
# 🛒 GoCart | Scalable E-commerce Engine
[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge)](https://gocart01.vercel.app/)

GoCart is a high-performance, full-stack e-commerce platform built with the **PERN stack**. Designed to handle a massive catalog of **40,000+ products**, it features modular MVC architecture, ACID-compliant transactions, and a modern "glassmorphism" UI.

---

## 🔗 Project Links
* **Live Deployment:** [GoCart](https://go-cart-mu.vercel.app/)
* **Backend API:** Hosted via Ngrok/Cloud for testing.

---

## 🚀 Key Features
The core challenge of this project was managing a dataset of **40,000+ static products** without compromising speed:

* **Data Chunking:** Implemented server-side **Limit-Offset Pagination**, fetching only 20 items per request to minimize memory overhead.
* **Sub-100ms Search:** Optimized PostgreSQL queries using case-insensitive `ILIKE` pattern matching and parameterized inputs to ensure rapid search across thousands of rows.
* **Connection Efficiency:** Configured a robust PostgreSQL pool with custom timeout and idle settings to manage high-concurrency traffic safely.
* **Dynamic Product Discovery:** Multi-column search (Title, Description, Category) using case-insensitive SQL `ILIKE` pattern matching.
* **Intelligent Recommendations:** A built-in "Related Products" engine that suggests items based on category-driven randomization.
* **Server-Side Pagination:** Optimized data retrieval using `LIMIT/OFFSET` to ensure high performance even with large product catalogs.
* **ACID-Compliant Checkout:** Robust order fulfillment using **SQL Transactions** (`BEGIN/COMMIT/ROLLBACK`) to guarantee 100% data consistency.
* **Stateless Authentication:** Secure user sessions implemented via **JWT (JSON Web Tokens)** and custom authorization middleware.
* **Modern Responsive UI:** A "glassmorphism" styled interface built with **Next.js 15** and **Tailwind CSS v4**.

---

## 🛠️ Tech Stack

### **Frontend**
* **Framework:** Next.js 16 (App Router)
* **State Management:** TanStack React Query
* **Styling:** Tailwind CSS & Lucide React Icons
* **Language:** TypeScript for end-to-end type safety

### **Backend**
* **Runtime:** Node.js
* **Framework:** Express.js
* **Authentication:** JWT (JSON Web Tokens)
* **Emailing:** Brevo (Sendinblue) API via sib-api-v3-sdk for OTP & notificationss

### **Database**
* **Engine:** PostgreSQL
* **Driver:** Node-Postgres (pg) with optimized connection pooling

---

## 🏗️ Project Architecture

The backend follows a strict **Layered MVC Architecture** to ensure clean separation of concerns:

```text
src/
├── config/       # Database (PostgreSQL) & Mailer configurations
├── controllers/  # Business logic & Request handling
├── middleware/   # Auth & Security filters
├── models/       # SQL queries & Data logic
├── routes/       # API endpoint definitions
└── utils/        # Security hashing & Token utilities

```

---

## ⚙️ Installation & Setup

1. **Clone the repository:**
```bash
git clone [https://github.com/your-username/gocart.git](https://github.com/your-username/gocart.git)
cd gocart

```


2. **Install dependencies:**
```bash
# Install backend dependencies
cd backend && npm install
# Install frontend dependencies
cd ../frontend && npm install

```


3. **Environment Variables:**
Create a `.env` file in the backend folder:
```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
BREVO_API_KEY=your_brevo_api_key
SMTP_FROM=your_verified_sender_email@domain.com

```


4. **Run the application:**
```bash
# Start Backend
npm run dev
# Start Frontend
npm run dev

```
---

## 🛡️ API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/products` | Fetch all products with pagination & search |
| `GET` | `/api/products/:id` | Get detailed product information |
| `POST` | `/api/orders` | Place an order using SQL Transactions (Protected) |
| `POST` | `/api/auth/login` | User authentication & JWT generation |
