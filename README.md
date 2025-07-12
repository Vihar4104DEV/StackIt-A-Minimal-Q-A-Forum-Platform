# StackIt Backend API

A robust Django REST API backend for a Q&A platform similar to Stack Overflow. Built with Django 5.2, Django REST Framework, and JWT authentication.

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization**: JWT-based authentication with refresh tokens
- **Q&A Platform**: Questions, answers, voting, and reputation system
- **Tag System**: Categorize questions with tags
- **User Profiles**: Customizable user profiles with reputation tracking
- **Admin Panel**: Comprehensive admin interface for content moderation
- **Soft Delete**: Safe deletion with data recovery capabilities
- **Rate Limiting**: API rate limiting for security
- **CORS Support**: Cross-origin resource sharing for frontend integration

### Technical Features
- **RESTful API**: Clean, consistent API design
- **Database Optimization**: Proper indexing and query optimization
- **Custom User Model**: Extended user model with reputation system
- **Base Model**: Common fields and functionality for all models
- **Middleware**: Request logging, API response formatting, rate limiting
- **Environment Configuration**: Support for different environments

## 📋 Prerequisites

- Python 3.8+
- pip (Python package manager)
- Virtual environment (recommended)
- PostgreSQL (for production) or SQLite (for development)

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd stackit_backend
```

### 2. Create Virtual Environment
```bash
# Windows
python -m venv odoo_venv
odo_venv\Scripts\activate

# macOS/Linux
python3 -m venv odoo_venv
source odoo_venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Environment Configuration
Create a `.env` file in the root directory:
```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (for PostgreSQL)
POSTGRES_DB=stackit_db
POSTGRES_USER=stackit_user
POSTGRES_PASSWORD=stackit_pass
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# JWT Settings
JWT_ACCESS_TOKEN_LIFETIME=1
JWT_REFRESH_TOKEN_LIFETIME=7
```

### 5. Database Setup
```bash
# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser
```

### 6. Run Development Server
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/v1/`

## 📁 Project Structure

```
stackit_backend/
├── apps/                          # Django applications
│   ├── users/                     # User management & authentication
│   ├── questions/                 # Question management
│   ├── answers/                   # Answer management
│   ├── tags/                      # Tag system
│   ├── notifications/             # Notification system
│   └── common/                    # Shared utilities & base models
├── stackit/                       # Django project settings
│   ├── settings.py               # Main settings file
│   ├── urls.py                   # Main URL configuration
│   └── wsgi.py                   # WSGI configuration
├── media/                         # User uploaded files
├── static/                        # Static files
├── requirements.txt               # Python dependencies
├── manage.py                      # Django management script
└── test_api.py                   # API testing script
```

## 🔧 API Endpoints

### Authentication Endpoints
- `POST /api/v1/auth/register/` - User registration
- `POST /api/v1/auth/login/` - User login
- `POST /api/v1/auth/logout/` - User logout
- `POST /api/v1/auth/refresh/` - Refresh JWT token
- `GET /api/v1/auth/profile/` - Get user profile
- `PUT /api/v1/auth/profile/` - Update user profile
- `POST /api/v1/auth/change-password/` - Change password
- `POST /api/v1/auth/password-reset/` - Request password reset
- `POST /api/v1/auth/password-reset/confirm/` - Confirm password reset

### Questions Endpoints
- `GET /api/v1/questions/` - List questions
- `POST /api/v1/questions/` - Create question
- `GET /api/v1/questions/{id}/` - Get question details
- `PUT /api/v1/questions/{id}/` - Update question
- `DELETE /api/v1/questions/{id}/` - Delete question

### Answers Endpoints
- `GET /api/v1/answers/` - List answers
- `POST /api/v1/answers/` - Create answer
- `GET /api/v1/answers/{id}/` - Get answer details
- `PUT /api/v1/answers/{id}/` - Update answer
- `DELETE /api/v1/answers/{id}/` - Delete answer

### Tags Endpoints
- `GET /api/v1/tags/` - List tags
- `POST /api/v1/tags/` - Create tag
- `GET /api/v1/tags/{id}/` - Get tag details

### Admin Endpoints
- `GET /api/v1/admin/users/` - List all users (admin only)
- `GET /api/v1/admin/users/{id}/` - Get user details (admin only)

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Login** to get access and refresh tokens
2. **Include** the access token in the Authorization header:
   ```
   Authorization: Bearer <access_token>
   ```
3. **Refresh** the access token using the refresh token when it expires

### Example Authentication Flow
```bash
# 1. Register a new user
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123",
    "password_confirm": "testpass123"
  }'

# 2. Login to get tokens
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass123"
  }'

# 3. Use the access token for authenticated requests
curl -X GET http://localhost:8000/api/v1/auth/profile/ \
  -H "Authorization: Bearer <access_token>"
```

## 🧪 Testing

### Run API Tests
```bash
# Test the API endpoints
python test_api.py
```

### Run Django Tests
```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test apps.users
python manage.py test apps.questions
```

## 🗄️ Database Models

### User Model
- Custom user model extending Django's AbstractUser
- Reputation system with points tracking
- Profile fields: bio, avatar, verification status
- Activity tracking with last_seen timestamp

### Question Model
- Title, content, author, tags
- View count, vote count, bounty system
- Status flags: answered, closed, featured
- Soft delete support

### Answer Model
- Content, question reference, author
- Vote count, acceptance status
- Edit tracking with timestamps
- Soft delete support

### Base Model
- Common fields: created_at, updated_at, is_active, is_deleted
- Soft delete functionality
- Custom managers for filtering

## 🔧 Configuration

### Development Settings
- SQLite database
- Debug mode enabled
- CORS enabled for frontend development
- Detailed error messages

### Production Settings
- PostgreSQL database
- Debug mode disabled
- CORS configured for specific domains
- Static file serving
- Security headers

## 🚀 Deployment

### Using Docker (Recommended)
```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
RUN python manage.py collectstatic --noinput
RUN python manage.py migrate

EXPOSE 8000
CMD ["gunicorn", "stackit.wsgi:application", "--bind", "0.0.0.0:8000"]
```

### Manual Deployment
1. Set up production database (PostgreSQL)
2. Configure environment variables
3. Run migrations
4. Collect static files
5. Set up web server (nginx + gunicorn)

## 📊 Performance Optimization

- Database indexing on frequently queried fields
- Query optimization with select_related and prefetch_related
- Pagination for large datasets
- Rate limiting to prevent abuse
- Caching strategies (Redis recommended for production)

## 🔒 Security Features

- JWT token authentication
- Password validation and hashing
- CORS protection
- Rate limiting
- Input validation and sanitization
- Soft delete for data recovery

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the test examples in `test_api.py`

## 🔄 API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field_name": ["Error details"]
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## 📈 Future Enhancements

- Real-time notifications with WebSockets
- Advanced search functionality
- File upload support
- Email notifications
- Social authentication
- API versioning
- Comprehensive API documentation with Swagger/OpenAPI 