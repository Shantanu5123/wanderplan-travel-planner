# Personalized Travel Itinerary Planner (MVP)

An AI-powered travel itinerary planner that takes your destination, dates, budget, interests, and travel style to generate a day-by-day customized schedule. Users can save, edit, regenerate, export, and share trips.

---

## Tech Stack

- **Frontend**: React.js, Vite, Axios, Lucide Icons, Supabase JS
- **Backend**: FastAPI, Pydantic v2, Uvicorn, Python-dotenv
- **AI / LLM**: Groq API (`llama-3.3-70b-versatile`)
- **Database & Auth**: Supabase (PostgreSQL with Row Level Security)

---

## Project Structure

```
travel-planner/
├── .env.example              # Root env template
├── README.md                 # Setup & documentation
├── backend/
│   ├── .env.example          # Backend environment variables
│   ├── requirements.txt      # Python dependencies
│   └── app/
│       ├── main.py           # FastAPI entry point & CORS
│       ├── config.py         # App settings & env parser
│       ├── routers/          # Route handlers
│       ├── schemas/          # Pydantic data models
│       │   ├── itinerary.py  # Itinerary and Activity schemas
│       │   └── trip.py       # Trip request & response schemas
│       └── services/         # Business logic (Groq, Supabase, Exports)
└── frontend/
    ├── .env.example          # Frontend environment variables
    ├── index.html            # Vite HTML entry
    ├── package.json          # Node dependencies & scripts
    ├── vite.config.js        # Vite dev server configuration
    └── src/
        ├── App.jsx           # Main React component
        ├── index.css         # Styling
        ├── main.jsx          # React DOM entry
        ├── components/       # Reusable UI components
        ├── context/          # React Context (Auth, Trip State)
        ├── pages/            # Page views
        └── services/         # API & Supabase clients
```

---

## Prerequisites

- **Python**: 3.10+ (Python 3.14 tested)
- **Node.js**: v18+ (Node.js v26 tested)
- **Accounts & API Keys**:
  - **Groq API Key**: Sign up at [Groq Console](https://console.groq.com)
  - **Supabase Project**: Free tier at [Supabase](https://supabase.com)

---

## Getting Started

### 1. Backend Setup (FastAPI)

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   - **Windows (cmd/powershell)**:
     ```bash
     python -m venv venv
     venv\Scripts\activate
     ```
   - **macOS / Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     copy .env.example .env     # Windows
     # or cp .env.example .env  # Linux/macOS
     ```
   - Fill in your `GROQ_API_KEY`, `SUPABASE_URL`, and `SUPABASE_ANON_KEY`.
5. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
6. Visit the interactive API docs at [http://localhost:8000/docs](http://localhost:8000/docs).

---

### 2. Frontend Setup (React + Vite)

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     copy .env.example .env     # Windows
     # or cp .env.example .env  # Linux/macOS
     ```
   - Verify `VITE_API_BASE_URL` points to `http://localhost:8000/api/v1`.
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to [http://localhost:5173](http://localhost:5173).

---

## Security Notes

- Do **not** commit `.env` files to source control.
- Never place secrets (like `GROQ_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY`) in frontend code or repository commits.
