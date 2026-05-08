from __future__ import annotations

from pydantic import BaseModel


# ---------- Token / CLI ----------
class TokenUsage(BaseModel):
    input_tokens: int = 0
    output_tokens: int = 0
    input_token_limit: int = 0


class CLITotals(BaseModel):
    token_usage: TokenUsage | None = None


# ---------- Feature totals ----------
class FeatureTotals(BaseModel):
    feature: str  # code_completion | chat | agent | pull_requests | code_review
    editor: str | None = None
    model: str | None = None
    total_code_suggestions: int = 0
    total_code_acceptances: int = 0
    total_code_lines_suggested: int = 0
    total_code_lines_accepted: int = 0
    total_engaged_users: int = 0
    total_chat_turns: int = 0
    total_chat_acceptances: int = 0


# ---------- IDE totals ----------
class IDETotals(BaseModel):
    name: str
    version: str | None = None
    total_engaged_users: int = 0
    total_code_suggestions: int = 0
    total_code_acceptances: int = 0
    total_code_lines_suggested: int = 0
    total_code_lines_accepted: int = 0
    total_chat_turns: int = 0
    total_chat_acceptances: int = 0


# ---------- Model-feature totals ----------
class ModelFeatureTotals(BaseModel):
    model: str
    feature: str
    is_custom_model: bool = False
    total_engaged_users: int = 0
    total_code_suggestions: int = 0
    total_code_acceptances: int = 0
    total_code_lines_suggested: int = 0
    total_code_lines_accepted: int = 0
    total_chat_turns: int = 0
    total_chat_acceptances: int = 0


# ---------- Language-model totals ----------
class LanguageModelTotals(BaseModel):
    language: str
    model: str
    total_engaged_users: int = 0
    total_code_suggestions: int = 0
    total_code_acceptances: int = 0
    total_code_lines_suggested: int = 0
    total_code_lines_accepted: int = 0


# ---------- Pull request metrics ----------
class PullRequestMetrics(BaseModel):
    total_engaged_users: int = 0
    total_pr_summaries_created: int = 0
    total_pr_summaries_with_code_changes: int = 0


# ---------- Daily enterprise metrics ----------
class EnterpriseDayMetrics(BaseModel):
    date: str  # YYYY-MM-DD
    total_active_users: int = 0
    total_engaged_users: int = 0
    copilot_dau: int = 0
    copilot_wau: int = 0
    copilot_mau: int = 0
    total_code_suggestions: int = 0
    total_code_acceptances: int = 0
    total_code_lines_suggested: int = 0
    total_code_lines_accepted: int = 0
    total_chat_turns: int = 0
    total_chat_acceptances: int = 0
    totals_by_feature: list[FeatureTotals] = []
    totals_by_ide: list[IDETotals] = []
    totals_by_model_feature: list[ModelFeatureTotals] = []
    totals_by_language_model: list[LanguageModelTotals] = []
    totals_by_cli: CLITotals | None = None
    pull_requests: PullRequestMetrics | None = None


# ---------- Daily user metrics ----------
class UserDayMetrics(BaseModel):
    date: str
    user_login: str
    avatar_url: str | None = None
    total_code_suggestions: int = 0
    total_code_acceptances: int = 0
    total_code_lines_suggested: int = 0
    total_code_lines_accepted: int = 0
    total_chat_turns: int = 0
    total_chat_acceptances: int = 0
    code_generation_activity_count: int = 0
    code_acceptance_activity_count: int = 0
    loc_added_sum: int = 0
    used_agent: bool = False
    used_chat: bool = False
    used_cli: bool = False
    totals_by_feature: list[FeatureTotals] = []
    totals_by_ide: list[IDETotals] = []
    totals_by_language_model: list[LanguageModelTotals] = []
    totals_by_cli: CLITotals | None = None


# ---------- API responses ----------
class MetricsResponse(BaseModel):
    metrics: list[EnterpriseDayMetrics]
    total_days: int = 0


class UsersResponse(BaseModel):
    users: list[UserDayMetrics]
    total_users: int = 0


class SettingsRead(BaseModel):
    enterprise_slug: str
    organizations: list[str]
    mock_mode: bool
    github_api_version: str
    github_api_url: str
    token_set: bool
    token_masked: str


class SettingsUpdate(BaseModel):
    enterprise_slug: str | None = None
    organizations: list[str] | None = None
    mock_mode: bool | None = None
    github_token: str | None = None


# ---------- Team models ----------
class TeamInfo(BaseModel):
    slug: str
    name: str
    description: str | None = None
    members_count: int | None = None


class TeamsListResponse(BaseModel):
    teams: list[TeamInfo]
    org: str
