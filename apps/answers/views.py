from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Answer
from .serializers import (
    AnswerSerializer, 
    AnswerCreateSerializer, 
    AnswerUpdateSerializer,
    AnswerListSerializer
)


class AnswerViewSet(viewsets.ModelViewSet):
    """ViewSet for Answer model."""
    
    queryset = Answer.objects.filter(is_active=True, is_deleted=False)
    serializer_class = AnswerSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['question', 'author', 'is_accepted']
    ordering_fields = ['created_at', 'updated_at', 'votes']
    ordering = ['-is_accepted', '-votes', '-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return AnswerListSerializer
        elif self.action == 'create':
            return AnswerCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return AnswerUpdateSerializer
        return AnswerSerializer
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    def perform_update(self, serializer):
        # Only allow author to update
        if serializer.instance.author != self.request.user:
            raise permissions.PermissionDenied("You can only edit your own answers.")
        serializer.save()
    
    def perform_destroy(self, instance):
        # Only allow author to delete
        if instance.author != self.request.user:
            raise permissions.PermissionDenied("You can only delete your own answers.")
        instance.is_deleted = True
        instance.save()
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Accept an answer."""
        answer = self.get_object()
        if answer.question.author == request.user:
            answer.accept()
            return Response({'status': 'answer accepted'})
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=True, methods=['post'])
    def unaccept(self, request, pk=None):
        """Unaccept an answer."""
        answer = self.get_object()
        if answer.question.author == request.user:
            answer.unaccept()
            return Response({'status': 'answer unaccepted'})
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=True, methods=['post'])
    def vote_up(self, request, pk=None):
        """Vote up an answer."""
        answer = self.get_object()
        if answer.author == request.user:
            return Response({'error': 'You cannot vote on your own answer'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Add voting logic here (you can implement a separate Vote model)
        answer.increment_votes()
        return Response({'status': 'voted up', 'votes': answer.votes})
    
    @action(detail=True, methods=['post'])
    def vote_down(self, request, pk=None):
        """Vote down an answer."""
        answer = self.get_object()
        if answer.author == request.user:
            return Response({'error': 'You cannot vote on your own answer'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Add voting logic here
        answer.decrement_votes()
        return Response({'status': 'voted down', 'votes': answer.votes})
    
    @action(detail=False, methods=['get'])
    def accepted(self, request):
        """Get accepted answers."""
        queryset = self.get_queryset().filter(is_accepted=True)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def highly_voted(self, request):
        """Get highly voted answers."""
        queryset = self.get_queryset().filter(votes__gte=10)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data) 