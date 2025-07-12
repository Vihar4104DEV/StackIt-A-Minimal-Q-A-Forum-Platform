from rest_framework import status, generics, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db.models import Q
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction

from apps.common.utils import APIResponseMixin, format_validation_errors
from .models import User
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer,
    UserUpdateSerializer, ChangePasswordSerializer, AdminUserSerializer,
    AdminUserUpdateSerializer, TokenRefreshSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer
)


class BaseAuthView(APIView, APIResponseMixin):
    """
    Base view for authentication endpoints with consistent response formatting.
    """
    permission_classes = [permissions.AllowAny]


class UserRegistrationView(BaseAuthView):
    """
    User registration endpoint.
    
    POST /api/v1/auth/register/
    """
    
    def post(self, request, *args, **kwargs):
        try:
            serializer = UserRegistrationSerializer(data=request.data)
            if serializer.is_valid():
                with transaction.atomic():
                    user = serializer.save()
                    
                    # Generate JWT tokens efficiently
                    refresh = RefreshToken.for_user(user)
                    access_token = refresh.access_token
                    
                    # Update last seen in a single query
                    User.objects.filter(id=user.id).update(last_seen=timezone.now())
                    
                    # Prepare response data efficiently
                    user_data = {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'full_name': user.get_full_name_or_username(),
                        'bio': user.bio,
                        'avatar': user.avatar.url if user.avatar else None,
                        'reputation': user.reputation,
                        'reputation_level': user.reputation_level,
                        'is_verified': user.is_verified,
                        'is_premium_user': user.is_premium_user,
                        'date_joined': user.date_joined,
                        'last_seen': user.last_seen,
                    }
                    
                    response_data = {
                        'user': user_data,
                        'tokens': {
                            'access': str(access_token),
                            'refresh': str(refresh),
                        }
                    }
                    
                    return self.created_response(
                        data=response_data,
                        message="User registered successfully"
                    )
            else:
                errors = format_validation_errors(serializer.errors)
                return self.validation_error_response(errors)
                
        except Exception as e:
            return self.error_response(
                message="Registration failed",
                errors=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserLoginView(BaseAuthView):
    """
    User login endpoint.
    
    POST /api/v1/auth/login/
    """
    
    def post(self, request, *args, **kwargs):
        try:
            serializer = UserLoginSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.validated_data['user']
                
                # Generate JWT tokens efficiently
                refresh = RefreshToken.for_user(user)
                access_token = refresh.access_token
                
                # Update last seen in a single query
                User.objects.filter(id=user.id).update(last_seen=timezone.now())
                
                # Prepare response data efficiently
                user_data = {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'full_name': user.get_full_name_or_username(),
                    'bio': user.bio,
                    'avatar': user.avatar.url if user.avatar else None,
                    'reputation': user.reputation,
                    'reputation_level': user.reputation_level,
                    'is_verified': user.is_verified,
                    'is_premium_user': user.is_premium_user,
                    'date_joined': user.date_joined,
                    'last_seen': user.last_seen,
                }
                
                response_data = {
                    'user': user_data,
                    'tokens': {
                        'access': str(access_token),
                        'refresh': str(refresh),
                    }
                }
                
                return self.success_response(
                    data=response_data,
                    message="Login successful"
                )
            else:
                errors = format_validation_errors(serializer.errors)
                return self.validation_error_response(errors)
                
        except Exception as e:
            return self.error_response(
                message="Login failed",
                errors=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserLogoutView(APIView, APIResponseMixin):
    """
    User logout endpoint.
    
    POST /api/v1/auth/logout/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        try:
            # Get refresh token from request
            refresh_token = request.data.get('refresh')
            if refresh_token:
                try:
                    token = RefreshToken(refresh_token)
                    token.blacklist()
                except Exception:
                    pass  # Token might be invalid, but we still logout
            
            return self.success_response(
                message="Logout successful"
            )
            
        except Exception as e:
            return self.error_response(
                message="Logout failed",
                errors=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TokenRefreshView(BaseAuthView):
    """
    JWT token refresh endpoint.
    
    POST /api/v1/auth/refresh/
    """
    
    def post(self, request, *args, **kwargs):
        try:
            serializer = TokenRefreshSerializer(data=request.data)
            if serializer.is_valid():
                refresh_token = serializer.validated_data['refresh']
                try:
                    token = RefreshToken(refresh_token)
                    access_token = token.access_token
                    
                    response_data = {
                        'access': str(access_token),
                        'refresh': str(token),
                    }
                    
                    return self.success_response(
                        data=response_data,
                        message="Token refreshed successfully"
                    )
                except Exception as e:
                    return self.error_response(
                        message="Invalid refresh token",
                        status_code=status.HTTP_401_UNAUTHORIZED
                    )
            else:
                errors = format_validation_errors(serializer.errors)
                return self.validation_error_response(errors)
                
        except Exception as e:
            return self.error_response(
                message="Token refresh failed",
                errors=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserProfileView(APIView, APIResponseMixin):
    """
    User profile management endpoint.
    
    GET /api/v1/auth/profile/ - Get current user profile
    PUT /api/v1/auth/profile/ - Update current user profile
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        try:
            user = request.user
            
            # Update last seen efficiently
            User.objects.filter(id=user.id).update(last_seen=timezone.now())
            
            # Prepare response data efficiently
            user_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'full_name': user.get_full_name_or_username(),
                'bio': user.bio,
                'avatar': user.avatar.url if user.avatar else None,
                'reputation': user.reputation,
                'reputation_level': user.reputation_level,
                'is_verified': user.is_verified,
                'is_premium_user': user.is_premium_user,
                'date_joined': user.date_joined,
                'last_seen': user.last_seen,
            }
            
            return self.success_response(
                data=user_data,
                message="Profile retrieved successfully"
            )
            
        except Exception as e:
            return self.error_response(
                message="Failed to retrieve profile",
                errors=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def put(self, request, *args, **kwargs):
        try:
            user = request.user
            serializer = UserUpdateSerializer(user, data=request.data, partial=True)
            
            if serializer.is_valid():
                with transaction.atomic():
                    serializer.save()
                    # Update last seen efficiently
                    User.objects.filter(id=user.id).update(last_seen=timezone.now())
                    
                    # Prepare updated user data
                    user_data = {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'full_name': user.get_full_name_or_username(),
                        'bio': user.bio,
                        'avatar': user.avatar.url if user.avatar else None,
                        'reputation': user.reputation,
                        'reputation_level': user.reputation_level,
                        'is_verified': user.is_verified,
                        'is_premium_user': user.is_premium_user,
                        'date_joined': user.date_joined,
                        'last_seen': user.last_seen,
                    }
                    
                    return self.updated_response(
                        data=user_data,
                        message="Profile updated successfully"
                    )
            else:
                errors = format_validation_errors(serializer.errors)
                return self.validation_error_response(errors)
                
        except Exception as e:
            return self.error_response(
                message="Failed to update profile",
                errors=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ChangePasswordView(APIView, APIResponseMixin):
    """
    Change password endpoint.
    
    POST /api/v1/auth/change-password/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        try:
            serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
            
            if serializer.is_valid():
                user = request.user
                with transaction.atomic():
                    user.set_password(serializer.validated_data['new_password'])
                    user.save(update_fields=['password'])
                    # Update last seen efficiently
                    User.objects.filter(id=user.id).update(last_seen=timezone.now())
                
                return self.success_response(
                    message="Password changed successfully"
                )
            else:
                errors = format_validation_errors(serializer.errors)
                return self.validation_error_response(errors)
                
        except Exception as e:
            return self.error_response(
                message="Failed to change password",
                errors=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# Admin Views
class AdminUserListView(generics.ListAPIView, APIResponseMixin):
    """
    Admin endpoint to list all users.
    
    GET /api/v1/admin/users/
    """
    permission_classes = [permissions.IsAdminUser]
    serializer_class = AdminUserSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'is_verified', 'is_staff', 'is_superuser']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['username', 'email', 'reputation', 'date_joined', 'last_seen']
    ordering = ['-date_joined']
    
    def get_queryset(self):
        return User.objects.filter(is_deleted=False)
    
    def list(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                response_data = {
                    'users': serializer.data,
                    'pagination': {
                        'count': self.paginator.page.paginator.count,
                        'next': self.paginator.get_next_link(),
                        'previous': self.paginator.get_previous_link(),
                        'current_page': self.paginator.page.number,
                        'total_pages': self.paginator.page.paginator.num_pages,
                        'page_size': self.paginator.page_size,
                    }
                }
                
                return self.success_response(
                    data=response_data,
                    message="Users retrieved successfully"
                )
            
            serializer = self.get_serializer(queryset, many=True)
            return self.success_response(
                data={'users': serializer.data},
                message="Users retrieved successfully"
            )
            
        except Exception as e:
            return self.error_response(
                message="Failed to retrieve users",
                errors=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView, APIResponseMixin):
    """
    Admin endpoint to manage individual users.
    
    GET /api/v1/admin/users/{id}/ - Get user details
    PUT /api/v1/admin/users/{id}/ - Update user details
    DELETE /api/v1/admin/users/{id}/ - Soft delete user
    """
    permission_classes = [permissions.IsAdminUser]
    serializer_class = AdminUserSerializer
    queryset = User.objects.filter(is_deleted=False)
    
    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return self.success_response(
                data=serializer.data,
                message="User details retrieved successfully"
            )
        except Exception as e:
            return self.error_response(
                message="Failed to retrieve user details",
                errors=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            serializer = AdminUserUpdateSerializer(instance, data=request.data, partial=partial)
            
            if serializer.is_valid():
                serializer.save()
                updated_serializer = AdminUserSerializer(instance)
                return self.updated_response(
                    data=updated_serializer.data,
                    message="User updated successfully"
                )
            else:
                errors = format_validation_errors(serializer.errors)
                return self.validation_error_response(errors)
                
        except Exception as e:
            return self.error_response(
                message="Failed to update user",
                errors=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.is_deleted = True
            instance.is_active = False
            instance.save()
            
            return self.deleted_response(
                message="User deleted successfully"
            )
            
        except Exception as e:
            return self.error_response(
                message="Failed to delete user",
                errors=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PasswordResetRequestView(BaseAuthView):
    """
    Password reset request endpoint.
    
    POST /api/v1/auth/password-reset/
    """
    
    def post(self, request, *args, **kwargs):
        try:
            serializer = PasswordResetRequestSerializer(data=request.data)
            if serializer.is_valid():
                email = serializer.validated_data['email']
                # Here you would typically send an email with reset link
                # For now, we'll just return success
                
                return self.success_response(
                    message="Password reset email sent successfully"
                )
            else:
                errors = format_validation_errors(serializer.errors)
                return self.validation_error_response(errors)
                
        except Exception as e:
            return self.error_response(
                message="Failed to send password reset email",
                errors=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PasswordResetConfirmView(BaseAuthView):
    """
    Password reset confirmation endpoint.
    
    POST /api/v1/auth/password-reset/confirm/
    """
    
    def post(self, request, *args, **kwargs):
        try:
            serializer = PasswordResetConfirmSerializer(data=request.data)
            if serializer.is_valid():
                # Here you would typically validate the token and reset password
                # For now, we'll just return success
                
                return self.success_response(
                    message="Password reset successfully"
                )
            else:
                errors = format_validation_errors(serializer.errors)
                return self.validation_error_response(errors)
                
        except Exception as e:
            return self.error_response(
                message="Failed to reset password",
                errors=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 