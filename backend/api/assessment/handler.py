from aws_lambda_powertools import Logger
from aws_lambda_powertools.event_handler import APIGatewayRestResolver, Response, content_types
from aws_lambda_powertools.event_handler.api_gateway import CORSConfig

from assessment import schemas, service
from shared.auth import get_current_user

logger = Logger(service="assessment-service")
cors = CORSConfig(allow_origin="*", allow_headers=["Content-Type", "Authorization"])
app = APIGatewayRestResolver(cors=cors)


def _proxy(result: dict) -> Response:
    return Response(
        status_code=result.get("statusCode", 200),
        content_type=content_types.APPLICATION_JSON,
        body=result.get("body", "{}"),
    )


@app.get("/quizzes/<curriculum_id>/<quiz_id>")
def get_quiz(curriculum_id: str, quiz_id: str):
    return _proxy(service.get_quiz(curriculum_id, quiz_id))


@app.post("/quizzes/<curriculum_id>/<quiz_id>/submit")
def submit_answers(curriculum_id: str, quiz_id: str):
    user = get_current_user(app.current_event.raw_event)
    body = schemas.SubmitAnswersRequest.model_validate(app.current_event.json_body)
    return _proxy(service.submit_answers(user["user_id"], curriculum_id, quiz_id, [a.model_dump() for a in body.answers]))


@app.get("/curricula/<curriculum_id>/pre-assessment")
def get_pre_assessment(curriculum_id: str):
    return _proxy(service.get_pre_assessment(curriculum_id))


@app.post("/curricula/<curriculum_id>/pre-assessment/submit")
def submit_pre_assessment(curriculum_id: str):
    user = get_current_user(app.current_event.raw_event)
    body = schemas.SubmitAnswersRequest.model_validate(app.current_event.json_body)
    return _proxy(service.submit_pre_assessment(user["user_id"], curriculum_id, [a.model_dump() for a in body.answers]))


@logger.inject_lambda_context(correlation_id_path="requestContext.requestId")
def lambda_handler(event, context):
    return app.resolve(event, context)
