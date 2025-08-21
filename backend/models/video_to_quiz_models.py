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


class QuestionModel(BaseModel):  # adjust fields to match MCQ
    question_id: int
    question: str
    a: str
    b: str
    c: str
    d: str
    correct_answer: str
    explanation: str

class QuizResultRequest(BaseModel):
    total_correct_attempt: int
    total_wrong_attempt: int
    not_attempted: int