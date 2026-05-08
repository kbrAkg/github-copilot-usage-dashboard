from __future__ import annotations

import random
from datetime import date, timedelta

from app.models import (
    CLITotals,
    EnterpriseDayMetrics,
    FeatureTotals,
    IDETotals,
    LanguageModelTotals,
    ModelFeatureTotals,
    PullRequestMetrics,
    TokenUsage,
    UserDayMetrics,
)

_USERS = [
    "alice", "bob", "charlie", "diana", "eve", "frank", "grace", "hank",
    "ivy", "jack", "kate", "leo", "mona", "nick", "olivia", "paul",
    "quinn", "rachel", "sam", "tina",
]

_IDES = [
    ("VS Code", "1.96.0"),
    ("JetBrains IntelliJ", "2025.1"),
    ("Neovim", "0.10.2"),
    ("Visual Studio", "17.12"),
]

_MODELS = ["gpt-4o", "claude-sonnet-4", "gpt-4o-mini"]
_FEATURES = ["code_completion", "chat", "agent"]
_LANGUAGES = ["python", "javascript", "typescript", "java", "go", "rust", "c#"]

_ORGS = ["org-alpha", "org-beta", "org-gamma"]

_ORG_TEAMS: dict[str, list[dict]] = {
    "org-alpha": [
        {"slug": "team-frontend", "name": "Frontend Team", "description": "UI and web development"},
        {"slug": "team-backend", "name": "Backend Team", "description": "APIs and services"},
    ],
    "org-beta": [
        {"slug": "team-platform", "name": "Platform Team", "description": "Infrastructure and DevOps"},
    ],
    "org-gamma": [],
}

random.seed(42)


def _rand(lo: int, hi: int) -> int:
    return random.randint(lo, hi)


def _make_feature_totals() -> list[FeatureTotals]:
    result: list[FeatureTotals] = []
    for f in _FEATURES:
        result.append(FeatureTotals(
            feature=f,
            total_code_suggestions=_rand(500, 3000) if f == "code_completion" else 0,
            total_code_acceptances=_rand(200, 1500) if f == "code_completion" else 0,
            total_code_lines_suggested=_rand(2000, 8000) if f == "code_completion" else 0,
            total_code_lines_accepted=_rand(800, 4000) if f == "code_completion" else 0,
            total_engaged_users=_rand(5, 18),
            total_chat_turns=_rand(50, 400) if f in ("chat", "agent") else 0,
            total_chat_acceptances=_rand(20, 200) if f in ("chat", "agent") else 0,
        ))
    return result


def _make_ide_totals() -> list[IDETotals]:
    return [
        IDETotals(
            name=name,
            version=ver,
            total_engaged_users=_rand(2, 12),
            total_code_suggestions=_rand(100, 2000),
            total_code_acceptances=_rand(50, 1000),
            total_code_lines_suggested=_rand(500, 5000),
            total_code_lines_accepted=_rand(200, 2500),
            total_chat_turns=_rand(10, 200),
            total_chat_acceptances=_rand(5, 100),
        )
        for name, ver in _IDES
    ]


def _make_model_feature_totals() -> list[ModelFeatureTotals]:
    result: list[ModelFeatureTotals] = []
    for model in _MODELS:
        for feature in _FEATURES:
            result.append(ModelFeatureTotals(
                model=model,
                feature=feature,
                total_engaged_users=_rand(2, 10),
                total_code_suggestions=_rand(50, 800) if feature == "code_completion" else 0,
                total_code_acceptances=_rand(20, 400) if feature == "code_completion" else 0,
                total_code_lines_suggested=_rand(200, 3000) if feature == "code_completion" else 0,
                total_code_lines_accepted=_rand(100, 1500) if feature == "code_completion" else 0,
                total_chat_turns=_rand(10, 150) if feature in ("chat", "agent") else 0,
                total_chat_acceptances=_rand(5, 80) if feature in ("chat", "agent") else 0,
            ))
    return result


def _make_language_model_totals() -> list[LanguageModelTotals]:
    result: list[LanguageModelTotals] = []
    for lang in _LANGUAGES[:4]:
        for model in _MODELS[:2]:
            result.append(LanguageModelTotals(
                language=lang,
                model=model,
                total_engaged_users=_rand(1, 8),
                total_code_suggestions=_rand(30, 500),
                total_code_acceptances=_rand(10, 250),
                total_code_lines_suggested=_rand(100, 2000),
                total_code_lines_accepted=_rand(50, 1000),
            ))
    return result


def _make_cli_totals() -> CLITotals:
    return CLITotals(
        token_usage=TokenUsage(
            input_tokens=_rand(5000, 50000),
            output_tokens=_rand(2000, 20000),
            input_token_limit=150000,
        )
    )


def _make_pr_metrics() -> PullRequestMetrics:
    return PullRequestMetrics(
        total_engaged_users=_rand(3, 12),
        total_pr_summaries_created=_rand(5, 40),
        total_pr_summaries_with_code_changes=_rand(2, 20),
    )


def generate_enterprise_metrics(days: int = 28) -> list[EnterpriseDayMetrics]:
    today = date.today()
    metrics: list[EnterpriseDayMetrics] = []
    for i in range(days, 0, -1):
        d = today - timedelta(days=i)
        dau = _rand(10, 20)
        metrics.append(EnterpriseDayMetrics(
            date=d.isoformat(),
            total_active_users=dau,
            total_engaged_users=_rand(8, dau),
            copilot_dau=dau,
            copilot_wau=_rand(dau, 20),
            copilot_mau=_rand(15, 20),
            total_code_suggestions=_rand(800, 5000),
            total_code_acceptances=_rand(300, 2500),
            total_code_lines_suggested=_rand(3000, 12000),
            total_code_lines_accepted=_rand(1000, 6000),
            total_chat_turns=_rand(100, 600),
            total_chat_acceptances=_rand(40, 300),
            totals_by_feature=_make_feature_totals(),
            totals_by_ide=_make_ide_totals(),
            totals_by_model_feature=_make_model_feature_totals(),
            totals_by_language_model=_make_language_model_totals(),
            totals_by_cli=_make_cli_totals(),
            pull_requests=_make_pr_metrics(),
        ))
    return metrics


def generate_user_metrics(days: int = 28) -> list[UserDayMetrics]:
    today = date.today()
    users: list[UserDayMetrics] = []
    for i in range(days, 0, -1):
        d = today - timedelta(days=i)
        for login in _USERS:
            suggestions = _rand(10, 300)
            acceptances = _rand(5, min(suggestions, 200))
            lines_suggested = _rand(50, 1500)
            lines_accepted = _rand(20, min(lines_suggested, 800))
            users.append(UserDayMetrics(
                date=d.isoformat(),
                user_login=login,
                avatar_url=f"https://github.com/{login}.png",
                total_code_suggestions=suggestions,
                total_code_acceptances=acceptances,
                total_code_lines_suggested=lines_suggested,
                total_code_lines_accepted=lines_accepted,
                total_chat_turns=_rand(5, 80),
                total_chat_acceptances=_rand(2, 40),
                code_generation_activity_count=_rand(5, 50),
                code_acceptance_activity_count=_rand(3, 30),
                loc_added_sum=lines_accepted,
                used_agent=random.choice([True, False]),
                used_chat=random.choice([True, True, False]),
                used_cli=random.choice([True, False, False]),
                totals_by_feature=[
                    FeatureTotals(
                        feature=f,
                        total_code_suggestions=_rand(5, 100) if f == "code_completion" else 0,
                        total_code_acceptances=_rand(2, 50) if f == "code_completion" else 0,
                        total_code_lines_suggested=_rand(20, 500) if f == "code_completion" else 0,
                        total_code_lines_accepted=_rand(10, 250) if f == "code_completion" else 0,
                        total_engaged_users=1,
                        total_chat_turns=_rand(1, 20) if f in ("chat", "agent") else 0,
                        total_chat_acceptances=_rand(0, 10) if f in ("chat", "agent") else 0,
                    )
                    for f in _FEATURES
                ],
                totals_by_ide=[
                    IDETotals(
                        name=random.choice(_IDES)[0],
                        total_engaged_users=1,
                        total_code_suggestions=_rand(10, 100),
                        total_code_acceptances=_rand(5, 50),
                        total_code_lines_suggested=_rand(50, 500),
                        total_code_lines_accepted=_rand(20, 250),
                    )
                ],
                totals_by_language_model=[
                    LanguageModelTotals(
                        language=random.choice(_LANGUAGES),
                        model=random.choice(_MODELS),
                        total_engaged_users=1,
                        total_code_suggestions=_rand(5, 80),
                        total_code_acceptances=_rand(2, 40),
                        total_code_lines_suggested=_rand(20, 400),
                        total_code_lines_accepted=_rand(10, 200),
                    )
                ],
                totals_by_cli=_make_cli_totals() if random.random() > 0.6 else None,
            ))
    return users


def generate_org_metrics(org_name: str, days: int = 28) -> list[EnterpriseDayMetrics]:
    """Generate org-level metrics (same shape as enterprise, scaled down)."""
    today = date.today()
    scale = {"org-alpha": 0.5, "org-beta": 0.3, "org-gamma": 0.2}.get(org_name, 0.3)
    metrics: list[EnterpriseDayMetrics] = []
    for i in range(days, 0, -1):
        d = today - timedelta(days=i)
        dau = max(2, int(_rand(10, 20) * scale))
        metrics.append(EnterpriseDayMetrics(
            date=d.isoformat(),
            total_active_users=dau,
            total_engaged_users=max(1, _rand(1, dau)),
            copilot_dau=dau,
            copilot_wau=_rand(dau, max(dau + 1, int(20 * scale))),
            copilot_mau=_rand(max(1, int(10 * scale)), max(2, int(20 * scale))),
            total_code_suggestions=int(_rand(800, 5000) * scale),
            total_code_acceptances=int(_rand(300, 2500) * scale),
            total_code_lines_suggested=int(_rand(3000, 12000) * scale),
            total_code_lines_accepted=int(_rand(1000, 6000) * scale),
            total_chat_turns=int(_rand(100, 600) * scale),
            total_chat_acceptances=int(_rand(40, 300) * scale),
            totals_by_feature=_make_feature_totals(),
            totals_by_ide=_make_ide_totals(),
            totals_by_model_feature=_make_model_feature_totals(),
            totals_by_language_model=_make_language_model_totals(),
            totals_by_cli=_make_cli_totals(),
            pull_requests=_make_pr_metrics(),
        ))
    return metrics


def generate_org_user_metrics(org_name: str, days: int = 28) -> list[UserDayMetrics]:
    """Generate org-level user metrics (subset of users)."""
    user_map = {
        "org-alpha": _USERS[:10],
        "org-beta": _USERS[5:15],
        "org-gamma": _USERS[12:20],
    }
    org_users = user_map.get(org_name, _USERS[:8])
    all_users = generate_user_metrics(days)
    return [u for u in all_users if u.user_login in org_users]


def get_mock_teams(org_name: str) -> list[dict]:
    """Return mock team list for an org."""
    return _ORG_TEAMS.get(org_name, [])


def generate_team_metrics(org_name: str, team_slug: str, days: int = 28) -> list[EnterpriseDayMetrics]:
    """Generate team-level metrics (scaled down from org metrics)."""
    team_scales = {
        "team-frontend": 0.4,
        "team-backend": 0.35,
        "team-platform": 0.5,
    }
    scale = team_scales.get(team_slug, 0.25)
    org_scale = {"org-alpha": 0.5, "org-beta": 0.3, "org-gamma": 0.2}.get(org_name, 0.3)
    combined_scale = scale * org_scale / 0.3  # normalize relative to org

    today = date.today()
    metrics: list[EnterpriseDayMetrics] = []
    for i in range(days, 0, -1):
        d = today - timedelta(days=i)
        dau = max(2, int(_rand(10, 20) * combined_scale))
        metrics.append(EnterpriseDayMetrics(
            date=d.isoformat(),
            total_active_users=dau,
            total_engaged_users=max(1, _rand(1, dau)),
            copilot_dau=dau,
            copilot_wau=_rand(dau, max(dau + 1, int(20 * combined_scale))),
            copilot_mau=_rand(max(1, int(10 * combined_scale)), max(2, int(20 * combined_scale))),
            total_code_suggestions=int(_rand(800, 5000) * combined_scale),
            total_code_acceptances=int(_rand(300, 2500) * combined_scale),
            total_code_lines_suggested=int(_rand(3000, 12000) * combined_scale),
            total_code_lines_accepted=int(_rand(1000, 6000) * combined_scale),
            total_chat_turns=int(_rand(100, 600) * combined_scale),
            total_chat_acceptances=int(_rand(40, 300) * combined_scale),
            totals_by_feature=_make_feature_totals(),
            totals_by_ide=_make_ide_totals(),
            totals_by_model_feature=_make_model_feature_totals(),
            totals_by_language_model=_make_language_model_totals(),
            totals_by_cli=_make_cli_totals(),
            pull_requests=_make_pr_metrics(),
        ))
    return metrics
