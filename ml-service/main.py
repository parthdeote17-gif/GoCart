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

# New Google GenAI SDK Imports
from google import genai
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# Load Environment Variables from .env file
load_dotenv()

app = FastAPI()

# Enable CORS to allow requests from your Node.js backend / Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data model for chat requests
class ChatRequest(BaseModel):
    user_id: str
    message: str

def get_db_connection():
    """Establish a connection to the PostgreSQL database."""
    return psycopg2.connect(os.environ.get("DATABASE_URL"))

@app.get("/")
def read_root():
    return {"status": "GoCart ML & Go AI Engine is Running 🚀"}

# ==========================================
# 🤖 Route 1: Go AI Assistant (Database Aware & Actionable)
# ==========================================
@app.post("/chat")
def chat_with_assistant(request: ChatRequest):
    conn = None
    try:
        conn = get_db_connection()
        
        # Ye words hum ignore karenge taaki database search kharab na ho
        ignore_words = {'mujhe', 'dikhao', 'kya', 'hai', 'the', 'show', 'me', 'some', 'good', 'best', 'under', 'in', 'and', 'with', 'for', 'want', 'need', 'buy', 'please', 'a', 'an', 'ki', 'ka', 'ko', 'se', 'yeh', 'woh'}
        
        # Message se search keywords nikalna
        words = [w.lower() for w in re.findall(r'\b\w+\b', request.message) if len(w) > 2 and w.lower() not in ignore_words]
        
        where_clauses = []
        for w in words:
            # Plural handle karne ke liye ('laptops' ko 'laptop' bana dega)
            term = w[:-1] if w.endswith('s') and len(w) > 3 else w
            where_clauses.append(f"(title ILIKE '%{term}%' OR category_name ILIKE '%{term}%' OR description ILIKE '%{term}%')")
            
        if where_clauses:
            # Yahan par 'OR' ki jagah 'AND' kar diya hai aur LIMIT 40000 hi rakha hai
            query = f"SELECT id, title, price, category_name FROM products WHERE {' AND '.join(where_clauses)} LIMIT 40000"
            df_products = pd.read_sql_query(query, conn)
        else:
            df_products = pd.DataFrame()
            
        if df_products.empty:
            # Agar user ne sirf "Hi" bola hai (koi keyword nahi), toh random products layega
            df_products = pd.read_sql_query("SELECT id, title, price, category_name FROM products ORDER BY RANDOM() LIMIT 150", conn)
            
        product_list = df_products.to_dict(orient="records")
        catalog_str = "\n".join([f"ID: {p['id']} | Name: {p['title']} | Price: ₹{p['price']} | Category: {p['category_name']}" for p in product_list])

        # 2. Initialize Gemini client using the API key ONLY from .env
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            print("⚠️ WARNING: GEMINI_API_KEY is missing in your .env file!")
            
        client = genai.Client(api_key=api_key)
        
        # 3. Define the prompt enforcing strict JSON output and behavior rules
        prompt = f"""
        You are 'Go AI', the smart and friendly shopping assistant for the GoCart e-commerce platform.
        
        HERE IS OUR CURRENT PRODUCT CATALOG matching the user's query. You MUST ONLY recommend products from this list:
        {catalog_str}
        
        STRICT RULES:
        1. You MUST respond ONLY in valid JSON format. No markdown syntax, no backticks, no introductory text. Just the raw JSON object.
        2. Language Rule: If the user speaks in English, reply strictly in English. If the user speaks in Hinglish or Hindi, reply in friendly Hinglish. Match their tone exactly.
        3. If the user asks to recommend products, find relevant products from the catalog provided above and include their IDs in the 'show_product_ids' array.
        4. If the user asks to add a specific item to the cart or wishlist, set the 'action' and 'action_product_id' fields accordingly.
        
        User Message: {request.message}
        
        YOU MUST RETURN YOUR RESPONSE USING EXACTLY THIS JSON STRUCTURE:
        {{
            "reply": "Your conversational text response here. Make it sound natural and friendly.",
            "show_product_ids": [array of integer product IDs to display in the UI based on user request, maximum 4 items, leave empty array [] if none],
            "action": "add_to_cart" or "add_to_wishlist" or null,
            "action_product_id": The integer ID of the specific product the user wants to add, or null
        }}
        """
        
        # Call the Gemini API
        response = client.models.generate_content(
            model='gemini-2.5-flash', 
            contents=prompt
        )
        
        # 4. Safely extract and parse the JSON from the AI's response
        ai_text = response.text.strip()
        
        # Strip markdown formatting if the AI accidentally includes it despite instructions
        if ai_text.startswith("```json"):
            ai_text = ai_text[7:-3]
        elif ai_text.startswith("```"):
            ai_text = ai_text[3:-3]
            
        ai_data = json.loads(ai_text.strip())
        
        # 5. Fetch full product details from the DB if the AI recommended specific products
        ai_products = []
        show_ids = ai_data.get("show_product_ids", [])
        
        if show_ids and isinstance(show_ids, list) and len(show_ids) > 0:
            # Clean the list to ensure they are integers
            clean_ids = [int(id) for id in show_ids if str(id).isdigit()]
            
            if clean_ids:
                # Handle single vs multiple IDs for SQL syntax
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
        print(f"Raw AI Response was: {response.text}")
        return {
            "status": "error",
            "reply": "I am having trouble formulating my response right now. Please ask again!"
        }
    except Exception as e:
        print("\n❌ Go AI Error:")
        traceback.print_exc()
        return {
            "status": "error",
            "reply": "I am currently experiencing some technical issues connecting to our catalog. Please try again in a moment!"
        }
    finally:
        if conn:
            conn.close()

# ==========================================
# 🛍️ Route 2: Product Recommendation Engine
# ==========================================
@app.get("/recommend/{user_id}")
def get_recommendations(user_id: str):
    conn = None
    try:
        conn = get_db_connection()
        
        # Fetch interaction data from the database
        query = "SELECT user_id, product_id, weight FROM user_interactions"
        try:
            df = pd.read_sql_query(query, conn)
        except Exception:
            df = pd.DataFrame()

        # 1. Cold Start Logic: For new users or when data is insufficient
        if df.empty or len(df) < 3:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM products ORDER BY stars DESC NULLS LAST LIMIT 50")
            rows = cursor.fetchall()
            cursor.close()
            fallback_ids = [int(row[0]) for row in rows]
            
            # Shuffle the list to provide variety on every refresh
            random.shuffle(fallback_ids)
            return {"recommended_product_ids": fallback_ids[:10]}

        # 2. Matrix Creation: Pivot data for KNN processing
        matrix = df.pivot_table(index='user_id', columns='product_id', values='weight', aggfunc='sum').fillna(0)
        user_interacted_products = set()

        if user_id in matrix.index:
            user_interacted_products = set(matrix.columns[matrix.loc[user_id] > 0])

        recommended_set = set()

        # 3. KNN Logic: AI-driven Collaborative Filtering
        if len(matrix) > 1 and user_id in matrix.index:
            knn = NearestNeighbors(metric='cosine', algorithm='brute')
            knn.fit(matrix.values)
            user_index = matrix.index.get_loc(user_id)
            n_neighbors = min(len(matrix), 3)
            
            distances, indices = knn.kneighbors([matrix.iloc[user_index].values], n_neighbors=n_neighbors)
            similar_users = [matrix.index[indices[0][i]] for i in range(1, len(distances[0]))]
            
            for sim_user in similar_users:
                sim_user_products = set(matrix.columns[matrix.loc[sim_user] > 0])
                recommended_set.update(sim_user_products - user_interacted_products)

        # Shuffle recommended items for a dynamic experience
        recommended_list = list(recommended_set)
        random.shuffle(recommended_list)
        recommended_list = recommended_list[:10]

        # 4. Fallback Logic: Ensure exactly 10 products are returned
        if len(recommended_list) < 10:
            popular = df.groupby('product_id')['weight'].sum().sort_values(ascending=False).index.tolist()
            popular_filtered = [int(p) for p in popular if int(p) not in recommended_list and int(p) not in user_interacted_products]
            random.shuffle(popular_filtered)
            recommended_list.extend(popular_filtered[:10 - len(recommended_list)])
            
            if len(recommended_list) < 10:
                cursor = conn.cursor()
                cursor.execute("SELECT id FROM products ORDER BY stars DESC NULLS LAST LIMIT 50")
                db_products = cursor.fetchall()
                cursor.close()
                db_ids = [int(row[0]) for row in db_products if int(row[0]) not in recommended_list and int(row[0]) not in user_interacted_products]
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