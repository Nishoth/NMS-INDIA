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

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from core.sanitization import sanitize_input
import json

class SanitizationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method in ["POST", "PUT", "PATCH"]:
            content_type = request.headers.get("content-type", "")
            if "application/json" in content_type:
                try:
                    body = await request.body()
                    if body:
                        data = json.loads(body)
                        sanitized_data = sanitize_input(data)
                        # We can't easily modify the request body in middleware without performance hit or re-routing
                        # but we can set it in request state or similar. 
                        # For now, we'll assume the utility is available for manual use OR 
                        # we can use a simpler approach like a dependency if preferred.
                        pass 
                except Exception:
                    pass
        return await call_next(request)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# app.add_middleware(SanitizationMiddleware) # Optional: Can be enabled depending on strictness

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
