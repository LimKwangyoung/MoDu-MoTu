from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import FavoriteStock, Balance, Position
from .serializers import PositionSerializer, PositionSaveSerializer
from stocks.views import get_real_headers
import os, requests
from pprint import pprint

state = os.environ.get("STATE")
BASE_URL = 'http://localhost:8000/api/accounts/'
REAL_KIS_API_BASE_URL = "https://openapi.koreainvestment.com:9443"

@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def favorite_stock(request):
    if request.method == 'GET':
        user = request.user
        favorite_stocks = FavoriteStock.objects.filter(user=user)

        url = f"{REAL_KIS_API_BASE_URL}/uapi/domestic-stock/v1/quotations/intstock-multprice"
        headers = get_real_headers('FHKST11300006', "P")
        params = {}
        for index, stock in enumerate(favorite_stocks):
            params[f"fid_cond_mrkt_div_code_{index+1}"] = "J"
            params[f"fid_input_iscd_{index+1}"] = stock.stock_code
        response =  requests.get(url, headers=headers, params=params)

        data = []
        if response.status_code == 200:
            outputs = response.json()['output']
            for output in outputs:
                data.append({
                    'stock_code': output.get("inter_shrn_iscd"), 
                    'stock_name': output.get("inter_kor_isnm"),
                    'stock_price': output.get("inter2_prpr"),
                    'fluctuation_rate': output.get("prdy_ctrt"),
                    'fluctuation_difference': output.get("inter2_prdy_vrss"),
                })
        else:
            pprint(response.json())
            return Response({"error": "Failed to order from KIS API"}, status=status.HTTP_502_BAD_GATEWAY)
            
        return Response(data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        user = request.user
        stock_code = request.data.get('stock_code')

        if not stock_code:
            return Response({"error": "Stock code is required."}, status=status.HTTP_400_BAD_REQUEST)

        favorite, created = FavoriteStock.objects.get_or_create(user=user, stock_code=stock_code)

        if created:
            return Response({"message": "Stock added to favorites."}, status=status.HTTP_201_CREATED)
        else:
            return Response({"message": "Stock is already in favorites."}, status=status.HTTP_200_OK)
    elif request.method == 'DELETE':
        user = request.user
        stock_code = request.data.get('stock_code')
        
        if not stock_code:
            return Response({"error": "Stock code is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            stock = FavoriteStock.objects.get(user=user, stock_code=stock_code)
            stock.delete()
            return Response({"message": f"Stock {stock_code} removed from favorites."}, status=status.HTTP_204_NO_CONTENT)
        except FavoriteStock.DoesNotExist:
            return Response({"error": f"Stock {stock_code} is not in favorites."}, status=status.HTTP_404_NOT_FOUND)
        
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def balance(request):
    user = request.user
    try:
        balance = Balance.objects.get(user=user)
    except:
        balance = Balance.objects.create(user=user, balance=5000000)
    return Response({"balance": balance.balance}, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def position(request):
    user = request.user
    if request.method == "GET":
        positions = Position.objects.filter(user=user)
        serializer = PositionSerializer(positions, many=True)
        data = serializer.data
        
        for d in serializer.data:
            d['w'] = d['width']
            d['h'] = d['height']
            del d['width']
            del d['height']
        
        return Response({'layout': data}, status=status.HTTP_200_OK)
    if request.method == "POST":
        if Position.objects.filter(user=user).exists():
            positions = Position.objects.filter(user=user)
            positions.delete()
        
        layout = request.data.get("layout")
        for l in layout:
            l['width'] = l['w']
            del l['w']
            l['height'] = l['h']
            del l['h']
            l['user'] = user.id
        serializer = PositionSaveSerializer(data=layout, many=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return Response({"message": "Data saved."}, status=status.HTTP_200_OK)