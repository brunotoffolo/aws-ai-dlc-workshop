"""Standard API response helpers and error constants."""

import json
from typing import Any

# Error constants (status code, error type)
NOT_FOUND = (404, "NOT_FOUND")
CONFLICT = (409, "CONFLICT")
VALIDATION_ERROR = (400, "VALIDATION_ERROR")
UNAUTHORIZED = (401, "UNAUTHORIZED")
ACCOUNT_LOCKED = (403, "ACCOUNT_LOCKED")
EMAIL_NOT_VERIFIED = (403, "EMAIL_NOT_VERIFIED")
FORBIDDEN = (403, "FORBIDDEN")


def success_response(body: Any, status_code: int = 200) -> dict:
    return {
        "statusCode": status_code,
        "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
        "body": json.dumps(body, default=str),
    }


def error_response(error: tuple[int, str] | str, message: str, details: Any = None) -> dict:
    if isinstance(error, tuple):
        status_code, error_type = error
    else:
        status_code, error_type = 400, error

    body: dict[str, Any] = {"error": error_type, "message": message}
    if details:
        body["details"] = details

    return {
        "statusCode": status_code,
        "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
        "body": json.dumps(body, default=str),
    }
