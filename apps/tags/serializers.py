from rest_framework import serializers
from .models import Tag


class TagSerializer(serializers.ModelSerializer):
    """Serializer for Tag model."""
    
    class Meta:
        model = Tag
        fields = ['id', 'name', 'description', 'color', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class TagCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating tags."""
    
    class Meta:
        model = Tag
        fields = ['name', 'description', 'color']
    
    def create(self, validated_data):
        return super().create(validated_data)


class TagUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating tags."""
    
    class Meta:
        model = Tag
        fields = ['name', 'description', 'color'] 