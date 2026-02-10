from aws_lambda_powertools import Logger
from aws_lambda_powertools.event_handler import APIGatewayRestResolver

from admin import service
from shared.auth import require_role

logger = Logger(service="admin-service")
app = APIGatewayRestResolver()


@app.get("/admin/learners")
def learner_overview():
    curriculum_id = app.current_event.get_query_string_value("curriculum_id")
    return service.get_learner_overview(curriculum_id)


@app.get("/admin/courses")
def course_catalog():
    return service.get_course_catalog()


@app.get("/admin/review-backlog")
def review_backlog():
    return service.get_review_backlog()


@logger.inject_lambda_context(correlation_id_path="requestContext.requestId")
def lambda_handler(event, context):
    return app.resolve(event, context)
