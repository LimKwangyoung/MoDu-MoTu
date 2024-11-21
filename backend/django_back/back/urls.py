from django.contrib import admin
from django.urls import path, include


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/accounts/', include('dj_rest_auth.urls')),
    path('api/accounts/registration/', include('dj_rest_auth.registration.urls')),
    path('api/stocks/', include('stocks.urls')),
    path('api/chatbot/', include('chatbot.urls'))
]
