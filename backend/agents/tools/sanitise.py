"""Input sanitisation for prompt injection protection."""


def sanitise_topic(topic: str) -> str:
    topic = topic[:500]
    for pattern in ["ignore previous", "system:", "assistant:", "<|", "|>", "\\n\\n#"]:
        topic = topic.lower().replace(pattern, "")
    return topic.strip()
