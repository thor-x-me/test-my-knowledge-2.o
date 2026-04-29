import logging
from pydantic import BaseModel
from typing import List, Optional
from openai import OpenAI

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FileItem(BaseModel):
    type: str
    file_id: str


class OpenAIService:
    def __init__(self, api_key: str, model: str = "gpt-4o-mini") -> None:
        self.client = OpenAI(api_key=api_key)
        self.model = model

    def upload_file(self, file_path: str) -> str:
        with open(file_path, "rb") as file_content:
            result = self.client.files.create(
                file=file_content,
                purpose="vision",
            )
            return result.id

    def generate_response(
        self,
        prompt: str,
        file_items: Optional[List[dict]] = None  # ✅ accept dicts, not FileItem models
    ):

        input_object = [
            {
                "role": "user",
                "content": [
                    {"type": "input_text", "text": prompt},
                ],
            }
        ]

        if file_items:
            for item in file_items:
                logger.info(f"Attaching file item: {item}")
                input_object[0]["content"].append(item)  # ✅ append dict directly

        response = self.client.responses.create(
            model=self.model,        # ✅ plain string after load_dotenv fix
            input=input_object
        )

        return response  # router accesses .output_text on this — that's fine