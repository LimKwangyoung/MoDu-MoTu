from rest_framework import serializers
from .models import StockData

class StockDataSaveSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockData
        fields = ['user', 'order_number', 'stock_code', 'execution_date', 'execution_time', 'amount', "remain_amount", 'price', 'target_price', 'order_type']
        
class StockDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockData
        fields = ['order_number', 'stock_code', 'execution_date', 'execution_time', 'amount', "real_amount", "cancel_amount", "remain_amount", 'price', "real_price", 'target_price', 'order_type']
