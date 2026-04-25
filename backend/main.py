from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import Base, engine
from routers import auth, notifications


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Otomatik tablo oluşturma — production için Alembic migration kullan
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="UI Starter API", version="0.1.0", lifespan=lifespan)

origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(notifications.router)


@app.get("/health")
def health():
    return {"status": "ok"}
