from __future__ import annotations

from fastapi import APIRouter

from app.config import settings
from app.models import SettingsRead, SettingsUpdate

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("", response_model=SettingsRead)
async def get_settings():
    return SettingsRead(
        enterprise_slug=settings.enterprise_slug,
        organizations=settings.org_list,
        mock_mode=settings.mock_mode,
        github_api_version=settings.github_api_version,
        github_api_url=settings.github_api_url,
        token_set=bool(settings.github_token),
        token_masked=settings.masked_token,
    )


@router.post("", response_model=SettingsRead)
async def update_settings(body: SettingsUpdate):
    if body.enterprise_slug is not None:
        settings.enterprise_slug = body.enterprise_slug
    if body.organizations is not None:
        settings.organizations = ",".join(body.organizations)
    if body.mock_mode is not None:
        settings.mock_mode = body.mock_mode
    if body.github_token is not None:
        settings.github_token = body.github_token

    return SettingsRead(
        enterprise_slug=settings.enterprise_slug,
        organizations=settings.org_list,
        mock_mode=settings.mock_mode,
        github_api_version=settings.github_api_version,
        github_api_url=settings.github_api_url,
        token_set=bool(settings.github_token),
        token_masked=settings.masked_token,
    )


@router.post("/test-connection")
async def test_connection():
    if settings.mock_mode:
        return {"status": "ok", "message": "Mock mode is enabled, connection test skipped."}
    if not settings.github_token:
        return {"status": "error", "message": "GitHub token is not set."}
    from app.github_client import test_connection as _test
    return await _test()
