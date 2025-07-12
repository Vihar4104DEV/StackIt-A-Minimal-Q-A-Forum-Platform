from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.exceptions import ValidationError
from django.db import transaction

from .utils import APIResponseMixin, format_validation_errors


class BaseModelViewSet(viewsets.ModelViewSet, APIResponseMixin):
    """
    Base ViewSet that provides consistent response formatting for all models.
    
    This ViewSet ensures that all responses follow the same structure:
    {
        "success": true/false,
        "message": "Response message",
        "data": {...},
        "status_code": 200
    }
    """
    
    def create(self, request, *args, **kwargs):
        """Create a new instance with consistent response formatting."""
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                with transaction.atomic():
                    instance = serializer.save()
                    response_serializer = self.get_serializer(instance)
                    return self.created_response(
                        data=response_serializer.data,
                        message=f"{self.get_model_name()} created successfully"
                    )
            else:
                errors = format_validation_errors(serializer.errors)
                return self.validation_error_response(errors)
        except ValidationError as e:
            return self.validation_error_response(str(e))
        except Exception as e:
            return self.error_response(
                message=f"Failed to create {self.get_model_name()}",
                errors=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def list(self, request, *args, **kwargs):
        """List instances with consistent response formatting."""
        try:
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                response_data = {
                    'items': serializer.data,
                    'pagination': {
                        'count': self.paginator.page.paginator.count,
                        'next': self.paginator.get_next_link(),
                        'previous': self.paginator.get_previous_link(),
                        'current_page': self.paginator.page.number,
                        'total_pages': self.paginator.page.paginator.num_pages,
                        'page_size': self.paginator.page_size,
                    }
                }
                return self.success_response(
                    data=response_data,
                    message=f"{self.get_model_name_plural()} retrieved successfully"
                )
            
            serializer = self.get_serializer(queryset, many=True)
            return self.success_response(
                data={'items': serializer.data},
                message=f"{self.get_model_name_plural()} retrieved successfully"
            )
        except Exception as e:
            return self.error_response(
                message=f"Failed to retrieve {self.get_model_name_plural()}",
                errors=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve a single instance with consistent response formatting."""
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return self.success_response(
                data=serializer.data,
                message=f"{self.get_model_name()} retrieved successfully"
            )
        except Exception as e:
            return self.error_response(
                message=f"Failed to retrieve {self.get_model_name()}",
                errors=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def update(self, request, *args, **kwargs):
        """Update an instance with consistent response formatting."""
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            
            if serializer.is_valid():
                with transaction.atomic():
                    serializer.save()
                    return self.updated_response(
                        data=serializer.data,
                        message=f"{self.get_model_name()} updated successfully"
                    )
            else:
                errors = format_validation_errors(serializer.errors)
                return self.validation_error_response(errors)
        except ValidationError as e:
            return self.validation_error_response(str(e))
        except Exception as e:
            return self.error_response(
                message=f"Failed to update {self.get_model_name()}",
                errors=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def destroy(self, request, *args, **kwargs):
        """Delete an instance with consistent response formatting."""
        try:
            instance = self.get_object()
            
            # Check if model supports soft delete
            if hasattr(instance, 'is_deleted'):
                instance.is_deleted = True
                if hasattr(instance, 'is_active'):
                    instance.is_active = False
                instance.save()
            else:
                instance.delete()
            
            return self.deleted_response(
                message=f"{self.get_model_name()} deleted successfully"
            )
        except Exception as e:
            return self.error_response(
                message=f"Failed to delete {self.get_model_name()}",
                errors=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get_model_name(self):
        """Get the singular model name for response messages."""
        return self.queryset.model._meta.verbose_name.title()
    
    def get_model_name_plural(self):
        """Get the plural model name for response messages."""
        return self.queryset.model._meta.verbose_name_plural.title()


class BaseReadOnlyModelViewSet(viewsets.ReadOnlyModelViewSet, APIResponseMixin):
    """
    Base read-only ViewSet for models that should not be modified via API.
    """
    
    def list(self, request, *args, **kwargs):
        """List instances with consistent response formatting."""
        try:
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                response_data = {
                    'items': serializer.data,
                    'pagination': {
                        'count': self.paginator.page.paginator.count,
                        'next': self.paginator.get_next_link(),
                        'previous': self.paginator.get_previous_link(),
                        'current_page': self.paginator.page.number,
                        'total_pages': self.paginator.page.paginator.num_pages,
                        'page_size': self.paginator.page_size,
                    }
                }
                return self.success_response(
                    data=response_data,
                    message=f"{self.get_model_name_plural()} retrieved successfully"
                )
            
            serializer = self.get_serializer(queryset, many=True)
            return self.success_response(
                data={'items': serializer.data},
                message=f"{self.get_model_name_plural()} retrieved successfully"
            )
        except Exception as e:
            return self.error_response(
                message=f"Failed to retrieve {self.get_model_name_plural()}",
                errors=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve a single instance with consistent response formatting."""
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return self.success_response(
                data=serializer.data,
                message=f"{self.get_model_name()} retrieved successfully"
            )
        except Exception as e:
            return self.error_response(
                message=f"Failed to retrieve {self.get_model_name()}",
                errors=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get_model_name(self):
        """Get the singular model name for response messages."""
        return self.queryset.model._meta.verbose_name.title()
    
    def get_model_name_plural(self):
        """Get the plural model name for response messages."""
        return self.queryset.model._meta.verbose_name_plural.title()


class BaseAPIView(APIResponseMixin):
    """
    Base API view that provides consistent response formatting.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def handle_exception(self, exc):
        """Handle exceptions with consistent error response formatting."""
        if isinstance(exc, ValidationError):
            return self.validation_error_response(str(exc))
        elif isinstance(exc, PermissionError):
            return self.permission_denied_response(str(exc))
        else:
            return self.error_response(
                message="An error occurred",
                errors=str(exc),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 