"""Bloom's taxonomy adaptive difficulty algorithm."""

BLOOMS_LEVELS = {
    1: "Remember",
    2: "Understand",
    3: "Apply",
    4: "Analyse",
    5: "Evaluate",
    6: "Create",
}

ADVANCE_THRESHOLD = 0.80
DROP_THRESHOLD = 0.50
WINDOW_SIZE = 10
MIN_QUESTIONS_BEFORE_CHANGE = 5


def calculate_new_level(current_level: int, recent_scores: list[bool]) -> int:
    """Calculate new Bloom's level based on rolling accuracy."""
    if len(recent_scores) < MIN_QUESTIONS_BEFORE_CHANGE:
        return current_level

    window = recent_scores[-WINDOW_SIZE:]
    accuracy = sum(window) / len(window)

    if accuracy > ADVANCE_THRESHOLD and current_level < 6:
        return current_level + 1
    elif accuracy < DROP_THRESHOLD and current_level > 1:
        return current_level - 1
    return current_level


def get_level_name(level: int) -> str:
    return BLOOMS_LEVELS.get(level, "Unknown")
