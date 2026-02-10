"""DynamoDB data access layer."""

from typing import Any, Optional

import boto3
from boto3.dynamodb.conditions import Key

from . import config


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


def query(pk: str, sk_prefix: Optional[str] = None, index: Optional[str] = None, limit: int = 50) -> list[dict[str, Any]]:
    table = _get_table()
    kwargs: dict[str, Any] = {"Limit": limit}
    if index:
        kwargs["IndexName"] = index

    condition = Key("GSI1PK" if index == "GSI1" else "PK").eq(pk)
    if sk_prefix:
        sk_key = "GSI1SK" if index == "GSI1" else "SK"
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
