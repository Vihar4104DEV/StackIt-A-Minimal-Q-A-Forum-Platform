from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.common.models import BaseModel

User = get_user_model()


class Answer(BaseModel):
    """
    Answer model for Q&A platform.
    
    Inherits from BaseModel for common functionality like created_at, updated_at,
    is_active, and is_deleted fields.
    """
    
    content = models.TextField(
        help_text="Answer content/body"
    )
    question = models.ForeignKey(
        'questions.Question', 
        on_delete=models.CASCADE, 
        related_name='answers',
        db_index=True,
        help_text="Question this answer belongs to"
    )
    author = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='answers',
        db_index=True,
        help_text="User who provided the answer"
    )
    is_accepted = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Whether this answer is accepted as the best answer"
    )
    votes = models.IntegerField(
        default=0,
        db_index=True,
        help_text="Net vote count (upvotes - downvotes)"
    )
    is_edited = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Whether this answer has been edited"
    )
    edit_count = models.PositiveIntegerField(
        default=0,
        help_text="Number of times this answer has been edited"
    )
    last_edited_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When this answer was last edited"
    )
    
    class Meta:
        db_table = 'answers'
        ordering = ['-is_accepted', '-votes', '-created_at']
        indexes = [
            models.Index(fields=['question']),
            models.Index(fields=['author']),
            models.Index(fields=['is_accepted']),
            models.Index(fields=['votes']),
            models.Index(fields=['is_edited']),
            models.Index(fields=['question', 'is_accepted']),
            models.Index(fields=['question', 'votes']),
            models.Index(fields=['author', 'created_at']),
            models.Index(fields=['votes', 'created_at']),
            models.Index(fields=['is_active', 'is_accepted']),
            models.Index(fields=['is_active', 'question']),
        ]
        verbose_name = 'Answer'
        verbose_name_plural = 'Answers'
    
    def __str__(self):
        return f"Answer to: {self.question.title[:50]}"
    
    def get_votes_count(self):
        """Get the total number of votes for this answer."""
        # Since we don't have a separate Vote model, we'll use the votes field
        # This represents the net vote count (upvotes - downvotes)
        return abs(self.votes)
    
    def accept(self):
        """Accept this answer as the best answer."""
        # Unaccept all other answers for this question
        self.question.answers.filter(is_active=True, is_deleted=False).update(
            is_accepted=False,
            updated_at=timezone.now()
        )
        # Accept this answer
        self.is_accepted = True
        self.save(update_fields=['is_accepted', 'updated_at'])
        # Mark question as answered
        self.question.mark_as_answered()
    
    def unaccept(self):
        """Unaccept this answer."""
        self.is_accepted = False
        self.save(update_fields=['is_accepted', 'updated_at'])
        # Mark question as unanswered if no other accepted answers
        if not self.question.answers.filter(is_active=True, is_deleted=False, is_accepted=True).exists():
            self.question.mark_as_unanswered()
    
    def increment_votes(self, amount=1):
        """Increment the vote count."""
        self.votes += amount
        self.save(update_fields=['votes', 'updated_at'])
    
    def decrement_votes(self, amount=1):
        """Decrement the vote count."""
        self.votes -= amount
        self.save(update_fields=['votes', 'updated_at'])
    
    def mark_as_edited(self):
        """Mark the answer as edited and update edit count."""
        self.is_edited = True
        self.edit_count += 1
        self.last_edited_at = timezone.now()
        self.save(update_fields=['is_edited', 'edit_count', 'last_edited_at', 'updated_at'])
    
    @property
    def is_best_answer(self):
        """Check if this is the best answer for the question."""
        return self.is_accepted and self.question.is_answered
    
    @property
    def short_content(self):
        """Get a shortened version of the content."""
        return self.content[:100] + '...' if len(self.content) > 100 else self.content
    
    @property
    def is_highly_voted(self):
        """Check if this answer is highly voted."""
        return self.votes >= 10
    
    def get_author_reputation_bonus(self):
        """Get reputation bonus for the author if this is a good answer."""
        if self.votes >= 5 and self.is_accepted:
            return 15
        elif self.votes >= 5:
            return 10
        elif self.is_accepted:
            return 15
        return 0 