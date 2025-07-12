from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.common.models import BaseModel

User = get_user_model()


class Question(BaseModel):
    """
    Question model for Q&A platform.
    
    Inherits from BaseModel for common functionality like created_at, updated_at,
    is_active, and is_deleted fields.
    """
    
    title = models.CharField(
        max_length=300,
        db_index=True,
        help_text="Question title"
    )
    content = models.TextField(
        help_text="Question content/body"
    )
    author = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='questions',
        db_index=True,
        help_text="User who asked the question"
    )
    tags = models.ManyToManyField(
        'tags.Tag', 
        related_name='questions', 
        blank=True,
        help_text="Tags associated with the question"
    )
    views = models.PositiveIntegerField(
        default=0,
        db_index=True,
        help_text="Number of views for this question"
    )
    votes = models.IntegerField(
        default=0,
        db_index=True,
        help_text="Net vote count (upvotes - downvotes)"
    )
    is_answered = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Whether the question has an accepted answer"
    )
    is_closed = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Whether the question is closed for new answers"
    )
    is_featured = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Whether this is a featured question"
    )
    bounty_amount = models.PositiveIntegerField(
        default=0,
        help_text="Bounty amount for the question"
    )
    bounty_expires_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the bounty expires"
    )
    
    class Meta:
        db_table = 'questions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['title']),
            models.Index(fields=['author']),
            models.Index(fields=['views']),
            models.Index(fields=['votes']),
            models.Index(fields=['is_answered']),
            models.Index(fields=['is_closed']),
            models.Index(fields=['is_featured']),
            models.Index(fields=['bounty_amount']),
            models.Index(fields=['author', 'created_at']),
            models.Index(fields=['votes', 'created_at']),
            models.Index(fields=['views', 'created_at']),
            models.Index(fields=['is_answered', 'created_at']),
            models.Index(fields=['is_active', 'is_answered']),
            models.Index(fields=['is_active', 'is_closed']),
        ]
        verbose_name = 'Question'
        verbose_name_plural = 'Questions'
    
    def __str__(self):
        return self.title
    
    def get_answers_count(self):
        """Get the number of answers for this question."""
        return self.answers.filter(is_active=True, is_deleted=False).count()
    
    def get_votes_count(self):
        """Get the total number of votes for this question."""
        # Since we don't have a separate Vote model, we'll use the votes field
        # This represents the net vote count (upvotes - downvotes)
        return abs(self.votes)
    
    def increment_views(self):
        """Increment the view count."""
        self.views += 1
        self.save(update_fields=['views', 'updated_at'])
    
    def increment_votes(self, amount=1):
        """Increment the vote count."""
        self.votes += amount
        self.save(update_fields=['votes', 'updated_at'])
    
    def decrement_votes(self, amount=1):
        """Decrement the vote count."""
        self.votes -= amount
        self.save(update_fields=['votes', 'updated_at'])
    
    def mark_as_answered(self):
        """Mark the question as answered."""
        self.is_answered = True
        self.save(update_fields=['is_answered', 'updated_at'])
    
    def mark_as_unanswered(self):
        """Mark the question as unanswered."""
        self.is_answered = False
        self.save(update_fields=['is_answered', 'updated_at'])
    
    def close_question(self):
        """Close the question for new answers."""
        self.is_closed = True
        self.save(update_fields=['is_closed', 'updated_at'])
    
    def reopen_question(self):
        """Reopen the question for new answers."""
        self.is_closed = False
        self.save(update_fields=['is_closed', 'updated_at'])
    
    def feature_question(self):
        """Mark the question as featured."""
        self.is_featured = True
        self.save(update_fields=['is_featured', 'updated_at'])
    
    def unfeature_question(self):
        """Remove featured status from the question."""
        self.is_featured = False
        self.save(update_fields=['is_featured', 'updated_at'])
    
    @property
    def has_bounty(self):
        """Check if the question has an active bounty."""
        if self.bounty_amount > 0 and self.bounty_expires_at:
            return timezone.now() < self.bounty_expires_at
        return False
    
    @property
    def is_popular(self):
        """Check if the question is popular based on views and votes."""
        return self.views > 100 or self.votes > 10
    
    @property
    def short_title(self):
        """Get a shortened version of the title."""
        return self.title[:50] + '...' if len(self.title) > 50 else self.title 