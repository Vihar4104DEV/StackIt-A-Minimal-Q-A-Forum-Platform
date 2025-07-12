import logging
import time
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from django.conf import settings
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.authentication import JWTAuthentication

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(MiddlewareMixin):
    """
    Middleware to log API requests and responses.
    """
    
    def process_request(self, request):
        """Log incoming request."""
        request.start_time = time.time()
        
        # Only log API requests to reduce overhead
        if request.path.startswith('/api/'):
            logger.info(f"Request: {request.method} {request.path} - User: {getattr(request.user, 'username', 'Anonymous')}")
        
        return None
    
    def process_response(self, request, response):
        """Log response details."""
        if hasattr(request, 'start_time') and request.path.startswith('/api/'):
            duration = time.time() - request.start_time
            
            # Log response details
            logger.info(
                f"Response: {request.method} {request.path} - "
                f"Status: {response.status_code} - "
                f"Duration: {duration:.3f}s - "
                f"User: {getattr(request.user, 'username', 'Anonymous')}"
            )
        
        return response
    
    def process_exception(self, request, exception):
        """Log exceptions."""
        if request.path.startswith('/api/'):
            logger.error(
                f"Exception: {request.method} {request.path} - "
                f"Error: {str(exception)} - "
                f"User: {getattr(request.user, 'username', 'Anonymous')}"
            )
        return None


# Custom CORS middleware - DISABLED for development
# Uncomment for production if needed:
# class CORSMiddleware(MiddlewareMixin):
#     """
#     Custom CORS middleware to handle cross-origin requests.
#     """
#     
#     def process_response(self, request, response):
#         """Add CORS headers to response."""
#         # Configure for your production domains
#         response['Access-Control-Allow-Origin'] = 'https://yourdomain.com'
#         response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
#         response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
#         response['Access-Control-Allow-Credentials'] = 'true'
#         
#         return response


class APIResponseMiddleware(MiddlewareMixin):
    """
    Middleware to ensure consistent API response structure.
    """
    
    def process_response(self, request, response):
        """Ensure consistent response structure for API endpoints."""
        # Only process API responses
        if not request.path.startswith('/api/'):
            return response
        
        # Skip if response is already in the correct format
        if hasattr(response, 'data') and isinstance(response.data, dict):
            if 'success' in response.data:
                return response
        
        # For non-API responses, return as is
        if not hasattr(response, 'data'):
            return response
        
        # Convert to consistent format if needed
        if response.status_code >= 200 and response.status_code < 300:
            response.data = {
                'success': True,
                'message': 'Success',
                'data': response.data,
                'status_code': response.status_code
            }
        else:
            response.data = {
                'success': False,
                'message': 'Error occurred',
                'errors': response.data,
                'status_code': response.status_code
            }
        
        return response


class RateLimitingMiddleware(MiddlewareMixin):
    """
    Basic rate limiting middleware.
    """
    
    def __init__(self, get_response=None):
        super().__init__(get_response)
        self.request_counts = {}
    
    def process_request(self, request):
        """Check rate limits for API requests."""
        # Only apply to API endpoints
        if not request.path.startswith('/api/'):
            return None
        
        # Get client IP
        client_ip = self._get_client_ip(request)
        
        # Simple rate limiting: max 100 requests per minute per IP
        current_time = time.time()
        minute_ago = current_time - 60
        
        # Clean old entries
        if client_ip in self.request_counts:
            self.request_counts[client_ip] = [
                req_time for req_time in self.request_counts[client_ip]
                if req_time > minute_ago
            ]
        else:
            self.request_counts[client_ip] = []
        
        # Check rate limit
        if len(self.request_counts[client_ip]) >= 100:
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            return JsonResponse({
                'success': False,
                'message': 'Rate limit exceeded. Please try again later.',
                'errors': None,
                'status_code': 429
            }, status=429)
        
        # Add current request
        self.request_counts[client_ip].append(current_time)
        
        return None
    
    def _get_client_ip(self, request):
        """Get client IP address."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip 