"""DynamoDB data access layer."""

from typing import Any, Optional

import boto3
from boto3.dynamodb.conditions import Key

from . import config
from . import keys as _keys


_table = None


def _get_table():
    global _table
    if _table is None:
        _table = boto3.resource("dynamodb").Table(config.TABLE_NAME)
    return _table


def put_item(item: dict[str, Any]) -> None:
    _get_table().put_item(Item=item)


def get_item(pk: str, sk: str) -> Optional[dict[str, Any]]:
    resp = _get_table().get_item(Key={"PK": pk, "SK": sk})
    return resp.get("Item")


def query(pk: str, sk_prefix: Optional[str] = None, index: Optional[str] = None, index_name: Optional[str] = None, limit: int = 50) -> list[dict[str, Any]]:
    table = _get_table()
    idx = index or index_name
    kwargs: dict[str, Any] = {"Limit": limit}
    if idx:
        kwargs["IndexName"] = idx

    condition = Key("GSI1PK" if idx == "GSI1" else "PK").eq(pk)
    if sk_prefix:
        sk_key = "GSI1SK" if idx == "GSI1" else "SK"
        condition = condition & Key(sk_key).begins_with(sk_prefix)

    kwargs["KeyConditionExpression"] = condition
    resp = table.query(**kwargs)
    return resp.get("Items", [])


def update_item(pk: str, sk: str, updates: dict[str, Any]) -> dict[str, Any]:
    expr_parts = []
    names = {}
    values = {}
    for i, (key, val) in enumerate(updates.items()):
        attr = f"#a{i}"
        placeholder = f":v{i}"
        expr_parts.append(f"{attr} = {placeholder}")
        names[attr] = key
        values[placeholder] = val

    resp = _get_table().update_item(
        Key={"PK": pk, "SK": sk},
        UpdateExpression="SET " + ", ".join(expr_parts),
        ExpressionAttributeNames=names,
        ExpressionAttributeValues=values,
        ReturnValues="ALL_NEW",
    )
    return resp.get("Attributes", {})


def delete_item(pk: str, sk: str) -> None:
    _get_table().delete_item(Key={"PK": pk, "SK": sk})


class Keys:
    """Key builders as static methods for API service compatibility."""
    user_pk = staticmethod(_keys.user_pk)
    profile_sk = staticmethod(_keys.user_sk)
    email_gsi1pk = staticmethod(_keys.user_gsi1pk)
    curriculum_pk = staticmethod(_keys.curriculum_pk)
    curriculum_sk = staticmethod(_keys.curriculum_sk)
    curriculum_gsi1pk = staticmethod(_keys.curriculum_gsi1pk)
    lesson_sk = staticmethod(_keys.lesson_sk)
    quiz_sk = staticmethod(_keys.quiz_sk)
    progress_pk = staticmethod(_keys.progress_pk)
    progress_sk = staticmethod(_keys.progress_sk)
    assignment_sk = staticmethod(_keys.assignment_sk)
    assignment_gsi1pk = staticmethod(_keys.assignment_gsi1pk)
    review_pk = staticmethod(_keys.review_pk)
    review_sk = staticmethod(_keys.review_sk)
    status_gsi1pk = staticmethod(_keys.status_gsi1pk)

    @staticmethod
    def content_sk(lesson_order: int) -> str:
        return f"CONTENT#{lesson_order:04d}"

    @staticmethod
    def review_gsi1pk(status: str) -> str:
        return f"STATUS#{status}"


class _DbClient:
    """Object-style db access for API service compatibility."""
    put_item = staticmethod(put_item)
    get_item = staticmethod(get_item)
    query = staticmethod(query)
    update_item = staticmethod(update_item)
    delete_item = staticmethod(delete_item)


db_client = _DbClient()
