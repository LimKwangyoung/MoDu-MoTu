from fastapi import FastAPI
from items import router as items_router

app = FastAPI()

@app.get("/")
async def read_root():
    return {"message": "Hello, FastAPI!"}

app.include_router(items_router, prefix="/items")
