from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.common.models import BaseModel

User = get_user_model()


class Notification(BaseModel):
    """
    Notification model for user notifications.
    
    Inherits from BaseModel for common functionality like created_at, updated_at,
    is_active, and is_deleted fields.
    """
    
    NOTIFICATION_TYPES = [
        ('answer', 'New Answer'),
        ('vote', 'Vote'),
        ('accept', 'Answer Accepted'),
        ('comment', 'Comment'),
        ('mention', 'Mention'),
        ('bounty', 'Bounty'),
        ('moderation', 'Moderation'),
        ('system', 'System'),
    ]
    
    recipient = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='notifications',
        db_index=True,
        help_text="User receiving the notification"
    )
    sender = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='sent_notifications', 
        null=True, 
        blank=True,
        db_index=True,
        help_text="User who triggered the notification (if applicable)"
    )
    notification_type = models.CharField(
        max_length=20, 
        choices=NOTIFICATION_TYPES,
        db_index=True,
        help_text="Type of notification"
    )
    title = models.CharField(
        max_length=255,
        help_text="Notification title"
    )
    message = models.TextField(
        help_text="Notification message content"
    )
    related_question = models.ForeignKey(
        'questions.Question', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        db_index=True,
        help_text="Related question (if applicable)"
    )
    related_answer = models.ForeignKey(
        'answers.Answer', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        db_index=True,
        help_text="Related answer (if applicable)"
    )
    is_read = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Whether the notification has been read"
    )
    is_important = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Whether this is an important notification"
    )
    read_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the notification was read"
    )
    action_url = models.URLField(
        blank=True,
        help_text="URL to navigate to when notification is clicked"
    )
    
    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient']),
            models.Index(fields=['sender']),
            models.Index(fields=['notification_type']),
            models.Index(fields=['is_read']),
            models.Index(fields=['is_important']),
            models.Index(fields=['related_question']),
            models.Index(fields=['related_answer']),
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['recipient', 'notification_type']),
            models.Index(fields=['recipient', 'created_at']),
            models.Index(fields=['is_read', 'created_at']),
            models.Index(fields=['is_important', 'created_at']),
            models.Index(fields=['is_active', 'is_read']),
            models.Index(fields=['is_active', 'recipient']),
        ]
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
    
    def __str__(self):
        return f"{self.notification_type} - {self.recipient.username}"
    
    def mark_as_read(self):
        """Mark notification as read."""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at', 'updated_at'])
    
    def mark_as_unread(self):
        """Mark notification as unread."""
        self.is_read = False
        self.read_at = None
        self.save(update_fields=['is_read', 'read_at', 'updated_at'])
    
    def mark_as_important(self):
        """Mark notification as important."""
        self.is_important = True
        self.save(update_fields=['is_important', 'updated_at'])
    
    def mark_as_unimportant(self):
        """Remove important status from notification."""
        self.is_important = False
        self.save(update_fields=['is_important', 'updated_at'])
    
    @property
    def is_recent(self):
        """Check if notification is recent (within last 24 hours)."""
        return timezone.now() - self.created_at < timezone.timedelta(hours=24)
    
    @property
    def is_urgent(self):
        """Check if notification is urgent (important and unread)."""
        return self.is_important and not self.is_read
    
    @property
    def short_message(self):
        """Get a shortened version of the message."""
        return self.message[:100] + '...' if len(self.message) > 100 else self.message
    
    @classmethod
    def create_notification(cls, recipient, notification_type, title, message, **kwargs):
        """Create a new notification with proper defaults."""
        return cls.objects.create(
            recipient=recipient,
            notification_type=notification_type,
            title=title,
            message=message,
            **kwargs
        )
    
    @classmethod
    def get_unread_count(cls, user):
        """Get the count of unread notifications for a user."""
        return cls.objects.filter(
            recipient=user,
            is_read=False,
            is_active=True,
            is_deleted=False
        ).count()
    
    @classmethod
    def mark_all_as_read(cls, user):
        """Mark all notifications as read for a user."""
        cls.objects.filter(
            recipient=user,
            is_read=False,
            is_active=True,
            is_deleted=False
        ).update(
            is_read=True,
            read_at=timezone.now(),
            updated_at=timezone.now()
        ) 