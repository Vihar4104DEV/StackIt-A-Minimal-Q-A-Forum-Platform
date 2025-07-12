# StackIt Frontend Setup Guide

## API Integration Issues Fixed

I've fixed the following issues in your StackIt frontend:

### 1. Authentication Issues
- ✅ Fixed authApi response handling to work with your backend's direct response structure
- ✅ Updated authStore to properly handle login/register responses
- ✅ Fixed token storage and retrieval
- ✅ Added proper error handling and debugging

### 2. Questions API Issues
- ✅ Fixed questionsApi to handle paginated responses correctly
- ✅ Updated Questions component to display real data from API
- ✅ Fixed AskQuestion component to handle question creation properly
- ✅ Updated Home component to show real popular questions

### 3. API Client Issues
- ✅ Fixed response structure handling for both wrapped and unwrapped responses
- ✅ Added comprehensive error handling and debugging
- ✅ Fixed TypeScript errors in the API client

## Setup Instructions

### 1. Environment Configuration
Create a `.env` file in your project root with:
```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### 2. Backend Requirements
Make sure your Django backend is running on `http://localhost:8000` and has:
- Authentication endpoints at `/api/v1/auth/`
- Questions endpoints at `/api/v1/questions/`
- Answers endpoints at `/api/v1/answers/`

### 3. Testing the Integration

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Check the browser console** for:
   - API Configuration logs
   - Request/response logs
   - Any error messages

3. **Test Authentication:**
   - Go to `/login` and try logging in
   - Check console for detailed logs
   - Verify tokens are stored in localStorage

4. **Test Questions:**
   - Go to `/questions` to see the questions list
   - Try creating a new question at `/ask`
   - Check console for API response logs

## Debugging

### Console Logs to Look For:
- `API Configuration:` - Shows your current API settings
- `Making API request:` - Shows each API call
- `Raw API response:` - Shows the actual response from your backend
- `Login response:` - Shows authentication responses
- `Popular questions response:` - Shows questions API responses

### Common Issues:

1. **CORS Errors:** Make sure your Django backend allows requests from `http://localhost:5173`
2. **Network Errors:** Check if your backend is running on the correct port
3. **Authentication Errors:** Verify your backend's authentication endpoints match the expected format

### Backend Response Format Expected:

**Login Response:**
```json
{
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User",
    "reputation": 0,
    "is_staff": false,
    "is_verified": false,
    "date_joined": "2024-01-01T00:00:00Z"
  },
  "tokens": {
    "access": "your_access_token",
    "refresh": "your_refresh_token"
  }
}
```

**Questions Response:**
```json
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Question Title",
      "author": {
        "id": 1,
        "username": "testuser",
        "email": "test@example.com",
        "first_name": "Test",
        "last_name": "User",
        "reputation": 0
      },
      "tags": [
        {
          "id": 1,
          "name": "react",
          "color": "#007bff"
        }
      ],
      "views": 0,
      "votes": 0,
      "is_answered": false,
      "created_at": "2024-01-01T00:00:00Z",
      "answers_count": 0,
      "votes_count": 0,
      "is_popular": false
    }
  ]
}
```

## Next Steps

1. Start your Django backend server
2. Create the `.env` file with the correct API URL
3. Run `npm run dev` to start the frontend
4. Check the browser console for any errors
5. Test the authentication and questions functionality

If you encounter any issues, check the browser console for detailed error logs that will help identify the problem. 