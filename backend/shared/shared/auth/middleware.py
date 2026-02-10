from __future__ import annotations

from functools import wraps
from typing import Any

from shared.models.responses import FORBIDDEN, UNAUTHORIZED, error_response


def get_current_user(event: dict) -> dict[str, Any] | None:
    """Extract user info from Cognito JWT claims in API Gateway event."""
    claims = (
        event.get("requestContext", {}).get("authorizer", {}).get("claims", {})
    )
    if not claims:
        return None
    return {
        "user_id": claims.get("sub", ""),
        "email": claims.get("email", ""),
        "role": claims.get("custom:role", "learner"),
    }


def require_role(*allowed_roles: str):
    """Decorator that enforces role-based access control."""

    def decorator(func):
        @wraps(func)
        def wrapper(event, *args, **kwargs):
            user = get_current_user(event)
            if not user:
                return error_response(UNAUTHORIZED, "Authentication required", 401)
            if user["role"] not in allowed_roles:
                return error_response(FORBIDDEN, "Insufficient permissions", 403)
            return func(event, *args, **kwargs)

        return wrapper

    return decorator
