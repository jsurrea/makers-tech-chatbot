from langchain.agents import AgentExecutor, AgentType, initialize_agent
from langchain.tools import Tool
from langchain_community.chat_models import ChatOpenAI

from app.api.deps import SessionDep
from app.core.config import settings
from app.services.tools import get_products_by_category


def make_product_lookup_tool(session: SessionDep) -> Tool:
    return Tool(
        name="get_products_by_category",
        func=lambda category: get_products_by_category(category, session),
        description=(
            "Use this tool to get a list of products by category. "
            "Valid categories are: tv, audio, laptop, mobile, gaming, appliances. "
            "Call this tool if the user asks about available products or details."
        ),
    )


def create_agent_with_session(session: SessionDep) -> AgentExecutor:
    llm = ChatOpenAI(
        temperature=0,
        model="gpt-4.1-nano",
        api_key=settings.OPENAI_API_KEY,
    )
    tool = make_product_lookup_tool(session)
    return initialize_agent(
        tools=[tool],
        llm=llm,
        agent=AgentType.CHAT_CONVERSATIONAL_REACT_DESCRIPTION,
        verbose=True,
    )
