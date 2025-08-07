import io
import os
import sys
from typing import List, Dict, Optional, Tuple
from google import genai
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GeminiService:
    """
    Service class for interacting with Google Gemini AI for audio processing and quiz generation.
    """
    
    def __init__(self, api_key: str):
        """
        Initialize the Gemini service with API key.
        
        Args:
            api_key (str): Google Gemini API key
        """
        self.client = genai.Client(api_key=api_key)
        self.model = "gemini-2.5-flash"
        self.file_uploaded = False
        self.uploaded_file_uri = None
        self.transcription_generated = False
        self.transcription = None
        self.quiz_generated = False
        self.quiz_data = None
    
    class ProgressFileReader(io.BufferedReader):
        """
        A file reader that wraps a binary file and reports upload progress.
        Inherits from BufferedReader to be compatible with genai SDK.
        """

        def __init__(self, filepath: str, callback=None):
            self.file = open(filepath, 'rb')
            super().__init__(self.file)
            self.total_size = os.path.getsize(filepath)
            self.callback = callback
            self._read_bytes = 0

        def read(self, size=-1):
            data = super().read(size)
            if data:
                self._read_bytes += len(data)
                if self.callback:
                    self.callback(self._read_bytes, self.total_size)
            return data

        def close(self):
            try:
                super().close()
            except OSError:
                pass

        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc_val, exc_tb):
            self.close()

    def upload_progress(self, read_bytes: int, total_bytes: int) -> None:
        """
        Progress callback function for file uploads.
        
        Args:
            read_bytes (int): Bytes read so far
            total_bytes (int): Total bytes to read
        """
        percent = (read_bytes / total_bytes) * 100
        sys.stdout.write(f"\rUploading... {read_bytes:,}/{total_bytes:,} bytes ({percent:.1f}%)")
        sys.stdout.flush()
        if read_bytes == total_bytes:
            print()  # New line when done

    def upload_audio_file(self, file_path: str, display_name: str = "Audio Clip") -> Optional[str]:
        """
        Upload an audio file to Gemini and return the file URI.
        
        Args:
            file_path (str): Path to the audio file
            display_name (str): Display name for the file
            
        Returns:
            Optional[str]: File URI if successful, None otherwise
        """
        try:
            if not os.path.exists(file_path):
                logger.error(f"File not found: {file_path}")
                return None

            # Open file with progress wrapper
            with self.ProgressFileReader(file_path, callback=self.upload_progress) as pfr:
                self.uploaded_file_uri = self.client.files.upload(
                    file=pfr,
                    config={
                        "mime_type": "audio/mpeg",
                        "display_name": display_name
                    }
                )

            logger.info(f"Uploaded file: {self.uploaded_file_uri}")
            self.file_uploaded = True
            return self.uploaded_file_uri
            
        except Exception as e:
            logger.error(f"Error uploading file: {str(e)}")
            return None

    def get_audio_transcription(self, file_uri: str) -> Optional[str]:
        """
        Get transcription and analysis of the uploaded audio file.
        
        Args:
            file_uri (str): URI of the uploaded file
            
        Returns:
            Optional[str]: Transcription text if successful, None otherwise
        """
        if self.file_uploaded:
            try:
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=["Please transcribe this audio file and provide a detailed summary of its content.", self.uploaded_file_uri]
                )
                
                self.transcription_generated = True
                self.transcription = response.text

                return response.text
                
            except Exception as e:
                logger.error(f"Error getting transcription: {str(e)}")
                return None
        
        return "Upload the audio file first to get the transcript."

    def generate_quiz_questions(self, audio_content: str, num_questions: int = 5, difficulty: str = "medium") -> List[Dict]:
        """
        Generate quiz questions based on audio content.
        
        Args:
            audio_content (str): Transcription or summary of audio content
            num_questions (int): Number of questions to generate
            difficulty (str): Difficulty level (easy, medium, hard)
            
        Returns:
            List[Dict]: List of quiz questions with answers
        """
        try:
            example_json = """
            [
                {
                    "question": first question,
                    "options": {
                        "A": option A,
                        "B": option B,
                        "C": option C,
                        "D": option D,
                    },
                    "correct_answer": correct option either A,B,C or D,
                    "explanation": Explanation for the correct option,"
                },
                
            ]
            """
            prompt = f"""
            Based on the following content, generate {num_questions} multiple-choice quiz questions.
            Randomize correct answer positions across A, B, C, D.
            
            Requirements:
            - Difficulty level: {difficulty}
            - Each question should have 4 options (A, B, C, D)
            - Include the correct answer
            - Questions should test understanding of the content
            - Format each question as a JSON object with: question, options, correct_answer, explanation
            example:
            {example_json}
            Content:
            {audio_content}
            
            Return the questions as a JSON array.
            """
            
            response = self.client.models.generate_content(
                model=self.model,
                contents=[prompt]
            )
            
            # Parse the response to extract questions
            # Note: In a production environment, you'd want more robust JSON parsing
            questions = self._parse_quiz_response(response.text)
            return questions
            
        except Exception as e:
            logger.error(f"Error generating quiz questions: {str(e)}")
            return []

    def _parse_quiz_response(self, response_text: str) -> List[Dict]:
        """
        Parse the quiz response from Gemini into a structured format.
        
        Args:
            response_text (str): Raw response from Gemini
            
        Returns:
            List[Dict]: Parsed quiz questions
        """
        try:
            import json
            import re
            
            # Clean response text
            cleaned_text = response_text.strip()
            
            # Try to find JSON object with questions array
            json_match = re.search(r'\{.*"questions"\s*:\s*\[.*?\]\s*.*?\}', cleaned_text, re.DOTALL)
            if json_match:
                quiz_data = json.loads(json_match.group())
                return quiz_data.get("questions", [])
            
            # Try to find just the questions array
            array_match = re.search(r'\[.*?\]', cleaned_text, re.DOTALL)
            if array_match:
                return json.loads(array_match.group())
                
            # Fallback for malformed JSON
            return self._create_fallback_questions(cleaned_text)
            
        except (json.JSONDecodeError, AttributeError) as e:
            logger.warning(f"Failed to parse JSON response: {e}")
            return self._create_fallback_questions(response_text)


    def process_audio_and_generate_quiz(self, file_path: str, num_questions: int = 5, difficulty: str = "medium") -> Dict:
        """
        Complete workflow: upload audio, get transcription, and generate quiz questions.
        
        Args:
            file_path (str): Path to the audio file
            num_questions (int): Number of questions to generate
            difficulty (str): Difficulty level
            
        Returns:
            Dict: Complete quiz data including questions and metadata
        """
        try:
            # Step 1: Upload audio file
            file_uri = self.upload_audio_file(file_path)
            if not file_uri:
                return {"error": "Failed to upload audio file"}

            # Step 2: Get transcription
            transcription = self.get_audio_transcription(file_uri)
            if not transcription:
                return {"error": "Failed to get audio transcription"}

            # Step 3: Generate quiz questions
            questions = self.generate_quiz_questions(transcription, num_questions, difficulty)

            return {
                "success": True,
                "file_uri": file_uri,
                "transcription": transcription,
                "questions": questions,
                "metadata": {
                    "num_questions": len(questions),
                    "difficulty": difficulty,
                    "source_file": os.path.basename(file_path)
                }
            }
            
        except Exception as e:
            logger.error(f"Error in complete workflow: {str(e)}")
            return {"error": f"Workflow failed: {str(e)}"}

