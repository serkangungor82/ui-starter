from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import Base, engine
from middleware.tenant import TenantMiddleware
from routers import (
    auth,
    notifications,
    oauth_microsoft,
    platform_auth,
    signup,
    tenant_permissions,
    tenant_products,
    tenant_roles,
    tenant_users,
)


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
    allow_origin_regex=r"https?://([a-z0-9-]+\.)?localhost(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# TenantMiddleware CORS'tan SONRA register edildi — Starlette LIFO çalıştığı için
# request akışında CORS önce, sonra TenantMiddleware tetiklenir.
app.add_middleware(TenantMiddleware)

app.include_router(auth.router)
app.include_router(notifications.router)
app.include_router(platform_auth.router)
app.include_router(signup.router)
app.include_router(tenant_users.router)
app.include_router(tenant_roles.router)
app.include_router(tenant_permissions.router)
app.include_router(tenant_products.router)
app.include_router(oauth_microsoft.router)


@app.get("/health")
def health():
    return {"status": "ok"}
