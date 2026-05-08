from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import enterprise, organization, settings as settings_router

app = FastAPI(
    title="GitHub Copilot Usage Metrics Dashboard",
    version="1.0.0",
    description="Enterprise & Organization Copilot usage reporting API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(enterprise.router)
app.include_router(organization.router)
app.include_router(settings_router.router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
