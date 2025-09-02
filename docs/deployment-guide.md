# Deployment Guide - BarberManager System

## Overview

This guide provides comprehensive instructions for deploying the BarberManager system in different environments, from development to production. The system consists of a FastAPI backend and React frontend.

## System Requirements

### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 50GB SSD
- **OS**: Linux (Ubuntu 20.04+), Windows 10+, or macOS 10.15+

### Recommended Production Requirements
- **CPU**: 4 cores
- **RAM**: 8GB
- **Storage**: 100GB SSD
- **OS**: Linux (Ubuntu 22.04 LTS)
- **Network**: 100 Mbps connection

### Software Dependencies
- **Python**: 3.8+ (recommended 3.11)
- **Node.js**: 16+ (recommended 18 LTS)
- **Database**: PostgreSQL 14+ (SQLite for development)
- **Web Server**: Nginx (production)
- **Process Manager**: PM2 or systemd

---

## Development Environment Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd BarberManager
```

### 2. Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt
# or using poetry
poetry install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
python run.py --init-db

# Run development server
python run.py
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### 4. Environment Variables (.env)

```env
# Database
DATABASE_URL=sqlite:///./barbearia.db
# For PostgreSQL: postgresql://user:password@localhost/barbermanager

# Security
SECRET_KEY=your-super-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=BarberManager

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Environment
ENVIRONMENT=development
DEBUG=true
```

---

## Production Deployment

### Option 1: Docker Deployment (Recommended)

#### 1. Create Dockerfile (Backend)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: barbermanager
      POSTGRES_USER: barbermanager
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U barbermanager"]
      interval: 30s
      timeout: 10s
      retries: 5

  backend:
    build: .
    environment:
      DATABASE_URL: postgresql://barbermanager:secure_password@db:5432/barbermanager
      SECRET_KEY: your-production-secret-key-min-32-chars
      ENVIRONMENT: production
      DEBUG: false
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl/certs:ro
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

#### 3. Deploy with Docker

```bash
# Production deployment
docker-compose up -d

# View logs
docker-compose logs -f

# Scale services (if needed)
docker-compose up -d --scale backend=2
```

### Option 2: Traditional Server Deployment

#### 1. Server Preparation (Ubuntu 22.04)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3 python3-pip python3-venv \
    nodejs npm nginx postgresql postgresql-contrib \
    supervisor curl git

# Install Python 3.11 (if not available)
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt install python3.11 python3.11-venv python3.11-dev
```

#### 2. Database Setup

```bash
# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE barbermanager;
CREATE USER barbermanager WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE barbermanager TO barbermanager;
\q
EOF
```

#### 3. Application Deployment

```bash
# Create application directory
sudo mkdir -p /opt/barbermanager
cd /opt/barbermanager

# Clone repository
sudo git clone <repository-url> .
sudo chown -R www-data:www-data /opt/barbermanager

# Backend setup
sudo -u www-data python3.11 -m venv venv
sudo -u www-data ./venv/bin/pip install -r requirements.txt

# Create production environment file
sudo -u www-data cp .env.example .env.production
# Edit .env.production with production values

# Frontend build
cd frontend
sudo npm install
sudo npm run build
```

#### 4. Nginx Configuration

```nginx
# /etc/nginx/sites-available/barbermanager
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration
    ssl_certificate /path/to/your/fullchain.pem;
    ssl_certificate_key /path/to/your/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Frontend (React build)
    location / {
        root /opt/barbermanager/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Caching for static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # File upload size
    client_max_body_size 10M;
}
```

#### 5. Supervisor Configuration

```ini
# /etc/supervisor/conf.d/barbermanager.conf
[program:barbermanager]
command=/opt/barbermanager/venv/bin/uvicorn backend.main:app --host 127.0.0.1 --port 8000
directory=/opt/barbermanager
user=www-data
autostart=true
autorestart=true
stderr_logfile=/var/log/barbermanager/error.log
stdout_logfile=/var/log/barbermanager/access.log
environment=PATH="/opt/barbermanager/venv/bin"
```

#### 6. Service Management

```bash
# Enable and start services
sudo systemctl enable nginx
sudo systemctl start nginx

sudo systemctl enable supervisor
sudo systemctl start supervisor

# Enable site
sudo ln -s /etc/nginx/sites-available/barbermanager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Start application
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start barbermanager
```

---

## SSL Certificate Setup

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## Monitoring and Logging

### 1. Log Configuration

```python
# backend/logging_config.py
import logging
import logging.handlers
import os

def setup_logging():
    log_dir = "/var/log/barbermanager"
    os.makedirs(log_dir, exist_ok=True)
    
    # Application logs
    app_handler = logging.handlers.RotatingFileHandler(
        f"{log_dir}/app.log",
        maxBytes=10485760,  # 10MB
        backupCount=5
    )
    
    # Error logs
    error_handler = logging.handlers.RotatingFileHandler(
        f"{log_dir}/error.log",
        maxBytes=10485760,
        backupCount=5
    )
    error_handler.setLevel(logging.ERROR)
    
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[app_handler, error_handler]
    )
```

### 2. Health Monitoring Script

```bash
#!/bin/bash
# /opt/barbermanager/scripts/health_check.sh

# Check API health
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/health)

if [ $response -eq 200 ]; then
    echo "$(date): API is healthy"
else
    echo "$(date): API is down (HTTP $response)"
    # Restart service
    sudo supervisorctl restart barbermanager
    
    # Send alert (configure with your notification service)
    # curl -X POST "https://hooks.slack.com/services/..." \
    #      -H 'Content-type: application/json' \
    #      --data '{"text":"BarberManager API is down!"}'
fi
```

### 3. Automated Monitoring with Cron

```bash
# Add to crontab
*/5 * * * * /opt/barbermanager/scripts/health_check.sh >> /var/log/barbermanager/health.log 2>&1
```

---

## Backup Strategy

### 1. Database Backup Script

```bash
#!/bin/bash
# /opt/barbermanager/scripts/backup_db.sh

BACKUP_DIR="/opt/barbermanager/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="barbermanager"
DB_USER="barbermanager"

mkdir -p $BACKUP_DIR

# Create backup
pg_dump -h localhost -U $DB_USER -d $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Database backup completed: backup_$DATE.sql.gz"
```

### 2. Complete System Backup

```bash
#!/bin/bash
# /opt/barbermanager/scripts/full_backup.sh

BACKUP_DIR="/opt/barbermanager/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR/full_$DATE

# Backup database
/opt/barbermanager/scripts/backup_db.sh

# Backup application files
tar -czf $BACKUP_DIR/full_$DATE/app_backup.tar.gz \
    --exclude='venv' \
    --exclude='node_modules' \
    --exclude='*.log' \
    /opt/barbermanager

# Backup configuration
cp /etc/nginx/sites-available/barbermanager $BACKUP_DIR/full_$DATE/
cp /etc/supervisor/conf.d/barbermanager.conf $BACKUP_DIR/full_$DATE/

echo "Full backup completed: $BACKUP_DIR/full_$DATE"
```

### 3. Automated Backups

```bash
# Daily database backup at 2 AM
0 2 * * * /opt/barbermanager/scripts/backup_db.sh >> /var/log/barbermanager/backup.log 2>&1

# Weekly full backup on Sundays at 3 AM
0 3 * * 0 /opt/barbermanager/scripts/full_backup.sh >> /var/log/barbermanager/backup.log 2>&1
```

---

## Performance Optimization

### 1. Database Optimization

```sql
-- PostgreSQL optimization queries
-- Run as database administrator

-- Create indexes for better performance
CREATE INDEX CONCURRENTLY idx_appointments_date ON appointments(data_hora);
CREATE INDEX CONCURRENTLY idx_appointments_barbeiro ON appointments(barbeiro_id);
CREATE INDEX CONCURRENTLY idx_appointments_status ON appointments(status);
CREATE INDEX CONCURRENTLY idx_sales_date ON sales(criado_em);
CREATE INDEX CONCURRENTLY idx_clients_search ON clients USING gin(to_tsvector('portuguese', nome || ' ' || email));

-- Analyze tables for query optimization
ANALYZE appointments;
ANALYZE clients;
ANALYZE services;
ANALYZE sales;
```

### 2. System Optimization

```bash
# /etc/sysctl.d/99-barbermanager.conf
# Network optimization
net.core.somaxconn = 1024
net.ipv4.tcp_max_syn_backlog = 2048

# Memory optimization  
vm.swappiness = 10
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5

# Apply changes
sudo sysctl -p /etc/sysctl.d/99-barbermanager.conf
```

---

## Security Considerations

### 1. Firewall Configuration

```bash
# Configure UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 2. Application Security

- Change default passwords and secret keys
- Use strong JWT secret (min 32 characters)
- Enable HTTPS with valid SSL certificates
- Regular security updates
- Monitor logs for suspicious activity
- Use fail2ban for SSH protection

### 3. Database Security

```sql
-- Revoke public permissions
REVOKE ALL ON SCHEMA public FROM PUBLIC;

-- Create read-only user for reporting
CREATE USER barbermanager_readonly WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE barbermanager TO barbermanager_readonly;
GRANT USAGE ON SCHEMA public TO barbermanager_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO barbermanager_readonly;
```

---

## Troubleshooting

### Common Issues

#### Application Won't Start

1. Check logs: `sudo tail -f /var/log/barbermanager/error.log`
2. Verify database connection
3. Check environment variables
4. Ensure dependencies are installed

#### Database Connection Issues

```bash
# Test database connection
psql -h localhost -U barbermanager -d barbermanager -c "SELECT version();"

# Check PostgreSQL status
sudo systemctl status postgresql
```

#### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log

# Reload configuration
sudo systemctl reload nginx
```

#### SSL Certificate Issues

```bash
# Check certificate expiry
sudo certbot certificates

# Renew certificates
sudo certbot renew

# Check SSL configuration
openssl s_client -connect your-domain.com:443
```

### Performance Issues

1. Monitor system resources: `htop`, `iotop`
2. Check database performance: PostgreSQL logs
3. Analyze slow queries
4. Monitor application metrics
5. Check network connectivity

---

## Maintenance

### Regular Tasks

1. **Daily**: Monitor logs and system health
2. **Weekly**: Review performance metrics
3. **Monthly**: Update security patches
4. **Quarterly**: Review and test backups

### Update Procedure

```bash
# 1. Backup current version
/opt/barbermanager/scripts/full_backup.sh

# 2. Pull latest code
cd /opt/barbermanager
sudo git pull

# 3. Update dependencies
sudo -u www-data ./venv/bin/pip install -r requirements.txt

# 4. Run database migrations (if any)
sudo -u www-data ./venv/bin/python migrate.py

# 5. Build frontend
cd frontend
sudo npm install
sudo npm run build

# 6. Restart services
sudo supervisorctl restart barbermanager
sudo systemctl reload nginx
```

---

## Support

For deployment issues:
1. Check logs in `/var/log/barbermanager/`
2. Verify configuration files
3. Test individual components
4. Review this documentation
5. Check the troubleshooting section

---

*Last updated: February 2024*