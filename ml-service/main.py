import os
import random
import re
import pandas as pd
import psycopg2
import traceback
import json
from fastapi import FastAPI
from sklearn.neighbors import NearestNeighbors
from dotenv import load_dotenv
from groq import Groq
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    user_id: str
    message: str

def get_db_connection():
    return psycopg2.connect(os.environ.get("DATABASE_URL"))

@app.get("/")
def read_root():
    return {"status": "GoCart ML & Go AI Engine is Running 🚀"}

# ==========================================
# 🤖 Route 1: Go AI Assistant (Groq Powered)
# ==========================================
@app.post("/chat")
def chat_with_assistant(request: ChatRequest):
    conn = None
    try:
        conn = get_db_connection()

        # Step 1: Message se keywords nikalo
        ignore_words = {
            'mujhe', 'dikhao', 'kya', 'hai', 'the', 'show', 'me', 'some',
            'good', 'best', 'under', 'in', 'and', 'with', 'for', 'want',
            'need', 'buy', 'please', 'a', 'an', 'ki', 'ka', 'ko', 'se',
            'yeh', 'woh', 'tell', 'new', 'latest', 'top', 'cheap', 'nice',
            'give', 'find', 'get', 'chahiye', 'batao', 'laao', 'do'
        }

        words = [
            w.lower() for w in re.findall(r'\b\w+\b', request.message)
            if len(w) > 2 and w.lower() not in ignore_words
        ]

        # Step 2: STRICT search (AND) - exact match
        df_products = pd.DataFrame()

        if words:
            strict_clauses = []
            for w in words:
                term = w[:-1] if w.endswith('s') and len(w) > 3 else w
                strict_clauses.append(
                    f"(title ILIKE '%{term}%' OR category_name ILIKE '%{term}%' OR description ILIKE '%{term}%')"
                )

            strict_query = (
                f"SELECT id, title, price, category_name FROM products "
                f"WHERE {' AND '.join(strict_clauses)} "
                f"ORDER BY stars DESC NULLS LAST LIMIT 20"
            )
            df_products = pd.read_sql_query(strict_query, conn)

        # Step 3: BROAD search (OR) - agar strict mein kuch nahi mila
        if df_products.empty and words:
            broad_clauses = []
            for w in words:
                term = w[:-1] if w.endswith('s') and len(w) > 3 else w
                broad_clauses.append(
                    f"(title ILIKE '%{term}%' OR category_name ILIKE '%{term}%' OR description ILIKE '%{term}%')"
                )

            broad_query = (
                f"SELECT id, title, price, category_name FROM products "
                f"WHERE {' OR '.join(broad_clauses)} "
                f"ORDER BY stars DESC NULLS LAST LIMIT 20"
            )
            df_products = pd.read_sql_query(broad_query, conn)

        # Step 4: Kuch nahi mila toh random products
        if df_products.empty:
            df_products = pd.read_sql_query(
                "SELECT id, title, price, category_name FROM products ORDER BY RANDOM() LIMIT 15",
                conn
            )

        # Step 5: Catalog string banao AI ke liye
        product_list = df_products.to_dict(orient="records")
        catalog_str = "\n".join([
            f"{p['id']}|{p['title']}|Rs{p['price']}|{p['category_name']}"
            for p in product_list
        ])

        # Step 6: Language detect karo
        hindi_words = {
            'mujhe', 'dikhao', 'kya', 'hai', 'ki', 'ka', 'ko', 'se', 'yeh', 'woh',
            'chahiye', 'batao', 'laao', 'aur', 'nahi', 'hain', 'tha', 'thi', 'karo',
            'mere', 'tera', 'humko', 'kuch', 'sab', 'bahut', 'accha', 'theek'
        }
        message_words = set(request.message.lower().split())
        is_hindi = len(message_words & hindi_words) > 0
        lang_instruction = (
            "Reply in friendly Hinglish (mix of Hindi and English)."
            if is_hindi else
            "Reply in English only."
        )

        # Step 7: Groq AI Call
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            print("WARNING: GROQ_API_KEY is missing in your .env file!")

        client = Groq(api_key=api_key)

        # ✅ FIX: Catalog IDs clearly listed, AI ko force kiya products dikhane ke liye
        product_ids_list = [str(p['id']) for p in product_list]
        
        prompt = f"""You are 'Go AI', GoCart's smart shopping assistant.

CATALOG (ID|Name|Price|Category):
{catalog_str}

AVAILABLE PRODUCT IDs: {', '.join(product_ids_list)}

LANGUAGE RULE: {lang_instruction}

STRICT RULES:
1. Reply ONLY in raw JSON. No markdown, no backticks, no extra text.
2. You MUST ALWAYS put 4 product IDs from AVAILABLE PRODUCT IDs into show_product_ids. NEVER leave it empty when products exist.
3. Pick the most relevant products. If no exact match, pick closest ones. NEVER say not found.
4. For cart/wishlist requests, set action and action_product_id.

User: {request.message}

YOU MUST RETURN THIS EXACT JSON (replace ... with actual values):
{{"reply":"...","show_product_ids":[id1,id2,id3,id4],"action":null,"action_product_id":null}}"""

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
        )

        # Step 8: AI Response parse karo
        ai_text = response.choices[0].message.content.strip()

        if ai_text.startswith("```json"):
            ai_text = ai_text[7:-3]
        elif ai_text.startswith("```"):
            ai_text = ai_text[3:-3]

        ai_data = json.loads(ai_text.strip())

        # ✅ FIX: Agar AI ne products nahi diye, toh top 4 khud se lao
        show_ids = ai_data.get("show_product_ids", [])
        if not show_ids or len(show_ids) == 0:
            show_ids = [p['id'] for p in product_list[:4]]

        # Step 9: Full product details DB se lao
        ai_products = []
        clean_ids = [int(id) for id in show_ids if str(id).isdigit()]

        if clean_ids:
            if len(clean_ids) == 1:
                query = f"SELECT * FROM products WHERE id = {clean_ids[0]}"
            else:
                ids_tuple = tuple(clean_ids)
                query = f"SELECT * FROM products WHERE id IN {ids_tuple}"

            df_rec = pd.read_sql_query(query, conn)
            ai_products = df_rec.to_dict(orient="records")

        return {
            "status": "success",
            "reply": ai_data.get("reply", "I am ready to help you shop!"),
            "products": ai_products,
            "action": ai_data.get("action"),
            "action_product_id": ai_data.get("action_product_id")
        }

    except json.JSONDecodeError:
        print("\n❌ Go AI Error: Failed to parse JSON from AI response.")
        print(f"Raw AI Response was: {response.choices[0].message.content}")
        return {
            "status": "error",
            "reply": "I am having trouble formulating my response right now. Please ask again!"
        }
    except Exception as e:
        print("\n❌ Go AI Error:")
        traceback.print_exc()
        return {
            "status": "error",
            "reply": "I am currently experiencing some technical issues. Please try again in a moment!"
        }
    finally:
        if conn:
            conn.close()


# ==========================================
# 🛍️ Route 2: Product Recommendation Engine (KNN)
# ==========================================
@app.get("/recommend/{user_id}")
def get_recommendations(user_id: str):
    conn = None
    try:
        conn = get_db_connection()

        query = "SELECT user_id, product_id, weight FROM user_interactions"
        try:
            df = pd.read_sql_query(query, conn)
        except Exception:
            df = pd.DataFrame()

        # 1. Cold Start
        if df.empty or len(df) < 3:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM products ORDER BY stars DESC NULLS LAST LIMIT 50")
            rows = cursor.fetchall()
            cursor.close()
            fallback_ids = [int(row[0]) for row in rows]
            random.shuffle(fallback_ids)
            return {"recommended_product_ids": fallback_ids[:10]}

        # 2. User-Product Matrix
        matrix = df.pivot_table(
            index='user_id', columns='product_id', values='weight', aggfunc='sum'
        ).fillna(0)

        user_interacted_products = set()
        if user_id in matrix.index:
            user_interacted_products = set(matrix.columns[matrix.loc[user_id] > 0])

        recommended_set = set()

        # 3. KNN
        if len(matrix) > 1 and user_id in matrix.index:
            knn = NearestNeighbors(metric='cosine', algorithm='brute')
            knn.fit(matrix.values)
            user_index = matrix.index.get_loc(user_id)
            n_neighbors = min(len(matrix), 3)

            distances, indices = knn.kneighbors(
                [matrix.iloc[user_index].values], n_neighbors=n_neighbors
            )
            similar_users = [matrix.index[indices[0][i]] for i in range(1, len(distances[0]))]

            for sim_user in similar_users:
                sim_user_products = set(matrix.columns[matrix.loc[sim_user] > 0])
                recommended_set.update(sim_user_products - user_interacted_products)

        recommended_list = list(recommended_set)
        random.shuffle(recommended_list)
        recommended_list = recommended_list[:10]

        # 4. Fallback
        if len(recommended_list) < 10:
            popular = (
                df.groupby('product_id')['weight']
                .sum()
                .sort_values(ascending=False)
                .index.tolist()
            )
            popular_filtered = [
                int(p) for p in popular
                if int(p) not in recommended_list and int(p) not in user_interacted_products
            ]
            random.shuffle(popular_filtered)
            recommended_list.extend(popular_filtered[:10 - len(recommended_list)])

            if len(recommended_list) < 10:
                cursor = conn.cursor()
                cursor.execute("SELECT id FROM products ORDER BY stars DESC NULLS LAST LIMIT 50")
                db_products = cursor.fetchall()
                cursor.close()
                db_ids = [
                    int(row[0]) for row in db_products
                    if int(row[0]) not in recommended_list
                    and int(row[0]) not in user_interacted_products
                ]
                random.shuffle(db_ids)
                recommended_list.extend(db_ids[:10 - len(recommended_list)])

        return {"recommended_product_ids": recommended_list}

    except Exception as e:
        print("❌ ML Engine Error:")
        traceback.print_exc()
        return {"recommended_product_ids": []}

    finally:
        if conn:
            conn.close()
