from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import transaction
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """
    Basic user serializer for use in other models.
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'avatar', 'reputation']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration with password confirmation.
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
   
    email = serializers.EmailField(required=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'password', 'bio', 'avatar'
        ]
        read_only_fields = ['id']
    
    def validate_email(self, value):
        """Validate email uniqueness."""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate_username(self, value):
        """Validate username uniqueness."""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value
    

    def create(self, validated_data):
        """Create user with validated data."""
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    """
    username = serializers.CharField(required=True)
    password = serializers.CharField(
        required=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """Validate user credentials."""
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            # Use select_related to optimize database queries
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError("Invalid credentials.")
            if not user.is_active:
                raise serializers.ValidationError("User account is disabled.")
            attrs['user'] = user
        else:
            raise serializers.ValidationError("Must include username and password.")
        
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile display and update.
    """
    full_name = serializers.SerializerMethodField()
    reputation_level = serializers.SerializerMethodField()
    is_premium_user = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'bio', 'avatar', 'reputation', 'reputation_level',
            'is_verified', 'is_premium_user', 'date_joined', 'last_seen'
        ]
        read_only_fields = ['id', 'username', 'email', 'reputation', 
                           'is_verified', 'date_joined', 'last_seen']
    
    def get_full_name(self, obj):
        return obj.get_full_name_or_username()
    
    def get_reputation_level(self, obj):
        return obj.reputation_level
    
    def get_is_premium_user(self, obj):
        return obj.is_premium_user


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user profile (limited fields).
    """
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'bio', 'avatar']
    
    def validate_avatar(self, value):
        """Validate avatar file size and type."""
        if value:
            if value.size > 5 * 1024 * 1024:  # 5MB limit
                raise serializers.ValidationError("Avatar file size must be less than 5MB.")
            
            allowed_types = ['image/jpeg', 'image/png', 'image/gif']
            if value.content_type not in allowed_types:
                raise serializers.ValidationError("Only JPEG, PNG, and GIF images are allowed.")
        
        return value


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for changing user password.
    """
    old_password = serializers.CharField(
        required=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        required=True,
        style={'input_type': 'password'}
    )
    
    def validate_old_password(self, value):
        """Validate old password."""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value
    
    def validate(self, attrs):
        """Validate new password confirmation."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords do not match.")
        return attrs


class AdminUserSerializer(serializers.ModelSerializer):
    """
    Serializer for admin user management (includes sensitive fields).
    """
    full_name = serializers.SerializerMethodField()
    reputation_level = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'bio', 'avatar', 'reputation', 'reputation_level',
            'is_verified', 'is_active', 'is_staff', 'is_superuser',
            'date_joined', 'last_seen', 'is_deleted'
        ]
    
    def get_full_name(self, obj):
        return obj.get_full_name_or_username()
    
    def get_reputation_level(self, obj):
        return obj.reputation_level


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for admin to update user details.
    """
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'bio', 'avatar', 'reputation',
            'is_verified', 'is_active', 'is_staff', 'is_superuser'
        ]


class TokenRefreshSerializer(serializers.Serializer):
    """
    Serializer for refreshing JWT tokens.
    """
    refresh = serializers.CharField(required=True)


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Serializer for password reset request.
    """
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        """Validate email exists."""
        if not User.objects.filter(email=value, is_active=True).exists():
            raise serializers.ValidationError("No active user found with this email address.")
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer for password reset confirmation.
    """
    token = serializers.CharField(required=True)
    uidb64 = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        required=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """Validate password confirmation."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("Passwords do not match.")
        return attrs 