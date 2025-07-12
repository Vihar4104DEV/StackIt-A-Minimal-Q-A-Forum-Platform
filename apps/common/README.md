# Common App - BaseModel Documentation

## Overview

The `common` app provides a `BaseModel` that all other models in the application inherit from. This ensures consistency across the application and provides common functionality for all models.

## BaseModel Features

### Core Fields

Every model inheriting from `BaseModel` automatically gets these fields:

- **`created_at`**: DateTimeField - Timestamp when the record was created
- **`updated_at`**: DateTimeField - Timestamp when the record was last updated  
- **`is_active`**: BooleanField - Whether this record is active
- **`is_deleted`**: BooleanField - Soft delete flag

### Database Optimization

- All fields are indexed for better query performance
- Composite indexes for common query patterns
- Proper ordering by `created_at` (newest first)

### Custom Managers

The BaseModel provides three custom managers:

1. **`objects`** - Default manager (returns all objects)
2. **`active_objects`** - Only returns active, non-deleted objects
3. **`deleted_objects`** - Only returns soft-deleted objects

## Usage Examples

### Basic Model Definition

```python
from apps.common.models import BaseModel

class MyModel(BaseModel):
    name = models.CharField(max_length=100)
    description = models.TextField()
    
    class Meta:
        db_table = 'my_model'
```

### Querying with Custom Managers

```python
# Get all objects (including inactive and deleted)
all_objects = MyModel.objects.all()

# Get only active, non-deleted objects
active_objects = MyModel.active_objects.all()

# Get only soft-deleted objects
deleted_objects = MyModel.deleted_objects.all()

# Get objects created in last 7 days
recent_objects = MyModel.objects.recent(days=7)

# Get objects updated recently
updated_objects = MyModel.objects.updated_recently(days=3)
```

### Soft Delete Operations

```python
# Soft delete an object
obj = MyModel.objects.get(id=1)
obj.soft_delete()  # Sets is_deleted=True, is_active=False

# Restore a soft-deleted object
obj.restore()  # Sets is_deleted=False, is_active=True

# Deactivate without deleting
obj.deactivate()  # Sets is_active=False

# Activate an inactive object
obj.activate()  # Sets is_active=True
```

### Bulk Operations

```python
# Bulk activate objects
MyModel.objects.bulk_activate([1, 2, 3])

# Bulk deactivate objects
MyModel.objects.bulk_deactivate([1, 2, 3])

# Bulk soft delete objects
MyModel.objects.bulk_soft_delete([1, 2, 3])

# Bulk restore objects
MyModel.objects.bulk_restore([1, 2, 3])
```

## Best Practices

### 1. Always Use Active Objects for Public Queries

```python
# Good - Only show active content to users
questions = Question.active_objects.filter(tags__name='python')

# Bad - Might show deleted content
questions = Question.objects.filter(tags__name='python')
```

### 2. Use Soft Delete Instead of Hard Delete

```python
# Good - Soft delete preserves data
question.soft_delete()

# Bad - Hard delete loses data permanently
question.delete()
```

### 3. Use Update Fields for Performance

```python
# Good - Only update specific fields
question.increment_views()  # Uses update_fields

# Bad - Updates all fields
question.views += 1
question.save()
```

### 4. Use Custom Manager Methods

```python
# Good - Use built-in manager methods
recent_questions = Question.objects.recent(days=30)

# Bad - Manual date filtering
from django.utils import timezone
from datetime import timedelta
recent_questions = Question.objects.filter(
    created_at__gte=timezone.now() - timedelta(days=30)
)
```

## Model Methods

### Instance Methods

- `soft_delete()` - Soft delete the record
- `restore()` - Restore a soft-deleted record
- `deactivate()` - Deactivate without deleting
- `activate()` - Activate an inactive record

### Class Methods

- `active_objects` - Queryset of active objects
- `deleted_objects` - Queryset of deleted objects
- `inactive_objects` - Queryset of inactive objects

## Database Indexes

The BaseModel automatically creates these indexes:

- `created_at` - For chronological queries
- `updated_at` - For modification tracking
- `is_active` - For active/inactive filtering
- `is_deleted` - For soft delete filtering
- `is_active, is_deleted` - Composite index for common queries

## Migration Strategy

When adding BaseModel to existing models:

1. Create a migration to add the new fields
2. Set default values for existing records
3. Add appropriate indexes
4. Update any existing queries to use the new managers

## Performance Considerations

- Use `active_objects` manager for public-facing queries
- Use `update_fields` parameter when saving to avoid unnecessary updates
- Consider adding model-specific indexes for frequently queried fields
- Use bulk operations for multiple records

## Common Patterns

### Filtering by Status

```python
# Get active questions by a user
user_questions = Question.active_objects.filter(author=user)

# Get deleted questions (admin only)
deleted_questions = Question.deleted_objects.all()

# Get all questions including inactive
all_questions = Question.objects.all()
```

### Time-based Queries

```python
# Get questions from last week
recent_questions = Question.objects.recent(days=7)

# Get questions updated today
updated_today = Question.objects.updated_recently(days=1)

# Get questions from specific date range
from datetime import datetime
questions = Question.objects.created_between(
    start_date=datetime(2024, 1, 1),
    end_date=datetime(2024, 12, 31)
)
```

### Related Object Counting

```python
# Get questions with answer counts
questions_with_counts = Question.objects.with_related_counts('answers')

# Get users with question and answer counts
users_with_counts = User.objects.with_related_counts('questions', 'answers')
```

This BaseModel provides a solid foundation for all models in the application, ensuring consistency, performance, and maintainability. 