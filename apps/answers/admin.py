from django.contrib import admin
from .models import Answer


@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    """Admin configuration for Answer model."""
    
    list_display = ['content', 'question', 'author', 'is_accepted', 'votes', 'created_at']
    list_filter = ['is_accepted', 'created_at']
    search_fields = ['content', 'question__title', 'author__username']
    readonly_fields = ['votes', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Answer Details', {
            'fields': ('content', 'question', 'author')
        }),
        ('Status', {
            'fields': ('is_accepted', 'votes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    ) 