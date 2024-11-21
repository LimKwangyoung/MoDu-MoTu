# myapp/management/commands/move_to_mysql.py
import json
from django.core.management.base import BaseCommand
from django.conf import settings
import redis
from stocks.models import StockData  # MySQL에 저장할 모델

# Redis 클라이언트 설정
redis_client = redis.StrictRedis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=0)

class Command(BaseCommand):
    help = 'Move stock data from Redis to MySQL'

    def handle(self, *args, **options):
        keys = redis_client.keys("stock_data:*")  # Redis에서 "stock_data:"로 시작하는 키 검색
        for key in keys:
            stock_data_json = redis_client.get(key)
            stock_data = json.loads(stock_data_json)
            
            # MySQL에 데이터 저장
            StockData.objects.create(
                stock_code=stock_data['code'],
                execution_time=stock_data['time'],
                value=stock_data['value']
            )

            # Redis에서 해당 데이터 삭제
            redis_client.delete(key)

        self.stdout.write(self.style.SUCCESS('Successfully moved stock data to MySQL'))
