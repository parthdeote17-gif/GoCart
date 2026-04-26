# 🛒 GoCart | AI-Powered Scalable E-commerce Engine
[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge)](https://gocart01.vercel.app/)

GoCart is a high-performance, full-stack e-commerce platform built with the **PERN stack** and an integrated **Python ML Microservice**. Designed to handle a massive catalog of **40,000+ products**, it features intelligent AI shopping assistance, personalized machine learning recommendations, ACID-compliant transactions, and a modern "glassmorphism" UI. 

Developed collaboratively by a 4-member engineering team under expert industry mentorship, this project bridges traditional robust backends with modern generative AI capabilities.

---

## 🔗 Project Links
* **Live Deployment:** [GoCart](https://go-cart-mu.vercel.app/)
* **Backend API:** Hosted via Ngrok/Cloud for testing.

---

## 🚀 Key Features

* **🤖 Go AI Shopping Assistant:** A smart conversational assistant powered by the Groq LLM (Llama 3.1) that understands natural language (including Hinglish) to search the database and recommend exact products to users.
* **🧠 Machine Learning Recommendations:** A custom collaborative filtering engine using K-Nearest Neighbors (KNN) and Cosine Similarity to suggest highly relevant products based on real-time user interaction matrices.
* **⚡ Microservices Architecture:** Decoupled Node.js API Gateway and Python/FastAPI AI engine to ensure heavy machine learning computations don't block core e-commerce transactions.
* **📦 Massive Catalog Management:** Implemented server-side **Limit-Offset Pagination**, fetching only optimized chunks per request to minimize memory overhead.
* **🔍 Sub-100ms Search:** Optimized PostgreSQL queries using strict/broad case-insensitive `ILIKE` pattern matching and parameterized inputs to ensure rapid search across thousands of rows.
* **🛡️ ACID-Compliant Checkout:** Robust order fulfillment using **SQL Transactions** (`BEGIN/COMMIT/ROLLBACK`) to guarantee 100% data consistency.
* **🔐 Stateless Authentication:** Secure user sessions implemented via **JWT (JSON Web Tokens)** and custom authorization middleware.

---

## 🛠️ Tech Stack

### **Frontend (User Interface)**
* **Framework:** Next.js 16.1 (App Router)
* **State & Fetching:** TanStack React Query (for real-time caching)
* **Styling:** Tailwind CSS v4 & Lucide React Icons
* **Language:** TypeScript for end-to-end type safety

### **Core Backend (API Gateway)**
* **Runtime:** Node.js
* **Framework:** Express.js
* **Authentication:** JWT
* **Emailing:** Brevo (Sendinblue) API via sib-api-v3-sdk

### **AI & ML Microservice**
* **Framework:** FastAPI (Python)
* **AI Model:** Groq SDK (llama-3.1-8b-instant)
* **Data Science:** Pandas, Scikit-learn (NearestNeighbors), NumPy

### **Database**
* **Engine:** PostgreSQL
* **Driver:** Node-Postgres (pg) & Psycopg2 (Python)

---

## 🏗️ Project Architecture

The application follows a distributed architecture, splitting core commerce features from AI processing:

```text
gocart/
├── frontend/             # Next.js App Router UI
├── src/                  # Node.js API Gateway (Express)
│   ├── config/           # DB & Mailer configurations
│   ├── controllers/      # Core logic (Auth, Cart, Orders) + AI Controller
│   ├── middleware/       # JWT Auth & Security filters
│   ├── models/           # SQL queries
│   └── routes/           # API endpoint definitions
└── ml-service/           # Python FastAPI Microservice
    ├── main.py           # Groq AI & KNN Engine Logic
    └── requirements.txt  # Python dependencies

⚙️ Installation & SetupClone the repository:Bashgit clone [https://github.com/your-username/gocart.git](https://github.com/your-username/gocart.git)
cd gocart
Setup Core Backend (Node.js):Bashcd backend
npm install
Create a .env file in the backend folder:Code snippetDATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
PYTHON_ML_SERVICE_URL=[http://127.0.0.1:8000](http://127.0.0.1:8000)
Setup AI/ML Microservice (Python):Bashcd ../ml-service
pip install -r requirements.txt
Create a .env file in the ml-service folder:Code snippetDATABASE_URL=your_postgresql_connection_string
GROQ_API_KEY=your_groq_api_key
Setup Frontend:Bashcd ../frontend
npm install
Run the application:You will need to run three separate terminal instances:Bash# Terminal 1: Node.js API
npm run dev

# Terminal 2: Python FastAPI
uvicorn main:app --reload --port 8000

# Terminal 3: Next.js Frontend
npm run dev
🛡️ Key API EndpointsServiceMethodEndpointDescriptionCommerceGET/api/productsFetch catalog with pagination & searchCommercePOST/api/ordersPlace order using SQL TransactionsAI EnginePOST/api/ai/chatChat with Go AI Assistant (Forwards to Python)ML EngineGET/recommend/{user_id}Direct FastAPI route for KNN recommendations
