from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Tag
from .serializers import TagSerializer, TagCreateSerializer, TagUpdateSerializer


class TagViewSet(viewsets.ModelViewSet):
    """ViewSet for Tag model."""
    
    queryset = Tag.objects.filter(is_active=True, is_deleted=False)
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TagCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return TagUpdateSerializer
        return TagSerializer
    
    def perform_create(self, serializer):
        serializer.save()
    
    def perform_update(self, serializer):
        # Only allow admin to update tags
        if not self.request.user.is_staff:
            raise permissions.PermissionDenied("Only administrators can edit tags.")
        serializer.save()
    
    def perform_destroy(self, instance):
        # Only allow admin to delete tags
        if not self.request.user.is_staff:
            raise permissions.PermissionDenied("Only administrators can delete tags.")
        instance.is_deleted = True
        instance.save() 