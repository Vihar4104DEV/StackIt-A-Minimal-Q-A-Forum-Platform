from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count
from .models import Question
from .serializers import (
    QuestionSerializer, 
    QuestionCreateSerializer, 
    QuestionUpdateSerializer,
    QuestionListSerializer
)


class QuestionViewSet(viewsets.ModelViewSet):
    """ViewSet for Question model."""
    
    queryset = Question.objects.filter(is_active=True, is_deleted=False)
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['author', 'tags', 'is_answered', 'is_closed', 'is_featured']
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'updated_at', 'votes', 'views', 'answers_count']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Add answers count annotation
        queryset = queryset.annotate(
            answers_count=Count('answers', filter=Q(answers__is_active=True, answers__is_deleted=False))
        )
        
        # Filter by answered/unanswered
        answered = self.request.query_params.get('answered', None)
        if answered is not None:
            if answered.lower() == 'true':
                queryset = queryset.filter(is_answered=True)
            elif answered.lower() == 'false':
                queryset = queryset.filter(is_answered=False)
        
        # Filter by popular questions
        popular = self.request.query_params.get('popular', None)
        if popular is not None:
            if popular.lower() == 'true':
                queryset = queryset.filter(Q(views__gt=100) | Q(votes__gt=10))
        
        # Filter by bounty questions
        has_bounty = self.request.query_params.get('has_bounty', None)
        if has_bounty is not None:
            if has_bounty.lower() == 'true':
                queryset = queryset.filter(bounty_amount__gt=0)
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'list':
            return QuestionListSerializer
        elif self.action == 'create':
            return QuestionCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return QuestionUpdateSerializer
        return QuestionSerializer
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    def perform_update(self, serializer):
        # Only allow author to update
        if serializer.instance.author != self.request.user:
            raise permissions.PermissionDenied("You can only edit your own questions.")
        serializer.save()
    
    def perform_destroy(self, instance):
        # Only allow author to delete
        if instance.author != self.request.user:
            raise permissions.PermissionDenied("You can only delete your own questions.")
        instance.is_deleted = True
        instance.save()
    
    @action(detail=True, methods=['post'])
    def vote_up(self, request, pk=None):
        """Vote up a question."""
        question = self.get_object()
        if question.author == request.user:
            return Response({'error': 'You cannot vote on your own question'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Add voting logic here (you can implement a separate Vote model)
        question.increment_votes()
        return Response({'status': 'voted up', 'votes': question.votes})
    
    @action(detail=True, methods=['post'])
    def vote_down(self, request, pk=None):
        """Vote down a question."""
        question = self.get_object()
        if question.author == request.user:
            return Response({'error': 'You cannot vote on your own question'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Add voting logic here
        question.decrement_votes()
        return Response({'status': 'voted down', 'votes': question.votes})
    
    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """Close a question."""
        question = self.get_object()
        if question.author == request.user:
            question.close_question()
            return Response({'status': 'question closed'})
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=True, methods=['post'])
    def reopen(self, request, pk=None):
        """Reopen a question."""
        question = self.get_object()
        if question.author == request.user:
            question.reopen_question()
            return Response({'status': 'question reopened'})
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=True, methods=['post'])
    def feature(self, request, pk=None):
        """Feature a question (admin only)."""
        question = self.get_object()
        if request.user.is_staff:
            question.feature_question()
            return Response({'status': 'question featured'})
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=True, methods=['post'])
    def unfeature(self, request, pk=None):
        """Unfeature a question (admin only)."""
        question = self.get_object()
        if request.user.is_staff:
            question.unfeature_question()
            return Response({'status': 'question unfeatured'})
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get popular questions."""
        queryset = self.get_queryset().filter(Q(views__gt=100) | Q(votes__gt=10))
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def unanswered(self, request):
        """Get unanswered questions."""
        queryset = self.get_queryset().filter(is_answered=False)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured questions."""
        queryset = self.get_queryset().filter(is_featured=True)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def bounty(self, request):
        """Get questions with bounty."""
        queryset = self.get_queryset().filter(bounty_amount__gt=0)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def increment_views(self, request, pk=None):
        """Increment view count for a question."""
        question = self.get_object()
        question.increment_views()
        return Response({'status': 'view count incremented', 'views': question.views}) 