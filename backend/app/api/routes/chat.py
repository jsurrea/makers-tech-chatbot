import datetime
import uuid

from fastapi import APIRouter, Depends
from langchain.schema import AIMessage, HumanMessage
from pydantic import BaseModel
from sqlalchemy import desc
from sqlmodel import Session, select

from app.api.deps import get_current_user, get_db
from app.models import ChatMessage, User
from app.services.langchain_agent import create_agent_with_session
from app.services.tools import VALID_CATEGORIES

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


@router.post("/", response_model=ChatResponse)
def chat(
    body: ChatRequest,
    session: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ChatResponse:
    message = body.message.lower()

    # Count category usage
    for category in VALID_CATEGORIES:
        if category in message:
            count_field = f"{category}_count"
            current_count = getattr(user, count_field, 0)
            setattr(user, count_field, current_count + 1)
            session.add(user)
            session.commit()
            break

    # Get chat history

    chat_history = session.exec(
        select(ChatMessage)
        .where(ChatMessage.user_id == user.id)
        .order_by(desc(ChatMessage.timestamp))  # type: ignore
        .limit(10)
    ).all()

    langchain_history: list[HumanMessage | AIMessage] = []

    for msg in reversed(chat_history):  # Reverse to get chronological order
        if msg.role == "user":
            langchain_history.append(HumanMessage(content=msg.content))
        elif msg.role == "assistant":
            langchain_history.append(AIMessage(content=msg.content))

    agent = create_agent_with_session(session)

    enhanced_prompt = (
        f"You are a helpful tech assistant. {message} "
        "If you list products, explain what makes them different, what might be a good choice depending on budget, "
        "and speak in a friendly tone as if you're talking to a client in a store."
    )

    reply = agent.run({"input": enhanced_prompt, "chat_history": langchain_history})

    # Save user message
    session.add(
        ChatMessage(
            id=uuid.uuid4(),
            user_id=user.id,
            role="user",
            content=body.message,
            timestamp=datetime.datetime.now(datetime.timezone.utc),
        )
    )

    # Save assistant reply
    session.add(
        ChatMessage(
            id=uuid.uuid4(),
            user_id=user.id,
            role="assistant",
            content=reply,
            timestamp=datetime.datetime.now(datetime.timezone.utc),
        )
    )

    session.commit()

    return ChatResponse(reply=reply)
