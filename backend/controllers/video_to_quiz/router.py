from fastapi import APIRouter, HTTPException, BackgroundTasks, Request, Depends
from typing import Dict
import os
import logging
from datetime import datetime
from dotenv import load_dotenv
from sqlalchemy.orm import Session


from database.video_to_quiz_db import (
    get_video_to_quiz_quota,
    get_user_video_to_quiz,
    add_bulk_mcqs_video_to_quiz,
    get_user_mcqs_video_to_quiz,
    get_quiz_info,
    create_video_to_quiz,
    reset_video_to_quiz_quota_if_needed,
    add_video_info_to_cache,
    get_video_info_from_cache,
    add_quiz_result,
    get_quiz_result,
)
from backend.utils import authenticate_user_get_user_details
from database.db_models import get_db, VideoToQuiz, MCQsVideoToQuiz

from backend.services.youtube_services import YouTubeService
from backend.services.gemini_services import GeminiService
from backend.models.video_to_quiz_models import *

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter(
    tags=["videoToQuiz"]
)

load_dotenv(r"../.env")

gemini_service = GeminiService(os.getenv("GEMINI_API_KEY"))

@router.get("/")        # successfully tested
async def root():
    logger.info("Video to quiz route accessed")
    return {"message": "Video to Quiz Platform API", "status": "running"}


@router.get("/user-history")
async def user_history(request: Request, db: Session = Depends(get_db)):
    logger.info("User history accessed")
    user_id = authenticate_user_get_user_details(request).get("user_id")
    quizzes = get_user_video_to_quiz(db, user_id)
    return {"quizzes": quizzes}

@router.get("/quota")
async def get_quota(request: Request, db: Session = Depends(get_db)):
    user_id = authenticate_user_get_user_details(request).get("user_id")
    quota = get_video_to_quiz_quota(db, user_id)
    if not quota:
        logger.error(f"Quota not found for user:{user_id}")
        return {"user_id": user_id, "quota_remaining": 0, "last_reset_date": datetime.now()}
    quota = reset_video_to_quiz_quota_if_needed(db, quota)
    return quota

@router.post("/video/details")           # successfully tested
async def get_video_details(request: VideoUrlRequest, db: Session = Depends(get_db)):
    try:
        logger.info(f"Getting video details for URL: {request.url}")
        youtube_service = YouTubeService(request.url, output_directory="downloads")
        video_info = youtube_service.get_video_info()
        add_video_info_to_cache(db, **video_info)
        return {"success": True, "message": "Video details retrieved successfully.", "video_info": video_info}
    except Exception as e:
        logger.exception("Error getting video details")
        raise HTTPException(status_code=500, detail=f"Failed to get video details: {str(e)}")


async def check_audio_status(video_id: str):
    """
    Check if audio file is already downloaded for a video
    """
    audio_file_path = os.path.join("downloads", f"{video_id}.m4a")
    audio_exists = os.path.exists(audio_file_path)

    return {
        "success": True,
        "video_id": video_id,
        "audio_downloaded": audio_exists,
        "audio_path": audio_file_path if audio_exists else None
    }


@router.post("/audio/download")     # successfully tested
async def download_audio(req: AudioDownloadRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    try:
        video_info = get_video_info_from_cache(db=db, video_id=req.video_id)
        if not video_info:
            logger.warning(f"[BG] Video not found {req.video_id}")
            raise HTTPException(status_code=404, detail="Video not found in cache. Please get video details first.")

        audio_file_path = os.path.join("downloads", f"{req.video_id}.m4a")
        if os.path.exists(audio_file_path):
            logger.info(f"[BG] Audio already downloaded for {req.video_id}")
            return {
                "success": True,
                "message": "Audio already downloaded.",
                "video_info": video_info,
                "audio_path": audio_file_path,
                "status": "already_downloaded",
            }

        background_tasks.add_task(download_audio_background, req.video_id)
        logger.info(f"Audio download started {req.video_id}...")
        return {"success": True, "message": "Audio download started in background.", "video_info": video_info, "status": "downloading"}
    except HTTPException as e:
        logger.exception(f"Error: {e}")
        raise
    except Exception as e:
        logger.error(f"Error starting audio download: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start audio download: {str(e)}")

async def download_audio_background(video_id: str):
    try:
        logger.info(f"[BG] Downloading audio {video_id}")
        youtube_service = YouTubeService(f"https://www.youtube.com/watch?v={video_id}", output_directory="downloads")
        audio_result = youtube_service.download_audio()
        if "error" in audio_result:
            logger.error(f"[BG] Audio download failed: {audio_result['error']}")
    except Exception:
        logger.error("[BG] Audio download error")

@router.post("/generate")   # successfully tested
async def generate_quiz(request: Request, quiz_request: QuizGenerationRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    try:
        user_id = authenticate_user_get_user_details(request).get("user_id")
        if not user_id:
            logger.warning(f"[BG] User not found {user_id}")
            raise HTTPException(status_code=401, detail="User not authorized.")

        if quiz_request.difficulty not in ["easy", "medium", "hard"]:
            logger.exception("[BG] Invalid difficulty")
            raise HTTPException(status_code=400, detail="Difficulty must be easy, medium, or hard")
        if not (1 <= quiz_request.num_questions <= 20):
            logger.exception(f"[BG] Invalid number of questions{quiz_request.num_questions}")
            raise HTTPException(status_code=400, detail="Number of questions must be between 1 and 20")

        video_info = get_video_info_from_cache(db=db, video_id=quiz_request.video_id)

        if not video_info:
            logger.error(f"[BG] Video not found {video_info}")
            raise HTTPException(status_code=404, detail="Video not found. Please get video details first.")

        audio_file_path = os.path.join("downloads", f"{quiz_request.video_id}.m4a")
        if not os.path.exists(audio_file_path):
            logger.error("Audio not downloaded.")
            raise HTTPException(status_code=400, detail="Audio not downloaded. Please use /audio/download first.")

        quiz_ref = create_video_to_quiz(
            db=db,
            created_by=user_id,
            video_id=video_info.__dict__["video_id"],
            video_title=video_info.__dict__["title"],
            difficulty=quiz_request.difficulty,
            no_of_questions=quiz_request.num_questions
        )
        db.commit()
        logger.info(f"[BG] Quiz generation started for {video_info.title} (quiz_id={quiz_ref.id})")

        background_tasks.add_task(
            process_video_and_generate_quiz,
            quiz_request.video_id,
            quiz_ref.id,
            quiz_request.difficulty,
            quiz_request.num_questions,
            video_info,
        )

        return {
            "success": True,
            "message": "Quiz generation started in background.",
            "video_info": video_info,
            "difficulty": quiz_request.difficulty,
            "num_questions": quiz_request.num_questions,
            "status": "processing",
            "quiz_ref": quiz_ref,
        }

    except HTTPException as e:
        logger.exception(f"[BG] Quiz generation error: {e}")
        raise
    except Exception as e:
        logger.exception(f"Error starting quiz generation: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start quiz generation: {str(e)}")

async def process_video_and_generate_quiz(video_id: str, quiz_id: int, difficulty: str, num_questions: int, video_info: Dict):
    from database.db_models import SessionLocal  # factory that returns a new Session
    db = SessionLocal()
    try:
        audio_file_path = os.path.join("downloads", f"{video_id}.m4a")
        if not os.path.exists(audio_file_path):
            logger.error(f"[BG] Audio file missing: {audio_file_path}")
            return

        quiz_result = gemini_service.process_audio_and_generate_quiz(
            audio_file_path, num_questions=num_questions, difficulty=difficulty
        )
        if "error" in quiz_result:
            logger.error(f"[BG] Quiz generation failed: {quiz_result['error']}")
            return

        add_bulk_mcqs_video_to_quiz(db=db, quiz_id=quiz_id, questions=quiz_result["questions"])
        db.commit()
        logger.info(f"[BG] Quiz generated for {video_info.__dict__['title']} (quiz_id={quiz_id})")
    except Exception as e:
        db.rollback()
        logger.exception(f"[BG] Quiz generation error: {e}")
    finally:
        db.close()

async def get_quiz_status_from_db(db: Session, quiz_id: int, user_id: str):
    # Check quiz exists and belongs to the user
    quiz = db.query(VideoToQuiz).filter(
        VideoToQuiz.id == quiz_id,
        VideoToQuiz.created_by == user_id
    ).first()
    if not quiz:
        logger.error(f"[BG] Quiz not found: {quiz_id} for user {user_id}")
        return None

    # Check if any questions exist for this quiz
    has_questions = db.query(MCQsVideoToQuiz).filter(
        MCQsVideoToQuiz.quiz_id == quiz_id
    ).first() is not None

    return has_questions

@router.get("/status/{quiz_id}")    # successfully tested
async def get_quiz_status(request: Request, quiz_id: int, db: Session = Depends(get_db)):
    user_id = authenticate_user_get_user_details(request).get("user_id")
    status = get_quiz_status_from_db(db, quiz_id, user_id)

    if status is None:
        raise HTTPException(status_code=404, detail="Quiz not found")

    return {
        "success": True,
        "ready": status  # True if at least 1 question exists, False otherwise
    }


@router.post("/start/{quiz_id}")    # successfully tested
async def start_quiz(request: Request, quiz_id: int, db: Session = Depends(get_db)):
    user_id = authenticate_user_get_user_details(request).get("user_id")

    # 1. Get quiz info
    quiz_info = get_quiz_info(db, quiz_id)
    if not quiz_info or quiz_info.created_by != user_id:
        raise HTTPException(status_code=404, detail="Quiz not found")

    # 2. Get all questions for this quiz
    questions_in_db = get_user_mcqs_video_to_quiz(db, quiz_id)
    if not questions_in_db:
        raise HTTPException(status_code=400, detail="No questions found for quiz")

    # Format questions
    questions = []
    for q in questions_in_db:
        raw = q.__dict__
        formatted = {
            "question": raw["question"],
            "options": {
                "A": raw["a"],
                "B": raw["b"],
                "C": raw["c"],
                "D": raw["d"],
            },
            "correct_answer": raw["correct_answer"],
            "explanation": raw["explanation"],
        }
        questions.append(formatted)

    return {
        "success": True,
        "quiz_questions": questions,
        "quiz_id": quiz_id,
    }


@router.post("/add_results/{quiz_id}")  # successfully tested
async def add_results(
        quiz_id: int,
        result_data: QuizResultRequest,
        request: Request,
        db: Session = Depends(get_db)
):
    user_id = authenticate_user_get_user_details(request).get("user_id")

    try:
        return add_quiz_result(
            db, quiz_id, user_id,
            result_data.total_correct_attempt,
            result_data.total_wrong_attempt,
            result_data.not_attempted
        )
    except ValueError as e:
        logger.exception(f"[BG] Error adding results: {e}")
        raise HTTPException(
            status_code=400,
            detail="Invalid quiz submission: question count does not match quiz requirements"
        )

@router.get("/get_results/{quiz_id}")   # successfully tested
async def get_results(
   quiz_id: int,
   request: Request,
   db: Session = Depends(get_db)
):
   user_id = authenticate_user_get_user_details(request).get("user_id")
   return get_quiz_result(db, quiz_id, user_id)
