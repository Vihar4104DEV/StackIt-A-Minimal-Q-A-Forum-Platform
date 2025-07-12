from django.db import models
from django.utils import timezone
from apps.common.models import BaseModel


class Tag(BaseModel):
    """
    Tag model for categorizing questions.
    
    Inherits from BaseModel for common functionality like created_at, updated_at,
    is_active, and is_deleted fields.
    """
    
    name = models.CharField(
        max_length=50, 
        unique=True,
        db_index=True,
        help_text="Tag name (must be unique)"
    )
    description = models.TextField(
        blank=True,
        help_text="Tag description"
    )
    color = models.CharField(
        max_length=7, 
        default='#007bff',
        help_text="Hex color code for the tag"
    )
    usage_count = models.PositiveIntegerField(
        default=0,
        db_index=True,
        help_text="Number of questions using this tag"
    )
    is_featured = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Whether this is a featured tag"
    )
    is_moderated = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Whether this tag requires moderation"
    )
    synonym_of = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="If this tag is a synonym of another tag"
    )
    
    class Meta:
        db_table = 'tags'
        ordering = ['-usage_count', 'name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['usage_count']),
            models.Index(fields=['is_featured']),
            models.Index(fields=['is_moderated']),
            models.Index(fields=['synonym_of']),
            models.Index(fields=['usage_count', 'name']),
            models.Index(fields=['is_active', 'usage_count']),
            models.Index(fields=['is_active', 'is_featured']),
        ]
        verbose_name = 'Tag'
        verbose_name_plural = 'Tags'
    
    def __str__(self):
        return self.name
    
    def get_questions_count(self):
        """Get the number of active questions using this tag."""
        return self.questions.filter(is_active=True, is_deleted=False).count()
    
    def increment_usage(self):
        """Increment the usage count of this tag."""
        self.usage_count += 1
        self.save(update_fields=['usage_count', 'updated_at'])
    
    def decrement_usage(self):
        """Decrement the usage count of this tag."""
        if self.usage_count > 0:
            self.usage_count -= 1
            self.save(update_fields=['usage_count', 'updated_at'])
    
    def feature_tag(self):
        """Mark the tag as featured."""
        self.is_featured = True
        self.save(update_fields=['is_featured', 'updated_at'])
    
    def unfeature_tag(self):
        """Remove featured status from the tag."""
        self.is_featured = False
        self.save(update_fields=['is_featured', 'updated_at'])
    
    def moderate_tag(self):
        """Mark the tag as requiring moderation."""
        self.is_moderated = True
        self.save(update_fields=['is_moderated', 'updated_at'])
    
    def unmoderate_tag(self):
        """Remove moderation requirement from the tag."""
        self.is_moderated = False
        self.save(update_fields=['is_moderated', 'updated_at'])
    
    @property
    def is_popular(self):
        """Check if this tag is popular based on usage count."""
        return self.usage_count >= 10
    
    @property
    def is_trending(self):
        """Check if this tag is trending (high recent usage)."""
        # This could be enhanced with time-based logic
        return self.usage_count >= 5
    
    @property
    def display_name(self):
        """Get the display name, handling synonyms."""
        if self.synonym_of:
            return f"{self.name} (synonym of {self.synonym_of.name})"
        return self.name
    
    def get_related_tags(self, limit=5):
        """Get related tags based on co-occurrence."""
        from apps.questions.models import Question
        related_tags = Tag.objects.filter(
            questions__in=self.questions.filter(is_active=True, is_deleted=False),
            is_active=True,
            is_deleted=False
        ).exclude(id=self.id).annotate(
            co_occurrence=models.Count('questions')
        ).order_by('-co_occurrence')[:limit]
        return related_tags
    
    def clean(self):
        """Validate the tag data."""
        from django.core.exceptions import ValidationError
        
        # Ensure name is lowercase and contains only valid characters
        if self.name:
            self.name = self.name.lower().strip()
            if not self.name.replace('-', '').replace('_', '').isalnum():
                raise ValidationError("Tag name can only contain letters, numbers, hyphens, and underscores.")
        
        # Ensure color is a valid hex color
        if self.color and not self.color.startswith('#') or len(self.color) != 7:
            raise ValidationError("Color must be a valid hex color code (e.g., #007bff).")
    
    def save(self, *args, **kwargs):
        """Override save to clean the data."""
        self.clean()
        super().save(*args, **kwargs) 