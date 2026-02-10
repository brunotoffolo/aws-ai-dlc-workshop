from aws_lambda_powertools import Logger
from aws_lambda_powertools.event_handler import APIGatewayRestResolver

from curriculum import schemas, service
from shared.auth import get_current_user, require_role

logger = Logger(service="curriculum-service")
app = APIGatewayRestResolver()


@app.post("/curricula/generate")
def generate():
    user = get_current_user(app.current_event.raw_event)
    body = schemas.GenerateCurriculumRequest.model_validate(app.current_event.json_body)
    return service.generate_curriculum(user["user_id"], body.topic, body.test_type, body.program_level)


@app.get("/curricula")
def list_curricula():
    user = get_current_user(app.current_event.raw_event)
    return service.list_curricula(user["user_id"])


@app.get("/curricula/wizard/categories")
def wizard_categories():
    return service.get_wizard_categories()


@app.get("/curricula/<curriculum_id>")
def get_curriculum(curriculum_id: str):
    return service.get_curriculum(curriculum_id)


@app.get("/curricula/<curriculum_id>/status")
def poll_status(curriculum_id: str):
    return service.poll_status(curriculum_id)


@app.post("/curricula/assign")
def assign():
    user = get_current_user(app.current_event.raw_event)
    body = schemas.AssignCurriculumRequest.model_validate(app.current_event.json_body)
    return service.assign_curriculum(user["user_id"], body.curriculum_id, body.learner_ids, body.deadline)


@app.post("/curricula/<curriculum_id>/archive")
def archive(curriculum_id: str):
    user = get_current_user(app.current_event.raw_event)
    return service.archive_curriculum(user["user_id"], curriculum_id)


@logger.inject_lambda_context(correlation_id_path="requestContext.requestId")
def lambda_handler(event, context):
    return app.resolve(event, context)
