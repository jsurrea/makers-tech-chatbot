import random

from fastapi import APIRouter, Depends
from sqlmodel import Session, or_, select

from app.api.deps import get_current_user, get_db
from app.models import Item, User

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("/")
def get_recommendations(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict[str, list[Item]]:
    """
    Recommend products using a simple probabilistic model based on category interest.
    """

    # User interaction counts per category
    raw_counts = {
        "tv": user.tv_count,
        "audio": user.audio_count,
        "laptop": user.laptop_count,
        "mobile": user.mobile_count,
        "gaming": user.gaming_count,
        "appliances": user.appliances_count,
    }

    total = sum(raw_counts.values())

    if total == 0:
        # Default fallback when there's no history
        raw_counts = {k: 1 for k in raw_counts}
        total = sum(raw_counts.values())

    # Probabilities per category
    category_probs = {k: v / total for k, v in raw_counts.items()}

    # Sample categories according to probability
    all_categories = list(category_probs.keys())
    weights = [category_probs[c] for c in all_categories]

    sampled_categories = random.choices(all_categories, weights=weights, k=3)
    sampled_categories = list(set(sampled_categories))  # remove duplicates

    def get_items(categories: list[str]) -> list[Item]:
        if not categories:
            return []

        # Build condition: (Item.category == cat1) OR (Item.category == cat2) ...
        conditions = [Item.category == cat for cat in categories]
        stmt = select(Item).where(or_(*conditions))
        return list(db.exec(stmt).all())

    # We can still return 3 tiers, but probabilistically assigned
    return {
        "highly_recommended": get_items([sampled_categories[0]])
        if len(sampled_categories) > 0
        else [],
        "recommended": get_items([sampled_categories[1]])
        if len(sampled_categories) > 1
        else [],
        "not_recommended": get_items(
            [c for c in all_categories if c not in sampled_categories]
        ),
    }
