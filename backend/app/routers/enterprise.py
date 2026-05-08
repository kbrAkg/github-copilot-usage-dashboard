from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query
from httpx import HTTPStatusError

from app.config import settings
from app.models import EnterpriseDayMetrics, MetricsResponse, UserDayMetrics, UsersResponse

router = APIRouter(prefix="/api/enterprise", tags=["enterprise"])


@router.get("/{slug}/metrics", response_model=MetricsResponse)
async def enterprise_metrics(slug: str, day: str | None = Query(None)):
    if settings.mock_mode:
        from app.mock_data import generate_enterprise_metrics
        all_metrics = generate_enterprise_metrics(28)
        if day:
            all_metrics = [m for m in all_metrics if m.date == day]
        return MetricsResponse(metrics=all_metrics, total_days=len(all_metrics))

    try:
        from app import github_client
        if day:
            rows = await github_client.get_enterprise_metrics_1day(slug, day)
        else:
            rows = await github_client.get_enterprise_metrics_28day_latest(slug)
        metrics = [EnterpriseDayMetrics(**r) for r in rows]
        return MetricsResponse(metrics=metrics, total_days=len(metrics))
    except HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e)) from e


@router.get("/{slug}/users", response_model=UsersResponse)
async def enterprise_users(slug: str, day: str | None = Query(None)):
    if settings.mock_mode:
        from app.mock_data import generate_user_metrics
        all_users = generate_user_metrics(28)
        if day:
            all_users = [u for u in all_users if u.date == day]
        return UsersResponse(users=all_users, total_users=len(all_users))

    try:
        from app import github_client
        if day:
            rows = await github_client.get_enterprise_users_1day(slug, day)
        else:
            rows = await github_client.get_enterprise_users_28day_latest(slug)
        users = [UserDayMetrics(**r) for r in rows]
        return UsersResponse(users=users, total_users=len(users))
    except HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e)) from e
