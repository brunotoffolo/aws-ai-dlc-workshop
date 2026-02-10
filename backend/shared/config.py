import os


TABLE_NAME = os.environ.get("TABLE_NAME", "TutorialTable")
CONTENT_BUCKET = os.environ.get("CONTENT_BUCKET", "content-bucket")
USER_POOL_ID = os.environ.get("USER_POOL_ID", "")
