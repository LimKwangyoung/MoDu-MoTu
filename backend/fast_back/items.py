from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# 라우터 객체 생성
router = APIRouter()

# 데이터 모델 정의
class Item(BaseModel):
    name: str
    price: float
    description: str = None

# GET 요청
@router.get("/")
async def get_items():
    return {"message": "List of items"}

# POST 요청
@router.post("/")
async def create_item(item: Item):
    return {"message": "Item created", "item": item}

# GET 요청 (특정 아이템)
@router.get("/{item_id}")
async def get_item(item_id: int):
    if item_id != 1:  # 예시로 ID가 1인 경우에만 반환
        raise HTTPException(status_code=404, detail="Item not found")
    return {"item_id": item_id, "name": "Example Item"}

# PUT 요청
@router.put("/{item_id}")
async def update_item(item_id: int, item: Item):
    return {"message": "Item updated", "item_id": item_id, "updated_item": item}

# DELETE 요청
@router.delete("/{item_id}")
async def delete_item(item_id: int):
    return {"message": "Item deleted", "item_id": item_id}
