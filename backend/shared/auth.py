"""Auth utilities for extracting user context from API Gateway events."""

from typing import Any
from functools import wraps


def get_user_context(event: dict[str, Any]) -> dict[str, str]:
    """Extract user info from Cognito authorizer claims in API Gateway event."""
    claims = (
        event.get("requestContext", {})
        .get("authorizer", {})
        .get("claims", {})
    )
    return {
        "user_id": claims.get("sub", ""),
        "email": claims.get("email", ""),
        "groups": claims.get("cognito:groups", ""),
    }


def get_current_user(event: dict[str, Any]) -> dict[str, str]:
    """Alias for get_user_context — used by API services."""
    return get_user_context(event)


def require_role(event: dict[str, Any], role: str) -> bool:
    """Check if user has the required role/group."""
    ctx = get_user_context(event)
    groups = ctx.get("groups", "")
    return role.lower() in groups.lower()
