from django.urls import path
from .views import chat

app_name = "chatbot"
urlpatterns = [
    path("", chat),
]
