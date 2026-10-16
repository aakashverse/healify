from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import chat, facilities, vision

app = FastAPI(title="Rural Healthcare Assistant AI Service", version="1.0.0")

# allow CORS for frontend and node, baad me sirf backedn & frontend allow krenge
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# mount routes
app.include_router(chat.router)
app.include_router(facilities.router)
app.include_router(vision.router)

# health check
@app.get("/health")
def health():
    return {"status": "healthy", "service": "rural-health-ai-fastapi is working :)"}

@app.get("/")
def root():
    return {"message": "Rural Healthcare Assistant AI Service is running."}