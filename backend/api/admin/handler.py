from aws_lambda_powertools import Logger
from aws_lambda_powertools.event_handler import APIGatewayRestResolver, Response, content_types
from aws_lambda_powertools.event_handler.api_gateway import CORSConfig

from admin import service
from shared.auth import require_role

logger = Logger(service="admin-service")
cors = CORSConfig(allow_origin="*", allow_headers=["Content-Type", "Authorization"])
app = APIGatewayRestResolver(cors=cors)


def _proxy(result: dict) -> Response:
    return Response(
        status_code=result.get("statusCode", 200),
        content_type=content_types.APPLICATION_JSON,
        body=result.get("body", "{}"),
    )


@app.get("/admin/learners")
def learner_overview():
    curriculum_id = app.current_event.get_query_string_value("curriculum_id")
    return _proxy(service.get_learner_overview(curriculum_id))


@app.get("/admin/courses")
def course_catalog():
    return _proxy(service.get_course_catalog())


@app.get("/admin/review-backlog")
def review_backlog():
    return _proxy(service.get_review_backlog())


@logger.inject_lambda_context(correlation_id_path="requestContext.requestId")
def lambda_handler(event, context):
    return app.resolve(event, context)
