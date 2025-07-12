from rest_framework import serializers
from .models import Answer
from apps.users.serializers import UserSerializer


class AnswerSerializer(serializers.ModelSerializer):
    """Serializer for Answer model."""
    
    author = UserSerializer(read_only=True)
    votes_count = serializers.SerializerMethodField()
    is_best_answer = serializers.SerializerMethodField()
    is_highly_voted = serializers.SerializerMethodField()
    short_content = serializers.SerializerMethodField()
    
    class Meta:
        model = Answer
        fields = [
            'id', 'content', 'question', 'author', 'is_accepted', 'votes', 
            'is_edited', 'edit_count', 'last_edited_at', 'created_at', 'updated_at',
            'votes_count', 'is_best_answer', 'is_highly_voted', 'short_content'
        ]
        read_only_fields = [
            'id', 'author', 'is_accepted', 'votes', 'is_edited', 'edit_count',
            'last_edited_at', 'created_at', 'updated_at'
        ]
    
    def get_votes_count(self, obj):
        return obj.get_votes_count()
    
    def get_is_best_answer(self, obj):
        return obj.is_best_answer
    
    def get_is_highly_voted(self, obj):
        return obj.is_highly_voted
    
    def get_short_content(self, obj):
        return obj.short_content


class AnswerCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating answers."""
    
    class Meta:
        model = Answer
        fields = ['content', 'question']
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class AnswerUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating answers."""
    
    class Meta:
        model = Answer
        fields = ['content']
    
    def update(self, instance, validated_data):
        # Mark as edited
        instance.mark_as_edited()
        return super().update(instance, validated_data)


class AnswerListSerializer(serializers.ModelSerializer):
    """Serializer for listing answers with minimal data."""
    
    author = UserSerializer(read_only=True)
    votes_count = serializers.SerializerMethodField()
    is_best_answer = serializers.SerializerMethodField()
    
    class Meta:
        model = Answer
        fields = [
            'id', 'content', 'author', 'is_accepted', 'votes', 'created_at',
            'votes_count', 'is_best_answer'
        ]
    
    def get_votes_count(self, obj):
        return obj.get_votes_count()
    
    def get_is_best_answer(self, obj):
        return obj.is_best_answer 