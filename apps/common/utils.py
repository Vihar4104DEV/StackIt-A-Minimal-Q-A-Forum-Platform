"""
Utility functions for common operations across the application.
"""

from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from typing import List, Optional, Any, Dict
import logging

from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import exception_handler
from django.core.exceptions import ValidationError
from django.http import Http404
from rest_framework.exceptions import APIException, PermissionDenied, NotAuthenticated

logger = logging.getLogger(__name__)


class APIResponseMixin:
    """
    Mixin to provide consistent API response structure across all views.
    """
    
    def success_response(self, data=None, message="Success", status_code=status.HTTP_200_OK, **kwargs):
        """
        Generate a consistent success response.
        
        Args:
            data: Response data
            message: Success message
            status_code: HTTP status code
            **kwargs: Additional fields to include in response
        """
        response_data = {
            "success": True,
            "message": message,
            "data": data,
            "status_code": status_code,
        }
        response_data.update(kwargs)
        return Response(response_data, status=status_code)
    
    def error_response(self, message="Error occurred", errors=None, status_code=status.HTTP_400_BAD_REQUEST, **kwargs):
        """
        Generate a consistent error response.
        
        Args:
            message: Error message
            errors: Detailed error information
            status_code: HTTP status code
            **kwargs: Additional fields to include in response
        """
        response_data = {
            "success": False,
            "message": message,
            "errors": errors,
            "status_code": status_code,
        }
        response_data.update(kwargs)
        return Response(response_data, status=status_code)
    
    def created_response(self, data=None, message="Resource created successfully"):
        """Generate a response for successful resource creation."""
        return self.success_response(data, message, status.HTTP_201_CREATED)
    
    def updated_response(self, data=None, message="Resource updated successfully"):
        """Generate a response for successful resource update."""
        return self.success_response(data, message, status.HTTP_200_OK)
    
    def deleted_response(self, message="Resource deleted successfully"):
        """Generate a response for successful resource deletion."""
        return self.success_response(None, message, status.HTTP_204_NO_CONTENT)
    
    def not_found_response(self, message="Resource not found"):
        """Generate a response for resource not found."""
        return self.error_response(message, status_code=status.HTTP_404_NOT_FOUND)
    
    def validation_error_response(self, errors, message="Validation error"):
        """Generate a response for validation errors."""
        return self.error_response(message, errors, status.HTTP_400_BAD_REQUEST)
    
    def permission_denied_response(self, message="Permission denied"):
        """Generate a response for permission denied."""
        return self.error_response(message, status_code=status.HTTP_403_FORBIDDEN)
    
    def unauthorized_response(self, message="Authentication required"):
        """Generate a response for unauthorized access."""
        return self.error_response(message, status_code=status.HTTP_401_UNAUTHORIZED)


def custom_exception_handler(exc, context):
    """
    Custom exception handler to provide consistent error responses.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    if response is not None:
        # Customize the error response structure
        error_data = {
            "success": False,
            "message": response.data.get('detail', 'An error occurred'),
            "errors": response.data if isinstance(response.data, dict) else None,
            "status_code": response.status_code,
        }
        
        # Handle specific error types
        if isinstance(exc, ValidationError):
            error_data["message"] = "Validation error"
            error_data["errors"] = exc.message_dict if hasattr(exc, 'message_dict') else str(exc)
        elif isinstance(exc, Http404):
            error_data["message"] = "Resource not found"
        elif isinstance(exc, PermissionDenied):
            error_data["message"] = "Permission denied"
        elif isinstance(exc, NotAuthenticated):
            error_data["message"] = "Authentication required"
        
        response.data = error_data
        return response
    
    # Handle unexpected exceptions
    logger.error(f"Unexpected error: {exc}", exc_info=True)
    
    return Response({
        "success": False,
        "message": "Internal server error",
        "errors": None,
        "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def format_validation_errors(serializer_errors):
    """
    Format serializer validation errors into a consistent structure.
    """
    formatted_errors = {}
    
    for field, errors in serializer_errors.items():
        if isinstance(errors, list):
            formatted_errors[field] = errors[0] if errors else "Invalid value"
        else:
            formatted_errors[field] = str(errors)
    
    return formatted_errors


def get_paginated_response(paginator, data, request):
    """
    Generate a consistent paginated response.
    """
    page = paginator.paginate_queryset(data, request)
    if page is not None:
        serializer = paginator.get_serializer(page, many=True)
        return {
            "success": True,
            "message": "Data retrieved successfully",
            "data": serializer.data,
            "pagination": {
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "current_page": paginator.page.number,
                "total_pages": paginator.page.paginator.num_pages,
                "page_size": paginator.page_size,
            },
            "status_code": 200,
        }
    return None


def bulk_soft_delete(model_class, ids: List[int]) -> int:
    """
    Bulk soft delete objects by their IDs.
    
    Args:
        model_class: The model class to operate on
        ids: List of object IDs to soft delete
        
    Returns:
        Number of objects successfully soft deleted
    """
    try:
        count = model_class.objects.filter(id__in=ids).update(
            is_deleted=True,
            is_active=False,
            updated_at=timezone.now()
        )
        logger.info(f"Soft deleted {count} {model_class.__name__} objects")
        return count
    except Exception as e:
        logger.error(f"Error bulk soft deleting {model_class.__name__}: {e}")
        raise


def bulk_restore(model_class, ids: List[int]) -> int:
    """
    Bulk restore soft-deleted objects by their IDs.
    
    Args:
        model_class: The model class to operate on
        ids: List of object IDs to restore
        
    Returns:
        Number of objects successfully restored
    """
    try:
        count = model_class.objects.filter(id__in=ids, is_deleted=True).update(
            is_deleted=False,
            is_active=True,
            updated_at=timezone.now()
        )
        logger.info(f"Restored {count} {model_class.__name__} objects")
        return count
    except Exception as e:
        logger.error(f"Error bulk restoring {model_class.__name__}: {e}")
        raise


def bulk_activate(model_class, ids: List[int]) -> int:
    """
    Bulk activate objects by their IDs.
    
    Args:
        model_class: The model class to operate on
        ids: List of object IDs to activate
        
    Returns:
        Number of objects successfully activated
    """
    try:
        count = model_class.objects.filter(id__in=ids).update(
            is_active=True,
            updated_at=timezone.now()
        )
        logger.info(f"Activated {count} {model_class.__name__} objects")
        return count
    except Exception as e:
        logger.error(f"Error bulk activating {model_class.__name__}: {e}")
        raise


def bulk_deactivate(model_class, ids: List[int]) -> int:
    """
    Bulk deactivate objects by their IDs.
    
    Args:
        model_class: The model class to operate on
        ids: List of object IDs to deactivate
        
    Returns:
        Number of objects successfully deactivated
    """
    try:
        count = model_class.objects.filter(id__in=ids).update(
            is_active=False,
            updated_at=timezone.now()
        )
        logger.info(f"Deactivated {count} {model_class.__name__} objects")
        return count
    except Exception as e:
        logger.error(f"Error bulk deactivating {model_class.__name__}: {e}")
        raise


def get_model_stats(model_class) -> Dict[str, int]:
    """
    Get statistics for a model including counts of active, inactive, and deleted objects.
    
    Args:
        model_class: The model class to get stats for
        
    Returns:
        Dictionary with counts for different object states
    """
    try:
        stats = {
            'total': model_class.objects.count(),
            'active': model_class.active_objects.count(),
            'inactive': model_class.inactive_objects.count(),
            'deleted': model_class.deleted_objects.count(),
        }
        return stats
    except Exception as e:
        logger.error(f"Error getting stats for {model_class.__name__}: {e}")
        return {}


def cleanup_old_deleted_records(model_class, days: int = 90) -> int:
    """
    Permanently delete old soft-deleted records.
    
    Args:
        model_class: The model class to clean up
        days: Number of days after which to permanently delete soft-deleted records
        
    Returns:
        Number of records permanently deleted
    """
    try:
        cutoff_date = timezone.now() - timezone.timedelta(days=days)
        old_deleted = model_class.deleted_objects.filter(updated_at__lt=cutoff_date)
        count = old_deleted.count()
        old_deleted.delete()
        logger.info(f"Permanently deleted {count} old {model_class.__name__} records")
        return count
    except Exception as e:
        logger.error(f"Error cleaning up old {model_class.__name__} records: {e}")
        raise


def validate_model_data(model_class, data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate data for a model before creating/updating.
    
    Args:
        model_class: The model class to validate for
        data: Dictionary of field data to validate
        
    Returns:
        Cleaned and validated data dictionary
        
    Raises:
        ValidationError: If data is invalid
    """
    try:
        # Create a temporary instance for validation
        instance = model_class(**data)
        instance.full_clean()
        return data
    except ValidationError as e:
        logger.error(f"Validation error for {model_class.__name__}: {e}")
        raise


def get_recent_activity(model_class, days: int = 7, limit: int = 10):
    """
    Get recent activity for a model.
    
    Args:
        model_class: The model class to get activity for
        days: Number of days to look back
        limit: Maximum number of records to return
        
    Returns:
        QuerySet of recent records
    """
    try:
        cutoff_date = timezone.now() - timezone.timedelta(days=days)
        return model_class.active_objects.filter(
            created_at__gte=cutoff_date
        ).order_by('-created_at')[:limit]
    except Exception as e:
        logger.error(f"Error getting recent activity for {model_class.__name__}: {e}")
        return model_class.active_objects.none()


def export_model_data(model_class, include_deleted: bool = False) -> List[Dict[str, Any]]:
    """
    Export model data to a list of dictionaries.
    
    Args:
        model_class: The model class to export
        include_deleted: Whether to include soft-deleted records
        
    Returns:
        List of dictionaries containing model data
    """
    try:
        queryset = model_class.objects.all()
        if not include_deleted:
            queryset = model_class.active_objects.all()
        
        data = []
        for obj in queryset:
            obj_data = {}
            for field in obj._meta.fields:
                value = getattr(obj, field.name)
                if hasattr(value, 'isoformat'):  # Handle datetime fields
                    value = value.isoformat()
                obj_data[field.name] = value
            data.append(obj_data)
        
        logger.info(f"Exported {len(data)} {model_class.__name__} records")
        return data
    except Exception as e:
        logger.error(f"Error exporting {model_class.__name__} data: {e}")
        raise


def import_model_data(model_class, data: List[Dict[str, Any]], 
                     update_existing: bool = False) -> Dict[str, int]:
    """
    Import model data from a list of dictionaries.
    
    Args:
        model_class: The model class to import into
        data: List of dictionaries containing model data
        update_existing: Whether to update existing records
        
    Returns:
        Dictionary with counts of created and updated records
    """
    try:
        created_count = 0
        updated_count = 0
        
        for item_data in data:
            # Remove id field for new records
            obj_id = item_data.pop('id', None)
            
            if obj_id and update_existing:
                # Update existing record
                try:
                    obj = model_class.objects.get(id=obj_id)
                    for field, value in item_data.items():
                        setattr(obj, field, value)
                    obj.save()
                    updated_count += 1
                except model_class.DoesNotExist:
                    # Create new record if not found
                    model_class.objects.create(**item_data)
                    created_count += 1
            else:
                # Create new record
                model_class.objects.create(**item_data)
                created_count += 1
        
        logger.info(f"Imported {created_count} new and {updated_count} updated {model_class.__name__} records")
        return {
            'created': created_count,
            'updated': updated_count
        }
    except Exception as e:
        logger.error(f"Error importing {model_class.__name__} data: {e}")
        raise


def get_model_changes(model_class, days: int = 30) -> Dict[str, int]:
    """
    Get statistics about model changes over a period.
    
    Args:
        model_class: The model class to analyze
        days: Number of days to analyze
        
    Returns:
        Dictionary with change statistics
    """
    try:
        cutoff_date = timezone.now() - timezone.timedelta(days=days)
        
        created = model_class.objects.filter(created_at__gte=cutoff_date).count()
        updated = model_class.objects.filter(
            updated_at__gte=cutoff_date,
            created_at__lt=cutoff_date
        ).count()
        deleted = model_class.deleted_objects.filter(updated_at__gte=cutoff_date).count()
        
        return {
            'created': created,
            'updated': updated,
            'deleted': deleted,
            'total_changes': created + updated + deleted
        }
    except Exception as e:
        logger.error(f"Error getting changes for {model_class.__name__}: {e}")
        return {}


def optimize_model_queries(model_class, queryset):
    """
    Apply common optimizations to a queryset.
    
    Args:
        model_class: The model class
        queryset: The queryset to optimize
        
    Returns:
        Optimized queryset
    """
    try:
        # Add select_related for foreign keys
        select_related_fields = []
        for field in model_class._meta.fields:
            if isinstance(field, models.ForeignKey):
                select_related_fields.append(field.name)
        
        if select_related_fields:
            queryset = queryset.select_related(*select_related_fields)
        
        # Add prefetch_related for many-to-many and reverse foreign keys
        prefetch_related_fields = []
        for field in model_class._meta.get_fields():
            if (isinstance(field, models.ManyToManyField) or 
                (hasattr(field, 'related_name') and field.related_name)):
                prefetch_related_fields.append(field.name)
        
        if prefetch_related_fields:
            queryset = queryset.prefetch_related(*prefetch_related_fields)
        
        return queryset
    except Exception as e:
        logger.error(f"Error optimizing queries for {model_class.__name__}: {e}")
        return queryset 