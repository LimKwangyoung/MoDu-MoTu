from django.db import models
from django.contrib.auth import get_user_model


User = get_user_model()
class StockData(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    order_number = models.CharField(max_length=10)  # 주문 번호
    stock_code = models.CharField(max_length=10)  # 종목 코드
    execution_date = models.DateField()  # 주문 일자
    execution_time = models.TimeField()  # 주문 시간
    amount = models.IntegerField()  # 주문 수량
    real_amount = models.IntegerField(default=0)  # 총 체결수량
    cancel_amount = models.IntegerField(default=0)  # 취소확인수량
    remain_amount = models.IntegerField() # 잔여 수량
    price = models.IntegerField(default=0)  # 주문 단가, 이게 0이면 시장가, 있으면 지정가or 조건
    real_price =  models.FloatField(default=0)  # 체결 평균가
    target_price = models.IntegerField(default=0)  # 조건 주문 목표가  # 이게 있으면 조건, 없으면 지정
    order_type = models.CharField(max_length=2, default="00")  # 00: 지정가, 01: 시장가, 02: 조건