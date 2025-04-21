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
    Recommend products using top-2 most interacted categories by user.
    """

    # Step 1: Get category interaction counts
    counts = {
        "tv": user.tv_count,
        "audio": user.audio_count,
        "laptop": user.laptop_count,
        "mobile": user.mobile_count,
        "gaming": user.gaming_count,
        "appliances": user.appliances_count,
    }

    # Step 2: Sort categories by interaction count
    sorted_categories = sorted(counts.items(), key=lambda x: x[1], reverse=True)
    top_1 = sorted_categories[0][0] if sorted_categories else None
    top_2 = sorted_categories[1][0] if len(sorted_categories) > 1 else None
    rest = [cat for cat, _ in sorted_categories[2:]]

    def get_items(categories: list[str]) -> list[Item]:
        if not categories:
            return []
        conditions = [Item.category == cat for cat in categories]
        stmt = select(Item).where(or_(*conditions))
        return list(db.exec(stmt).all())[:3]

    return {
        "highly_recommended": get_items([top_1]) if top_1 else [],
        "recommended": get_items([top_2]) if top_2 else [],
        "not_recommended": get_items(rest),
    }
