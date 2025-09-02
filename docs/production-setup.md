# Production Environment Configuration

## Environment Variables for Production

Create a `.env.production` file with the following configuration:

```env
# Database Configuration
DATABASE_URL=postgresql://barbermanager:secure_password@localhost:5432/barbermanager

# Security Configuration
SECRET_KEY=your-super-secure-secret-key-min-32-characters-long-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Email Configuration (Production SMTP)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-business-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
SMTP_FROM_EMAIL=your-business-email@gmail.com
SMTP_FROM_NAME=BarberManager System

# Application Configuration
ENVIRONMENT=production
DEBUG=false
FRONTEND_URL=https://your-domain.com

# Security Headers
CORS_ORIGINS=["https://your-domain.com", "https://www.your-domain.com"]

# Rate Limiting (requests per minute)
RATE_LIMIT_LOGIN=5
RATE_LIMIT_API=100
RATE_LIMIT_PUBLIC=20

# Cache Configuration
CACHE_TTL_DEFAULT=300
CACHE_TTL_DASHBOARD=60
CACHE_TTL_SERVICES=600
```

## Quick Deployment Checklist

### Pre-Deployment
- [ ] Server with minimum 4GB RAM, 2 CPU cores
- [ ] PostgreSQL database installed and configured
- [ ] Domain name with SSL certificate
- [ ] Email service configured (Gmail, SendGrid, etc.)

### Security Setup
- [ ] Strong SECRET_KEY generated (min 32 characters)
- [ ] Database user with limited privileges
- [ ] Firewall configured (ports 80, 443, 22 only)
- [ ] SSL certificate installed and configured

### Application Deployment
- [ ] Code deployed to `/opt/barbermanager`
- [ ] Virtual environment created and dependencies installed
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Nginx configured and started
- [ ] Application process managed with systemd/supervisor

### Post-Deployment Verification
- [ ] Health check endpoint responds: `GET /api/health`
- [ ] System stats accessible: `GET /api/system/stats`
- [ ] Authentication works correctly
- [ ] Database connections stable
- [ ] Email notifications working
- [ ] SSL certificate valid

### Monitoring Setup
- [ ] Log rotation configured
- [ ] Backup strategy implemented
- [ ] Performance monitoring enabled
- [ ] Uptime monitoring configured

## Production Commands

### Start Application
```bash
# Using systemd (recommended)
sudo systemctl start barbermanager
sudo systemctl enable barbermanager

# Using supervisor
sudo supervisorctl start barbermanager
```

### Check Status
```bash
# Health check
curl https://your-domain.com/api/health

# System stats (admin only)
curl https://your-domain.com/api/system/stats

# Check logs
sudo tail -f /var/log/barbermanager/app.log
```

### Backup
```bash
# Database backup
/opt/barbermanager/scripts/backup_db.sh

# Full system backup
/opt/barbermanager/scripts/full_backup.sh
```

### Update Application
```bash
# 1. Backup current version
/opt/barbermanager/scripts/full_backup.sh

# 2. Stop application
sudo systemctl stop barbermanager

# 3. Pull updates
cd /opt/barbermanager
sudo git pull

# 4. Update dependencies
sudo -u www-data ./venv/bin/pip install -r requirements.txt

# 5. Run migrations (if any)
sudo -u www-data ./venv/bin/python migrate.py

# 6. Restart application
sudo systemctl start barbermanager

# 7. Verify deployment
curl https://your-domain.com/api/health
```

## Performance Tuning

### Database Optimization
```sql
-- PostgreSQL performance tuning
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
SELECT pg_reload_conf();
```

### Nginx Optimization
```nginx
# Add to nginx.conf
worker_processes auto;
worker_connections 1024;

# Enable gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1000;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

# Client body size for file uploads
client_max_body_size 10M;

# Timeouts
client_body_timeout 12;
client_header_timeout 12;
keepalive_timeout 15;
send_timeout 10;
```

### Application Tuning
```python
# Add to main.py for production
if os.getenv("ENVIRONMENT") == "production":
    # Increase worker processes
    workers = (multiprocessing.cpu_count() * 2) + 1
    
    # Configure Uvicorn for production
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        workers=workers,
        access_log=False,
        log_level="warning"
    )
```

## Troubleshooting

### Common Issues

1. **Application won't start**
   - Check database connection
   - Verify environment variables
   - Check file permissions
   - Review application logs

2. **Performance issues**
   - Monitor database queries
   - Check server resources
   - Review cache hit rates
   - Analyze slow endpoints

3. **Email notifications not working**
   - Verify SMTP configuration
   - Check email service credentials
   - Review firewall settings
   - Test email connectivity

4. **Database connection errors**
   - Check PostgreSQL status
   - Verify database credentials
   - Review connection limits
   - Check network connectivity

### Log Locations
- Application logs: `/var/log/barbermanager/app.log`
- Error logs: `/var/log/barbermanager/error.log`
- Nginx logs: `/var/log/nginx/access.log`, `/var/log/nginx/error.log`
- PostgreSQL logs: `/var/log/postgresql/postgresql-*.log`

### Support Commands
```bash
# Check system resources
htop
df -h
free -h

# Check database status
sudo systemctl status postgresql
sudo -u postgres psql -c "SELECT version();"

# Check application status
sudo systemctl status barbermanager
sudo supervisorctl status barbermanager

# Check network connectivity
netstat -tlnp | grep :8000
curl -I https://your-domain.com
```

## Security Recommendations

1. **Regular Updates**
   - Keep OS packages updated
   - Update Python dependencies monthly
   - Monitor security advisories

2. **Access Control**
   - Use SSH keys instead of passwords
   - Implement fail2ban for brute force protection
   - Regular security audits

3. **Data Protection**
   - Encrypt database backups
   - Use HTTPS everywhere
   - Implement proper LGPD compliance

4. **Monitoring**
   - Set up intrusion detection
   - Monitor failed login attempts
   - Track unusual API usage patterns

## Maintenance Schedule

### Daily
- Check system health
- Review error logs
- Monitor disk space

### Weekly
- Database performance review
- Security log analysis
- Backup verification

### Monthly
- Security updates
- Performance optimization
- Dependency updates

### Quarterly
- Full security audit
- Disaster recovery testing
- Capacity planning review