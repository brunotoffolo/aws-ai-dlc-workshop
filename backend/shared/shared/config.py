import os


class Config:
    TABLE_NAME: str = os.environ.get("TABLE_NAME", "tutorial-table")
    CONTENT_BUCKET_NAME: str = os.environ.get("CONTENT_BUCKET_NAME", "tutorial-content")
    USER_POOL_ID: str = os.environ.get("USER_POOL_ID", "")
    USER_POOL_CLIENT_ID: str = os.environ.get("USER_POOL_CLIENT_ID", "")
    PIPELINE_STATE_MACHINE_ARN: str = os.environ.get("PIPELINE_STATE_MACHINE_ARN", "")
    CONTENT_AGENT_ARN: str = os.environ.get("CONTENT_AGENT_ARN", "")
    ASSESSMENT_AGENT_ARN: str = os.environ.get("ASSESSMENT_AGENT_ARN", "")
    LOG_LEVEL: str = os.environ.get("LOG_LEVEL", "INFO")


config = Config()
