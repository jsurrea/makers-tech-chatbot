import random

import requests
from sqlmodel import Session, create_engine, select

from app import crud
from app.core.config import settings
from app.models import Item, User, UserCreate

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))


# make sure all SQLModel models are imported (app.models) before initializing DB
# otherwise, SQLModel might fail to initialize relationships properly
# for more details: https://github.com/fastapi/full-stack-fastapi-template/issues/28


def init_db(session: Session) -> None:
    # Tables should be created with Alembic migrations
    # But if you don't want to use migrations, create
    # the tables un-commenting the next lines
    # from sqlmodel import SQLModel

    # This works because the models are already imported and registered from app.models
    # SQLModel.metadata.create_all(engine)

    user = session.exec(
        select(User).where(User.email == settings.FIRST_SUPERUSER)
    ).first()
    if not user:
        user_in = UserCreate(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            is_superuser=True,
        )
        user = crud.create_user(session=session, user_create=user_in)

    # Add products from fakestoreapi.in if they don't exist
    existing_item = session.exec(select(Item)).first()
    if not existing_item:
        print("Importing products from fakestoreapi.in...")
        FAKESTORE_URL = "https://fakestoreapi.in/api/products?limit=150"
        try:
            response = requests.get(FAKESTORE_URL, timeout=10)
            response.raise_for_status()
            products = response.json()
            for product in products.get("products"):
                item = Item(
                    title=product["title"],
                    description=product.get("description", ""),
                    brand=product.get("brand", "Unknown"),
                    model=product.get("model"),
                    color=product.get("color"),
                    price=product["price"],
                    discount=product.get("discount"),
                    category=product.get("category"),
                    image=product.get("image"),
                    stock=random.randint(0, 25),
                    owner_id=user.id,
                )
                session.add(item)
            session.commit()
            print("Product import completed.")
        except Exception as e:
            print(f"Failed to fetch or import products: {e}")
