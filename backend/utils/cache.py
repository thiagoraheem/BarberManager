"""
Cache utilities for improving API performance
"""
import json
import hashlib
from datetime import datetime, timedelta
from typing import Any, Optional, Dict, Callable
from functools import wraps
import time


class SimpleCache:
    """Simple in-memory cache with TTL support"""
    
    def __init__(self):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._last_cleanup = time.time()
        self._cleanup_interval = 300  # 5 minutes
    
    def _cleanup(self):
        """Remove expired entries"""
        now = time.time()
        if now - self._last_cleanup < self._cleanup_interval:
            return
            
        expired_keys = []
        for key, data in self._cache.items():
            if data['expires'] < now:
                expired_keys.append(key)
        
        for key in expired_keys:
            del self._cache[key]
        
        self._last_cleanup = now
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        self._cleanup()
        
        if key not in self._cache:
            return None
        
        data = self._cache[key]
        if data['expires'] < time.time():
            del self._cache[key]
            return None
        
        return data['value']
    
    def set(self, key: str, value: Any, ttl: int = 300):
        """Set value in cache with TTL in seconds"""
        self._cache[key] = {
            'value': value,
            'expires': time.time() + ttl,
            'created': time.time()
        }
    
    def delete(self, key: str):
        """Delete key from cache"""
        if key in self._cache:
            del self._cache[key]
    
    def clear(self):
        """Clear all cache"""
        self._cache.clear()
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        self._cleanup()
        return {
            'entries': len(self._cache),
            'memory_usage': len(str(self._cache)),
            'last_cleanup': datetime.fromtimestamp(self._last_cleanup)
        }


# Global cache instance
cache = SimpleCache()


def cache_key(*args, **kwargs) -> str:
    """Generate cache key from arguments"""
    key_data = {
        'args': args,
        'kwargs': sorted(kwargs.items())
    }
    key_string = json.dumps(key_data, sort_keys=True, default=str)
    return hashlib.md5(key_string.encode()).hexdigest()


def cached(ttl: int = 300, key_prefix: str = ""):
    """
    Decorator for caching function results
    
    Args:
        ttl: Time to live in seconds (default: 5 minutes)
        key_prefix: Optional prefix for cache key
    """
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            func_key = f"{key_prefix}:{func.__name__}:{cache_key(*args, **kwargs)}"
            
            # Try to get from cache
            result = cache.get(func_key)
            if result is not None:
                return result
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            cache.set(func_key, result, ttl)
            return result
        
        # Add cache management methods to function
        wrapper.cache_clear = lambda: cache.clear()
        wrapper.cache_delete = lambda *args, **kwargs: cache.delete(
            f"{key_prefix}:{func.__name__}:{cache_key(*args, **kwargs)}"
        )
        
        return wrapper
    return decorator


def cache_dashboard_stats(ttl: int = 60):
    """Special cache decorator for dashboard statistics"""
    return cached(ttl=ttl, key_prefix="dashboard")


def cache_client_data(ttl: int = 300):
    """Special cache decorator for client data"""
    return cached(ttl=ttl, key_prefix="clients")


def cache_service_data(ttl: int = 600):
    """Special cache decorator for service data (longer TTL as it changes less)"""
    return cached(ttl=ttl, key_prefix="services")


def invalidate_cache_pattern(pattern: str):
    """Invalidate cache entries matching a pattern"""
    keys_to_delete = []
    for key in cache._cache.keys():
        if pattern in key:
            keys_to_delete.append(key)
    
    for key in keys_to_delete:
        cache.delete(key)


# Cache invalidation helpers
def invalidate_dashboard_cache():
    """Invalidate all dashboard-related cache"""
    invalidate_cache_pattern("dashboard:")


def invalidate_client_cache():
    """Invalidate all client-related cache"""
    invalidate_cache_pattern("clients:")


def invalidate_service_cache():
    """Invalidate all service-related cache"""
    invalidate_cache_pattern("services:")