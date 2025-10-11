# CRAV Unified Dashboard - Deployment Guide

## 🚀 Deployment Options

### Option 1: Quick Start (Development)

The easiest way to run the dashboard:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

The dashboard runs with mock data and is fully functional for testing and development.

---

## 📦 Option 2: Production Build (Static)

Build and serve as static files:

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Serve dist/ folder with any static server
# Example: serve -s dist
```

---

## 🐳 Option 3: Docker Deployment

### Using Docker Compose

```bash
# Start all services
docker compose up -d

# Initialize database (if using local Postgres)
npm run db:generate
npm run db:push
npm run db:seed

# Start app
npm run dev
```

### Production Docker Setup

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["npm", "run", "preview", "--", "--port", "3000", "--host"]
```

Build and run:

```bash
docker build -t crav-dashboard .
docker run -p 3000:3000 crav-dashboard
```

---

## 🖥️ Option 4: Ubuntu 24.04 Production

### Prerequisites

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install PostgreSQL (if not using Supabase)
sudo apt install -y postgresql postgresql-contrib
```

### Application Setup

```bash
# Clone repository
cd /var/www
sudo git clone <repo> crav-dashboard
cd crav-dashboard

# Install dependencies
sudo npm install

# Configure environment
sudo cp .env.example .env
sudo nano .env  # Edit with production values

# Build application
sudo npm run build

# Start with PM2
sudo pm2 start npm --name "crav-dashboard" -- run preview -- --port 3000 --host
sudo pm2 save
sudo pm2 startup
```

### Nginx Configuration

Create `/etc/nginx/sites-available/crav-dashboard`:

```nginx
server {
    listen 80;
    server_name dashboard.craudiovizai.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name dashboard.craudiovizai.com;

    # SSL Configuration (use certbot for Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/dashboard.craudiovizai.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dashboard.craudiovizai.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Proxy to Node app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/crav-dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d dashboard.craudiovizai.com
```

### Database Setup (PostgreSQL)

If using local PostgreSQL instead of Supabase:

```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE crav_unified;
CREATE USER crav WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE crav_unified TO crav;
\q

# Update DATABASE_URL in .env
DATABASE_URL="postgresql://crav:secure_password@localhost:5432/crav_unified"

# Run migrations
npm run db:generate
npm run db:push
npm run db:seed
```

---

## ☁️ Option 5: Cloud Platforms

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project directory
3. Follow prompts
4. Configure environment variables in Vercel dashboard

### Netlify

1. Install Netlify CLI: `npm i -g netlify-cli`
2. Run `netlify deploy`
3. Follow prompts
4. Configure environment variables in Netlify dashboard

### Railway

1. Connect GitHub repository
2. Railway auto-detects Vite
3. Add environment variables
4. Deploy

---

## 🔐 Environment Variables

Essential variables for production:

```env
# Database (use Supabase or PostgreSQL)
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Authentication (for future NextAuth integration)
NEXTAUTH_URL=https://dashboard.craudiovizai.com
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# Stripe (production keys)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal (production)
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=live

# Application
NODE_ENV=production
APP_BASE_URL=https://dashboard.craudiovizai.com
```

---

## 🔧 Maintenance

### Updating the Application

```bash
cd /var/www/crav-dashboard
sudo git pull
sudo npm install
sudo npm run build
sudo pm2 restart crav-dashboard
```

### Monitoring

```bash
# View logs
pm2 logs crav-dashboard

# Monitor resources
pm2 monit

# Process status
pm2 status
```

### Database Backups

```bash
# Backup PostgreSQL
pg_dump -U crav crav_unified > backup_$(date +%Y%m%d).sql

# Restore
psql -U crav crav_unified < backup_20250101.sql
```

---

## 🐛 Troubleshooting

### Application won't start

```bash
# Check logs
pm2 logs crav-dashboard --lines 100

# Check environment
cat .env

# Verify dependencies
npm install

# Rebuild
npm run build
```

### Database connection issues

```bash
# Test PostgreSQL connection
psql -U crav -d crav_unified -h localhost

# Check Prisma client
npm run db:generate

# Verify DATABASE_URL in .env
```

### Nginx errors

```bash
# Test configuration
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

---

## 📊 Performance Optimization

### Enable Caching

Add to Nginx config:

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_credit_transactions_wallet_created ON credit_transactions(wallet_id, created_at DESC);
CREATE INDEX idx_app_installs_org ON app_installs(org_id);
CREATE INDEX idx_memberships_org_user ON memberships(org_id, user_id);
```

---

## 🔒 Security Checklist

- [ ] Use HTTPS with valid SSL certificate
- [ ] Set secure environment variables
- [ ] Configure firewall (UFW)
- [ ] Enable fail2ban
- [ ] Regular security updates
- [ ] Database backups automated
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] CSP headers set
- [ ] Audit logs monitored

---

## 📈 Scaling

### Horizontal Scaling

Use a load balancer (Nginx, HAProxy, or cloud LB) with multiple app instances:

```bash
# Start multiple instances
pm2 start npm --name "crav-dashboard-1" -i 4 -- run preview -- --port 3001
pm2 start npm --name "crav-dashboard-2" -i 4 -- run preview -- --port 3002
```

### Database Scaling

- Use connection pooling (PgBouncer)
- Read replicas for heavy read workloads
- Consider PostgreSQL partitioning for large tables

---

## ✅ Post-Deployment

1. Verify all pages load correctly
2. Test app installation and gameplay
3. Verify credits deduct properly
4. Check responsive design on mobile
5. Test all navigation links
6. Monitor error logs for 24 hours
7. Set up uptime monitoring (UptimeRobot, Pingdom)
8. Configure alerts for errors

---

## 📞 Support

For deployment issues:
- Check logs: `pm2 logs`
- Review nginx logs: `/var/log/nginx/error.log`
- Verify environment variables
- Contact CRAV development team

---

**Note**: The current implementation uses mock authentication and in-memory credit tracking. For production, integrate real authentication (NextAuth) and connect to the Prisma database for persistent data.
