from rest_framework import serializers
from .models import Notification
from apps.users.serializers import UserSerializer


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model."""
    
    recipient = UserSerializer(read_only=True)
    sender = UserSerializer(read_only=True)
    
    class Meta:
        model = Notification
        fields = ['id', 'recipient', 'sender', 'notification_type', 'title', 'message',
                 'related_question', 'related_answer', 'is_read', 'created_at']
        read_only_fields = ['id', 'recipient', 'sender', 'notification_type', 'title', 'message',
                           'related_question', 'related_answer', 'created_at']


class NotificationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating notifications."""
    
    class Meta:
        model = Notification
        fields = ['recipient', 'sender', 'notification_type', 'title', 'message',
                 'related_question', 'related_answer'] 