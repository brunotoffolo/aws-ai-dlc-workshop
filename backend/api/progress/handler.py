from aws_lambda_powertools import Logger
from aws_lambda_powertools.event_handler import APIGatewayRestResolver, Response, content_types
from aws_lambda_powertools.event_handler.api_gateway import CORSConfig

from progress import schemas, service
from shared.auth import get_current_user

logger = Logger(service="progress-service")
cors = CORSConfig(allow_origin="*", allow_headers=["Content-Type", "Authorization"])
app = APIGatewayRestResolver(cors=cors)


def _proxy(result: dict) -> Response:
    return Response(
        status_code=result.get("statusCode", 200),
        content_type=content_types.APPLICATION_JSON,
        body=result.get("body", "{}"),
    )


@app.get("/progress/<curriculum_id>")
def get_progress(curriculum_id: str):
    user = get_current_user(app.current_event.raw_event)
    return _proxy(service.get_progress(user["user_id"], curriculum_id))


@app.put("/progress/<curriculum_id>/resume")
def save_resume(curriculum_id: str):
    user = get_current_user(app.current_event.raw_event)
    body = schemas.ResumeStateRequest.model_validate(app.current_event.json_body)
    return _proxy(service.save_resume(user["user_id"], curriculum_id, body.model_dump()))


@app.get("/progress/<curriculum_id>/resume")
def get_resume(curriculum_id: str):
    user = get_current_user(app.current_event.raw_event)
    return _proxy(service.get_resume(user["user_id"], curriculum_id))


@app.post("/progress/<curriculum_id>/lessons/<lesson_id>/complete")
def complete_lesson(curriculum_id: str, lesson_id: str):
    user = get_current_user(app.current_event.raw_event)
    return _proxy(service.complete_lesson(user["user_id"], curriculum_id, lesson_id))


@app.get("/progress/dashboard")
def dashboard():
    user = get_current_user(app.current_event.raw_event)
    return _proxy(service.get_dashboard(user["user_id"]))


@logger.inject_lambda_context(correlation_id_path="requestContext.requestId")
def lambda_handler(event, context):
    return app.resolve(event, context)
