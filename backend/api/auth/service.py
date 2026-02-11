from __future__ import annotations

import re
from datetime import datetime, timedelta

import boto3

from shared.config import config
from shared.db import Keys, db_client
from shared.models.responses import (
    ACCOUNT_LOCKED,
    CONFLICT,
    EMAIL_NOT_VERIFIED,
    UNAUTHORIZED,
    VALIDATION_ERROR,
    error_response,
    success_response,
)

cognito = boto3.client("cognito-idp")

PASSWORD_PATTERN = re.compile(r"^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?\":{}|<>]).{8,}$")
MAX_FAILED_LOGINS = 5
LOCKOUT_MINUTES = 15


def register_user(email: str, password: str, role: str = "learner") -> dict:
    if not PASSWORD_PATTERN.match(password):
        return error_response(VALIDATION_ERROR, "Password must have min 8 chars, 1 uppercase, 1 number, 1 special char")

    existing = db_client.query(Keys.email_gsi1pk(email), "USER", index_name="GSI1")
    if existing["items"]:
        return error_response(CONFLICT, "Email already registered", 409)

    resp = cognito.sign_up(
        ClientId=config.USER_POOL_CLIENT_ID,
        Username=email,
        Password=password,
        UserAttributes=[{"Name": "custom:role", "Value": role}],
    )
    user_id = resp["UserSub"]

    db_client.put_item({
        "PK": Keys.user_pk(user_id),
        "SK": Keys.profile_sk(),
        "GSI1PK": Keys.email_gsi1pk(email),
        "GSI1SK": "USER",
        "user_id": user_id,
        "email": email,
        "role": role,
        "status": "pending_verification",
        "failed_login_count": 0,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    })

    return success_response({"user_id": user_id, "message": "Verification email sent"}, 201)


def login(email: str, password: str) -> dict:
    result = db_client.query(Keys.email_gsi1pk(email), "USER", index_name="GSI1")
    if not result["items"]:
        return error_response(UNAUTHORIZED, "Invalid email or password", 401)

    user = result["items"][0]
    pk, sk = user["PK"], user["SK"]

    if user.get("locked_until"):
        lock_time = datetime.fromisoformat(user["locked_until"])
        if datetime.utcnow() < lock_time:
            remaining = int((lock_time - datetime.utcnow()).total_seconds())
            return error_response(ACCOUNT_LOCKED, "Account temporarily locked", 403, [{"retry_after": remaining}])
        db_client.update_item(pk, sk, {"failed_login_count": 0, "locked_until": None})

    if user.get("status") == "pending_verification":
        return error_response(EMAIL_NOT_VERIFIED, "Email not verified", 403)

    try:
        auth_resp = cognito.initiate_auth(
            ClientId=config.USER_POOL_CLIENT_ID,
            AuthFlow="USER_PASSWORD_AUTH",
            AuthParameters={"USERNAME": email, "PASSWORD": password},
        )
    except cognito.exceptions.NotAuthorizedException:
        count = user.get("failed_login_count", 0) + 1
        updates = {"failed_login_count": count, "updated_at": datetime.utcnow().isoformat()}
        if count >= MAX_FAILED_LOGINS:
            updates["locked_until"] = (datetime.utcnow() + timedelta(minutes=LOCKOUT_MINUTES)).isoformat()
        db_client.update_item(pk, sk, updates)
        return error_response(UNAUTHORIZED, "Invalid email or password", 401)

    db_client.update_item(pk, sk, {"failed_login_count": 0, "updated_at": datetime.utcnow().isoformat()})

    tokens = auth_resp["AuthenticationResult"]
    return success_response({
        "access_token": tokens["AccessToken"],
        "id_token": tokens.get("IdToken", ""),
        "refresh_token": tokens.get("RefreshToken", ""),
        "user": {"user_id": user["user_id"], "role": user["role"], "email": email},
    })


def verify_email(email: str, code: str) -> dict:
    cognito.confirm_sign_up(ClientId=config.USER_POOL_CLIENT_ID, Username=email, ConfirmationCode=code)

    result = db_client.query(Keys.email_gsi1pk(email), "USER", index_name="GSI1")
    if result["items"]:
        user = result["items"][0]
        db_client.update_item(user["PK"], user["SK"], {"status": "active", "updated_at": datetime.utcnow().isoformat()})

    return success_response({"message": "Email verified"})


def refresh_token(refresh_token_val: str) -> dict:
    resp = cognito.initiate_auth(
        ClientId=config.USER_POOL_CLIENT_ID,
        AuthFlow="REFRESH_TOKEN_AUTH",
        AuthParameters={"REFRESH_TOKEN": refresh_token_val},
    )
    return success_response({"access_token": resp["AuthenticationResult"]["AccessToken"]})


def get_profile(user_id: str) -> dict:
    item = db_client.get_item(Keys.user_pk(user_id), Keys.profile_sk())
    if not item:
        return error_response("NOT_FOUND", "User not found", 404)
    return success_response({k: v for k, v in item.items() if not k.startswith(("PK", "SK", "GSI"))})


def update_profile(user_id: str, updates: dict) -> dict:
    filtered = {k: v for k, v in updates.items() if v is not None}
    filtered["updated_at"] = datetime.utcnow().isoformat()
    db_client.update_item(Keys.user_pk(user_id), Keys.profile_sk(), filtered)
    return success_response({"message": "Profile updated"})
