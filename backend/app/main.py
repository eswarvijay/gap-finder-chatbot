from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import APP_HOST, APP_PORT
from app.routes import auth, materials, topic_map, quiz, diagnosis, chat, progress

app = FastAPI(
    title="GapFinder AI - Diagnostic & Adaptive Revision Platform",
    description="Finds what the student doesn't know using RAG over syllabus, notes, and past papers.",
    version="2.0.0"
)

# Robust CORS Configuration supporting localhost and any Vercel domain
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8000",
    "https://gap-finder-chatbot.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Register API Routers
app.include_router(auth.router)
app.include_router(materials.router)
app.include_router(topic_map.router)
app.include_router(quiz.router)
app.include_router(diagnosis.router)
app.include_router(chat.router)
app.include_router(progress.router)


@app.get("/")
def root():
    return {
        "app": "GapFinder AI",
        "status": "online",
        "description": "Find What the Student Doesn't Know - Dynamic Diagnostic & Adaptive Revision Engine",
        "docs": "/docs"
    }


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "gapfinder-backend"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=APP_HOST, port=APP_PORT, reload=True)
