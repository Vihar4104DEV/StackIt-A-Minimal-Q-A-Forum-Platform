# Generated manually to add BaseModel fields to existing models

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
        ('questions', '0002_initial'),
        ('answers', '0002_initial'),
        ('tags', '0001_initial'),
        ('notifications', '0002_initial'),
    ]

    operations = [
        # Add BaseModel fields to User model
        migrations.AddField(
            model_name='user',
            name='created_at',
            field=models.DateTimeField(default=django.utils.timezone.now, db_index=True, help_text='Timestamp when the record was created'),
        ),
        migrations.AddField(
            model_name='user',
            name='updated_at',
            field=models.DateTimeField(auto_now=True, db_index=True, help_text='Timestamp when the record was last updated'),
        ),
        migrations.AddField(
            model_name='user',
            name='is_active',
            field=models.BooleanField(default=True, db_index=True, help_text='Whether this record is active'),
        ),
        migrations.AddField(
            model_name='user',
            name='is_deleted',
            field=models.BooleanField(default=False, db_index=True, help_text='Soft delete flag - record is marked as deleted but not removed from database'),
        ),
        
        # Add BaseModel fields to Question model
        migrations.AddField(
            model_name='question',
            name='created_at',
            field=models.DateTimeField(default=django.utils.timezone.now, db_index=True, help_text='Timestamp when the record was created'),
        ),
        migrations.AddField(
            model_name='question',
            name='updated_at',
            field=models.DateTimeField(auto_now=True, db_index=True, help_text='Timestamp when the record was last updated'),
        ),
        migrations.AddField(
            model_name='question',
            name='is_active',
            field=models.BooleanField(default=True, db_index=True, help_text='Whether this record is active'),
        ),
        migrations.AddField(
            model_name='question',
            name='is_deleted',
            field=models.BooleanField(default=False, db_index=True, help_text='Soft delete flag - record is marked as deleted but not removed from database'),
        ),
        
        # Add BaseModel fields to Answer model
        migrations.AddField(
            model_name='answer',
            name='created_at',
            field=models.DateTimeField(default=django.utils.timezone.now, db_index=True, help_text='Timestamp when the record was created'),
        ),
        migrations.AddField(
            model_name='answer',
            name='updated_at',
            field=models.DateTimeField(auto_now=True, db_index=True, help_text='Timestamp when the record was last updated'),
        ),
        migrations.AddField(
            model_name='answer',
            name='is_active',
            field=models.BooleanField(default=True, db_index=True, help_text='Whether this record is active'),
        ),
        migrations.AddField(
            model_name='answer',
            name='is_deleted',
            field=models.BooleanField(default=False, db_index=True, help_text='Soft delete flag - record is marked as deleted but not removed from database'),
        ),
        
        # Add BaseModel fields to Tag model
        migrations.AddField(
            model_name='tag',
            name='created_at',
            field=models.DateTimeField(default=django.utils.timezone.now, db_index=True, help_text='Timestamp when the record was created'),
        ),
        migrations.AddField(
            model_name='tag',
            name='updated_at',
            field=models.DateTimeField(auto_now=True, db_index=True, help_text='Timestamp when the record was last updated'),
        ),
        migrations.AddField(
            model_name='tag',
            name='is_active',
            field=models.BooleanField(default=True, db_index=True, help_text='Whether this record is active'),
        ),
        migrations.AddField(
            model_name='tag',
            name='is_deleted',
            field=models.BooleanField(default=False, db_index=True, help_text='Soft delete flag - record is marked as deleted but not removed from database'),
        ),
        
        # Add BaseModel fields to Notification model
        migrations.AddField(
            model_name='notification',
            name='created_at',
            field=models.DateTimeField(default=django.utils.timezone.now, db_index=True, help_text='Timestamp when the record was created'),
        ),
        migrations.AddField(
            model_name='notification',
            name='updated_at',
            field=models.DateTimeField(auto_now=True, db_index=True, help_text='Timestamp when the record was last updated'),
        ),
        migrations.AddField(
            model_name='notification',
            name='is_active',
            field=models.BooleanField(default=True, db_index=True, help_text='Whether this record is active'),
        ),
        migrations.AddField(
            model_name='notification',
            name='is_deleted',
            field=models.BooleanField(default=False, db_index=True, help_text='Soft delete flag - record is marked as deleted but not removed from database'),
        ),
        
        # Add indexes for better performance
        migrations.AddIndex(
            model_name='user',
            index=models.Index(fields=['created_at'], name='users_created_at_idx'),
        ),
        migrations.AddIndex(
            model_name='user',
            index=models.Index(fields=['updated_at'], name='users_updated_at_idx'),
        ),
        migrations.AddIndex(
            model_name='user',
            index=models.Index(fields=['is_active'], name='users_is_active_idx'),
        ),
        migrations.AddIndex(
            model_name='user',
            index=models.Index(fields=['is_deleted'], name='users_is_deleted_idx'),
        ),
        migrations.AddIndex(
            model_name='user',
            index=models.Index(fields=['is_active', 'is_deleted'], name='users_active_deleted_idx'),
        ),
        
        migrations.AddIndex(
            model_name='question',
            index=models.Index(fields=['created_at'], name='questions_created_at_idx'),
        ),
        migrations.AddIndex(
            model_name='question',
            index=models.Index(fields=['updated_at'], name='questions_updated_at_idx'),
        ),
        migrations.AddIndex(
            model_name='question',
            index=models.Index(fields=['is_active'], name='questions_is_active_idx'),
        ),
        migrations.AddIndex(
            model_name='question',
            index=models.Index(fields=['is_deleted'], name='questions_is_deleted_idx'),
        ),
        migrations.AddIndex(
            model_name='question',
            index=models.Index(fields=['is_active', 'is_deleted'], name='questions_active_deleted_idx'),
        ),
        
        migrations.AddIndex(
            model_name='answer',
            index=models.Index(fields=['created_at'], name='answers_created_at_idx'),
        ),
        migrations.AddIndex(
            model_name='answer',
            index=models.Index(fields=['updated_at'], name='answers_updated_at_idx'),
        ),
        migrations.AddIndex(
            model_name='answer',
            index=models.Index(fields=['is_active'], name='answers_is_active_idx'),
        ),
        migrations.AddIndex(
            model_name='answer',
            index=models.Index(fields=['is_deleted'], name='answers_is_deleted_idx'),
        ),
        migrations.AddIndex(
            model_name='answer',
            index=models.Index(fields=['is_active', 'is_deleted'], name='answers_active_deleted_idx'),
        ),
        
        migrations.AddIndex(
            model_name='tag',
            index=models.Index(fields=['created_at'], name='tags_created_at_idx'),
        ),
        migrations.AddIndex(
            model_name='tag',
            index=models.Index(fields=['updated_at'], name='tags_updated_at_idx'),
        ),
        migrations.AddIndex(
            model_name='tag',
            index=models.Index(fields=['is_active'], name='tags_is_active_idx'),
        ),
        migrations.AddIndex(
            model_name='tag',
            index=models.Index(fields=['is_deleted'], name='tags_is_deleted_idx'),
        ),
        migrations.AddIndex(
            model_name='tag',
            index=models.Index(fields=['is_active', 'is_deleted'], name='tags_active_deleted_idx'),
        ),
        
        migrations.AddIndex(
            model_name='notification',
            index=models.Index(fields=['created_at'], name='notifications_created_at_idx'),
        ),
        migrations.AddIndex(
            model_name='notification',
            index=models.Index(fields=['updated_at'], name='notifications_updated_at_idx'),
        ),
        migrations.AddIndex(
            model_name='notification',
            index=models.Index(fields=['is_active'], name='notifications_is_active_idx'),
        ),
        migrations.AddIndex(
            model_name='notification',
            index=models.Index(fields=['is_deleted'], name='notifications_is_deleted_idx'),
        ),
        migrations.AddIndex(
            model_name='notification',
            index=models.Index(fields=['is_active', 'is_deleted'], name='notifications_active_deleted_idx'),
        ),
    ] 