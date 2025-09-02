"""
Rate limiting middleware for API protection
"""
import time
from typing import Dict, Tuple
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
import hashlib
from collections import defaultdict, deque


class RateLimiter:
    """Simple rate limiter with sliding window"""
    
    def __init__(self):
        # Store request timestamps for each client
        self._clients: Dict[str, deque] = defaultdict(deque)
        # Rate limit rules: {endpoint_pattern: (requests, window_seconds)}
        self._rules = {
            'default': (100, 60),  # 100 requests per minute by default
            '/api/auth/login': (5, 300),  # 5 login attempts per 5 minutes
            '/api/public/': (20, 60),  # 20 requests per minute for public endpoints
            '/api/pos/': (50, 60),  # 50 POS requests per minute
            '/api/appointments': (30, 60),  # 30 appointment requests per minute
        }
    
    def _get_client_id(self, request: Request) -> str:
        """Generate client identifier from IP and User-Agent"""
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "")
        
        # Create hash of IP + User-Agent for privacy
        client_data = f"{client_ip}:{user_agent}"
        return hashlib.md5(client_data.encode()).hexdigest()[:16]
    
    def _get_rule_for_path(self, path: str) -> Tuple[int, int]:
        """Get rate limit rule for given path"""
        for pattern, rule in self._rules.items():
            if pattern != 'default' and pattern in path:
                return rule
        return self._rules['default']
    
    def _cleanup_old_requests(self, client_requests: deque, window_seconds: int):
        """Remove requests older than window"""
        current_time = time.time()
        while client_requests and client_requests[0] < current_time - window_seconds:
            client_requests.popleft()
    
    def is_allowed(self, request: Request) -> Tuple[bool, Dict[str, any]]:
        """Check if request is allowed under rate limits"""
        client_id = self._get_client_id(request)
        path = request.url.path
        max_requests, window_seconds = self._get_rule_for_path(path)
        
        current_time = time.time()
        client_requests = self._clients[client_id]
        
        # Clean up old requests
        self._cleanup_old_requests(client_requests, window_seconds)
        
        # Check if limit exceeded
        if len(client_requests) >= max_requests:
            # Calculate retry after time
            oldest_request = client_requests[0]
            retry_after = int(oldest_request + window_seconds - current_time)
            
            return False, {
                'retry_after': max(retry_after, 1),
                'limit': max_requests,
                'window': window_seconds,
                'remaining': 0
            }
        
        # Add current request
        client_requests.append(current_time)
        
        return True, {
            'limit': max_requests,
            'window': window_seconds,
            'remaining': max_requests - len(client_requests)
        }
    
    def get_stats(self) -> Dict[str, any]:
        """Get rate limiter statistics"""
        active_clients = len(self._clients)
        total_requests = sum(len(requests) for requests in self._clients.values())
        
        return {
            'active_clients': active_clients,
            'total_tracked_requests': total_requests,
            'rules': self._rules
        }


# Global rate limiter instance
rate_limiter = RateLimiter()


async def rate_limit_middleware(request: Request, call_next):
    """Rate limiting middleware"""
    # Skip rate limiting for test environment
    import os
    if os.getenv("TESTING") == "true":
        return await call_next(request)
        
    # Skip rate limiting for health check
    if request.url.path == "/api/health":
        return await call_next(request)
    
    # Check rate limits
    allowed, info = rate_limiter.is_allowed(request)
    
    if not allowed:
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "detail": "Rate limit exceeded",
                "retry_after": info['retry_after'],
                "limit": info['limit'],
                "window_seconds": info['window']
            },
            headers={
                "Retry-After": str(info['retry_after']),
                "X-RateLimit-Limit": str(info['limit']),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(int(time.time() + info['retry_after']))
            }
        )
    
    # Process request
    response = await call_next(request)
    
    # Add rate limit headers to response
    response.headers["X-RateLimit-Limit"] = str(info['limit'])
    response.headers["X-RateLimit-Remaining"] = str(info['remaining'])
    response.headers["X-RateLimit-Window"] = str(info['window'])
    
    return response


def get_rate_limit_stats():
    """Get current rate limiting statistics"""
    return rate_limiter.get_stats()