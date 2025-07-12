"""
Django management command to migrate existing data to use BaseModel fields.
"""

from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from django.apps import apps
from django.db import transaction
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Migrate existing data to use BaseModel fields'

    def add_arguments(self, parser):
        parser.add_argument(
            '--app',
            type=str,
            help='Specific app to migrate (e.g., questions, answers)',
        )
        parser.add_argument(
            '--model',
            type=str,
            help='Specific model to migrate (e.g., Question, Answer)',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be done without making changes',
        )

    def handle(self, *args, **options):
        app_name = options.get('app')
        model_name = options.get('model')
        dry_run = options.get('dry_run')

        if dry_run:
            self.stdout.write(
                self.style.WARNING('DRY RUN MODE - No changes will be made')
            )

        try:
            with transaction.atomic():
                if app_name and model_name:
                    # Migrate specific model
                    self.migrate_specific_model(app_name, model_name, dry_run)
                elif app_name:
                    # Migrate all models in specific app
                    self.migrate_app_models(app_name, dry_run)
                else:
                    # Migrate all models
                    self.migrate_all_models(dry_run)

                if dry_run:
                    transaction.set_rollback(True)
                    self.stdout.write(
                        self.style.SUCCESS('Dry run completed successfully')
                    )
                else:
                    self.stdout.write(
                        self.style.SUCCESS('Migration completed successfully')
                    )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Migration failed: {str(e)}')
            )
            raise CommandError(f'Migration failed: {str(e)}')

    def migrate_all_models(self, dry_run=False):
        """Migrate all models that inherit from BaseModel."""
        self.stdout.write('Migrating all models...')
        
        # List of apps to migrate
        apps_to_migrate = ['users', 'questions', 'answers', 'tags', 'notifications']
        
        for app_name in apps_to_migrate:
            self.migrate_app_models(app_name, dry_run)

    def migrate_app_models(self, app_name, dry_run=False):
        """Migrate all models in a specific app."""
        try:
            app_config = apps.get_app_config(app_name)
            self.stdout.write(f'Migrating models in app: {app_name}')
            
            for model in app_config.get_models():
                if hasattr(model, 'is_active'):  # Check if model has BaseModel fields
                    self.migrate_model(model, dry_run)
                    
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error migrating app {app_name}: {str(e)}')
            )

    def migrate_specific_model(self, app_name, model_name, dry_run=False):
        """Migrate a specific model."""
        try:
            model = apps.get_model(app_name, model_name)
            self.migrate_model(model, dry_run)
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error migrating model {app_name}.{model_name}: {str(e)}')
            )

    def migrate_model(self, model, dry_run=False):
        """Migrate a specific model to ensure BaseModel fields are properly set."""
        model_name = f'{model._meta.app_label}.{model._meta.model_name}'
        self.stdout.write(f'  Migrating model: {model_name}')
        
        # Get all records that don't have proper BaseModel fields set
        queryset = model.objects.all()
        
        # Check for records without created_at
        records_without_created = queryset.filter(created_at__isnull=True)
        if records_without_created.exists():
            count = records_without_created.count()
            self.stdout.write(f'    Found {count} records without created_at')
            
            if not dry_run:
                now = timezone.now()
                records_without_created.update(created_at=now)
                self.stdout.write(f'    Updated {count} records with created_at')

        # Check for records without updated_at
        records_without_updated = queryset.filter(updated_at__isnull=True)
        if records_without_updated.exists():
            count = records_without_updated.count()
            self.stdout.write(f'    Found {count} records without updated_at')
            
            if not dry_run:
                now = timezone.now()
                records_without_updated.update(updated_at=now)
                self.stdout.write(f'    Updated {count} records with updated_at')

        # Check for records without is_active
        records_without_active = queryset.filter(is_active__isnull=True)
        if records_without_active.exists():
            count = records_without_active.count()
            self.stdout.write(f'    Found {count} records without is_active')
            
            if not dry_run:
                records_without_active.update(is_active=True)
                self.stdout.write(f'    Updated {count} records with is_active=True')

        # Check for records without is_deleted
        records_without_deleted = queryset.filter(is_deleted__isnull=True)
        if records_without_deleted.exists():
            count = records_without_deleted.count()
            self.stdout.write(f'    Found {count} records without is_deleted')
            
            if not dry_run:
                records_without_deleted.update(is_deleted=False)
                self.stdout.write(f'    Updated {count} records with is_deleted=False')

        # Show statistics
        total_records = queryset.count()
        active_records = queryset.filter(is_active=True, is_deleted=False).count()
        inactive_records = queryset.filter(is_active=False).count()
        deleted_records = queryset.filter(is_deleted=True).count()
        
        self.stdout.write(f'    Total records: {total_records}')
        self.stdout.write(f'    Active records: {active_records}')
        self.stdout.write(f'    Inactive records: {inactive_records}')
        self.stdout.write(f'    Deleted records: {deleted_records}')
        
        if not dry_run:
            logger.info(f'Migrated {model_name}: {total_records} total records') 