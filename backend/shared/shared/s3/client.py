from __future__ import annotations

import boto3

from shared.config import config


class S3Client:
    def __init__(self) -> None:
        self._client = None

    @property
    def client(self):
        if self._client is None:
            self._client = boto3.client("s3")
        return self._client

    def get_content(self, key: str) -> str:
        resp = self.client.get_object(Bucket=config.CONTENT_BUCKET_NAME, Key=key)
        return resp["Body"].read().decode("utf-8")

    def put_content(self, key: str, body: str, content_type: str = "text/markdown") -> None:
        self.client.put_object(
            Bucket=config.CONTENT_BUCKET_NAME, Key=key, Body=body.encode("utf-8"), ContentType=content_type
        )

    def generate_presigned_url(self, key: str, expires_in: int = 3600) -> str:
        return self.client.generate_presigned_url(
            "get_object", Params={"Bucket": config.CONTENT_BUCKET_NAME, "Key": key}, ExpiresIn=expires_in
        )


s3_client = S3Client()
