from __future__ import annotations

from typing import Any

import boto3
from boto3.dynamodb.conditions import Key

from shared.config import config


class DynamoDBClient:
    def __init__(self) -> None:
        self._table = None

    @property
    def table(self):
        if self._table is None:
            self._table = boto3.resource("dynamodb").Table(config.TABLE_NAME)
        return self._table

    def get_item(self, pk: str, sk: str) -> dict | None:
        resp = self.table.get_item(Key={"PK": pk, "SK": sk})
        return resp.get("Item")

    def put_item(self, item: dict[str, Any]) -> None:
        self.table.put_item(Item=item)

    def update_item(
        self, pk: str, sk: str, updates: dict[str, Any]
    ) -> dict:
        expr_parts, names, values = [], {}, {}
        for i, (key, val) in enumerate(updates.items()):
            alias = f"#k{i}"
            placeholder = f":v{i}"
            expr_parts.append(f"{alias} = {placeholder}")
            names[alias] = key
            values[placeholder] = val
        return self.table.update_item(
            Key={"PK": pk, "SK": sk},
            UpdateExpression="SET " + ", ".join(expr_parts),
            ExpressionAttributeNames=names,
            ExpressionAttributeValues=values,
            ReturnValues="ALL_NEW",
        )

    def delete_item(self, pk: str, sk: str) -> None:
        self.table.delete_item(Key={"PK": pk, "SK": sk})

    def query(
        self,
        pk: str,
        sk_begins_with: str | None = None,
        index_name: str | None = None,
        limit: int | None = None,
        last_key: dict | None = None,
    ) -> dict:
        key_expr = Key("GSI1PK" if index_name else "PK").eq(pk)
        if sk_begins_with:
            sk_attr = "GSI1SK" if index_name else "SK"
            key_expr = key_expr & Key(sk_attr).begins_with(sk_begins_with)

        kwargs: dict[str, Any] = {"KeyConditionExpression": key_expr}
        if index_name:
            kwargs["IndexName"] = index_name
        if limit:
            kwargs["Limit"] = limit
        if last_key:
            kwargs["ExclusiveStartKey"] = last_key

        resp = self.table.query(**kwargs)
        return {"items": resp.get("Items", []), "last_key": resp.get("LastEvaluatedKey")}


db_client = DynamoDBClient()
