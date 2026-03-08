from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.controllers.video_to_quiz import router as video_to_quiz
from backend.controllers.document_chat import router as document_chat
from backend.controllers.lecture_notes import router as lecture_notes
from datetime import datetime

import logger
app = FastAPI(
    title="Ed Tech",
    description="A platform that provides education with the help of AI.",
    version="1.0.0"
)

app.include_router(video_to_quiz.router,
                   prefix="/api/video_to_quiz",
                   tags=["videoToQuiz"]
                   )

app.include_router(document_chat.router,
                   prefix="/api/document_chat",
                   tags=["DocumentChat"]
                   )

app.include_router(lecture_notes.router,
                   prefix="/api/lecture_notes",
                   tags=["LectureNotes"]
                   )

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/")
async def health_check():
    """
    Available endpoints
    """
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "available_endpoints": {
            "video to quiz": "/api/video_to_quiz",
            "document chat": "/api/document_chat",
            "lecture notes": "/api/lecture_notes"
        }
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)