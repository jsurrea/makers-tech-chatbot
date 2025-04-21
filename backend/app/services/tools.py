from typing import Any

from sqlmodel import select

from app.api.deps import SessionDep
from app.models import Item

VALID_CATEGORIES = {"tv", "audio", "laptop", "mobile", "gaming", "appliances"}


def get_products_by_category(
    category: str, session: SessionDep
) -> list[dict[str, Any]]:
    """
    Return a list of products for a given category from the database.

    Only supports the following categories: tv, audio, laptop, mobile, gaming, appliances.
    """
    if category.strip().lower() not in VALID_CATEGORIES:
        return []

    items = session.exec(
        select(Item).where(Item.category == category.strip().lower())
    ).all()

    return [
        {
            "title": item.title,
            "description": item.description,
            "brand": item.brand,
            "model": item.model,
            "color": item.color,
            "price": item.price,
            "discount": item.discount,
            "stock": item.stock,
        }
        for item in items
    ]
