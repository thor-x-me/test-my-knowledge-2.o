import os
from typing import Optional, List, Dict
from backend.services.gemini_services import GeminiService
from google.genai.types import File
from pydantic import BaseModel
from dotenv import load_dotenv
from backend.prompts.summary_generator_prompt import prompt
load_dotenv()


class Documents(BaseModel):
    document: List[File]

class DocumentChatHistory(BaseModel):
    history: List[Dict[str, str]]

class DocumentChatService:
    def __init__(self):
        self.user_tier = None
        # Initialize empty in-memory state for each service instance
        self.history: List[Dict[str, str]] = []
        self.documents: List[File] = []  # using as a storage for uploaded files
        self.model = GeminiService(api_key=os.getenv("GEMINI_API_KEY"))
        self.document_chat_token_count = 0

    def upload_document(self, file_path: str) -> Optional[File]:
        file = self.model.upload_pdf_file(file_path)
        if file:
            self.documents.append(file)
        return file

    def chat_with_document(self, user_input: str) -> Optional[str]:
        
        # Combine history with current prompt
        full_prompt = "History:\n" + str(self.history) + "\nCurrent question: " + user_input
        
        response = self.model.generate_response(full_prompt, files=self.documents)
        
        # Add the new conversation to history
        self.history.append({user_input: response})
        
        # Best-effort token counting; ignore if counting fails
        try:
            count_response = self.model.get_token_count(full_prompt)
            # Some SDKs return an object with total_tokens; fall back to int(...) if possible
            total_tokens = getattr(count_response, "total_tokens", None)
            if isinstance(total_tokens, int):
                self.document_chat_token_count += total_tokens
        except Exception:
            pass
        return response

    def summarize_chat(self, chat_history):
        summary = self.model.generate_response(prompt.prompt + chat_history)
        return summary

