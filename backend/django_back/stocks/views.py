import requests, json, redis, asyncio, httpx, time
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from stocks.utils import *
from datetime import datetime, timedelta, date
from django.conf import settings
from django.contrib.auth import get_user_model
from .models import StockData
from .serializers import StockDataSaveSerializer, StockDataSerializer
from django.db.models import Sum, F, ExpressionWrapper, FloatField
from accounts.models import Balance


REAL_KIS_API_BASE_URL = "https://openapi.koreainvestment.com:9443"
PAPER_KIS_API_BASE_URL = "https://openapivts.koreainvestment.com:29443"

redis_client = redis.StrictRedis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=0)
User = get_user_model()

@api_view(["GET"])
def kospi(request):
    return Response(indicators('kospi'), status=status.HTTP_200_OK)

@api_view(['GET'])
def kosdaq(request):
    return Response(indicators('kosdaq'), status=status.HTTP_200_OK)

@api_view(['GET'])
def nasdaq(request):
    return Response(indicators('nasdaq'), status=status.HTTP_200_OK)

@api_view(['GET'])
def sp500(request):
    return Response(indicators('s&p500'), status=status.HTTP_200_OK)

@api_view(['GET'])
def dji(request):
    return Response(indicators('dji'), status=status.HTTP_200_OK)

@api_view(['GET'])
def yen_dollar(request):
    return Response(indicators('yen_dollar'), status=status.HTTP_200_OK)

@api_view(['GET'])
def won_dollar(request):
    return Response(indicators('won_dollar'), status=status.HTTP_200_OK)

@api_view(['GET'])
def wti(request):
    return Response(indicators('wti'), status=status.HTTP_200_OK)

@api_view(['GET'])
def gold(request):
    return Response(indicators('gold'), status=status.HTTP_200_OK)

def indicators(indicator):
    cache_key = f"indicator_day_data:{indicator}"
    
    end_date = date.today()
    start_date = end_date - timedelta(days=3*365)  # 약 3년 전

    # Redis에서 기존 데이터를 가져오기
    end_date_str = end_date.strftime("%Y%m%d")
    indicator_data = redis_client.zrange(cache_key, 0, -1, withscores=False)
    while indicator_data and json.loads(indicator_data[-1])["stck_bsop_date"] == end_date_str:
        value = indicator_data.pop()
        redis_client.zrem(cache_key, value)  # 오늘 데이터 삭제
    existing_dates = {json.loads(item)["stck_bsop_date"] for item in indicator_data}
    
    current_date = end_date
    while current_date >= start_date:
        end_date_str = current_date.strftime("%Y%m%d")
        start_date_str = (current_date - timedelta(weeks=12)).strftime("%Y%m%d")

        # 누락된 날짜에 대해 데이터 요청 및 저장
        if end_date_str not in existing_dates:
            if indicator in {'kospi', 'kosdaq'}:
                response_data = fetch_and_save_korea_indicator_day_data(end_date_str, indicator)
            elif indicator in {'nasdaq', 's&p500', 'dji', 'yen_dollar', 'won_dollar', 'wti', 'gold'}:
                response_data = fetch_and_save_overseas_indicator_day_data(start_date_str, end_date_str, indicator)
            if response_data:
                last_date = response_data[-1]["stck_bsop_date"]
                # 마지막 날짜 기준으로 업데이트 및 존재 확인
                if last_date != end_date_str:
                    current_date = datetime.strptime(last_date, "%Y%m%d").date()
                    if current_date.strftime("%Y%m%d") in existing_dates:
                        break  # 이미 가져온 날짜로 다시 돌아가면 중단
        else:
            break

        # 이전 날짜로 이동
        current_date -= timedelta(days=1)
        time.sleep(0.3)

    indicator_data = redis_client.zrange(cache_key, 0, -1, withscores=False)

    return [json.loads(item) for item in indicator_data]

def fetch_and_save_korea_indicator_day_data(date_str, indicator):
    print(f'{indicator}의 {date_str}의 데이터 가져옴')
    url = f"{REAL_KIS_API_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-daily-indexchartprice"
    
    params = {
        "fid_cond_mrkt_div_code": "U",    # 시장 구분 코드
        "fid_input_iscd": "",         # 지수 코드
        "fid_input_date_1": date_str,     # 시작 날짜
        "fid_input_date_2": "",     # 종료 날짜
        "fid_period_div_code": "D"        # 기간 구분 코드 (D: 일별)
    }
    
    if indicator == 'kospi':
        params['fid_input_iscd'] = '0001'
    elif indicator == 'kosdaq':
        params['fid_input_iscd'] = '1001'
    else:
        print(f"indicator값을 확인해주세요. 현재 indicator는 {indicator}입니다.")
        return None
    
    headers = get_real_headers('FHKUP03500100')
    
    response = requests.get(url, headers=headers, params=params)
    if response.status_code == 200:
        response_data = response.json()
        cache_key = f"indicator_day_data:{indicator}"
        
        pipe = redis_client.pipeline()

        for daily_data in response_data['output2']:
            timestamp = datetime.strptime(daily_data['stck_bsop_date'], "%Y%m%d").timestamp()
            pipe.zadd(cache_key, {json.dumps(daily_data): timestamp})

        pipe.execute()
        return response_data['output2']
    else:
        print(f"Failed to fetch data for {indicator.upper()} on {date_str}: {response.status_code}")
        return None

def fetch_and_save_overseas_indicator_day_data(start_date_str, end_date_str, indicator):
    print(f'{indicator}의 {start_date_str}의 데이터 가져옴')
    url = f"{REAL_KIS_API_BASE_URL}/uapi/overseas-price/v1/quotations/inquire-daily-chartprice"
    
    params = {
        "fid_cond_mrkt_div_code": "N",    # 시장 구분 코드
        "fid_input_iscd": "",         # 지수 코드
        "fid_input_date_1": start_date_str,     # 시작 날짜
        "fid_input_date_2": end_date_str,     # 종료 날짜
        "fid_period_div_code": "D"        # 기간 구분 코드 (D: 일별)
    }
    
    if indicator == 'nasdaq':
        params['fid_input_iscd'] = 'COMP'
    elif indicator == 's&p500':
        params['fid_input_iscd'] = 'SPX'
    elif indicator == 'dji':
        params['fid_input_iscd'] = '.DJI'
    elif indicator == 'yen_dollar':
        params['fid_input_iscd'] = 'FX@JPY'
        params['fid_cond_mrkt_div_code'] = 'X'
    elif indicator == 'won_dollar':
        params['fid_input_iscd'] = 'FX@KRW'
        params['fid_cond_mrkt_div_code'] = 'X'
    elif indicator == 'wti':
        params['fid_input_iscd'] = 'WTIF'
    elif indicator == 'gold':
        params['fid_input_iscd'] = 'NYGOLD'
    else:
        print(f"indicator 값을 확인해주세요. 현재 indicator는 {indicator}입니다.")
        return None
    
    headers = get_real_headers('FHKST03030100')
    
    response = requests.get(url, headers=headers, params=params)
    if response.status_code == 200:
        response_data = response.json()
        cache_key = f"indicator_day_data:{indicator}"
        
        pipe = redis_client.pipeline()

        for daily_data in response_data['output2']:
            timestamp = datetime.strptime(daily_data['stck_bsop_date'], "%Y%m%d").timestamp()
            pipe.zadd(cache_key, {json.dumps(daily_data): timestamp})

        pipe.execute()
        return response_data['output2']
    else:
        print(f"Failed to fetch data for {indicator.upper()} on {start_date_str}: {response.status_code}")
        return None
    
@api_view(['GET'])
def minute_price(request):
    stock_code = request.GET.get('stock_code')
    if not stock_code:
        return Response({"error": "stock_code parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

    # 데이터 수집 종료 시간(현재 시간)과 시작 시간 설정
    end_time = datetime.now()
    start_time = datetime.combine(date.today(), datetime.strptime("090000", "%H%M%S").time())
    
    cache_key = f"stock_min_data:{stock_code}"
    today_str = date.today().strftime("%Y%m%d")
    end_time_str = end_time.strftime("%H%M") + "00"
    indicator_data = redis_client.zrange(cache_key, 0, -1, withscores=False)
    while indicator_data and json.loads(indicator_data[-1])["stck_cntg_hour"] == end_time_str:
        value = indicator_data.pop()
        redis_client.zrem(cache_key, value)  # 지금 데이터 삭제

    indicator_data = redis_client.zrange(cache_key, 0, -1, withscores=False)
    existing_times = set()

    # 오늘 날짜 데이터 필터링 및 Redis에서 오래된 데이터 삭제
    for value in indicator_data:
        data = json.loads(value)
        if data.get("stck_bsop_date") != today_str:
            redis_client.zrem(cache_key, value)  # 오늘 데이터가 아닌 경우 삭제
        else:
            existing_times.add(data["stck_cntg_hour"])  # 오늘 데이터의 시간 기록

    # 누락된 시간대 확인 및 요청
    current_time = end_time
    while current_time >= start_time:
        time_str = current_time.strftime("%H%M") + "00"
        
        if time_str not in existing_times:
            fetch_and_save_stock_minute_data(stock_code, time_str)
        
        current_time -= timedelta(minutes=30)

    indicator_data = redis_client.zrange(cache_key, 0, -1, withscores=False)
    all_data = [json.loads(item) for item in indicator_data]

    return Response(all_data, status=status.HTTP_200_OK)

def fetch_and_save_stock_minute_data(stock_code, time_str):
    url = f"{REAL_KIS_API_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-time-itemchartprice"

    params = {
        "FID_ETC_CLS_CODE": "", 
        "FID_COND_MRKT_DIV_CODE": "J",  # 시장 구분 코드
        "fid_input_iscd": stock_code,
        "FID_INPUT_HOUR_1": time_str,  # 요청할 시간대
        "FID_PW_DATA_INCU_YN": "Y"
    }
    headers = get_real_headers('FHKST03010200')

    response = requests.get(url, headers=headers, params=params)
    if response.status_code == 200:
        response = response.json()
        cache_key = f"stock_min_data:{stock_code}"

        pipe = redis_client.pipeline()
        for minute_data in response['output2']:
            pipe.zadd(cache_key, {json.dumps(minute_data): minute_data['stck_cntg_hour']})
        pipe.execute()

        return response['output2']
    else:
        print(response.json())
        print(f"Failed to fetch minute data for {stock_code} at {time_str}: {response.status_code}")
        return None

@api_view(['GET'])
def stock_price(request):
    period_code = request.GET.get('period_code')
    stock_code = request.GET.get('stock_code')
    
    cache_key = f"stock_{period_code}_data:{stock_code}"
    
    end_date = date.today()
    start_date = end_date - timedelta(days=5 * 365)  # 5년 전
    start_date_str = start_date.strftime("%Y%m%d")
    
    end_date_str = end_date.strftime("%Y%m%d")
    stock_data = redis_client.zrange(cache_key, 0, -1, withscores=False)
    while stock_data and json.loads(stock_data[-1])["stck_bsop_date"] == end_date_str:
        value = stock_data.pop()
        redis_client.zrem(cache_key, value)  # 오늘 데이터 삭제
    existing_keys = set(stock_data)
    current_date = end_date
    while current_date >= start_date:
        end_date_str = current_date.strftime("%Y%m%d")
        
        response_data = fetch_and_save_stock_data(start_date_str, end_date_str, stock_code, period_code)
        if response_data:
            last_date = response_data[-1]["stck_bsop_date"]
            # 마지막 날짜 기준으로 업데이트 및 존재 확인
            current_date = datetime.strptime(last_date, "%Y%m%d").date()
            data = {
                "stck_bsop_date": response_data[-1].get("stck_bsop_date"), 
                "stck_clpr": response_data[-1].get("stck_clpr"), 
                "stck_oprc": response_data[-1].get("stck_oprc"), 
                "stck_hgpr": response_data[-1].get("stck_hgpr"), 
                "stck_lwpr": response_data[-1].get("stck_lwpr"), 
                "acml_vol": response_data[-1].get("acml_vol"), 
                "prdy_vrss_sign": response_data[-1].get("prdy_vrss_sign"), 
                "prdy_vrss": response_data[-1].get("prdy_vrss"), 
            }
            json_data = json.dumps(data).encode('utf-8')
            # 중복 여부 확인
            if json_data in existing_keys:
                break
        else:
            break

        current_date -= timedelta(days=1)
        time.sleep(0.2)

    stock_data = redis_client.zrange(cache_key, 0, -1, withscores=False)
    all_data = [json.loads(item) for item in stock_data]

    return Response(all_data, status=status.HTTP_200_OK)

def fetch_and_save_stock_data(start_date_str, end_date_str, stock_code, period_code):
    print(f'{stock_code}의 {end_date_str}의 데이터 가져옴')
    url = f"{REAL_KIS_API_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice"
    
    params = {
        "fid_cond_mrkt_div_code": "J",    # 시장 구분 코드
        "fid_input_iscd": stock_code,         # 종목 코드
        "fid_input_date_1": start_date_str,     # 시작 날짜
        "fid_input_date_2": end_date_str,     # 종료 날짜
        "fid_period_div_code": period_code,         # 기간 구분 코드 (D, W, M, Y)
        "fid_org_adj_prc": "0"
    }
    
    headers = get_real_headers('FHKST03010100')
    
    response = requests.get(url, headers=headers, params=params)
    if response.status_code == 200:
        response_data = response.json()
        cache_key = f"stock_{period_code}_data:{stock_code}"
        
        pipe = redis_client.pipeline()
        for daily_data in response_data['output2']:
            if not daily_data.get("stck_bsop_date"):
                break
            timestamp = datetime.strptime(daily_data['stck_bsop_date'], "%Y%m%d").timestamp()
            data = {
                "stck_bsop_date": daily_data.get("stck_bsop_date"), 
                "stck_clpr": daily_data.get("stck_clpr"), 
                "stck_oprc": daily_data.get("stck_oprc"), 
                "stck_hgpr": daily_data.get("stck_hgpr"), 
                "stck_lwpr": daily_data.get("stck_lwpr"), 
                "acml_vol": daily_data.get("acml_vol"), 
                "prdy_vrss_sign": daily_data.get("prdy_vrss_sign"), 
                "prdy_vrss": daily_data.get("prdy_vrss"), 
            }
            pipe.zadd(cache_key, {json.dumps(data): timestamp})

        pipe.execute()
        while response_data['output2'] and "stck_bsop_date" not in response_data['output2'][-1]:
            response_data['output2'].pop()
        return response_data['output2']
    else:
        print(f"Failed to fetch data for {stock_code} on {start_date_str}: {response.status_code}")
        return None
    
@api_view(['GET'])
def volume_ranking(request):
    response = rankings('volume')
    
    if response.status_code == 200:
        return Response(response.json()['output'], status=status.HTTP_200_OK)
    else:
        return Response({"error": "Failed to fetch data from KIS API"}, status=status.HTTP_502_BAD_GATEWAY)
    
@api_view(['GET'])
def amount_ranking(request):
    response = rankings('amount')
    
    if response.status_code == 200:
        return Response(response.json()['output'], status=status.HTTP_200_OK)
    else:
        return Response({"error": "Failed to fetch data from KIS API"}, status=status.HTTP_502_BAD_GATEWAY)

@api_view(['GET'])
def advance_ranking(request):
    response = rankings('advance')
    
    if response.status_code == 200:
        return Response(response.json()['output'], status=status.HTTP_200_OK)
    else:
        return Response({"error": "Failed to fetch data from KIS API"}, status=status.HTTP_502_BAD_GATEWAY)

@api_view(['GET'])
def decline_ranking(request):
    response = rankings('decline')
    
    if response.status_code == 200:
        return Response(response.json()['output'], status=status.HTTP_200_OK)
    else:
        return Response({"error": "Failed to fetch data from KIS API"}, status=status.HTTP_502_BAD_GATEWAY)

def rankings(rank_type):
    params = {
        "FID_COND_MRKT_DIV_CODE": "J", 
        "FID_INPUT_ISCD": "0001",
        "FID_DIV_CLS_CODE": "0",
        "FID_TRGT_CLS_CODE": "111111111",
        "FID_TRGT_EXLS_CLS_CODE": "000000",
        "FID_INPUT_PRICE_1": "0",
        "FID_INPUT_PRICE_2": "0",
        "FID_VOL_CNT": "0",
    }
    
    if rank_type in {'volume', 'amount'}:
        url = f"{REAL_KIS_API_BASE_URL}/uapi/domestic-stock/v1/quotations/volume-rank"
        params['fid_cond_scr_div_code'] = "20171"
        params['FID_INPUT_DATE_1'] = '0'
        
        if rank_type == 'volume':
            params['FID_BLNG_CLS_CODE'] = '0'
        else:
            params['FID_BLNG_CLS_CODE'] = '3'
            
        headers = get_real_headers('FHPST01710000')
    elif rank_type in {'advance', 'decline'}:
        url = f"{REAL_KIS_API_BASE_URL}/uapi/domestic-stock/v1/ranking/fluctuation"
        params['fid_cond_scr_div_code'] = "20170"
        params['fid_input_cnt_1'] = "0"
        params['fid_prc_cls_code'] = '1'
        params['fid_rsfl_rate1'] = ''
        params['fid_rsfl_rate2'] = ''
        
        if rank_type == 'advance':
            params['fid_rank_sort_cls_code'] = '0'
        else:
            params['fid_rank_sort_cls_code'] = '1'
            
        headers = get_real_headers('FHPST01700000', 'P')
    return requests.get(url, headers=headers, params=params)

@api_view(['GET', 'POST', 'PUT'])
@permission_classes([IsAuthenticated])
def orders(request):
    if request.method == 'GET':
        user = request.user
        history_type = request.GET.get('history_type')
        incomplete_data = StockData.objects.filter(user=user).exclude(remain_amount=0).exclude(order_number="지정주문").order_by('-execution_date', '-execution_time')
        for stock_data in incomplete_data:
            execution_date = stock_data.execution_date.strftime("%Y%m%d")
            order_number = stock_data.order_number
            url = f"{PAPER_KIS_API_BASE_URL}/uapi/domestic-stock/v1/trading/inquire-daily-ccld"
            headers = get_paper_headers("VTTC8001R")
            params = {
                "CANO": settings.PAPER_ACCOUNT, 
                "ACNT_PRDT_CD": "01", 
                "INQR_STRT_DT": execution_date, 
                "INQR_END_DT": execution_date, 
                "SLL_BUY_DVSN_CD": "00", 
                "INQR_DVSN": "00", 
                "PDNO": "", 
                "CCLD_DVSN": "00", # 00: 전체, 01: 체결, 02: 미체결
                "ORD_GNO_BRNO": "", 
                "ODNO": order_number, 
                "INQR_DVSN_3": "00", 
                "INQR_DVSN_1": "", 
                "CTX_AREA_FK100": "", 
                "CTX_AREA_NK100": ""
            }
            response = requests.request("GET", url, headers=headers, params=params)
            amount = int(stock_data.amount)
            sign = amount // abs(amount)
            if response.status_code == 200:    
                response_data = response.json()
                output = response_data['output1'][0]
                stock_data.remain_amount = output.get('rmn_qty')
                stock_data.price = int(output.get('tot_ccld_amt')) * sign
                stock_data.save()
            else:
                print(response.json())
                return Response({"error": "Failed to order from KIS API"}, status=status.HTTP_502_BAD_GATEWAY)
            time.sleep(0.5)
            
        if not history_type:  # 전체 주문 내역
            all_data = StockData.objects.filter(user=user).order_by('-execution_date', '-execution_time')
            serializer = StockDataSerializer(instance=all_data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif history_type == 'standard':
            all_data = StockData.objects.filter(user=user).exclude(order_type="02").order_by('-execution_date', '-execution_time')
            response_data = [
                {
                    "odno": data.order_number, 
                    "pdno": data.stock_code, 
                    "sll_buy_dvsn_cd": "SELL" if data.price < 0 else "BUY", 
                    "ord_dt": data.execution_date, 
                    "ord_tmd": data.execution_time, 
                    "ord_qty": abs(data.amount), 
                    "tot_ccld_qty": data.amount - data.cancel_amount, 
                    "cncl_cfrm_qty": data.cancel_amount, 
                    "rmn_qty": data.remain_amount, 
                    "ord_unpr": data.price / data.amount, 
                    "avg_prvs": data.price / data.amount, 
                }
                for data in all_data
            ]
            return Response(response_data, status=status.HTTP_200_OK)
        elif history_type == 'scheduled':
            all_data = StockData.objects.filter(user=user).filter(order_type="03").order_by('-execution_date', '-execution_time')
            response_data = [
                {
                    "pdno": data.stock_code, 
                    "sll_buy_dvsn_cd": "SELL" if data.price < 0 else "BUY", 
                    "ord_qty": abs(data.amount), 
                    "ord_unpr": data.price / data.amount, 
                    "tar_pr": data.target_price, 
                }
                for data in all_data
            ]
            return Response(response_data, status=status.HTTP_200_OK)
            
    if request.method == 'POST':
        user = request.user
        stock_code = request.data.get('stock_code')
        trade_type = request.data.get('trade_type')
        amount = request.data.get('amount')
        price = request.data.get('price')
        target_price = request.data.get('target_price')
        
        payload = {
            "CANO": settings.PAPER_ACCOUNT,
            "ACNT_PRDT_CD": "01",
            "PDNO": stock_code,
            "ORD_DVSN": "00",  # 00: 지정가, 01: 시장가
            "ORD_QTY": amount,  # 주문 주식 수
            "ORD_UNPR": price  # 지정가인 경우 가격 담고, 시장가인 경우는 0으로
        }
        
        if target_price == "0":
            # 시장가 주문
            if price == "0":
                payload['ORD_DVSN'] = "01"
            # 아니면 지정가 주문
        # 조건 주문
        else:
            serializer = StockDataSaveSerializer(data={
                    "user": user.id,
                    "order_number": "지정주문", 
                    "stock_code": stock_code,
                    "execution_date": datetime.now().strftime("%Y%m%d"), 
                    "execution_time": datetime.now().strftime("%H%M%S"), 
                    "amount": amount, 
                    "remain_amount": amount, 
                    "price": price, 
                    "target_price": target_price, 
                    "order_type": payload['ORD_DVSN'] if target_price == "0" else "03"
                    }
                )
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response({"msg1": "모의투자 매수주문이 완료 되었습니다."}, status=status.HTTP_200_OK)
        url = f"{PAPER_KIS_API_BASE_URL}/uapi/domestic-stock/v1/trading/order-cash"

        headers = get_paper_headers('VTTC0802U' if trade_type == 'buy' else 'VTTC0801U')
        response =  requests.post(url, headers=headers, data=json.dumps(payload))
        
        if response.status_code == 200:
            response_data = response.json()
            if response_data.get('rt_cd') == "0": # 성공
                output = response_data.get('output')
                execution_date = datetime.now().strftime("%Y%m%d")
                order_number = output.get('ODNO')
                execution_time = output.get('ORD_TMD')
                
                amount = int(amount)
                if trade_type == 'sell':
                    amount *= -1
                serializer = StockDataSaveSerializer(data={
                    "user": user.id,
                    "order_number": order_number, 
                    "stock_code": stock_code,
                    "execution_date": execution_date, 
                    "execution_time": execution_time, 
                    "amount": amount, 
                    "remain_amount": amount, 
                    "price": price, 
                    "target_price": target_price, 
                    "order_type": payload['ORD_DVSN'] if target_price == "0" else "03"
                    }
                )
                if serializer.is_valid():
                    serializer.save()
                    balance = Balance.objects.get(user=user)
                    balance.balance -= int(price) * amount
                    balance.save()
                    return Response(response_data, status=status.HTTP_200_OK)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:  # 실패
                print(response.json())
                return Response(response, status=status.HTTP_400_BAD_REQUEST)
        else:
            print(response.json())
            return Response({"error": "Failed to order from KIS API"}, status=status.HTTP_502_BAD_GATEWAY)
    
    if request.method == 'PUT':
        order_number = request.data.get('order_number')
        amount = request.data.get('amount')
        price = request.data.get('price')
        stock_data = StockData.objects.get(order_number=order_number)
        payload = {
            "CANO": settings.PAPER_ACCOUNT,
            "ACNT_PRDT_CD": "01",
            "KRX_FWDG_ORD_ORGNO": "",
            "ORGN_ODNO": order_number,  # 주문 번호
            "ORD_DVSN": stock_data.order_type,  # 주문 구분
            "RVSE_CNCL_DVSN_CD": "01" if price != "0" else "02",  # 정정 취소 구분 코드, 01: 정정, 02: 취소
            "ORD_QTY": amount,  # 0이면 전부 취소, 그 이외는 수량 설정
            "ORD_UNPR": price,  # 정정이면 가격 설정, 시장가나 취소면 0 설정
            "QTY_ALL_ORD_YN": "Y" if amount == 0 else "N"  # ORD_QTY에서 0이면 Y, 그게 아니면 N
        }
        
        url = f"{PAPER_KIS_API_BASE_URL}/uapi/domestic-stock/v1/trading/order-rvsecncl"
        
        headers = get_paper_headers('VTTC0803U')
        response =  requests.post(url, headers=headers, data=json.dumps(payload))
        
        if response.status_code == 200:
            response_data = response.json()
            if response_data.get('rt_cd') == "0": # 성공
                output = response_data.get('output')
                execution_date = datetime.now().strftime("%Y%m%d")
                order_number = output.get('ODNO')
                execution_time = output.get('ORD_TMD')
                # 정정이면
                # 가격 데이터, 주문 번호, execution_date, execution_time 수정
                if payload['RVSE_CNCL_DVSN_CD'] == "01":
                    stock_data.price = price
                    stock_data.order_number = order_number
                    stock_data.execution_date = execution_date
                    stock_data.execution_time = execution_time
                # 취소라면?
                else:
                    # 전량 취소면 그냥 제거
                    if amount == '0':
                        stock_data.delete()
                    # 일부 취소면 값만 변경
                    else:
                        stock_data.amount -= int(amount)
                        stock_data.cancel_amount += int(amount)
                        stock_data.save()
            return Response(response_data, status=status.HTTP_200_OK)
        else:
            print(response.json())
            return Response({"error": "Failed to order from KIS API"}, status=status.HTTP_502_BAD_GATEWAY)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def holdings(request):
    user = request.user
    all_data = StockData.objects.filter(user=user)
    balance = all_data.aggregate(total_price=Sum('price'))['total_price'] or 0
    holdings = (
        StockData.objects.filter(user=user).filter(remain_amount=0)
        .values('stock_code')
        .annotate(
            total_amount=Sum('amount'),  # 보유 수량 합계
            total_value=Sum('price')  # 총 가치
        )
        .annotate(
            average_price=ExpressionWrapper(F('total_value') / F('total_amount'), output_field=FloatField())
        )
        .filter(total_amount__gt=0)  # 보유 수량이 0 이상인 종목만 반환
    )
    
    if not holdings:
        return Response({"balance": 5000000 - balance, "holdings": []}, status=status.HTTP_200_OK)

    url = f"{REAL_KIS_API_BASE_URL}/uapi/domestic-stock/v1/quotations/intstock-multprice"
    headers = get_real_headers('FHKST11300006', "P")
    params = {}
    for index, holding in enumerate(holdings):
        params[f"fid_cond_mrkt_div_code_{index+1}"] = "J"
        params[f"fid_input_iscd_{index+1}"] = holding["stock_code"]
    response =  requests.get(url, headers=headers, params=params)

    response_data = {
        "holdings": [
            {
                "stock_code": holding["stock_code"],
                "total_amount": holding["total_amount"],
                "average_price": holding["average_price"],
            }
            for holding in holdings
        ], 
        "balance": 5000000 - balance
    }
    
    if response.status_code == 200:
        outputs = response.json()['output']
        for index, output in enumerate(outputs):
            response_data["holdings"][index]['stock_name'] = output.get("inter_kor_isnm")
            response_data["holdings"][index]['current_price'] = output.get("inter2_prpr")
            response_data["holdings"][index]['difference'] = output.get("inter2_prdy_vrss")
            response_data["holdings"][index]['percentage'] = output.get("prdy_ctrt")
    else:
        print(response.json())
        return Response({"error": "Failed to order from KIS API"}, status=status.HTTP_502_BAD_GATEWAY)

    return Response(response_data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_time_rankings(request):
    top_users = User.objects.order_by('-balance')[:3]
    response_data = [
            {
                "username": user.username,
                "return_rate": round(user.balance / 5000000, 2)
            }
            for user in top_users
        ]
    
    return Response(response_data, status=status.HTTP_200_OK)

@api_view(['GET'])
def trend(request, keyword):
    stock_code = request.GET.get('stock_code')
    if keyword == 'trader':
        url = f"{REAL_KIS_API_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-member"
        headers = get_paper_headers('FHKST01010600')
        params = {
            "fid_cond_mrkt_div_code": "J",
            "fid_input_iscd": stock_code,
        }
        response =  requests.get(url, headers=headers, params=params)
        if response.status_code == 200:
            return Response(response.json()['output'], status=status.HTTP_200_OK)
        else:
            print(response.json())
            return Response({"error": "Failed to order from KIS API"}, status=status.HTTP_502_BAD_GATEWAY)
    elif keyword == 'investor':
        url = f"{REAL_KIS_API_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-investor"
        headers = get_paper_headers('FHKST01010900')
        params = {
            "fid_cond_mrkt_div_code": "J",
            "fid_input_iscd": stock_code,
        }
        response =  requests.get(url, headers=headers, params=params)
        data = []
        if response.status_code == 200:
            outputs = response.json()['output']
            for output in outputs:    
                data.append({
                    "stck_bsop_date": output.get("stck_bsop_date"), 
                    "prsn_ntby_qty": output.get("prsn_ntby_qty"), 
                    "frgn_ntby_qty": output.get("frgn_ntby_qty"), 
                    "orgn_ntby_qty": output.get("orgn_ntby_qty"), 
                    "prsn_ntby_tr_pbmn": output.get("prsn_ntby_tr_pbmn"), 
                    "frgn_ntby_tr_pbmn": output.get("frgn_ntby_tr_pbmn"), 
                    "orgn_ntby_tr_pbmn": output.get("orgn_ntby_tr_pbmn"), 
                })
            return Response(data, status=status.HTTP_200_OK)
        else:
            print(response.json())
            return Response({"error": "Failed to order from KIS API"}, status=status.HTTP_502_BAD_GATEWAY)

@api_view(['GET'])
def information(request):
    stock_code = request.GET.get('stock_code')
    url = f"{REAL_KIS_API_BASE_URL}/uapi/domestic-stock/v1/quotations/search-stock-info"
    headers = get_real_headers('CTPF1002R', "P")
    params = {
        "PRDT_TYPE_CD": "300",
        "PDNO": stock_code,
    }
    response =  requests.get(url, headers=headers, params=params)
    if response.status_code == 200:
        output = response.json()['output']
        data = {
            "std_idst_clsf_cd_name": output.get("std_idst_clsf_cd_name"), 
            "idx_bztp_scls_cd_name": output.get("idx_bztp_scls_cd_name"), 
        }
        return Response(data, status=status.HTTP_200_OK)
    else:
        print(response.json())
        return Response({"error": "Failed to order from KIS API"}, status=status.HTTP_502_BAD_GATEWAY)
    
@api_view(['GET'])
def disclosure(request):
    stock_code = request.GET.get('stock_code')
    
    cache_key = f"stock_news:{stock_code}"
    end_date = date.today()
    start_date = end_date - timedelta(days=7)

    news_data = redis_client.zrange(cache_key, 0, -1, withscores=False)
    existing_keys = set(news_data)
    
    current_date = end_date
    while current_date >= start_date:
        current_date_str = current_date.strftime("%Y%m%d")
        response_data = fetch_and_save_stock_news(current_date_str, stock_code)
        data = {
                "hts_pbnt_titl_cntt": response_data[-1].get('hts_pbnt_titl_cntt'), 
                "dorg": response_data[-1].get('dorg'), 
                "data_dt": response_data[-1].get('data_dt'), 
            }
        json_data = json.dumps(data).encode('utf-8')
        if json_data in existing_keys:
            break

        current_date -= timedelta(days=1)
        time.sleep(0.3)

    news_data = redis_client.zrevrange(cache_key, 0, -1, withscores=False)
    all_data = [json.loads(item) for item in news_data]
    
    return Response(all_data, status=status.HTTP_200_OK)

def fetch_and_save_stock_news(date_str, stock_code):
    print(f'{stock_code}의 {date_str}의 뉴스 가져옴')
    url = f"{REAL_KIS_API_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice"
    
    url = f"{REAL_KIS_API_BASE_URL}/uapi/domestic-stock/v1/quotations/news-title"
    headers = get_real_headers('FHKST01011800', "P")
    params = {
        "FID_NEWS_OFER_ENTP_CODE": "", 
        "FID_COND_MRKT_CLS_CODE": "", 
        "FID_INPUT_ISCD": stock_code,
        "FID_TITL_CNTT": "", 
        "FID_INPUT_DATE_1": date_str,
        "FID_INPUT_HOUR_1": "", 
        "FID_RANK_SORT_CLS_CODE": "", 
        "FID_INPUT_SRNO": "", 
    }
    response = requests.get(url, headers=headers, params=params)
    if response.status_code == 200:
        response_data = response.json()
        cache_key = f"stock_news:{stock_code}"
        
        pipe = redis_client.pipeline()
        for daily_data in response_data['output']:
            timestamp = datetime.strptime(daily_data['data_dt'] + daily_data['data_tm'], "%Y%m%d%H%M%S").timestamp()
            data = {
                "hts_pbnt_titl_cntt": daily_data.get('hts_pbnt_titl_cntt'), 
                "dorg": daily_data.get('dorg'), 
                "data_dt": daily_data.get('data_dt'), 
            }
            pipe.zadd(cache_key, {json.dumps(data): timestamp})

        pipe.execute()
        return response_data['output']
    else:
        print(f"Failed to fetch news for {stock_code} on {stock_code}: {response.status_code}")
    return None

# 실전 투자 헤더 생성 함수
def get_real_headers(tr_id, custtype=""):
    basic_headers = {
        'content-type': 'application/json',
        'authorization': settings.REAL_API_TOKEN,
        'appkey': settings.REAL_APP_KEY,
        'appsecret': settings.REAL_APP_SECRET,
        'tr_id': tr_id,
    }
    
    if custtype != "":
        basic_headers["custtype"] = custtype
        
    return basic_headers

# 모의 투자 헤더 생성 함수
def get_paper_headers(tr_id):
    basic_headers = {
        'content-type': 'application/json',
        'authorization': settings.PAPER_API_TOKEN,
        'appkey': settings.PAPER_APP_KEY,
        'appsecret': settings.PAPER_APP_SECRET,
        'tr_id': tr_id,
    }
        
    return basic_headers