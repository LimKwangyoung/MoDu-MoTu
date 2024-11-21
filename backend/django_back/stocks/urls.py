from django.urls import path, include
from . import views
from . import routing

app_name = 'stocks'
urlpatterns = [
    path('', include(routing.websocket_urlpatterns)),  # WebSocket URL 패턴 포함
    path('kospi/', views.kospi),
    path('kosdaq/', views.kosdaq),
    path('nasdaq/', views.nasdaq),
    path('sp500/', views.sp500),
    path('dji/', views.dji),
    path('yen-dollar/', views.yen_dollar),
    path('won-dollar/', views.won_dollar),
    path('wti/', views.wti),
    path('gold/', views.gold),
    path('volume-ranking/', views.volume_ranking),
    path('amount-ranking/', views.amount_ranking),
    path('advance-ranking/', views.advance_ranking),
    path('decline-ranking/', views.decline_ranking),
    path('orders/', views.orders),
    path('holdings/', views.holdings),
    path('minute-price/', views.minute_price),
    path('stock-price/', views.stock_price),
    path('all-time-ranking/', views.all_time_rankings),
    path('trend/<str:keyword>/', views.trend),
    path('information/', views.information),
    path('disclosure/', views.disclosure),
]