import bleach
from typing import Any, Dict, List, Union

def sanitize_input(data: Union[str, Dict, List]) -> Any:
    """
    Recursively sanitize input data to prevent XSS and other injection attacks.
    """
    if isinstance(data, str):
        # Allow some basic tags if needed, but for now strict clean
        return bleach.clean(data, tags=[], attributes={}, strip=True)
    elif isinstance(data, dict):
        return {k: sanitize_input(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_input(i) for i in data]
    return data

def validate_uuid(id_str: str) -> bool:
    import uuid
    try:
        uuid.UUID(id_str)
        return True
    except ValueError:
        return False
