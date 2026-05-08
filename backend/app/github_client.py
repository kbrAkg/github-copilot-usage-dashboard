from __future__ import annotations

import json
import logging

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

_TIMEOUT = 30.0


def _headers() -> dict[str, str]:
    return {
        "Accept": "application/json",
        "Authorization": f"Bearer {settings.github_token}",
        "X-GitHub-Api-Version": settings.github_api_version,
    }


async def _parse_ndjson_from_url(url: str) -> list[dict]:
    """Download a signed URL and parse NDJSON content line-by-line."""
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        lines = resp.text.strip().split("\n")
        return [json.loads(line) for line in lines if line.strip()]


async def _fetch_download_links(endpoint: str) -> list[dict]:
    """Call a GitHub Copilot metrics endpoint that returns download_links,
    then download and parse each NDJSON file, returning merged rows."""
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        resp = await client.get(
            f"{settings.github_api_url}{endpoint}",
            headers=_headers(),
        )
        resp.raise_for_status()
        body = resp.json()

    download_links: list[dict] = body.get("download_links", [])
    if not download_links:
        logger.warning("No download_links in response for %s", endpoint)
        return []

    all_rows: list[dict] = []
    for link_obj in download_links:
        url = link_obj.get("url", "")
        if url:
            rows = await _parse_ndjson_from_url(url)
            all_rows.extend(rows)
    return all_rows


# ---------- Enterprise endpoints ----------

async def get_enterprise_metrics_1day(slug: str, day: str | None = None) -> list[dict]:
    endpoint = f"/enterprises/{slug}/copilot/metrics"
    if day:
        endpoint += f"?since={day}&until={day}"
    return await _fetch_download_links(endpoint)


async def get_enterprise_metrics_28day_latest(slug: str) -> list[dict]:
    endpoint = f"/enterprises/{slug}/copilot/metrics"
    return await _fetch_download_links(endpoint)


async def get_enterprise_users_1day(slug: str, day: str | None = None) -> list[dict]:
    endpoint = f"/enterprises/{slug}/copilot/metrics/users"
    if day:
        endpoint += f"?since={day}&until={day}"
    return await _fetch_download_links(endpoint)


async def get_enterprise_users_28day_latest(slug: str) -> list[dict]:
    endpoint = f"/enterprises/{slug}/copilot/metrics/users"
    return await _fetch_download_links(endpoint)


# ---------- Organization endpoints ----------

async def get_org_metrics_1day(org: str, day: str | None = None) -> list[dict]:
    endpoint = f"/orgs/{org}/copilot/metrics"
    if day:
        endpoint += f"?since={day}&until={day}"
    return await _fetch_download_links(endpoint)


async def get_org_metrics_28day_latest(org: str) -> list[dict]:
    endpoint = f"/orgs/{org}/copilot/metrics"
    return await _fetch_download_links(endpoint)


async def get_org_users_1day(org: str, day: str | None = None) -> list[dict]:
    endpoint = f"/orgs/{org}/copilot/metrics/users"
    if day:
        endpoint += f"?since={day}&until={day}"
    return await _fetch_download_links(endpoint)


async def get_org_users_28day_latest(org: str) -> list[dict]:
    endpoint = f"/orgs/{org}/copilot/metrics/users"
    return await _fetch_download_links(endpoint)


# ---------- Team endpoints ----------

async def get_org_teams(org: str) -> list[dict]:
    """Fetch teams for an org from GitHub API."""
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        resp = await client.get(
            f"{settings.github_api_url}/orgs/{org}/teams",
            headers=_headers(),
            params={"per_page": 100},
        )
        resp.raise_for_status()
        return resp.json()


async def get_team_metrics_1day(org: str, team_slug: str, day: str | None = None) -> list[dict]:
    endpoint = f"/orgs/{org}/team/{team_slug}/copilot/metrics"
    if day:
        endpoint += f"?since={day}&until={day}"
    return await _fetch_download_links(endpoint)


async def get_team_metrics_28day_latest(org: str, team_slug: str) -> list[dict]:
    endpoint = f"/orgs/{org}/team/{team_slug}/copilot/metrics"
    return await _fetch_download_links(endpoint)


# ---------- Connection test ----------

async def test_connection() -> dict:
    """Verify GitHub token by hitting /user endpoint."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{settings.github_api_url}/user",
                headers=_headers(),
            )
            if resp.status_code == 200:
                return {"status": "ok", "user": resp.json().get("login", "unknown")}
            return {"status": "error", "code": resp.status_code, "message": resp.text[:200]}
    except Exception as exc:
        return {"status": "error", "message": str(exc)}
