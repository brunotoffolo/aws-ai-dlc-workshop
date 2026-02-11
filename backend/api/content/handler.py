from aws_lambda_powertools import Logger
from aws_lambda_powertools.event_handler import APIGatewayRestResolver, Response, content_types
from aws_lambda_powertools.event_handler.api_gateway import CORSConfig

from content import schemas, service
from shared.auth import get_current_user

logger = Logger(service="content-service")
cors = CORSConfig(allow_origin="*", allow_headers=["Content-Type", "Authorization"])
app = APIGatewayRestResolver(cors=cors)


def _proxy(result: dict) -> Response:
    return Response(
        status_code=result.get("statusCode", 200),
        content_type=content_types.APPLICATION_JSON,
        body=result.get("body", "{}"),
    )


@app.get("/content/<curriculum_id>/<lesson_id>")
def get_lesson(curriculum_id: str, lesson_id: str):
    return _proxy(service.get_lesson(curriculum_id, lesson_id))


@app.get("/content/review-queue")
def review_queue():
    return _proxy(service.list_review_queue())


@app.post("/content/<curriculum_id>/<lesson_id>/review")
def review(curriculum_id: str, lesson_id: str):
    user = get_current_user(app.current_event.raw_event)
    body = schemas.ReviewRequest.model_validate(app.current_event.json_body)
    return _proxy(service.review_content(user["user_id"], curriculum_id, lesson_id, body.action, body.feedback, body.edited_content))


@app.post("/content/<curriculum_id>/<lesson_id>/regenerate")
def regenerate(curriculum_id: str, lesson_id: str):
    return _proxy(service.regenerate_content(curriculum_id, lesson_id))


@app.get("/content/<curriculum_id>/<lesson_id>/versions")
def versions(curriculum_id: str, lesson_id: str):
    return _proxy(service.get_versions(curriculum_id, lesson_id))


@logger.inject_lambda_context(correlation_id_path="requestContext.requestId")
def lambda_handler(event, context):
    return app.resolve(event, context)
