<div align="center">

# 🛒 GoCart

### AI-Powered Scalable E-commerce Engine

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-GoCart-brightgreen?style=for-the-badge)](https://go-cart-mu.vercel.app/)
[![Stack](https://img.shields.io/badge/Stack-PERN%20%2B%20Python-blue?style=for-the-badge)]()
[![AI](https://img.shields.io/badge/AI-Groq%20%7C%20Llama%203.1-purple?style=for-the-badge)]()

GoCart is a high-performance, full-stack e-commerce platform built on the **PERN stack** with an integrated **Python ML Microservice**. Engineered to handle a catalog of **40,000+ products**, it combines ACID-compliant transactions, a conversational AI shopping assistant, and a personalized ML recommendation engine — all wrapped in a modern glassmorphism UI.

> Built collaboratively by a 4-member engineering team under expert industry mentorship.

</div>

---

## 📌 Table of Contents

- [Live Links](#-live-links)
- [Key Features](#-key-features)
- [Tech Stack](#️-tech-stack)
- [Architecture](#️-architecture)
- [API Endpoints](#-api-endpoints)
- [Getting Started](#-getting-started)

---

## 🔗 Live Links

| Resource | URL |
|---|---|
| 🌐 Frontend | [go-cart-mu.vercel.app](https://go-cart-mu.vercel.app/) |
| ⚙️ Backend API | Hosted via Ngrok / Cloud (for testing) |

---

## 🚀 Key Features

### 🤖 Go AI Shopping Assistant
Conversational assistant powered by **Groq (Llama 3.1)**. Understands natural language queries — including Hinglish — to search the live database and recommend products in real time.

### 🧠 ML-Powered Recommendations
A custom **collaborative filtering engine** using K-Nearest Neighbors (KNN) and Cosine Similarity. Generates personalized product suggestions based on real-time user interaction matrices.

### ⚡ Microservices Architecture
The Node.js API Gateway and Python/FastAPI ML engine are fully decoupled. Heavy ML computations never block core e-commerce operations.

### 📦 Massive Catalog at Scale
Server-side **Limit-Offset Pagination** fetches only optimized chunks per request, keeping memory overhead minimal across 40,000+ products.

### 🔍 Sub-100ms Search
Optimized PostgreSQL queries using strict and broad case-insensitive `ILIKE` pattern matching with parameterized inputs for rapid, injection-safe search.

### 🛡️ ACID-Compliant Checkout
Robust order fulfillment with SQL Transactions (`BEGIN / COMMIT / ROLLBACK`) that guarantee 100% data consistency on every order.

### 🔐 Stateless Auth
Secure sessions via **JWT (JSON Web Tokens)** with custom authorization middleware protecting all sensitive routes.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 16.1 (App Router) | UI Framework |
| TanStack React Query | Data fetching & caching |
| Tailwind CSS v4 | Styling |
| TypeScript | End-to-end type safety |
| Lucide React | Icons |

### Core Backend (API Gateway)
| Technology | Purpose |
|---|---|
| Node.js + Express.js | Runtime & framework |
| JWT | Authentication |
| Brevo (Sendinblue) API | Transactional emails |

### AI & ML Microservice
| Technology | Purpose |
|---|---|
| FastAPI (Python) | Microservice framework |
| Groq SDK — `llama-3.1-8b-instant` | AI Shopping Assistant |
| Scikit-learn — `NearestNeighbors` | KNN recommendation engine |
| Pandas & NumPy | Data processing |

### Database
| Technology | Purpose |
|---|---|
| PostgreSQL | Primary database |
| node-postgres (`pg`) | Node.js driver |
| Psycopg2 | Python driver |

---

## 🏗️ Architecture

GoCart follows a **distributed, service-separated architecture** to isolate AI/ML workloads from core commerce logic.

```
gocart/
│
├── frontend/                   # Next.js App Router UI
│
├── src/                        # Node.js API Gateway (Express)
│   ├── config/                 # DB & Mailer configurations
│   ├── controllers/            # Auth, Cart, Orders + AI Controller
│   ├── middleware/             # JWT auth & security filters
│   ├── models/                 # SQL query definitions
│   └── routes/                 # API endpoint definitions
│
└── ml-service/                 # Python FastAPI Microservice
    ├── main.py                 # Groq AI chat + KNN engine logic
    └── requirements.txt        # Python dependencies
```

**Request Flow:**

```
User → Next.js Frontend
         ↓
    Express API Gateway  ──────────────────→  PostgreSQL
         ↓ (AI/ML requests)
    Python FastAPI Service
    (Groq LLM + KNN Engine)
```

---

## 📡 API Endpoints

| Service | Method | Endpoint | Description |
|---|---|---|---|
| Commerce | `GET` | `/api/products` | Fetch catalog with pagination & search |
| Commerce | `POST` | `/api/orders` | Place order via SQL Transaction |
| AI Engine | `POST` | `/api/ai/chat` | Chat with Go AI (proxied to Python) |
| ML Engine | `GET` | `/recommend/{user_id}` | KNN product recommendations |

---

## ⚙️ Getting Started

### Prerequisites

- Node.js v18+
- Python 3.10+
- PostgreSQL database

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/gocart.git
cd gocart
```

### 2. Setup Core Backend (Node.js)

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
PYTHON_ML_SERVICE_URL=http://127.0.0.1:8000
```

### 3. Setup AI/ML Microservice (Python)

```bash
cd ../ml-service
pip install -r requirements.txt
```

Create a `.env` file in the `ml-service/` folder:

```env
DATABASE_URL=your_postgresql_connection_string
GROQ_API_KEY=your_groq_api_key
```

### 4. Setup Frontend (Next.js)

```bash
cd ../frontend
npm install
```

### 5. Run the Application

You'll need **three separate terminal instances** running simultaneously:

```bash
# Terminal 1 — Node.js API Gateway
cd backend
npm run dev

# Terminal 2 — Python FastAPI ML Service
cd ml-service
uvicorn main:app --reload --port 8000

# Terminal 3 — Next.js Frontend
cd frontend
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

<div align="center">



</div>
