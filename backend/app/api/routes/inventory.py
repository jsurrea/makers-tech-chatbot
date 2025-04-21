from fastapi import APIRouter, Depends
from sqlmodel import Session, func, select

from app.api.deps import get_current_user, get_db
from app.models import Item, User

router = APIRouter(prefix="/inventory", tags=["inventory"])


@router.get("/summary/")
def inventory_summary(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict[str, dict[str, int]] | dict[str, str]:
    """
    Returns inventory summary grouped by category and brand.
    Only accessible to superusers.
    """
    if not user.is_superuser:
        return {"error": "You are not authorized to access this endpoint."}

    # Group by category
    stmt_category = select(Item.category, func.count()).group_by(Item.category)
    category_data = db.exec(stmt_category).all()
    category_summary = dict(category_data)

    # Group by brand
    stmt_brand = select(Item.brand, func.count()).group_by(Item.brand)
    brand_data = db.exec(stmt_brand).all()
    brand_summary = dict(brand_data)

    return {
        "by_category": category_summary,
        "by_brand": brand_summary,
    }


@router.get("/low-stock/")
def low_stock_items(
    threshold: int = 5,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[Item] | dict[str, str]:
    """
    Returns a list of items with stock below the threshold.
    Only accessible to superusers.
    """
    if not user.is_superuser:
        return {"error": "You are not authorized to access this endpoint."}

    items = db.exec(select(Item).where(Item.stock < threshold)).all()
    return list(items)
