from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Optional, Dict, List
import os
import logging
from datetime import datetime
from dotenv import load_dotenv

# Import our services
from backend.services.youtube_services import YouTubeService
from backend.services.gemini_services import GeminiService
from backend.services.quiz_services import QuizService

# Import models
from backend.models.video_to_quiz_models import *

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv(r"../.env")

# Initialize FastAPI router
router = APIRouter(
    tags=["videoToQuiz"],
)


# Global variables to store session data
# In production, use a proper database or session management
session_data = {}
video_cache = {}  # Cache for video information

# Initialize Gemini service with API key
# In production, load this from environment variables
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
gemini_service = GeminiService(GEMINI_API_KEY)


@router.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Video to Quiz Platform API", "status": "running"}


@router.post("/video/details")
async def get_video_details(request: VideoUrlRequest):
    """
    Get video details only - no quiz generation
    """
    try:
        logger.info(f"Getting video details for URL: {request.url}")

        # Initialize YouTube service
        youtube_service = YouTubeService(request.url, output_directory="downloads")

        # Get video information ONLY - no audio download
        video_info = youtube_service.get_video_info()

        logger.info(f"Video info retrieved successfully for video ID: {video_info['video_id']}")

        # Cache the video info for later use
        video_cache[video_info["video_id"]] = video_info

        return {
            "success": True,
            "message": "Video details retrieved successfully.",
            "video_info": video_info
        }

    except Exception as e:
        logger.error(f"Error getting video details: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get video details: {str(e)}")


@router.post("/generate")
async def generate_quiz(request: QuizGenerationRequest, background_tasks: BackgroundTasks):
    """
    Generate quiz for a video that has already been fetched
    """
    try:
        logger.info(
            f"Starting quiz generation for video ID: {request.video_id}, difficulty: {request.difficulty}, questions: {request.num_questions}")

        # Validate difficulty level
        if request.difficulty not in ["easy", "medium", "hard"]:
            raise HTTPException(status_code=400, detail="Difficulty must be easy, medium, or hard")

        # Validate number of questions
        if request.num_questions < 1 or request.num_questions > 20:
            raise HTTPException(status_code=400, detail="Number of questions must be between 1 and 20")

        # Check if video info exists in cache
        if request.video_id not in video_cache:
            raise HTTPException(status_code=404, detail="Video not found. Please get video details first.")

        video_info = video_cache[request.video_id]

        # Check if audio is downloaded
        audio_file_path = os.path.join("downloads", f"{request.video_id}.m4a")
        if not os.path.exists(audio_file_path):
            raise HTTPException(
                status_code=400,
                detail="Audio not downloaded. Please download audio first using /api/audio/download endpoint."
            )

        logger.info(f"Starting background task for quiz generation")

        # Start background task for quiz generation
        background_tasks.add_task(
            process_video_and_generate_quiz,
            video_info["video_id"],
            request.difficulty,
            request.num_questions,
            video_info
        )

        return {
            "success": True,
            "message": "Quiz generation started in background.",
            "video_info": video_info,
            "difficulty": request.difficulty,
            "num_questions": request.num_questions,
            "status": "processing"
        }

    except Exception as e:
        logger.error(f"Error starting quiz generation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to start quiz generation: {str(e)}")


@router.get("/audio/status/{video_id}")
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


@router.post("/audio/download")
async def download_audio(request: AudioDownloadRequest, background_tasks: BackgroundTasks):
    """
    Download audio for a video that has already been fetched
    """
    try:
        logger.info(f"Starting audio download for video ID: {request.video_id}")

        # Check if video info exists in cache
        if request.video_id not in video_cache:
            raise HTTPException(status_code=404, detail="Video not found. Please get video details first.")

        video_info = video_cache[request.video_id]

        # Check if audio is already downloaded
        audio_file_path = os.path.join("downloads", f"{request.video_id}.m4a")
        if os.path.exists(audio_file_path):
            return {
                "success": True,
                "message": "Audio already downloaded.",
                "video_info": video_info,
                "audio_path": audio_file_path,
                "status": "already_downloaded"
            }

        logger.info(f"Starting background task for audio download")

        # Start background task for audio download
        background_tasks.add_task(
            download_audio_background,
            request.video_id,
            video_info
        )

        return {
            "success": True,
            "message": "Audio download started in background.",
            "video_info": video_info,
            "status": "downloading"
        }

    except Exception as e:
        logger.error(f"Error starting audio download: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to start audio download: {str(e)}")


async def download_audio_background(video_id: str, video_info: Dict):
    """
    Background task to download audio
    """
    try:
        logger.info(f"Background task started: downloading audio for video ID: {video_id}")

        # Download audio
        youtube_service = YouTubeService(f"https://www.youtube.com/watch?v={video_id}", output_directory="downloads")
        audio_result = youtube_service.download_audio()

        if "error" in audio_result:
            logger.error(f"Audio download failed: {audio_result['error']}")
            return

        logger.info(f"Audio downloaded successfully for video: {video_info['title']}")

    except Exception as e:
        logger.error(f"Error in background audio download: {str(e)}")


async def process_video_and_generate_quiz(video_id: str, difficulty: str, num_questions: int, video_info: Dict):
    """
    Background task to generate quiz (audio should already be downloaded)
    """
    try:
        logger.info(f"Background task started: generating quiz for video ID: {video_id}")

        # Check if audio file exists
        audio_file_path = os.path.join("downloads", f"{video_id}.m4a")
        if not os.path.exists(audio_file_path):
            logger.error(f"Audio file not found: {audio_file_path}")
            return

        logger.info(f"Audio file found, starting quiz generation")

        # Generate quiz using Gemini
        quiz_result = gemini_service.process_audio_and_generate_quiz(
            audio_file_path,
            num_questions=num_questions,
            difficulty=difficulty
        )

        if "error" in quiz_result:
            logger.error(f"Quiz generation failed: {quiz_result['error']}")
            return

        # Store quiz data in session (in production, use database)
        session_key = f"{video_id}_{difficulty}"
        session_data[session_key] = {
            "quiz_service": QuizService(quiz_result["questions"], difficulty),
            "video_info": video_info,
            "quiz_data": quiz_result,
            "num_questions": num_questions,
            "created_at": datetime.now().isoformat()
        }

        logger.info(f"Quiz generated successfully for video: {video_info['title']}")

    except Exception as e:
        logger.error(f"Error in background quiz generation: {str(e)}")


@router.get("/status/{video_id}/{difficulty}")
async def get_quiz_status(video_id: str, difficulty: str):
    """
    Check if quiz is ready for a specific video and difficulty
    """
    session_key = f"{video_id}_{difficulty}"

    if session_key in session_data:
        quiz_service = session_data[session_key]["quiz_service"]
        quiz_info = quiz_service.get_quiz_info()

        return {
            "success": True,
            "ready": True,
            "quiz_info": quiz_info,
            "video_info": session_data[session_key]["video_info"]
        }
    else:
        return {
            "success": True,
            "ready": False,
            "message": "Quiz is still being generated"
        }


@router.post("/start/{video_id}/{difficulty}")
async def start_quiz(video_id: str, difficulty: str):
    """
    Start the quiz for a specific video and difficulty
    """
    session_key = f"{video_id}_{difficulty}"

    if session_key not in session_data:
        raise HTTPException(status_code=404, detail="Quiz not found or not ready")

    quiz_service = session_data[session_key]["quiz_service"]
    result = quiz_service.start_quiz()

    if not result["success"]:
        raise HTTPException(status_code=400, detail="Failed to start quiz")

    return {
        "success": True,
        "quiz_data": result,
        "video_info": session_data[session_key]["video_info"]
    }


@router.post("/next")
async def get_next_question(request: QuizNavigationRequest):
    """
    Get the next question in the quiz
    """
    # Find the quiz service for this session
    # In production, use proper session management
    quiz_service = None
    session_key = None

    for key, data in session_data.items():
        if data["quiz_service"].current_question_idx == request.question_index:
            quiz_service = data["quiz_service"]
            session_key = key
            break

    if not quiz_service:
        raise HTTPException(status_code=404, detail="Quiz session not found")

    result = quiz_service.get_next_question(request.question_index)

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return {
        "success": True,
        "quiz_data": result,
        "video_info": session_data[session_key]["video_info"]
    }


@router.post("/answer")
async def submit_answer(request: QuizAnswerRequest):
    """
    Submit an answer for a specific question
    """
    # Find the quiz service for this session using video_id and difficulty
    session_key = f"{request.video_id}_{request.difficulty}"

    if session_key not in session_data:
        raise HTTPException(status_code=404, detail="Quiz session not found")

    quiz_service = session_data[session_key]["quiz_service"]
    result = quiz_service.submit_answer(request.question_index, request.selected_option)

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return {
        "success": True,
        "result": result,
        "video_info": session_data[session_key]["video_info"]
    }


@router.get("/results/{video_id}/{difficulty}")
async def get_quiz_results(video_id: str, difficulty: str):
    """
    Get final quiz results
    """
    session_key = f"{video_id}_{difficulty}"

    if session_key not in session_data:
        raise HTTPException(status_code=404, detail="Quiz session not found")

    quiz_service = session_data[session_key]["quiz_service"]
    results = quiz_service.get_quiz_results()

    return {
        "success": True,
        "results": results,
        "video_info": session_data[session_key]["video_info"]
    }


@router.get("/question/{video_id}/{difficulty}/{question_index}")
async def get_specific_question(video_id: str, difficulty: str, question_index: int):
    """
    Get a specific question by index
    """
    session_key = f"{video_id}_{difficulty}"

    if session_key not in session_data:
        raise HTTPException(status_code=404, detail="Quiz session not found")

    quiz_service = session_data[session_key]["quiz_service"]

    if question_index < 0 or question_index >= quiz_service.totaL_questions:
        raise HTTPException(status_code=400, detail="Invalid question index")

    # Set current question index
    quiz_service.current_question_idx = question_index

    result = quiz_service.start_quiz()

    if not result["success"]:
        raise HTTPException(status_code=400, detail="Failed to get question")

    return {
        "success": True,
        "quiz_data": result,
        "video_info": session_data[session_key]["video_info"]
    }


@router.delete("/cleanup/{video_id}/{difficulty}")
async def cleanup_quiz_session(video_id: str, difficulty: str):
    """
    Clean up quiz session and downloaded files
    """
    session_key = f"{video_id}_{difficulty}"

    if session_key in session_data:
        # Clean up downloaded audio file
        quiz_data = session_data[session_key]["quiz_data"]
        if "metadata" in quiz_data and "source_file" in quiz_data["metadata"]:
            file_path = os.path.join("downloads", quiz_data["metadata"]["source_file"])
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Cleaned up file: {file_path}")

        # Remove session data
        del session_data[session_key]

        return {
            "success": True,
            "message": "Quiz session cleaned up successfully"
        }

    return {
        "success": True,
        "message": "No session found to clean up"
    }
