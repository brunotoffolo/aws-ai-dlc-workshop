"""Bedrock model invocation with fallback logic."""

import json
import logging

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)

PRIMARY_MODEL = "us.anthropic.claude-sonnet-4-5-20250514-v1:0"
FALLBACK_MODEL = "us.anthropic.claude-3-haiku-20240307-v1:0"

_client = None


def _get_client():
    global _client
    if _client is None:
        _client = boto3.client("bedrock-runtime")
    return _client


def invoke_model(system_prompt: str, user_prompt: str, max_tokens: int = 4096) -> str:
    """Invoke Bedrock model with fallback on throttling."""
    for model_id in [PRIMARY_MODEL, FALLBACK_MODEL]:
        try:
            resp = _get_client().invoke_model(
                modelId=model_id,
                contentType="application/json",
                accept="application/json",
                body=json.dumps({
                    "anthropic_version": "bedrock-2023-05-31",
                    "max_tokens": max_tokens,
                    "system": system_prompt,
                    "messages": [{"role": "user", "content": user_prompt}],
                }),
            )
            body = json.loads(resp["body"].read())
            text = body["content"][0]["text"]
            logger.info(
                "model_invocation",
                extra={
                    "model": model_id,
                    "input_tokens": body.get("usage", {}).get("input_tokens", 0),
                    "output_tokens": body.get("usage", {}).get("output_tokens", 0),
                },
            )
            return text
        except ClientError as e:
            if e.response["Error"]["Code"] == "ThrottlingException" and model_id == PRIMARY_MODEL:
                logger.warning("Primary model throttled, falling back to %s", FALLBACK_MODEL)
                continue
            raise
    raise RuntimeError("All models failed")


def invoke_model_json(system_prompt: str, user_prompt: str, max_tokens: int = 4096) -> dict:
    """Invoke model and parse JSON response."""
    text = invoke_model(system_prompt, user_prompt + "\n\nRespond with valid JSON only.", max_tokens)
    # Strip markdown code fences if present
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return json.loads(text.strip())
