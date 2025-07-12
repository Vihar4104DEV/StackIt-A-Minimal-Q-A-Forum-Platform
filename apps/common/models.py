from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from .managers import BaseModelManager, ActiveModelManager, DeletedModelManager


class BaseModel(models.Model):
    """
    Abstract base model providing common fields and functionality.
    
    This model includes:
    - created_at: Timestamp when the record was created
    - updated_at: Timestamp when the record was last updated
    - is_active: Boolean flag to mark active/inactive records
    - is_deleted: Boolean flag for soft delete functionality
    
    All models should inherit from this base model for consistency.
    """
    
    created_at = models.DateTimeField(
        default=timezone.now,
        db_index=True,
        help_text="Timestamp when the record was created"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        db_index=True,
        help_text="Timestamp when the record was last updated"
    )
    is_active = models.BooleanField(
        default=True,
        db_index=True,
        help_text="Whether this record is active"
    )
    is_deleted = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Soft delete flag - record is marked as deleted but not removed from database"
    )
    
    objects = BaseModelManager()
    active_objects = ActiveModelManager()
    deleted_objects = DeletedModelManager()
    
    class Meta:
        abstract = True
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['updated_at']),
            models.Index(fields=['is_active']),
            models.Index(fields=['is_deleted']),
            models.Index(fields=['is_active', 'is_deleted']),
        ]
    
    def save(self, *args, **kwargs):
        """Override save to ensure updated_at is set correctly."""
        if not self.pk:  # New instance
            self.created_at = timezone.now()
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)
    
    def soft_delete(self):
        """Soft delete the record by setting is_deleted=True and is_active=False."""
        self.is_deleted = True
        self.is_active = False
        self.save(update_fields=['is_deleted', 'is_active', 'updated_at'])
    
    def restore(self):
        """Restore a soft-deleted record."""
        self.is_deleted = False
        self.is_active = True
        self.save(update_fields=['is_deleted', 'is_active', 'updated_at'])
    
    def deactivate(self):
        """Deactivate the record without deleting it."""
        self.is_active = False
        self.save(update_fields=['is_active', 'updated_at'])
    
    def activate(self):
        """Activate the record."""
        self.is_active = True
        self.save(update_fields=['is_active', 'updated_at'])
    
    @classmethod
    def active_objects(cls):
        """Return a queryset of active, non-deleted objects."""
        return cls.objects.filter(is_active=True, is_deleted=False)
    
    @classmethod
    def deleted_objects(cls):
        """Return a queryset of soft-deleted objects."""
        return cls.objects.filter(is_deleted=True)
    
    @classmethod
    def inactive_objects(cls):
        """Return a queryset of inactive objects."""
        return cls.objects.filter(is_active=False) 