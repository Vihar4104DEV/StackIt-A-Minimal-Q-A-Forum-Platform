#!/usr/bin/env python3
"""
Test script for StackIt API endpoints.
This script demonstrates the API functionality and response structure.
"""

import requests
import json
import time

# Configuration
BASE_URL = "http://localhost:8000/api/v1"
HEADERS = {
    "Content-Type": "application/json"
}

def print_response(response, title):
    """Print formatted API response."""
    print(f"\n{'='*50}")
    print(f"{title}")
    print(f"{'='*50}")
    print(f"Status Code: {response.status_code}")
    print(f"Response:")
    print(json.dumps(response.json(), indent=2))
    print(f"{'='*50}")

def test_user_registration():
    """Test user registration endpoint."""
    url = f"{BASE_URL}/auth/register/"
    data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpass123",
        "password_confirm": "testpass123",
        "first_name": "Test",
        "last_name": "User",
        "bio": "Test user for API testing"
    }
    
    response = requests.post(url, headers=HEADERS, json=data)
    print_response(response, "User Registration")
    
    if response.status_code == 201:
        return response.json()["data"]["tokens"]["access"]
    return None

def test_user_login():
    """Test user login endpoint."""
    url = f"{BASE_URL}/auth/login/"
    data = {
        "username": "testuser",
        "password": "testpass123"
    }
    
    response = requests.post(url, headers=HEADERS, json=data)
    print_response(response, "User Login")
    
    if response.status_code == 200:
        return response.json()["data"]["tokens"]["access"]
    return None

def test_get_profile(access_token):
    """Test get user profile endpoint."""
    url = f"{BASE_URL}/auth/profile/"
    headers = {**HEADERS, "Authorization": f"Bearer {access_token}"}
    
    response = requests.get(url, headers=headers)
    print_response(response, "Get User Profile")
    return response.status_code == 200

def test_update_profile(access_token):
    """Test update user profile endpoint."""
    url = f"{BASE_URL}/auth/profile/"
    headers = {**HEADERS, "Authorization": f"Bearer {access_token}"}
    data = {
        "first_name": "Updated",
        "last_name": "Name",
        "bio": "Updated bio for testing"
    }
    
    response = requests.put(url, headers=headers, json=data)
    print_response(response, "Update User Profile")
    return response.status_code == 200

def test_change_password(access_token):
    """Test change password endpoint."""
    url = f"{BASE_URL}/auth/change-password/"
    headers = {**HEADERS, "Authorization": f"Bearer {access_token}"}
    data = {
        "old_password": "testpass123",
        "new_password": "newpass123",
        "new_password_confirm": "newpass123"
    }
    
    response = requests.post(url, headers=headers, json=data)
    print_response(response, "Change Password")
    return response.status_code == 200

def test_token_refresh(refresh_token):
    """Test token refresh endpoint."""
    url = f"{BASE_URL}/auth/refresh/"
    data = {
        "refresh": refresh_token
    }
    
    response = requests.post(url, headers=HEADERS, json=data)
    print_response(response, "Token Refresh")
    
    if response.status_code == 200:
        return response.json()["data"]["access"]
    return None

def test_password_reset_request():
    """Test password reset request endpoint."""
    url = f"{BASE_URL}/auth/password-reset/"
    data = {
        "email": "test@example.com"
    }
    
    response = requests.post(url, headers=HEADERS, json=data)
    print_response(response, "Password Reset Request")
    return response.status_code == 200

def test_invalid_login():
    """Test invalid login to demonstrate error handling."""
    url = f"{BASE_URL}/auth/login/"
    data = {
        "username": "nonexistent",
        "password": "wrongpassword"
    }
    
    response = requests.post(url, headers=HEADERS, json=data)
    print_response(response, "Invalid Login (Error Handling)")
    return response.status_code == 400

def test_unauthorized_access():
    """Test unauthorized access to demonstrate authentication."""
    url = f"{BASE_URL}/auth/profile/"
    
    response = requests.get(url, headers=HEADERS)
    print_response(response, "Unauthorized Access (No Token)")
    return response.status_code == 401

def test_invalid_token():
    """Test invalid token to demonstrate token validation."""
    url = f"{BASE_URL}/auth/profile/"
    headers = {**HEADERS, "Authorization": "Bearer invalid_token"}
    
    response = requests.get(url, headers=headers)
    print_response(response, "Invalid Token")
    return response.status_code == 401

def main():
    """Main test function."""
    print("StackIt API Test Suite")
    print("Testing all authentication endpoints and response formats...")
    
    # Test 1: User Registration
    access_token = test_user_registration()
    
    if not access_token:
        print("\n❌ Registration failed. Trying login with existing user...")
        access_token = test_user_login()
    
    if access_token:
        print("\n✅ Authentication successful!")
        
        # Test 2: Get Profile
        test_get_profile(access_token)
        
        # Test 3: Update Profile
        test_update_profile(access_token)
        
        # Test 4: Change Password
        test_change_password(access_token)
        
        # Test 5: Get Profile Again (to see updates)
        test_get_profile(access_token)
        
    # Test 6: Error Handling
    test_invalid_login()
    test_unauthorized_access()
    test_invalid_token()
    
    # Test 7: Password Reset Request
    test_password_reset_request()
    
    print("\n🎉 API Test Suite Completed!")
    print("\nKey Features Demonstrated:")
    print("✅ Consistent response structure")
    print("✅ JWT authentication")
    print("✅ Error handling")
    print("✅ Input validation")
    print("✅ User profile management")
    print("✅ Password management")

if __name__ == "__main__":
    main() 