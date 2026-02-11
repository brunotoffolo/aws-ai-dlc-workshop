from aws_lambda_powertools import Logger
from aws_lambda_powertools.event_handler import APIGatewayRestResolver, Response, content_types
from aws_lambda_powertools.event_handler.api_gateway import CORSConfig
from pydantic import ValidationError

from auth import schemas, service
from shared.auth import get_current_user

logger = Logger(service="auth-service")
cors = CORSConfig(allow_origin="*", allow_headers=["Content-Type", "Authorization"])
app = APIGatewayRestResolver(cors=cors)


@app.exception_handler(ValidationError)
def handle_validation_error(e: ValidationError):
    return Response(
        status_code=400,
        content_type=content_types.APPLICATION_JSON,
        body='{"error": "VALIDATION_ERROR", "message": "' + str(e.errors()[0]["msg"]) + '"}',
    )


def _proxy(result: dict) -> Response:
    """Convert our proxy-format response to a Powertools Response."""
    import json
    return Response(
        status_code=result.get("statusCode", 200),
        content_type=content_types.APPLICATION_JSON,
        body=result.get("body", "{}"),
    )


@app.post("/auth/register")
def register():
    body = schemas.RegisterRequest.model_validate(app.current_event.json_body)
    return _proxy(service.register_user(body.email, body.password, body.role))


@app.post("/auth/login")
def login():
    body = schemas.LoginRequest.model_validate(app.current_event.json_body)
    return _proxy(service.login(body.email, body.password))


@app.post("/auth/verify")
def verify():
    body = schemas.VerifyEmailRequest.model_validate(app.current_event.json_body)
    return _proxy(service.verify_email(body.email, body.code))


@app.post("/auth/refresh")
def refresh():
    body = schemas.RefreshTokenRequest.model_validate(app.current_event.json_body)
    return _proxy(service.refresh_token(body.refresh_token))


@app.get("/auth/profile")
def get_profile():
    user = get_current_user(app.current_event.raw_event)
    return _proxy(service.get_profile(user["user_id"]))


@app.put("/auth/profile")
def update_profile():
    user = get_current_user(app.current_event.raw_event)
    body = schemas.UpdateProfileRequest.model_validate(app.current_event.json_body)
    return _proxy(service.update_profile(user["user_id"], body.model_dump(exclude_none=True)))


@logger.inject_lambda_context(correlation_id_path="requestContext.requestId")
def lambda_handler(event, context):
    return app.resolve(event, context)
