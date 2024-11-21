from .models import Message
from rest_framework import serializers

class MessageSaveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        exclude = ['created_at']
        
class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['role', 'content']