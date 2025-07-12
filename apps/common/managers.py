from django.db import models
from django.utils import timezone


class BaseModelManager(models.Manager):
    """
    Custom manager for BaseModel providing enhanced querying capabilities.
    
    This manager provides methods to filter by active/deleted status and
    other common operations.
    """
    
    def get_queryset(self):
        """Return queryset with default ordering."""
        return super().get_queryset()
    
    def active(self):
        """Return only active, non-deleted objects."""
        return self.get_queryset().filter(is_active=True, is_deleted=False)
    
    def inactive(self):
        """Return only inactive objects."""
        return self.get_queryset().filter(is_active=False)
    
    def deleted(self):
        """Return only soft-deleted objects."""
        return self.get_queryset().filter(is_deleted=True)
    
    def recent(self, days=7):
        """Return objects created in the last N days."""
        cutoff_date = timezone.now() - timezone.timedelta(days=days)
        return self.get_queryset().filter(created_at__gte=cutoff_date)
    
    def updated_recently(self, days=7):
        """Return objects updated in the last N days."""
        cutoff_date = timezone.now() - timezone.timedelta(days=days)
        return self.get_queryset().filter(updated_at__gte=cutoff_date)
    
    def created_between(self, start_date, end_date):
        """Return objects created between two dates."""
        return self.get_queryset().filter(
            created_at__gte=start_date,
            created_at__lte=end_date
        )
    
    def updated_between(self, start_date, end_date):
        """Return objects updated between two dates."""
        return self.get_queryset().filter(
            updated_at__gte=start_date,
            updated_at__lte=end_date
        )
    
    def with_related_counts(self, *related_fields):
        """Annotate queryset with related object counts."""
        queryset = self.get_queryset()
        for field in related_fields:
            queryset = queryset.annotate(
                **{f'{field}_count': models.Count(field)}
            )
        return queryset
    
    def bulk_activate(self, ids):
        """Bulk activate objects by IDs."""
        return self.get_queryset().filter(id__in=ids).update(
            is_active=True,
            updated_at=timezone.now()
        )
    
    def bulk_deactivate(self, ids):
        """Bulk deactivate objects by IDs."""
        return self.get_queryset().filter(id__in=ids).update(
            is_active=False,
            updated_at=timezone.now()
        )
    
    def bulk_soft_delete(self, ids):
        """Bulk soft delete objects by IDs."""
        return self.get_queryset().filter(id__in=ids).update(
            is_deleted=True,
            is_active=False,
            updated_at=timezone.now()
        )
    
    def bulk_restore(self, ids):
        """Bulk restore soft-deleted objects by IDs."""
        return self.get_queryset().filter(id__in=ids).update(
            is_deleted=False,
            is_active=True,
            updated_at=timezone.now()
        )


class ActiveModelManager(BaseModelManager):
    """
    Manager that only returns active, non-deleted objects by default.
    """
    
    def get_queryset(self):
        """Return only active, non-deleted objects by default."""
        return super().get_queryset().filter(is_active=True, is_deleted=False)


class DeletedModelManager(BaseModelManager):
    """
    Manager that only returns soft-deleted objects by default.
    """
    
    def get_queryset(self):
        """Return only soft-deleted objects by default."""
        return super().get_queryset().filter(is_deleted=True) 