from __future__ import annotations

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    github_token: str = ""
    github_api_url: str = "https://api.github.com"
    github_api_version: str = "2026-03-10"
    mock_mode: bool = True
    enterprise_slug: str = "my-enterprise"
    organizations: str = "org-alpha,org-beta,org-gamma"

    @property
    def org_list(self) -> list[str]:
        return [o.strip() for o in self.organizations.split(",") if o.strip()]

    @property
    def masked_token(self) -> str:
        if not self.github_token:
            return ""
        t = self.github_token
        if len(t) <= 8:
            return "****"
        return t[:4] + "****" + t[-4:]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
