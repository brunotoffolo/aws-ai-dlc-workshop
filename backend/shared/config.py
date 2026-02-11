import os


TABLE_NAME = os.environ.get("TABLE_NAME", "TutorialTable")
CONTENT_BUCKET = os.environ.get("CONTENT_BUCKET", os.environ.get("CONTENT_BUCKET_NAME", "content-bucket"))
USER_POOL_ID = os.environ.get("USER_POOL_ID", "")
USER_POOL_CLIENT_ID = os.environ.get("USER_POOL_CLIENT_ID", "")
STATE_MACHINE_ARN = os.environ.get("STATE_MACHINE_ARN", os.environ.get("PIPELINE_STATE_MACHINE_ARN", ""))


class _Config:
    """Object-style access for API services that use config.ATTR."""
    @property
    def TABLE_NAME(self): return TABLE_NAME
    @property
    def CONTENT_BUCKET(self): return CONTENT_BUCKET
    @property
    def USER_POOL_ID(self): return USER_POOL_ID
    @property
    def USER_POOL_CLIENT_ID(self): return USER_POOL_CLIENT_ID
    @property
    def STATE_MACHINE_ARN(self): return STATE_MACHINE_ARN
    @property
    def PIPELINE_STATE_MACHINE_ARN(self): return STATE_MACHINE_ARN


config = _Config()
