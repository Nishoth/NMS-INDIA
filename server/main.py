from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, cases, notices, meetings, documents, recordings, audit, users

app = FastAPI(
    title="Arbitration Portal API",
    description="Backend API for JLS Arbitration System",
    version="1.0.0"
)

# Configure CORS
origins = [
    "http://localhost:5173", # Default Vite React dev server
    "http://localhost:3000",
    "*" # Replace with specific origins in production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(cases.router)
app.include_router(notices.router)
app.include_router(meetings.router)
app.include_router(documents.router)
app.include_router(recordings.router)
app.include_router(audit.router)
app.include_router(users.router)
from routers import portal
app.include_router(portal.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Arbitration Portal API"}
