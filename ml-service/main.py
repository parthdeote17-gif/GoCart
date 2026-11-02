import os
import random
import re
import json
import logging
import traceback
from typing import Optional

import pandas as pd
import psycopg2
from psycopg2 import sql
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from groq import Groq
from sklearn.neighbors import NearestNeighbors

# --------------------------------------------------
# Configuration
# --------------------------------------------------

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("gocart-ml")

GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")
DATABASE_URL = os.getenv("DATABASE_URL")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

app = FastAPI(title="GoCart ML & Go AI Engine", version="2.0.0")

# For production, replace "*" with your exact frontend URL(s).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    user_id: str = Field(..., min_length=1, max_length=128)
    message: str = Field(..., min_length=1, max_length=2000)


def get_db_connection():
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL is missing from ml-service/.env")
    return psycopg2.connect(DATABASE_URL, connect_timeout=10)


def get_groq_client():
    if not GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY is missing from ml-service/.env")
    return Groq(api_key=GROQ_API_KEY, timeout=30.0, max_retries=2)


def detect_language(message: str) -> str:
    hindi_words = {
        "mujhe", "dikhao", "kya", "hai", "ki", "ka", "ko", "se", "yeh",
        "woh", "chahiye", "batao", "laao", "aur", "nahi", "hain", "tha",
        "thi", "karo", "mere", "tera", "humko", "kuch", "sab", "bahut",
        "accha", "theek", "kitna", "kaisa", "wali", "wala"
    }
    words = set(re.findall(r"\b\w+\b", message.lower()))
    return "Hinglish" if words.intersection(hindi_words) else "English"


def is_greeting(message: str) -> bool:
    normalized = re.sub(r"[^a-z\s]", "", message.lower()).strip()
    greetings = {
        "hi", "hello", "hey", "hii", "hiii", "good morning",
        "good afternoon", "good evening", "how are you", "namaste",
        "नमस्ते", "नमaskar"
    }
    return normalized in greetings or normalized.startswith("hello ")


def extract_search_words(message: str):
    ignore_words = {
        "mujhe", "dikhao", "kya", "hai", "the", "show", "me", "some",
        "good", "best", "under", "in", "and", "with", "for", "want",
        "need", "buy", "please", "a", "an", "ki", "ka", "ko", "se",
        "yeh", "woh", "tell", "new", "latest", "top", "cheap", "nice",
        "give", "find", "get", "chahiye", "batao", "laao", "do",
        "hello", "hi", "hey", "product", "products", "price", "cost",
        "rs", "rupees", "₹", "please", "can", "you", "recommend",
        "recommendation", "suggest", "something", "anything"
    }

    words = []
    for word in re.findall(r"\b[\w]+\b", message.lower()):
        if len(word) > 2 and word not in ignore_words and not word.isdigit():
            # Basic English plural handling, e.g. shoes -> shoe.
            term = word[:-1] if word.endswith("s") and len(word) > 3 else word
            words.append(term)
    return list(dict.fromkeys(words))[:8]


def search_products(conn, message: str):
    """Search product catalog safely using parameterized SQL."""
    words = extract_search_words(message)

    base_query = """
        SELECT id, title, price, category_name
        FROM products
    """

    if words:
        strict_clauses = []
        strict_params = []
        for word in words:
            strict_clauses.append(
                "(title ILIKE %s OR category_name ILIKE %s OR description ILIKE %s)"
            )
            pattern = f"%{word}%"
            strict_params.extend([pattern, pattern, pattern])

        strict_query = (
            base_query
            + " WHERE "
            + " AND ".join(strict_clauses)
            + " ORDER BY stars DESC NULLS LAST LIMIT 20"
        )

        df = pd.read_sql_query(strict_query, conn, params=strict_params)

        if df.empty:
            broad_clauses = []
            broad_params = []
            for word in words:
                broad_clauses.append(
                    "(title ILIKE %s OR category_name ILIKE %s OR description ILIKE %s)"
                )
                pattern = f"%{word}%"
                broad_params.extend([pattern, pattern, pattern])

            broad_query = (
                base_query
                + " WHERE "
                + " OR ".join(broad_clauses)
                + " ORDER BY stars DESC NULLS LAST LIMIT 20"
            )
            df = pd.read_sql_query(broad_query, conn, params=broad_params)
    else:
        df = pd.DataFrame()

    # If no relevant products were found, return popular products as fallback.
    if df.empty:
        df = pd.read_sql_query(
            """
            SELECT id, title, price, category_name
            FROM products
            ORDER BY stars DESC NULLS LAST
            LIMIT 15
            """,
            conn,
        )

    return df


def parse_ai_json(ai_text: str) -> dict:
    """Parse JSON safely, including accidental Markdown fences."""
    text = (ai_text or "").strip()

    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
        text = re.sub(r"\s*```$", "", text)

    data = json.loads(text)

    if not isinstance(data, dict):
        raise ValueError("AI response must be a JSON object")

    return data


# --------------------------------------------------
# Health check
# --------------------------------------------------

@app.get("/")
def read_root():
    return {
        "status": "GoCart ML & Go AI Engine is Running",
        "model": GROQ_MODEL,
    }


# --------------------------------------------------
# Route 1: Go AI Assistant (Groq GPT-OSS 20B)
# --------------------------------------------------

@app.post("/chat")
def chat_with_assistant(request: ChatRequest):
    conn = None

    try:
        # Check API key before doing database work.
        client = get_groq_client()
        conn = get_db_connection()

        user_message = request.message.strip()
        language = detect_language(user_message)

        # Greetings should not trigger unnecessary catalog search.
        greeting = is_greeting(user_message)

        if greeting:
            product_list = []
            catalog_str = "No product catalog needed for this greeting."
        else:
            df_products = search_products(conn, user_message)
            product_list = df_products.to_dict(orient="records")
            catalog_str = "\n".join(
                f"{p['id']}|{p['title']}|Rs {p['price']}|{p['category_name']}"
                for p in product_list
            ) or "No products are currently available."

        available_ids = [int(p["id"]) for p in product_list]
        available_ids_text = ", ".join(map(str, available_ids)) or "None"

        language_instruction = (
            "Reply in friendly natural Hinglish (Hindi + English in Roman script)."
            if language == "Hinglish"
            else "Reply in clear, friendly English."
        )

        prompt = f"""
You are Go AI, the shopping assistant for GoCart, an e-commerce website.

USER MESSAGE:
{user_message}

LANGUAGE:
{language_instruction}

PRODUCT CATALOG (ID | Name | Price | Category):
{catalog_str}

VALID PRODUCT IDS:
{available_ids_text}

RULES:
1. Return ONLY one valid JSON object. Do not use Markdown or code fences.
2. Use this exact structure:
   {{
     "reply": "Your friendly response",
     "show_product_ids": [],
     "action": null,
     "action_product_id": null
   }}
3. For greetings or general conversation, respond naturally and set show_product_ids to [].
4. For shopping/product requests, recommend up to 4 relevant IDs from VALID PRODUCT IDS only.
5. Never invent product IDs, names, prices, stock, discounts, or product details.
6. If products are available but no exact match exists, suggest the closest catalog matches and explain briefly.
7. For add-to-cart requests, set action to "add_to_cart" and action_product_id to a valid product ID only when the user clearly identifies a product.
8. For wishlist requests, set action to "add_to_wishlist" and action_product_id to a valid product ID only when the user clearly identifies a product.
9. Otherwise action and action_product_id must be null.
10. Keep the reply concise, helpful, and conversational.
"""

        # GPT-OSS on Groq: JSON mode requires hidden/parsed reasoning format.
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_completion_tokens=1200,
            temperature=0.3,
            reasoning_effort="low",
            reasoning_format="hidden",
            response_format={"type": "json_object"},
        )

        ai_text = response.choices[0].message.content or ""
        ai_data = parse_ai_json(ai_text)

        reply = ai_data.get("reply")
        if not isinstance(reply, str) or not reply.strip():
            reply = "I'm ready to help you shop on GoCart!"

        # Only allow product IDs that were actually returned by the database.
        raw_show_ids = ai_data.get("show_product_ids", [])
        if not isinstance(raw_show_ids, list):
            raw_show_ids = []

        valid_id_set = set(available_ids)
        clean_ids = []
        for item in raw_show_ids:
            try:
                product_id = int(item)
            except (TypeError, ValueError):
                continue

            if product_id in valid_id_set and product_id not in clean_ids:
                clean_ids.append(product_id)

        clean_ids = clean_ids[:4]

        # Retrieve full product details using safe parameterized SQL.
        ai_products = []
        if clean_ids:
            placeholders = ", ".join(["%s"] * len(clean_ids))
            product_query = f"SELECT * FROM products WHERE id IN ({placeholders})"
            df_rec = pd.read_sql_query(product_query, conn, params=clean_ids)
            ai_products = df_rec.to_dict(orient="records")

            # Preserve the AI's selected order.
            order = {product_id: index for index, product_id in enumerate(clean_ids)}
            ai_products.sort(key=lambda p: order.get(int(p["id"]), 999))

        action = ai_data.get("action")
        action_product_id = ai_data.get("action_product_id")

        allowed_actions = {"add_to_cart", "add_to_wishlist"}
        if action not in allowed_actions:
            action = None
            action_product_id = None
        else:
            try:
                action_product_id = int(action_product_id)
            except (TypeError, ValueError):
                action = None
                action_product_id = None

            if action_product_id not in valid_id_set:
                action = None
                action_product_id = None

        return {
            "status": "success",
            "reply": reply.strip(),
            "products": ai_products,
            "action": action,
            "action_product_id": action_product_id,
        }

    except json.JSONDecodeError:
        logger.exception("Go AI returned invalid JSON")
        return {
            "status": "error",
            "reply": "I'm having trouble preparing that response. Please try again.",
            "products": [],
            "action": None,
            "action_product_id": None,
        }

    except Exception as exc:
        logger.exception("Go AI request failed: %s", str(exc))
        return {
            "status": "error",
            "reply": "Go AI is temporarily unavailable. Please try again in a moment.",
            "products": [],
            "action": None,
            "action_product_id": None,
        }

    finally:
        if conn:
            conn.close()


# --------------------------------------------------
# Route 2: Product Recommendation Engine (KNN)
# --------------------------------------------------

@app.get("/recommend/{user_id}")
def get_recommendations(user_id: str):
    conn = None

    try:
        conn = get_db_connection()

        query = """
            SELECT user_id, product_id, weight
            FROM user_interactions
        """

        try:
            df = pd.read_sql_query(query, conn)
        except Exception:
            logger.exception("Could not read user_interactions")
            df = pd.DataFrame()

        # Cold start: not enough interaction history.
        if df.empty or len(df) < 3:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT id
                    FROM products
                    ORDER BY stars DESC NULLS LAST
                    LIMIT 50
                    """
                )
                rows = cursor.fetchall()

            fallback_ids = [int(row[0]) for row in rows]
            random.shuffle(fallback_ids)
            return {"recommended_product_ids": fallback_ids[:10]}

        # Normalize IDs to strings to avoid int/string user ID mismatch.
        df["user_id"] = df["user_id"].astype(str)
        df["product_id"] = pd.to_numeric(
            df["product_id"], errors="coerce"
        )
        df["weight"] = pd.to_numeric(df["weight"], errors="coerce")
        df = df.dropna(subset=["product_id", "weight"])

        if df.empty:
            return {"recommended_product_ids": []}

        df["product_id"] = df["product_id"].astype(int)

        matrix = df.pivot_table(
            index="user_id",
            columns="product_id",
            values="weight",
            aggfunc="sum",
        ).fillna(0)

        current_user_id = str(user_id)
        user_interacted_products = set()

        if current_user_id in matrix.index:
            user_interacted_products = set(
                matrix.columns[matrix.loc[current_user_id] > 0]
            )

        recommended_set = set()

        # KNN collaborative filtering.
        if len(matrix) > 1 and current_user_id in matrix.index:
            knn = NearestNeighbors(metric="cosine", algorithm="brute")
            knn.fit(matrix.values)

            user_index = matrix.index.get_loc(current_user_id)
            n_neighbors = min(len(matrix), 3)

            distances, indices = knn.kneighbors(
                [matrix.iloc[user_index].values],
                n_neighbors=n_neighbors,
            )

            similar_users = [
                matrix.index[indices[0][i]]
                for i in range(1, len(distances[0]))
            ]

            for similar_user in similar_users:
                similar_user_products = set(
                    matrix.columns[matrix.loc[similar_user] > 0]
                )
                recommended_set.update(
                    similar_user_products - user_interacted_products
                )

        recommended_list = list(recommended_set)
        random.shuffle(recommended_list)
        recommended_list = recommended_list[:10]

        # Fill remaining slots with popular products.
        if len(recommended_list) < 10:
            popular = (
                df.groupby("product_id")["weight"]
                .sum()
                .sort_values(ascending=False)
                .index.tolist()
            )

            popular_filtered = [
                int(product_id)
                for product_id in popular
                if int(product_id) not in recommended_list
                and int(product_id) not in user_interacted_products
            ]

            random.shuffle(popular_filtered)
            recommended_list.extend(
                popular_filtered[: 10 - len(recommended_list)]
            )

        # Final fallback from highly rated products.
        if len(recommended_list) < 10:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT id
                    FROM products
                    ORDER BY stars DESC NULLS LAST
                    LIMIT 50
                    """
                )
                db_products = cursor.fetchall()

            db_ids = [
                int(row[0])
                for row in db_products
                if int(row[0]) not in recommended_list
                and int(row[0]) not in user_interacted_products
            ]

            random.shuffle(db_ids)
            recommended_list.extend(
                db_ids[: 10 - len(recommended_list)]
            )

        return {"recommended_product_ids": recommended_list[:10]}

    except Exception:
        logger.exception("ML recommendation engine failed")
        return {"recommended_product_ids": []}

    finally:
        if conn:
            conn.close()
