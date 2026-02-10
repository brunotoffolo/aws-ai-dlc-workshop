from __future__ import annotations

from typing import Any


def success_response(data: Any, status_code: int = 200) -> dict:
    return {"statusCode": status_code, "body": {"success": True, "data": data}}


def error_response(
    code: str, message: str, status_code: int = 400, details: list | None = None
) -> dict:
    body: dict[str, Any] = {"success": False, "error": {"code": code, "message": message}}
    if details:
        body["error"]["details"] = details
    return {"statusCode": status_code, "body": body}


# Standard error codes
VALIDATION_ERROR = "VALIDATION_ERROR"
UNAUTHORIZED = "UNAUTHORIZED"
FORBIDDEN = "FORBIDDEN"
NOT_FOUND = "NOT_FOUND"
CONFLICT = "CONFLICT"
ACCOUNT_LOCKED = "ACCOUNT_LOCKED"
EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED"
INTERNAL_ERROR = "INTERNAL_ERROR"
SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
