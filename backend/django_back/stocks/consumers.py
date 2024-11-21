import asyncio, json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.conf import settings
import websockets
from django.apps import apps
from django.contrib.auth import get_user_model
from asgiref.sync import sync_to_async
# #############
# import random
# #############

class KISWebSocketConsumer(AsyncWebsocketConsumer):
    kis_socket = None
    tasks = {}  # 클라이언트별 종목코드 추적
    # ###########            
    # random_data_task = None  # 랜덤 데이터 전송 태스크
    # ###########            

    async def connect(self):
        await self.accept()
        if not KISWebSocketConsumer.kis_socket:
            asyncio.create_task(self.connect_to_kis())
        ########  
        # if not KISWebSocketConsumer.random_data_task:
        #     asyncio.create_task(self.send_random_data())
        ########
        KISWebSocketConsumer.tasks[self.channel_name] = {
            "subscribed_stocks": set(),
            "favorite_stocks": set(),
        }
        await self.send(json.dumps({"message": "WebSocket connection established"}))
        print(f"WebSocket connection established: {self.channel_name}")

    async def disconnect(self, close_code):
        # 클라이언트가 연결 해제 시, 해당 클라이언트의 종목 코드 제거
        if self.channel_name in KISWebSocketConsumer.tasks:
            del KISWebSocketConsumer.tasks[self.channel_name]
        
        # ###########            
        # # 모든 클라이언트가 해제된 경우 랜덤 데이터 태스크 취소
        # if not KISWebSocketConsumer.tasks:
        #     KISWebSocketConsumer.random_data_task.cancel()
        #     KISWebSocketConsumer.random_data_task = None
        # ###########            
        print(f"Disconnected client: {self.channel_name}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except:
            await self.send(json.dumps({"error": f"{text_data} is not accepted."}))
            return
        stock_code = data.get("stock_code")
        exit_request = data.get("exit")
        username = data.get('username')
            
        if username:
            # 관심 종목 추적 요청
            User = get_user_model()
            try:
                user = await sync_to_async(User.objects.get)(username=username)
            except User.DoesNotExist:
                await self.send(json.dumps({"error": f"User '{username}' does not exist"}))
                return
            
            FavoriteStock = apps.get_model('accounts', 'FavoriteStock')
            favorite_stocks = await sync_to_async(list)(FavoriteStock.objects.filter(user=user))
            KISWebSocketConsumer.tasks[self.channel_name]['favorite_stocks'] = set()
            for favorite_stock in favorite_stocks:
                stock_code = favorite_stock.stock_code
                if stock_code in KISWebSocketConsumer.tasks[self.channel_name]['subscribed_stocks'] or stock_code in KISWebSocketConsumer.tasks[self.channel_name]['favorite_stocks']:
                    await self.send(json.dumps({"message": f"{stock_code} WebSocket connection already established"}))
                    continue
                KISWebSocketConsumer.tasks[self.channel_name]['favorite_stocks'].add(stock_code)
                await self.request_to_kis("1", "H0STASP0", stock_code)  # 주식 체결 실시간 등록
                await self.send(json.dumps({"message": f"{stock_code} WebSocket connection established"}))
            return

        if exit_request:
            # 특정 종목 추적 중단 요청
            if stock_code in KISWebSocketConsumer.tasks[self.channel_name]['subscribed_stocks']:
                KISWebSocketConsumer.tasks[self.channel_name]['subscribed_stocks'].remove(stock_code)
                await self.request_to_kis("2", "H0STASP0", stock_code)  # 주식 체결 실시간 해제
                await self.request_to_kis("2", "H0STCNT0", stock_code)  # 주식 호가 실시간 해제
                await self.send(json.dumps({"message": f"{stock_code} WebSocket connection stopped"}))
            return

        if stock_code:
            # 새로운 종목 추적 요청
            if stock_code in KISWebSocketConsumer.tasks[self.channel_name]['subscribed_stocks'] or stock_code in KISWebSocketConsumer.tasks[self.channel_name]['favorite_stocks']:
                return
            KISWebSocketConsumer.tasks[self.channel_name]['subscribed_stocks'].add(stock_code)
            if KISWebSocketConsumer.kis_socket:
                await self.request_to_kis("1", "H0STASP0", stock_code)  # 주식 체결 실시간 등록
                await self.request_to_kis("1", "H0STCNT0", stock_code)  # 주식 호가 실시간 등록
                await self.send(json.dumps({"message": f"{stock_code} WebSocket connection connected"}))
            else:
                await self.send(json.dumps({"message": f"KIS WebSocket connection is strange..."}))



    async def connect_to_kis(self):
        try:
            async with websockets.connect("ws://ops.koreainvestment.com:21000") as socket:
                KISWebSocketConsumer.kis_socket = socket
                print("Connected to KIS WebSocket")
                await self.request_to_kis("1", "H0UPCNT0", "0001")  # 코스피 지수 체결 실시간 등록
                await self.request_to_kis("1", "H0UPCNT0", "1001")  # 코스닥 지수 체결 실시간 등록

                while True:
                    message = await socket.recv()
                    data = await self.parse_kis_data(message)
                    if not data:
                        continue
                    stock_code = data.get("stock_code")
                    # print(data)
                    # 각 클라이언트의 구독 목록 확인 후 데이터 전송
                    for channel_name, client_data in KISWebSocketConsumer.tasks.items():
                        if stock_code in client_data["subscribed_stocks"] or stock_code in client_data["favorite_stocks"]:
                            await self.channel_layer.send(
                                channel_name,
                                {"type": "send_stock_data", "data": data},
                            )
                            # print(f"Sending data to channel {channel_name}: {data}")
                        else:
                            if data.get('indicator'):
                                await self.channel_layer.send(
                                   channel_name,
                                    {"type": "send_stock_data", "data": data},
                                )
                    # await asyncio.sleep(1)

        except Exception as e:
            print(f"KIS WebSocket connection error: {e}")
            KISWebSocketConsumer.kis_socket = None

    async def send_stock_data(self, event):
        await self.send(json.dumps(event["data"]))

    async def parse_kis_data(self, message):
        try:
            parts = message.split("|")
            if len(parts) >= 4:
                pValue = parts[3].split('^')
                if parts[1] == "H0STASP0":
                    result = self.stock_hoka(pValue)
                elif parts[1] == "H0STCNT0":
                    result = self.stock_purchase(pValue)
                elif parts[1] == "H0UPCNT0":
                    result = self.indicator(pValue)

                return result
            return {}
        except Exception as e:
            # JSON 메시지로 간주하고 처리
            try:
                recv_dic = json.loads(message)
                tr_id = recv_dic['header']['tr_id']

                if tr_id == 'PINGPONG':
                    await KISWebSocketConsumer.kis_socket.send(json.dumps({"type": "ping"}))
                    print("Ping message handled")
                    return {}  # 핑 메시지 처리 후 반환
            except json.JSONDecodeError:
                print(f"JSON Decode Error: {message}")

            print(f"Error parsing KIS data: {e}")
            return {}

    def stock_purchase(self, pValue):
        ret = {
            'stock_code': pValue[0],             # 종목 코드
            'trading': {    
                'STCK_CNTG_HOUR': pValue[1],     # 주식 체결 시간 (예: HHMMSS)
                'STCK_PRPR': pValue[2],          # 주식 현재가
                'CNTG_VOL': pValue[12],          # 체결 거래량
                'ACML_VOL': pValue[13],          # 누적 거래량
                'CTTR': pValue[18],              # 체결 강도 (매수/매도 비율)
                'CCLD_DVSN': pValue[21],         # 체결 구분 (매수: 1, 매도: 5)
            }
        }
        return ret
    
    def stock_hoka(self, pValue):
        ret = {
            'stock_code': pValue[0], 
            'ORDER_BOOK': {    
                'ASKP1': pValue[3],
                'ASKP2': pValue[4],
                'ASKP3': pValue[5],
                'ASKP4': pValue[6],
                'ASKP5': pValue[7],
                'ASKP6': pValue[8],
                'ASKP7': pValue[9],
                'ASKP8': pValue[10],
                'ASKP9': pValue[11],
                'ASKP10': pValue[12],
                'BIDP1': pValue[13],
                'BIDP2': pValue[14],
                'BIDP3': pValue[15],
                'BIDP4': pValue[16],
                'BIDP5': pValue[17],
                'BIDP6': pValue[18],
                'BIDP7': pValue[19],
                'BIDP8': pValue[20],
                'BIDP9': pValue[21],
                'BIDP10': pValue[22],
                'ASKP_RSQN1': pValue[23],
                'ASKP_RSQN2': pValue[24],
                'ASKP_RSQN3': pValue[25],
                'ASKP_RSQN4': pValue[26],
                'ASKP_RSQN5': pValue[27],
                'ASKP_RSQN6': pValue[28],
                'ASKP_RSQN7': pValue[29],
                'ASKP_RSQN8': pValue[30],
                'ASKP_RSQN9': pValue[31],
                'ASKP_RSQN10': pValue[32],
                'BIDP_RSQN1': pValue[33],
                'BIDP_RSQN2': pValue[34],
                'BIDP_RSQN3': pValue[35],
                'BIDP_RSQN4': pValue[36],
                'BIDP_RSQN5': pValue[37],
                'BIDP_RSQN6': pValue[38],
                'BIDP_RSQN7': pValue[39],
                'BIDP_RSQN8': pValue[40],
                'BIDP_RSQN9': pValue[41],
                'BIDP_RSQN10': pValue[42],
                'TOTAL_ASKP_RSQN': pValue[43],
                'TOTAL_BIDP_RSQN': pValue[44],
            }
        }
        return ret

    def indicator(self, pValue):
        ret = {
            'stock_code': pValue[0],             # 종목 코드
            'indicator': {    
                'prpr_nmix': pValue[2],          # 현재가 지수
            }
        }
        return ret
        

    def get_payload(self, tr_type, tr_id, stock_code):
        payload = {
                    "header": {
                        "approval_key": settings.REAL_APPROVAL_KEY,
                        "custtype": "P",
                        "tr_type": tr_type,  # 구독 시작: 1, 구독 취소: 2
                        "content-type": "utf-8",
                    },
                    "body": {
                        "input": {"tr_id": tr_id, "tr_key": stock_code},
                    },
                }
        return payload
    
    async def request_to_kis(self, tr_type, tr_id, stock_code):
        payload = self.get_payload(tr_type, tr_id, stock_code)
        print(KISWebSocketConsumer.tasks[self.channel_name])
        await self.send(json.dumps({"current subscribe": f"{KISWebSocketConsumer.tasks[self.channel_name]} Tracking..."}))
        await KISWebSocketConsumer.kis_socket.send(json.dumps(payload))
        if tr_type == "2":
            await self.send(json.dumps({"message": f"{stock_code} {tr_id} Tracking finished"}))
        else:
            await self.send(json.dumps({"message": f"{stock_code} {tr_id} Tracking started"}))
    # ##########################
    # async def send_random_data(self):
    #     """랜덤 데이터를 모든 클라이언트에게 전송"""
    #     while True:
    #         if KISWebSocketConsumer.tasks:  # 연결된 클라이언트가 있을 때만 실행
    #             # stock_code를 005930 또는 000660 중에서 랜덤 선택
    #             stock_code = random.choice(["005930", "000660"])
                
    #             # stock_code에 따른 데이터 값 설정
    #             if stock_code == "005930":
    #                 random_data = {
    #                     "stock_code": stock_code,
    #                     "trading": {
    #                         "STCK_CNTG_HOUR": f"{random.randint(9, 15)}:{random.randint(0, 59)}:{random.randint(0, 59)}",
    #                         "STCK_PRPR": f"{random.randint(50, 150)}",
    #                         "CNTG_VOL": "100",
    #                         "ACML_VOL": "100",
    #                         "CTTR": f"{random.uniform(0.1, 2.0):.2f}"
    #                         # CCLD_DVSN은 없음
    #                     }
    #                 }
    #             elif stock_code == "000660":
    #                 random_data = {
    #                     "stock_code": stock_code,
    #                     "trading": {
    #                         "STCK_CNTG_HOUR": f"{random.randint(9, 15)}:{random.randint(0, 59)}:{random.randint(0, 59)}",
    #                         "STCK_PRPR": f"{random.randint(90000, 150000)}",
    #                         "CNTG_VOL": "100000",
    #                         "ACML_VOL": "100000",
    #                         "CTTR": f"{random.uniform(0.1, 2.0):.2f}",
    #                         "CCLD_DVSN": f"{random.choice(['1', '5'])}"  # 매수: 1, 매도: 5
    #                     }
    #                 }
                
    #             # 모든 클라이언트에 데이터 전송
    #             for channel_name in KISWebSocketConsumer.tasks.keys():
    #                 await self.channel_layer.send(
    #                     channel_name,
    #                     {"type": "send_stock_data", "data": random_data},
    #                 )

    #         await asyncio.sleep(1)  # 0.1초 간격으로 전송
    # ############################