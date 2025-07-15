from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json
from openai import OpenAI

app = FastAPI()

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(
    api_key="sk-bb509f13ddf44ec1b539b30efcc5661a",
    base_url="https://api.deepseek.com"
)

class IncrementalRequest(BaseModel):
    original_doc: str
    prompt: str
    current_version: str

def increment_version(version: str) -> str:
    parts = version.split('.')
    parts[1] = str(int(parts[1]) + 1)
    return '.'.join(parts)

def generate_incremental_stream(request: IncrementalRequest):
    """同步流式生成器"""
    try:
        system_prompt = "你是一个专业的需求分析师..."
        user_prompt = f"原始文档(v{request.current_version}):\n{request.original_doc}\n\n指令:\n{request.prompt}"
        
        # 同步流式调用
        stream = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            stream=True,
            temperature=0.3
        )
        
        for chunk in stream:
            content = chunk.choices[0].delta.content or ""
            if content:
                yield json.dumps({
                    "content": content,
                    "new_version": increment_version(request.current_version)
                }) + "\n"
                
    except Exception as e:
        yield json.dumps({
            "error": str(e),
            "success": False
        }) + "\n"

@app.post("/api/generate-incremental-stream")
async def api_handler(request: Request):
    try:
        body = await request.json()
        req = IncrementalRequest(
            original_doc=body["original_doc"],
            prompt=body["prompt"],
            current_version=body.get("current_version", "1.0")
        )
        
        return StreamingResponse(
            generate_incremental_stream(req),
            media_type="application/x-ndjson"
        )
        
    except Exception as e:
        raise HTTPException(400, detail=str(e))