# 💸 FinTech AI — Autonomous Personal Finance Advisor

<div align="center">

![FinTech AI Banner](https://img.shields.io/badge/FinTech%20AI-Personal%20Finance%20Advisor-059669?style=for-the-badge&logo=cashapp&logoColor=white)

**An Enterprise-Grade, Full-Stack Autonomous Financial Intelligence Platform**  
*Powered by Google Gemini AI, LightGBM Quantile Ensemble Forecasting, and FastAPI.*

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![LightGBM](https://img.shields.io/badge/LightGBM-4.0+-FF6F00?style=flat-square&logo=scikitlearn&logoColor=white)](https://lightgbm.readthedocs.io)
[![Google Gemini](https://img.shields.io/badge/Gemini%20AI-Pro-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

[Features](#-key-features) •
[Architecture](#-system-architecture) •
[Tech Stack](#-tech-stack) •
[Machine Learning Engine](#-machine-learning--forecasting-engine) •
[Quick Start](#-getting-started) •
[API Reference](#-api-documentation) •
[Directory Layout](#-project-structure)

</div>

---

## 📌 Overview

**FinTech AI** is a state-of-the-art, production-ready Personal Finance Advisor and Wealth Intelligence system. It moves beyond passive transaction recording by bringing institutional-grade predictive analytics, automated machine-learning forecasting, dynamic financial health scoring, and generative conversational AI directly to users.

Whether you are tracking day-to-day discretionary spending, optimizing your emergency cash reserves, running multi-month quantile forecasts with confidence bands, or seeking conversational financial guidance with Google Gemini, **FinTech AI** delivers a unified, reactive, and visually breathtaking experience.

---

## 🌟 Key Features

### 🤖 1. Generative AI Financial Assistant (Google Gemini)
- **Context-Aware Dialogue**: Integrates live PostgreSQL transaction records, budget balances, and savings goals into Gemini's multi-turn conversational memory.
- **20 Financial Query Capabilities**: Answers queries ranging from spending habits and budget surplus estimates to loan amortization and milestone calculators.
- **Dynamic Visual Outputs**: Generates inline ASCII progress trackers, comparative summaries, and interactive chart data on the fly.

### 📈 2. Multi-Scale ML Expense Forecasting & Trend Engine
- **Ensemble ML Architecture**: Built using a Huber Robust Regressor for shock isolation coupled with LightGBM gradient boosters for residual trend forecasting.
- **Quantile Confidence Bands**: Computes P10 (optimistic), median (expected), and P90 (conservative) spending bounds.
- **3-Tier Categorization**:
  - *Fixed Contractual*: Rent, mortgages, insurance, utilities, and EMI obligations.
  - *Routine Living*: Groceries, transportation, medical care, and regular necessities.
  - *Discretionary & Elastic*: Dining out, entertainment, retail shopping, and vacations.
- **Adaptive Fallback Ladder**: Gracefully supports cold-start users (1–2 months), developing accounts (3–5 months), and mature profiles (6+ months).

### 🛡️ 3. Weighted Financial Health Scoring (0–100 Scale)
- Scientifically grades personal financial health using a weighted 7-pillar model:
  1. **Savings Rate (20%)**: Ratio of saved vs. gross inflows.
  2. **Budget Discipline (20%)**: Adherence to categorized budget caps.
  3. **Income Stability (15%)**: Variance and regularity of income streams.
  4. **Expense Stability (15%)**: Predictability and volatility of monthly outflows.
  5. **Goal Progress (10%)**: Momentum toward defined milestone savings goals.
  6. **Emergency Fund (10%)**: Runway coverage against routine monthly expenses.
  7. **Debt Ratio (10%)**: Debt service obligations against net income.
- Delivers an intuitive letter grade (**A+ to F**) alongside concrete, step-by-step recovery and optimization recommendations.

### 💳 4. Transaction Management & Automated Categorization
- **Full CRUD Support**: Add, edit, filter, search, soft-delete, and tag transactions.
- **Automated Categorization**: Machine learning auto-tags transactions based on historical patterns and vendor names.
- **Bulk CSV / Excel Operations**: Upload bank statements via CSV or Excel with preview verification and automated header mapping.

### 🎯 5. Dynamic Budgets & Milestone Savings Goals
- Category-specific monthly budget ceilings with live spend utilization meters.
- Multi-tier goal tracker with target dates, dynamic monthly deposit calculators, and milestone celebration states.

### 📊 6. Analytics, Visualizations & Multi-Format Reporting
- Real-time spending heatmaps, day-of-week velocity charts, and category breakdowns powered by **Recharts**.
- One-click server-side **PDF report generation** via ReportLab with professional vector layout.
- Multi-tab **Excel financial statement exports** via OpenPyXL.

### 🔐 7. Enterprise Security, Multi-Auth & Administration
- **Authentication**: JWT token lifecycle with secure HTTP-only authorization headers and Bcrypt password hashing.
- **Google OAuth 2.0**: Single Sign-On (SSO) login and signup flow.
- **Email Verification & Alerts**: Async SMTP email verification and real-time budget overspend notifications.
- **Admin Command Center**: System health logs, user directory, session tracking, audit logs, and support ticket management.
- **Media Management**: Cloudinary CDN integration for high-performance avatar image uploads and transformations.

### 🎨 8. Premium Cinematic UI / UX
- Developed with **React 19**, **Vite 6**, and **Tailwind CSS 3**.
- Silky micro-interactions using **Framer Motion**, **GSAP**, and ambient particle backgrounds using **tsParticles** and **OGL**.

---

## 🏛 System Architecture

```mermaid
flowchart TD
    subgraph Client ["Frontend (React 19 + Vite + Tailwind CSS)"]
        UI[Interactive Dashboard & Analytics]
        Chat[Gemini AI Assistant Chat]
        Reports[PDF / Excel Reports & Heatmaps]
        State[TanStack Query & Context API]
    end

    subgraph Gateway ["API Gateway & Middleware (FastAPI)"]
        Router[API v1 Router]
        AuthMW[JWT & OAuth2 Authentication]
        CORS[CORS & Trusted Host Security]
        Gzip[GZip Compression & Request Logger]
    end

    subgraph Services ["Application & Business Logic Layer"]
        FHS[Financial Health Service]
        EPS[Expense Prediction Service]
        GAS[Google Gemini AI Service]
        RPS[Report & Export Service]
        TXS[Transaction & Budget Service]
    end

    subgraph MLEngine ["Machine Learning & Forecasting Engine"]
        LGBM[LightGBM Residual & Quantile Models]
        Huber[Huber Robust Regressor]
        Features[Feature Engineering & Lag Pipeline]
        GenAI[Google Generative AI SDK]
    end

    subgraph Storage ["Persistence & External Services"]
        PG[(PostgreSQL 16 Database)]
        Cloudinary[(Cloudinary Media CDN)]
        SMTP[(SMTP Mail Server)]
    end

    UI --> Router
    Chat --> Router
    Reports --> Router
    Router --> AuthMW --> CORS --> Gzip
    Gzip --> Services

    EPS --> MLEngine
    GAS --> GenAI
    Services --> PG
    Services --> Cloudinary
    Services --> SMTP
```

---

## 💻 Tech Stack

| Domain | Technology | Description |
|---|---|---|
| **Backend Framework** | **FastAPI** (`>=0.115.0`) | High-performance asynchronous Python REST framework |
| **Server / ASGI** | **Uvicorn** (`>=0.30.0`) | Lightning-fast ASGI server implementation |
| **Database** | **PostgreSQL 16** | Relational database with ACID guarantees |
| **ORM & Migrations** | **SQLAlchemy 2.0** + **asyncpg** + **Alembic** | Async object-relational mapping and schema versioning |
| **Validation & Settings** | **Pydantic v2** + **pydantic-settings** | Strict schema validation and type-safe environment configuration |
| **AI / Large Language Model** | **Google Gemini AI** (`google-generativeai`) | Conversational financial intelligence and reasoning |
| **Machine Learning** | **LightGBM**, **Scikit-Learn**, **Joblib**, **Pandas**, **NumPy** | Quantile regressors, Huber outliers, time-series feature engineering |
| **Report Generation** | **ReportLab** + **OpenPyXL** | Automated enterprise PDF & XLSX report generators |
| **Cloud Storage** | **Cloudinary** | Cloud avatar & media asset processing |
| **Frontend Framework** | **React 19** + **Vite 6** | Cutting-edge reactive SPA runtime and fast bundler |
| **Styling & Icons** | **Tailwind CSS 3** + **Lucide React** | Utility-first responsive design and modern iconography |
| **Animations & Effects** | **Framer Motion**, **GSAP**, **tsParticles**, **OGL** | Physics-based animations, canvas effects, and 3D rendering |
| **Data Fetching & Charts** | **TanStack React Query v5** + **Recharts** | Reactive server caching, stale-while-revalidate, and charts |
| **Dev Environment** | **Node.js Orchestrator (`run-dev.js`)** | Unified concurrent launcher with auto-restart and anti-shutdown shield |

---

## 🧠 Machine Learning & Forecasting Engine

The platform incorporates a multi-tier forecasting pipeline engineered to address real-world financial data anomalies (e.g., uneven intervals, cold starts, and one-off expense shocks):

```
Historical Transactions (Live PostgreSQL)
               │
               ▼
   [Feature Engineering Pipeline]
   ├── Calendar Features: Day of week, Month phase, Quarter
   ├── Rolling Windows: Fast EMA (7d), Medium EMA (14d), Slow EMA (30d)
   └── Expense Categorization: Fixed, Routine, Discretionary
               │
               ▼
   [Hybrid Model Inference]
   ├── Huber Regressor: Strips out one-off shocks & non-linear spikes
   ├── LightGBM Direct: Predicts routine baseline expenditures
   ├── LightGBM Residual: Estimates momentum trend drift
   └── Quantile Boosters: P10 (Optimistic Bound) & P90 (Conservative Bound)
               │
               ▼
   [Synthesized Advisory Output]
   ├── Projected Monthly Outflow (₹)
   ├── Recommended Safe Daily Spend
   └── Liquidity Cushion & Overspending Risk Warnings
```

---

## 📂 Project Structure

```bash
AI-Powered-Personal-Finance-Advisor/
├── backend/
│   ├── alembic/                      # Database migration revisions
│   │   ├── versions/                 # Versioned SQL migration scripts
│   │   └── env.py                    # Alembic execution environment
│   ├── app/
│   │   ├── api/v1/                   # API v1 route declarations
│   │   │   ├── endpoints/            # Dedicated endpoint controllers (auth, transactions, etc.)
│   │   │   └── router.py             # Master v1 router aggregator
│   │   ├── core/                     # Application settings, constants, and logging
│   │   ├── database/                 # Async database engine, session, and table initializers
│   │   ├── dependencies/             # FastApi dependency injection (auth, db, services)
│   │   ├── exceptions/               # Custom business exceptions and global handlers
│   │   ├── ml_engine/                # Machine learning models, weights, and inference engine
│   │   ├── models/                   # SQLAlchemy declarative ORM models
│   │   ├── reports/                  # PDF (ReportLab) & Excel (OpenPyXL) generators
│   │   ├── repositories/             # Data access layer (Repository pattern)
│   │   ├── schemas/                  # Pydantic validation and serialization schemas
│   │   ├── services/                 # Business logic layer (Gemini, Health, Forecast, etc.)
│   │   └── utils/                    # Pagination, formatters, and security helpers
│   ├── scripts/database/             # Database initialization and seeding scripts
│   ├── tests/                        # Comprehensive Pytest test suite
│   ├── .env.example                  # Backend configuration template
│   ├── main.py                       # Backend development entry point
│   └── requirements.txt              # Backend Python dependencies
│
├── frontend/
│   ├── public/                       # Static public assets, favicons, logos
│   ├── src/
│   │   ├── api/                      # Axios clients and API abstraction functions
│   │   ├── components/               # Reusable UI components, widgets, modals, and charts
│   │   ├── contexts/                 # React Contexts (AuthContext, ThemeContext)
│   │   ├── layouts/                  # App shell layouts (Dashboard, Admin, Auth)
│   │   ├── pages/                    # Route pages (Dashboard, Transactions, AI Assistant, etc.)
│   │   ├── routes/                   # React Router DOM configuration
│   │   ├── styles/                   # Global CSS, Tailwind base, and theme variables
│   │   ├── utils/                    # Client-side formatters and currency helpers
│   │   ├── App.jsx                   # Master application component
│   │   └── main.jsx                  # React DOM root entry point
│   ├── .env.example                  # Frontend configuration template
│   ├── package.json                  # Frontend dependencies and scripts
│   ├── tailwind.config.js            # Tailwind CSS configuration
│   └── vite.config.js                # Vite build and server settings
│
├── package.json                      # Root workspace orchestrator configuration
├── run-dev.js                        # Unified dual-process development runner
├── .gitignore                        # Git exclusion rules
└── README.md                         # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.0.0` or higher (recommended: `v20.x`)
- **Python**: `3.10` or `3.11+`
- **PostgreSQL**: `v14` or higher (running locally or accessible via network)
- **Git**

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/ManDhanani07/AI-Powered-Personal-Finance-Advisor.git
cd AI-Powered-Personal-Finance-Advisor
```

---

### Step 2: Configure Environment Variables

#### 1. Backend Environment
Copy the backend environment template:
```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and update your PostgreSQL credentials and API keys:
```env
# Application
APP_NAME="AI-Powered Personal Finance Advisor API"
APP_ENV=development
DEBUG=True
SECRET_KEY=generate-a-secure-random-32-character-secret-key

# Database (PostgreSQL)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
POSTGRES_DB=finance_advisor_db
DATABASE_URL=postgresql+asyncpg://postgres:your_postgres_password@127.0.0.1:5432/finance_advisor_db
DATABASE_URL_SYNC=postgresql://postgres:your_postgres_password@127.0.0.1:5432/finance_advisor_db

# Google Gemini AI (Get free key from https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key_here

# Google OAuth 2.0 (Optional, for Google Sign-In)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/auth/google/callback

# SMTP Email (Optional, for email verification & alerts)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_gmail_app_password

# Cloudinary (Optional, for profile avatar storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### 2. Frontend Environment
Copy the frontend environment template:
```bash
cp frontend/.env.example frontend/.env
```

Review `frontend/.env`:
```env
VITE_APP_NAME="AI-Powered Personal Finance Advisor"
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

---

### Step 3: Set Up Database & Dependencies

#### Create PostgreSQL Database:
```sql
CREATE DATABASE finance_advisor_db;
```

#### Setup Backend Virtual Environment & Install Dependencies:
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
# Windows (PowerShell):
python -m venv venv
.\venv\Scripts\Activate.ps1

# Linux / macOS:
python3 -m venv venv
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Seed default categories into the database
python scripts/database/seed_database.py

# Return to root directory
cd ..
```

#### Install Frontend & Root Dependencies:
```bash
# Install frontend packages
cd frontend
npm install

# Return to root
cd ..
npm install
```

---

### Step 4: Run the Application

You can launch both the **FastAPI backend** and the **Vite frontend** simultaneously with a single command from the project root:

```bash
npm run dev
```

The unified orchestrator (`run-dev.js`) starts both services concurrently with live terminal streaming and automatic crash recovery:
- 🚀 **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- 🔌 **Backend REST API**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- 📖 **Interactive Swagger API Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- 📑 **ReDoc Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

### Alternative: Running Backend and Frontend Individually

If you prefer running services in separate terminal windows:

**Terminal 1 — Backend:**
```bash
cd backend
# Activate your venv first
.\venv\Scripts\Activate.ps1   # (Windows)
# or source venv/bin/activate   # (Linux/macOS)
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev:vite
```

---

## 📡 API Documentation

The backend provides complete OpenAPI (Swagger) documentation available out of the box at `/docs`.

### Key API Endpoint Groups

| Prefix | Module | Functionality |
|---|---|---|
| `/api/v1/auth` | Authentication | Register, Login, Refresh Token, Google OAuth 2.0, Password Reset, Email Verification |
| `/api/v1/user` | User Profile | Profile management, currency preferences, password change, avatar upload |
| `/api/v1/transactions` | Transactions | Create, list, search, filter, update, soft-delete, CSV/Excel bulk import & export |
| `/api/v1/categories` | Categories | List system & user categories, create custom categories, categorization rules |
| `/api/v1/budgets` | Budgets | Monthly budget caps, spending utilization, variance tracking, overspend warnings |
| `/api/v1/goals` | Savings Goals | Milestone creation, target date calculation, contribution logging, progress stats |
| `/api/v1/dashboard` | Dashboard Metrics | Net worth, monthly cash flow, category breakdowns, recent activity feed |
| `/api/v1/financial-health` | Health Score | 7-pillar weighted score (0–100), letter grade (A+ to F), recovery recommendations |
| `/api/v1/expense-prediction` | ML Forecasting | P10–P90 quantile forecasts, spending shock detection, daily spend velocity |
| `/api/v1/ai` | Gemini AI Advisor | Conversational financial chat, multi-turn memory, real-time advice generation |
| `/api/v1/reports` | Analytics & Reports | Generate downloadable PDF audit statements and multi-sheet Excel workbooks |
| `/api/v1/notifications` | Alerts & Reminders | System notifications, budget threshold warnings, unread counters |
| `/api/v1/admin` | Admin Portal | System health, user directory, audit trails, activity summaries |
| `/api/v1/support` | Support System | Ticket creation, user inquiry tracking, and status resolution |

---

## 🧪 Testing

The platform features an automated test suite verifying auth flows, repository queries, service logic, and forecasting pipelines:

```bash
cd backend
pytest -v
```

To run a specific test suite:
```bash
# Test authentication flows
pytest tests/test_auth.py -v

# Test machine learning expense prediction pipeline
pytest tests/test_expense_prediction.py -v

# Test financial forecasting with real-world spending spikes
pytest tests/test_real_life_spike_prediction.py -v
```

---

## 🛡️ Security & Best Practices

- **Zero Secret Commits**: Real `.env` files are strictly excluded via `.gitignore`.
- **Password Protection**: Passwords are never stored in plaintext and are hashed using **Bcrypt** with dynamic salt rounds.
- **Stateless Authorization**: Secured with short-lived **JWT access tokens** with validation at the gateway dependency layer.
- **SQL Injection Prevention**: Built entirely with parameterized queries via **SQLAlchemy ORM** and asyncpg drivers.
- **CORS Protection**: Restricted to configured frontend domains with strict method and header whitelists.
- **Input Sanitization**: All inbound payloads are validated through strongly-typed **Pydantic v2 schemas**.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project: `https://github.com/ManDhanani07/AI-Powered-Personal-Finance-Advisor`
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Man Dhanani**
- GitHub: [@ManDhanani07](https://github.com/ManDhanani07)
- Repository: [AI-Powered-Personal-Finance-Advisor](https://github.com/ManDhanani07/AI-Powered-Personal-Finance-Advisor)

<div align="center">
  <sub>Built with ❤️ and passion for FinTech, Machine Learning, and Web Architecture.</sub>
</div>
