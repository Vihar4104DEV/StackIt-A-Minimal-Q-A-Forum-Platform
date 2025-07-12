from rest_framework import serializers
from .models import Question
from apps.users.serializers import UserSerializer
from apps.tags.serializers import TagSerializer


class QuestionSerializer(serializers.ModelSerializer):
    """Serializer for Question model."""
    
    author = UserSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    answers_count = serializers.SerializerMethodField()
    votes_count = serializers.SerializerMethodField()
    is_popular = serializers.SerializerMethodField()
    has_bounty = serializers.SerializerMethodField()
    short_title = serializers.SerializerMethodField()
    
    class Meta:
        model = Question
        fields = [
            'id', 'title', 'content', 'author', 'tags', 'views', 'votes', 
            'is_answered', 'is_closed', 'is_featured', 'bounty_amount', 'bounty_expires_at',
            'created_at', 'updated_at', 'answers_count', 'votes_count', 'is_popular',
            'has_bounty', 'short_title'
        ]
        read_only_fields = [
            'id', 'author', 'views', 'votes', 'is_answered', 'is_closed', 
            'is_featured', 'created_at', 'updated_at'
        ]
    
    def get_answers_count(self, obj):
        return obj.get_answers_count()
    
    def get_votes_count(self, obj):
        return obj.get_votes_count()
    
    def get_is_popular(self, obj):
        return obj.is_popular
    
    def get_has_bounty(self, obj):
        return obj.has_bounty
    
    def get_short_title(self, obj):
        return obj.short_title


class QuestionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating questions."""
    
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=50),
        write_only=True,
        required=False,
        help_text="List of tag names to associate with the question"
    )
    
    class Meta:
        model = Question
        fields = ['title', 'content', 'tag_names', 'bounty_amount', 'bounty_expires_at']
    
    def create(self, validated_data):
        tag_names = validated_data.pop('tag_names', [])
        validated_data['author'] = self.context['request'].user
        
        # Create question
        question = super().create(validated_data)
        
        # Add tags
        if tag_names:
            from apps.tags.models import Tag
            for tag_name in tag_names:
                tag, created = Tag.objects.get_or_create(
                    name=tag_name.strip(),
                    defaults={}
                )
                question.tags.add(tag)
        
        return question


class QuestionUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating questions."""
    
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=50),
        write_only=True,
        required=False,
        help_text="List of tag names to associate with the question"
    )
    
    class Meta:
        model = Question
        fields = ['title', 'content', 'tag_names', 'bounty_amount', 'bounty_expires_at']
    
    def update(self, instance, validated_data):
        tag_names = validated_data.pop('tag_names', None)
        
        # Update question
        question = super().update(instance, validated_data)
        
        # Update tags if provided
        if tag_names is not None:
            question.tags.clear()
            from apps.tags.models import Tag
            for tag_name in tag_names:
                tag, created = Tag.objects.get_or_create(
                    name=tag_name.strip(),
                    defaults={}
                )
                question.tags.add(tag)
        
        return question


class QuestionListSerializer(serializers.ModelSerializer):
    """Serializer for listing questions with minimal data."""
    
    author = UserSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    answers_count = serializers.SerializerMethodField()
    votes_count = serializers.SerializerMethodField()
    is_popular = serializers.SerializerMethodField()
    
    class Meta:
        model = Question
        fields = [
            'id', 'title', 'author', 'tags', 'views', 'votes', 'is_answered',
            'created_at', 'answers_count', 'votes_count', 'is_popular'
        ]
    
    def get_answers_count(self, obj):
        return obj.get_answers_count()
    
    def get_votes_count(self, obj):
        return obj.get_votes_count()
    
    def get_is_popular(self, obj):
        return obj.is_popular 