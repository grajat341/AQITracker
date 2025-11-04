"""Application configuration helpers."""

from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parents[2]

# Load environment variables from a .env file if present. This keeps local development
# simple while still allowing hosts to inject secrets via real environment variables.
load_dotenv(BASE_DIR / '.env')


@lru_cache()
def get_openaq_api_key() -> Optional[str]:
    """Return the configured OpenAQ API key if one is available."""

    return os.getenv('OPENAQ_API_KEY')

