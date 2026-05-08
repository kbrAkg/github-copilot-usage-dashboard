from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query
from httpx import HTTPStatusError

from app.config import settings
from app.models import EnterpriseDayMetrics, MetricsResponse, TeamInfo, TeamsListResponse, UserDayMetrics, UsersResponse

router = APIRouter(prefix="/api/org", tags=["organization"])


@router.get("/{org}/metrics", response_model=MetricsResponse)
async def org_metrics(org: str, day: str | None = Query(None)):
    if settings.mock_mode:
        from app.mock_data import generate_org_metrics
        all_metrics = generate_org_metrics(org, 28)
        if day:
            all_metrics = [m for m in all_metrics if m.date == day]
        return MetricsResponse(metrics=all_metrics, total_days=len(all_metrics))

    try:
        from app import github_client
        if day:
            rows = await github_client.get_org_metrics_1day(org, day)
        else:
            rows = await github_client.get_org_metrics_28day_latest(org)
        metrics = [EnterpriseDayMetrics(**r) for r in rows]
        return MetricsResponse(metrics=metrics, total_days=len(metrics))
    except HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e)) from e


@router.get("/{org}/users", response_model=UsersResponse)
async def org_users(org: str, day: str | None = Query(None)):
    if settings.mock_mode:
        from app.mock_data import generate_org_user_metrics
        all_users = generate_org_user_metrics(org, 28)
        if day:
            all_users = [u for u in all_users if u.date == day]
        return UsersResponse(users=all_users, total_users=len(all_users))

    try:
        from app import github_client
        if day:
            rows = await github_client.get_org_users_1day(org, day)
        else:
            rows = await github_client.get_org_users_28day_latest(org)
        users = [UserDayMetrics(**r) for r in rows]
        return UsersResponse(users=users, total_users=len(users))
    except HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e)) from e


@router.get("/{org}/teams", response_model=TeamsListResponse)
async def org_teams(org: str):
    if settings.mock_mode:
        from app.mock_data import get_mock_teams
        raw_teams = get_mock_teams(org)
        teams = [TeamInfo(**t) for t in raw_teams]
        return TeamsListResponse(teams=teams, org=org)

    try:
        from app import github_client
        raw = await github_client.get_org_teams(org)
        teams = [
            TeamInfo(
                slug=t.get("slug", ""),
                name=t.get("name", ""),
                description=t.get("description"),
                members_count=t.get("members_count"),
            )
            for t in raw
        ]
        return TeamsListResponse(teams=teams, org=org)
    except HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e)) from e


@router.get("/{org}/team/{team_slug}/metrics", response_model=MetricsResponse)
async def team_metrics(org: str, team_slug: str, day: str | None = Query(None)):
    if settings.mock_mode:
        from app.mock_data import generate_team_metrics
        all_metrics = generate_team_metrics(org, team_slug, 28)
        if day:
            all_metrics = [m for m in all_metrics if m.date == day]
        return MetricsResponse(metrics=all_metrics, total_days=len(all_metrics))

    try:
        from app import github_client
        if day:
            rows = await github_client.get_team_metrics_1day(org, team_slug, day)
        else:
            rows = await github_client.get_team_metrics_28day_latest(org, team_slug)
        metrics = [EnterpriseDayMetrics(**r) for r in rows]
        return MetricsResponse(metrics=metrics, total_days=len(metrics))
    except HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e)) from e
