import os
import httpx
from typing import Optional
from config import settings

class DeepSeekClient:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or settings.DEEPSEEK_API_KEY
        self.base_url = "https://api.deepseek.com/v1"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def generate(self, prompt: str, max_tokens: int = 2000) -> str:
        async with httpx.AsyncClient() as client:
            payload = {
                "prompt": prompt,
                "max_tokens": max_tokens,
                "temperature": 0.7
            }
            response = await client.post(
                f"{self.base_url}/completions",
                headers=self.headers,
                json=payload
            )
            response.raise_for_status()
            return response.json()["choices"][0]["text"]