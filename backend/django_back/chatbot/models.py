from django.db import models
from django.contrib.auth import get_user_model


User = get_user_model()

class Message(models.Model):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
        ('system', 'System'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)  # 역할 (user/assistant/system)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
