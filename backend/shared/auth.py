"""Auth utilities for extracting user context from API Gateway events."""

from typing import Any


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
