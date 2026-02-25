# JLS Case Management System

Full-stack application with a React (Vite) frontend and a Python FastAPI backend.

## Prerequisites
- Node.js (v18+)
- Python (3.10+)
- PostgreSQL

## Backend Setup (FastAPI)

The backend is located in the `/server` directory.

1. **Navigate to the server directory:**
   ```bash
   cd server
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   *(Assuming you have a `requirements.txt`. If not, install fastAPI, uvicorn, sqlalchemy, psycopg2-binary, alembic, etc.)*
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Variables Config:**
   Create a `.env` file in the `/server` directory (you can use the provided `.env.example` if available) and configure your database and JWT secret keys:
   ```env
   DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/dbname
   SECRET_KEY=your_super_secret_key_here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   ```

5. **Run Database Migrations (Alembic):**
   Apply the initial database schema schemas:
   ```bash
   alembic upgrade head
   ```

6. **Start the FastAPI Server:**
   ```bash
   uvicorn main:app --reload --port 8000

   source venv/bin/activate && uvicorn main:app --reload --port 8000

   ```
   The backend will be available at `http://127.0.0.1:8000/`.
   API Documentation is automatically generated and accessible at `http://127.0.0.1:8000/docs`.


## Frontend Setup (React/Vite)

The frontend is located in the `/client` directory.

1. **Navigate to the client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables Config:**
   Create a `.env` file in the `/client` directory (you can copy `.env.example` if it exists):
   ```env
   VITE_API_URL=http://127.0.0.1:8000
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173/` (or the port specified in terminal).

---

## Technical Stack Overview
- **Frontend**: React 19, Tailwind CSS v4, Vite, Framer Motion, React Router.
- **Backend**: FastAPI, SQLAlchemy (Async), Alembic (Migrations), JWT Authentication.