from aws_lambda_powertools import Logger
from aws_lambda_powertools.event_handler import APIGatewayRestResolver

from auth import schemas, service
from shared.auth import get_current_user

logger = Logger(service="auth-service")
app = APIGatewayRestResolver()


@app.post("/auth/register")
def register():
    body = schemas.RegisterRequest.model_validate(app.current_event.json_body)
    return service.register_user(body.email, body.password, body.role)


@app.post("/auth/login")
def login():
    body = schemas.LoginRequest.model_validate(app.current_event.json_body)
    return service.login(body.email, body.password)


@app.post("/auth/verify")
def verify():
    body = schemas.VerifyEmailRequest.model_validate(app.current_event.json_body)
    return service.verify_email(body.email, body.code)


@app.post("/auth/refresh")
def refresh():
    body = schemas.RefreshTokenRequest.model_validate(app.current_event.json_body)
    return service.refresh_token(body.refresh_token)


@app.get("/auth/profile")
def get_profile():
    user = get_current_user(app.current_event.raw_event)
    return service.get_profile(user["user_id"])


@app.put("/auth/profile")
def update_profile():
    user = get_current_user(app.current_event.raw_event)
    body = schemas.UpdateProfileRequest.model_validate(app.current_event.json_body)
    return service.update_profile(user["user_id"], body.model_dump(exclude_none=True))


@logger.inject_lambda_context(correlation_id_path="requestContext.requestId")
def lambda_handler(event, context):
    return app.resolve(event, context)
