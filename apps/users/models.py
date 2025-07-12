from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from apps.common.models import BaseModel


class User(AbstractUser, BaseModel):
    """
    Custom User model extending Django's AbstractUser with additional fields.
    
    Inherits from BaseModel for common functionality like created_at, updated_at,
    is_active, and is_deleted fields.
    """
    
    bio = models.TextField(
        max_length=500, 
        blank=True,
        help_text="User's biography or description"
    )
    avatar = models.ImageField(
        upload_to='avatars/',
        null=True,
        blank=True,
        help_text="User's profile picture"
    )
    reputation = models.IntegerField(
        default=0,
        db_index=True,
        help_text="User's reputation score based on contributions"
    )
    is_verified = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Whether the user account is verified"
    )
    date_joined = models.DateTimeField(
        default=timezone.now,
        db_index=True,
        help_text="When the user joined the platform"
    )
    last_seen = models.DateTimeField(
        auto_now=True,
        db_index=True,
        help_text="Last time the user was active"
    )
    
    class Meta:
        db_table = 'users'
        ordering = ['-date_joined']
        indexes = [
            models.Index(fields=['username']),
            models.Index(fields=['email']),
            models.Index(fields=['reputation']),
            models.Index(fields=['is_verified']),
            models.Index(fields=['date_joined']),
            models.Index(fields=['last_seen']),
            models.Index(fields=['is_active', 'is_verified']),
            models.Index(fields=['reputation', 'is_active']),
        ]
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return self.username
    
    def get_full_name_or_username(self):
        """Return full name if available, otherwise username."""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.username
    
    def increment_reputation(self, points=1):
        """Increment user's reputation by given points."""
        self.reputation += points
        self.save(update_fields=['reputation', 'updated_at'])
    
    def decrement_reputation(self, points=1):
        """Decrement user's reputation by given points."""
        self.reputation = max(0, self.reputation - points)
        self.save(update_fields=['reputation', 'updated_at'])
    
    def update_last_seen(self):
        """Update the last_seen timestamp."""
        self.last_seen = timezone.now()
        self.save(update_fields=['last_seen'])
    
    @property
    def is_premium_user(self):
        """Check if user has premium status based on reputation."""
        return self.reputation >= 1000
    
    @property
    def reputation_level(self):
        """Get user's reputation level."""
        if self.reputation >= 10000:
            return 'Expert'
        elif self.reputation >= 5000:
            return 'Advanced'
        elif self.reputation >= 1000:
            return 'Intermediate'
        elif self.reputation >= 100:
            return 'Beginner'
        else:
            return 'New' 