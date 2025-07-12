from django.contrib import admin
from .models import Question


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    """Admin configuration for Question model."""
    
    list_display = ['title', 'author', 'votes', 'views', 'is_answered', 'is_closed', 'created_at']
    list_filter = ['is_answered', 'is_closed', 'created_at', 'tags']
    search_fields = ['title', 'content', 'author__username']
    readonly_fields = ['views', 'votes', 'created_at', 'updated_at']
    filter_horizontal = ['tags']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Question Details', {
            'fields': ('title', 'content', 'author', 'tags')
        }),
        ('Status', {
            'fields': ('is_answered', 'is_closed', 'views', 'votes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    ) 