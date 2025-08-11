from pydantic import BaseModel

# Pydantic models for request/response
class VideoUrlRequest(BaseModel):
    url: str


class AudioDownloadRequest(BaseModel):
    video_id: str


class QuizGenerationRequest(BaseModel):
    video_id: str
    difficulty: str = "medium"  # easy, medium, hard
    num_questions: int = 10  # Number of questions to generate (1-20)


class QuizAnswerRequest(BaseModel):
    video_id: str
    difficulty: str = "medium"
    question_index: int
    selected_option: str  # A, B, C, or D


class QuizNavigationRequest(BaseModel):
    question_index: int

