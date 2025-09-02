"""
Enhanced input validation and security middleware
"""
import re
import json
from typing import Any, Dict, List
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse


class SecurityValidator:
    """Enhanced security validation for input data"""
    
    def __init__(self):
        # SQL injection patterns
        self.sql_patterns = [
            r"(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bUNION\b)",
            r"(--|\#|\/\*|\*\/)",
            r"(\bOR\b\s+\d+\s*=\s*\d+|\bAND\b\s+\d+\s*=\s*\d+)",
            r"(\bEXEC\b|\bEXECUTE\b)",
        ]
        
        # XSS patterns
        self.xss_patterns = [
            r"<script[^>]*>.*?</script>",
            r"javascript:",
            r"vbscript:",
            r"data:text/html",
            r"on\w+\s*=",
            r"<iframe[^>]*>.*?</iframe>",
        ]
        
        # Common attack patterns
        self.attack_patterns = [
            r"\.\.\/",  # Directory traversal
            r"\/etc\/passwd",  # File access attempts
            r"cmd\.exe",  # Command execution
            r"powershell",  # PowerShell execution
            r"\${[^}]+}",  # Expression language injection
        ]
        
        # Compile patterns for better performance
        self.compiled_sql = [re.compile(pattern, re.IGNORECASE) for pattern in self.sql_patterns]
        self.compiled_xss = [re.compile(pattern, re.IGNORECASE) for pattern in self.xss_patterns]
        self.compiled_attacks = [re.compile(pattern, re.IGNORECASE) for pattern in self.attack_patterns]
    
    def validate_string(self, value: str) -> Dict[str, List[str]]:
        """Validate a string for security threats"""
        threats = {
            'sql_injection': [],
            'xss': [],
            'attacks': []
        }
        
        # Check SQL injection
        for pattern in self.compiled_sql:
            if pattern.search(value):
                threats['sql_injection'].append(pattern.pattern)
        
        # Check XSS
        for pattern in self.compiled_xss:
            if pattern.search(value):
                threats['xss'].append(pattern.pattern)
        
        # Check other attacks
        for pattern in self.compiled_attacks:
            if pattern.search(value):
                threats['attacks'].append(pattern.pattern)
        
        return threats
    
    def validate_data(self, data: Any, path: str = "") -> List[Dict[str, Any]]:
        """Recursively validate data structure"""
        issues = []
        
        if isinstance(data, str):
            threats = self.validate_string(data)
            for threat_type, patterns in threats.items():
                if patterns:
                    issues.append({
                        'type': threat_type,
                        'path': path,
                        'value': data[:100],  # Truncate for security
                        'patterns': patterns
                    })
        
        elif isinstance(data, dict):
            for key, value in data.items():
                new_path = f"{path}.{key}" if path else key
                issues.extend(self.validate_data(value, new_path))
        
        elif isinstance(data, list):
            for i, item in enumerate(data):
                new_path = f"{path}[{i}]" if path else f"[{i}]"
                issues.extend(self.validate_data(item, new_path))
        
        return issues
    
    def validate_request_size(self, content_length: int, max_size: int = 10485760):  # 10MB
        """Validate request size"""
        if content_length > max_size:
            return False, f"Request too large: {content_length} bytes (max: {max_size})"
        return True, None
    
    def validate_content_type(self, content_type: str, allowed_types: List[str]):
        """Validate content type"""
        if content_type and not any(allowed in content_type for allowed in allowed_types):
            return False, f"Invalid content type: {content_type}"
        return True, None


# Global validator instance
security_validator = SecurityValidator()


async def security_validation_middleware(request: Request, call_next):
    """Security validation middleware"""
    
    # Skip validation for test environment
    import os
    if os.getenv("TESTING") == "true":
        return await call_next(request)
    
    # Skip validation for certain endpoints
    skip_paths = ["/api/health", "/api/system/stats", "/docs", "/redoc", "/openapi.json"]
    if any(request.url.path.startswith(path) for path in skip_paths):
        return await call_next(request)
    
    # Validate request size
    content_length = request.headers.get("content-length")
    if content_length:
        try:
            size = int(content_length)
            valid, message = security_validator.validate_request_size(size)
            if not valid:
                return JSONResponse(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    content={"detail": message}
                )
        except ValueError:
            pass
    
    # Validate content type for POST/PUT requests
    if request.method in ["POST", "PUT", "PATCH"]:
        content_type = request.headers.get("content-type", "")
        allowed_types = ["application/json", "application/x-www-form-urlencoded", "multipart/form-data"]
        valid, message = security_validator.validate_content_type(content_type, allowed_types)
        if not valid:
            return JSONResponse(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                content={"detail": message}
            )
    
    # For JSON requests, validate body content
    if request.method in ["POST", "PUT", "PATCH"] and "application/json" in request.headers.get("content-type", ""):
        try:
            body = await request.body()
            if body:
                try:
                    json_data = json.loads(body)
                    issues = security_validator.validate_data(json_data)
                    
                    if issues:
                        return JSONResponse(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            content={
                                "detail": "Security validation failed",
                                "issues": issues[:5]  # Limit to first 5 issues
                            }
                        )
                except json.JSONDecodeError:
                    # Let FastAPI handle JSON parsing errors
                    pass
        except Exception:
            # If we can't read body, let the request proceed
            pass
    
    # Process request
    response = await call_next(request)
    
    # Add security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    return response


def get_security_stats():
    """Get security validation statistics"""
    return {
        "sql_patterns": len(security_validator.compiled_sql),
        "xss_patterns": len(security_validator.compiled_xss),
        "attack_patterns": len(security_validator.compiled_attacks),
        "validation_active": True
    }