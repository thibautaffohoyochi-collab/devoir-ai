from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from contextlib import asynccontextmanager
from app.config import get_settings
from app.database import init_db
from app.routers import auth, devoirs

settings = get_settings()
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="DevoirAI API",
    description="Plateforme d'aide aux devoirs étudiants avec IA",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS — accepte * si configuré, sinon liste précise
origins = settings.origins_list
if "*" in origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Routes
app.include_router(auth.router, prefix="/api")
app.include_router(devoirs.router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "DevoirAI API en ligne", "docs": "/docs"}


@app.get("/health")
async def health():
    return {"status": "ok"}
