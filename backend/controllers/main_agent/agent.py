from contextlib import asynccontextmanager
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langgraph.prebuilt import ToolNode, tools_condition
import os
from fastapi.params import Depends
from sqlalchemy.orm import Session
from backend.tools.maths import multiply
from database.db_models import get_db
from database.agent_chat_db import create_agent_chat
from backend.utils import authenticate_user_get_user_details
import logging

logger = logging.getLogger(__name__)
from dotenv import load_dotenv

load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")
DB_PORT = os.getenv("DB_PORT")

DB_URI = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}?sslmode=disable"

MODEL = os.getenv("AGENT_OPEN_AI_MODEL")
llm = ChatOpenAI(model=MODEL)
model = llm.bind_tools([multiply])
# Global graph variable
graph = None

@asynccontextmanager
async def lifespan(app: APIRouter):
    """Manage the lifecycle of the checkpointer and graph."""
    global graph
    
    async with AsyncPostgresSaver.from_conn_string(DB_URI) as checkpointer:
        await checkpointer.setup()  # Run once to create tables

        async def call_model(state: MessagesState):
            response = await model.ainvoke(state["messages"])
            return {"messages": response}

        builder = StateGraph(MessagesState)
        builder.add_node(call_model)
        builder.add_node("tools", ToolNode([multiply]))
        builder.add_edge(START, "call_model")
        builder.add_conditional_edges(
        "call_model",
        tools_condition,
        )
        builder.add_edge("tools", "call_model")
        builder.add_edge("call_model", END)
        graph = builder.compile(checkpointer=checkpointer)

        yield  # App runs here, checkpointer stays alive

    # automatic cleanup when context manager exits
    graph = None


router = APIRouter(lifespan=lifespan)

class AgentChatRequest(BaseModel):
    message: str
    chat_id: str = None

@router.post("/chat")
async def chat(request: Request, data: AgentChatRequest, db: Session = Depends(get_db)):
    """Non-streaming chat endpoint with persistent memory per thread_id."""
    user_id = authenticate_user_get_user_details(request).get("user_id")
    if not data.chat_id:
        data.chat_id = create_agent_chat(db=db, user_id=user_id)

    config = {"configurable": {"thread_id": data.chat_id}}
    final_message = None

    async for chunk in graph.astream(
        {"messages": [{"role": "user", "content": data.message}]},
        config,
        stream_mode="values"
    ):
        final_message = chunk["messages"][-1]

    return {
        "response": final_message.content,
        "chat_id": data.chat_id
    }


@router.post("/chat/stream")
async def chat_stream(request: Request, data: AgentChatRequest, db: Session = Depends(get_db)):
    """token-by-token streaming via SSE."""
    user_id = authenticate_user_get_user_details(request).get("user_id")
    if not data.chat_id:
        data.chat_id = create_agent_chat(db=db, user_id=user_id)

    config = {"configurable": {"thread_id": data.chat_id}}

    async def generate():
        yield f"event: chat_id\ndata: {data.chat_id}\n\n"
        async for event in graph.astream_events(
            {"messages": [{"role": "user", "content": data.message}]},
            config,
            version="v2"
        ):
            if event["event"] == "on_chat_model_stream":
                token = event["data"]["chunk"].content
                if token:
                    yield f"data: {token}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
