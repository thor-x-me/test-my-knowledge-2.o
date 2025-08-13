from pydantic import BaseModel

class SummarizeChatPrompt(BaseModel):
    prompt: str


