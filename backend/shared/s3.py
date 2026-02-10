"""S3 content storage utilities."""

from typing import Optional

import boto3

from . import config


_s3 = None


def _get_client():
    global _s3
    if _s3 is None:
        _s3 = boto3.client("s3")
    return _s3


def store_content(key: str, body: str, content_type: str = "text/markdown") -> None:
    _get_client().put_object(
        Bucket=config.CONTENT_BUCKET,
        Key=key,
        Body=body.encode("utf-8"),
        ContentType=content_type,
    )


def get_content(key: str) -> Optional[str]:
    try:
        resp = _get_client().get_object(Bucket=config.CONTENT_BUCKET, Key=key)
        return resp["Body"].read().decode("utf-8")
    except _get_client().exceptions.NoSuchKey:
        return None


def store_media(key: str, body: bytes, content_type: str) -> None:
    _get_client().put_object(
        Bucket=config.CONTENT_BUCKET,
        Key=key,
        Body=body,
        ContentType=content_type,
    )


def get_media_url(key: str, expires_in: int = 3600) -> str:
    return _get_client().generate_presigned_url(
        "get_object",
        Params={"Bucket": config.CONTENT_BUCKET, "Key": key},
        ExpiresIn=expires_in,
    )
