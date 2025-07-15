from fastapi import APIRouter, WebSocket
from config import settings
from schemas import WSMessage
from utils.llm_client import DeepSeekClient
import json

router = APIRouter()
llm = DeepSeekClient(api_key=settings.DEEPSEEK_API_KEY)

PROMPT_TEMPLATES = {
    "prd": "作为资深产品经理，根据用户需求生成PRD文档。需求如下：\n{requirement}",
    "design": "作为首席架构师，根据PRD生成系统设计文档：\n{content}",
    "code": "作为全栈工程师，根据设计文档生成代码：\n{content}"
}

@router.websocket(settings.WS_ENDPOINT)
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    session = {"stage": "prd"}
    
    try:
        while True:
            data = await websocket.receive_json()
            
            match session["stage"]:
                case "prd":
                    prompt = PROMPT_TEMPLATES["prd"].format(requirement=data["requirement"])
                    prd_content = await llm.generate(prompt)
                    session.update(prd=prd_content, stage="design")
                    await send_response(websocket, "pd", prd_content, ["confirm"])
                
                case "design":
                    if data.get("action") == "confirm":
                        prompt = PROMPT_TEMPLATES["design"].format(content=session["prd"])
                        design_content = await llm.generate(prompt)
                        session["design"] = design_content
                        await send_response(websocket, "architect", design_content, ["confirm", "edit", "llm_edit"])
                    
                    elif data.get("action") == "edit":
                        # 处理编辑逻辑
                        pass
                
                case "code":
                    # 代码生成逻辑
                    pass

    except Exception as e:
        await websocket.close(code=1011, reason=str(e))

async def send_response(websocket: WebSocket, role: str, content: str, actions: list):
    message = WSMessage(
        role=role,
        content=content,
        actions=actions
    )
    await websocket.send_json(message.dict())