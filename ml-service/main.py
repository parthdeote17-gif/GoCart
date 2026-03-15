import os
import random # 👈 NAYA IMPORT: Refresh pe naye items laane ke liye
from fastapi import FastAPI
import pandas as pd
import psycopg2
from sklearn.neighbors import NearestNeighbors
from dotenv import load_dotenv
import traceback

# Load Environment Variables
load_dotenv()

app = FastAPI()

def get_db_connection():
    return psycopg2.connect(os.environ.get("DATABASE_URL"))

@app.get("/")
def read_root():
    return {"status": "ML Recommendation Engine is Running 🚀"}

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

        # 1. COLD START (Agar naya user hai ya data kam hai)
        if df.empty or len(df) < 3:
            cursor = conn.cursor()
            # Top 50 best products uthao
            cursor.execute("SELECT id FROM products ORDER BY stars DESC NULLS LAST LIMIT 50")
            rows = cursor.fetchall()
            cursor.close()
            fallback_ids = [int(row[0]) for row in rows]
            
            # 🌟 MAGIC: In 50 products ko mix (shuffle) kar do aur koi bhi 10 bhej do
            random.shuffle(fallback_ids)
            return {"recommended_product_ids": fallback_ids[:10]}

        # 2. Matrix Banao
        matrix = df.pivot_table(index='user_id', columns='product_id', values='weight', aggfunc='sum').fillna(0)
        user_interacted_products = set()

        if user_id in matrix.index:
            user_interacted_products = set(matrix.columns[matrix.loc[user_id] > 0])

        recommended_set = set()

        # 3. KNN Logic (AI Recommendation)
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

        # 🌟 MAGIC: AI se jo list aayi usko bhi mix kar do
        recommended_list = list(recommended_set)
        random.shuffle(recommended_list)
        recommended_list = recommended_list[:10]

        # 4. THE FIX: Agar model ke paas 10 se kam products bache hain
        if len(recommended_list) < 10:
            
            # Popular list se nikaal kar mix karo
            popular = df.groupby('product_id')['weight'].sum().sort_values(ascending=False).index.tolist()
            popular_filtered = [int(p) for p in popular if int(p) not in recommended_list and int(p) not in user_interacted_products]
            random.shuffle(popular_filtered)
            recommended_list.extend(popular_filtered[:10 - len(recommended_list)])
            
            # Agar abhi bhi 10 nahi hue, toh database ke Top 50 uthao, mix karo, aur bhej do
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
        print("❌ ML ENGINE ERROR:")
        traceback.print_exc()
        return {"recommended_product_ids": []}
    
    finally:
        if conn:
            conn.close()