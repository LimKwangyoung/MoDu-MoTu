import time
import os
import requests
import json
from django.conf import settings
from celery import shared_task
from datetime import datetime
import redis
import asyncio
from django.conf import settings
from channels.layers import get_channel_layer
from .utils import get_multiple_stocks  # get_multiple_stocks는 WebSocket 연결 유지하며 데이터 스트리밍


redis_client = redis.StrictRedis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=0)

async def broadcast_stock_data():
    channel_layer = get_channel_layer()

    async for stock_data in get_multiple_stocks():
        # Channel Layer를 통해 "stock_data_group" 그룹에 데이터 브로드캐스트
        await channel_layer.group_send(
            "stock_data_group",
            {
                "type": "send_stock_data",
                "data": stock_data,
            }
        )

@shared_task
def fetch_stock_data(stock_code):
    current_time = datetime.now().strftime("%H%M%S")
    url = f"{settings.KIS_API_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-time-itemchartprice"
    params = {
        "FID_ETC_CLS_CODE": "",
        "FID_COND_MRKT_DIV_CODE": "J",
        "FID_INPUT_ISCD": stock_code,
        "FID_INPUT_HOUR_1": current_time,
        "FID_PW_DATA_INCU_YN": "Y"
    }
    headers = {
        'content-type': 'application/json',
        'authorization': settings.REAL_API_TOKEN,
        'appkey': settings.REAL_APP_KEY,
        'appsecret': settings.REAL_APP_SECRET,
        'tr_id': 'FHKST03010200'
    }
    
    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code == 200:
        data = response.json()
        cache_key = f"minute_price:{stock_code}:{datetime.now().strftime('%Y-%m-%d %H:%M')}"
        redis_client.set(cache_key, json.dumps(data))
        print(f"Data for {stock_code} stored in Redis with key: {cache_key}")
    else:
        print(f"Failed to fetch data for {stock_code}: {response.status_code}")

# @shared_task
# def collect_minute_data():
#     current_time = datetime.now().time()
    
#     # 9시부터 16시 30분까지만 실행
#     if current_time.hour < 9 or current_time.hour >= 17:
#         return
    
#     json_file_path = os.path.join(os.path.dirname(__file__), "data", "kospi_code_name.json")
#     with open(json_file_path, "r", encoding="utf-8") as f:
#         kospi_data = json.load(f)

#     stock_codes = kospi_data.keys()

#     # 각 stock_code에 대해 fetch_stock_data 작업을 비동기로 실행
#     for i, stock_code in enumerate(stock_codes):
#         fetch_stock_data.delay(stock_code)  # 비동기로 호출

#         # 매 10번째 요청마다 1초 지연
#         if (i + 1) % 10 == 0:
#             time.sleep(1)