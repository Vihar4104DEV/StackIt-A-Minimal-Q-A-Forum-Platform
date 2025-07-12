from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
import re


def validate_tag_name(value):
    """
    Validate tag name format.
    Tags should be alphanumeric with hyphens and underscores allowed.
    """
    if not re.match(r'^[a-zA-Z0-9_-]+$', value):
        raise ValidationError(
            _('Tag names can only contain letters, numbers, hyphens, and underscores.')
        )
    
    if len(value) < 2:
        raise ValidationError(
            _('Tag names must be at least 2 characters long.')
        )
    
    if len(value) > 50:
        raise ValidationError(
            _('Tag names cannot exceed 50 characters.')
        )


def validate_question_title(value):
    """
    Validate question title format.
    """
    if len(value) < 10:
        raise ValidationError(
            _('Question titles must be at least 10 characters long.')
        )
    
    if len(value) > 300:
        raise ValidationError(
            _('Question titles cannot exceed 300 characters.')
        )


def validate_content_length(value):
    """
    Validate content length for questions and answers.
    """
    if len(value) < 20:
        raise ValidationError(
            _('Content must be at least 20 characters long.')
        )
    
    if len(value) > 10000:
        raise ValidationError(
            _('Content cannot exceed 10,000 characters.')
        )


def validate_hex_color(value):
    """
    Validate hex color format.
    """
    if not re.match(r'^#[0-9A-Fa-f]{6}$', value):
        raise ValidationError(
            _('Color must be a valid hex color code (e.g., #FF0000).')
        ) 