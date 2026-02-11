from aws_lambda_powertools import Logger
from aws_lambda_powertools.event_handler import APIGatewayRestResolver, Response, content_types
from aws_lambda_powertools.event_handler.api_gateway import CORSConfig

from curriculum import schemas, service
from shared.auth import get_current_user, require_role

logger = Logger(service="curriculum-service")
cors = CORSConfig(allow_origin="*", allow_headers=["Content-Type", "Authorization"])
app = APIGatewayRestResolver(cors=cors)


def _proxy(result: dict) -> Response:
    return Response(
        status_code=result.get("statusCode", 200),
        content_type=content_types.APPLICATION_JSON,
        body=result.get("body", "{}"),
    )


@app.post("/curricula/generate")
def generate():
    user = get_current_user(app.current_event.raw_event)
    body = schemas.GenerateCurriculumRequest.model_validate(app.current_event.json_body)
    return _proxy(service.generate_curriculum(user["user_id"], body.topic, body.test_type, body.program_level))


@app.get("/curricula")
def list_curricula():
    user = get_current_user(app.current_event.raw_event)
    return _proxy(service.list_curricula(user["user_id"]))


@app.get("/curricula/wizard/categories")
def wizard_categories():
    return _proxy(service.get_wizard_categories())


@app.get("/curricula/<curriculum_id>")
def get_curriculum(curriculum_id: str):
    return _proxy(service.get_curriculum(curriculum_id))


@app.get("/curricula/<curriculum_id>/status")
def poll_status(curriculum_id: str):
    return _proxy(service.poll_status(curriculum_id))


@app.post("/curricula/assign")
def assign():
    user = get_current_user(app.current_event.raw_event)
    body = schemas.AssignCurriculumRequest.model_validate(app.current_event.json_body)
    return _proxy(service.assign_curriculum(user["user_id"], body.curriculum_id, body.learner_ids, body.deadline))


@app.post("/curricula/<curriculum_id>/archive")
def archive(curriculum_id: str):
    user = get_current_user(app.current_event.raw_event)
    return _proxy(service.archive_curriculum(user["user_id"], curriculum_id))


@logger.inject_lambda_context(correlation_id_path="requestContext.requestId")
def lambda_handler(event, context):
    return app.resolve(event, context)


@app.post("/curricula/<curriculum_id>/unassign")
def unassign(curriculum_id: str):
    user = get_current_user(app.current_event.raw_event)
    body = app.current_event.json_body or {}
    learner_id = body.get("learner_id", "")
    return _proxy(service.unassign_curriculum(user["user_id"], curriculum_id, learner_id))


@app.delete("/curricula/<curriculum_id>")
def delete_curriculum(curriculum_id: str):
    user = get_current_user(app.current_event.raw_event)
    return _proxy(service.delete_curriculum(user["user_id"], curriculum_id))
