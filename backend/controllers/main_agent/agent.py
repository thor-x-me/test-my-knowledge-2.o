from contextlib import asynccontextmanager
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from langchain.chat_models import init_chat_model
from langgraph.graph import StateGraph, MessagesState, START
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
import os
from backend.tools.maths import multiply
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
        builder.add_edge(START, "call_model")
        graph = builder.compile(checkpointer=checkpointer)

        yield  # App runs here, checkpointer stays alive

    # Cleanup happens automatically when context manager exits
    graph = None


router = APIRouter(lifespan=lifespan)

class ChatRequest(BaseModel):
    message: str
    thread_id: str = "default"


class ChatResponse(BaseModel):
    response: str
    thread_id: str


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Non-streaming chat endpoint with persistent memory per thread_id."""
    if graph is None:
        raise HTTPException(status_code=503, detail="Graph not initialized")

    config = {"configurable": {"thread_id": request.thread_id}}
    final_message = None

    async for chunk in graph.astream(
        {"messages": [{"role": "user", "content": request.message}]},
        config,
        stream_mode="values"
    ):
        final_message = chunk["messages"][-1]

    return ChatResponse(
        response=final_message.content,
        thread_id=request.thread_id
    )


@router.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """True token-by-token streaming via SSE."""
    if graph is None:
        raise HTTPException(status_code=503, detail="Graph not initialized")

    config = {"configurable": {"thread_id": request.thread_id}}

    async def generate():
        async for event in graph.astream_events(
            {"messages": [{"role": "user", "content": request.message}]},
            config,
            version="v2"
        ):
            if event["event"] == "on_chat_model_stream":
                token = event["data"]["chunk"].content
                if token:
                    yield f"data: {token}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")