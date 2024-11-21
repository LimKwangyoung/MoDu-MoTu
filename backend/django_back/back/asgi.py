import os
import django
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import stocks.routing
from stocks.utils import start_kis_websocket

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'back.settings')
django.setup()

# Django 서버가 시작될 때 KIS WebSocket 연결 시작
start_kis_websocket()

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            stocks.routing.websocket_urlpatterns
        )
    ),
})
