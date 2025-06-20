# 🚀 Deployment Guide

## Overview

This guide covers deploying the badminton booking system across different environments.

## 📋 Prerequisites

- Node.js 16+ 
- GitHub account
- Loga.app credentials
- Domain/hosting (for UI deployment)

## 🔧 Environment Setup

### 1. GitHub Repository

```bash
# Create new repository
gh repo create badminton-booking --public
# or use GitHub web interface

# Push code
git remote add origin https://github.com/username/badminton-booking.git
git push -u origin main
```

### 2. GitHub Secrets

Navigate to **Settings → Secrets and variables → Actions**

Add these secrets:

| Secret | Description | Example |
|--------|-------------|---------|
| `TOKEN` | Loga.app auth token | `abc123xyz...` |
| `DEVICE_ID` | Your device identifier | `device_12345` |
| `CARD_ID` | Membership card ID | `6364` |
| `SLOT_ID` | Venue slot ID | `12489` |
| `CONTACT` | Phone number | `0812345678` |

### 3. GitHub Token (for UI)

Create personal access token:
1. **Settings → Developer settings → Personal access tokens**
2. **Generate new token (classic)**
3. **Scopes**: `repo`, `workflow`
4. Copy token for UI configuration

## 🤖 GitHub Actions Deployment

### Automatic Setup

GitHub Actions are pre-configured and will:
- Run automatically on scheduled days
- Execute booking script with your secrets
- Log results in Actions tab

### Manual Triggers

```bash
# Via GitHub CLI
gh workflow run booking.yml

# Via API
curl -X POST \
  -H "Authorization: token YOUR_TOKEN" \
  -H "Accept: application/vnd.github.v3" \
  https://api.github.com/repos/USERNAME/REPO/actions/workflows/booking.yml/dispatches \
  -d '{"ref":"main"}'
```

### Workflow Status

Monitor at: `https://github.com/USERNAME/REPO/actions`

## 🌐 UI Deployment

### Option 1: GitHub Pages

**Setup:**
```bash
cd ui
npm run build
```

**Deploy via Actions:**

Create `.github/workflows/deploy-ui.yml`:
```yaml
name: Deploy UI
on:
  push:
    branches: [main]
    paths: ['ui/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '16'
      - run: cd ui && npm ci && npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./ui/dist
```

**Access:** `https://username.github.io/badminton-booking`

### Option 2: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
cd ui
npm run build
netlify deploy --prod --dir=dist
```

### Option 3: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd ui
vercel --prod
```

### Option 4: Self-hosted

```bash
# Build
cd ui
npm run build

# Serve with nginx
sudo cp -r dist/* /var/www/html/badminton-booking/

# Nginx config
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html/badminton-booking;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 🐳 Docker Deployment

### Dockerfile (UI)

```dockerfile
FROM node:16-alpine as builder
WORKDIR /app
COPY ui/package*.json ./
RUN npm ci
COPY ui/ .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  ui:
    build: .
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production
```

### Deploy

```bash
docker-compose up -d
```

## ☁️ Cloud Deployment

### AWS (S3 + CloudFront)

```bash
# Build
cd ui && npm run build

# Deploy to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

### Google Cloud (Firebase)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize
firebase init hosting

# Deploy
cd ui
npm run build
firebase deploy
```

## 🔄 CI/CD Pipeline

### Complete Workflow

```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci && npm test
      
  build-ui:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd ui && npm ci && npm run build
      - uses: actions/upload-artifact@v3
        with:
          name: ui-build
          path: ui/dist
          
  deploy:
    needs: build-ui
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/download-artifact@v3
      - name: Deploy to production
        run: echo "Deploy to your hosting service"
```

## 📊 Monitoring

### Health Checks

```bash
# Check booking script
node booking-script.js --dry-run

# Check UI build
cd ui && npm run build

# Check GitHub Actions
gh run list --workflow=booking.yml
```

### Logging

```javascript
// Add to booking-script.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'booking.log' })
  ]
});
```

## 🔒 Security Checklist

- ✅ Environment variables in GitHub Secrets
- ✅ No credentials in source code
- ✅ GitHub token with minimal permissions
- ✅ HTTPS for UI deployment
- ✅ Regular token rotation
- ✅ Repository access controls

## 🐛 Troubleshooting

### Common Issues

**GitHub Actions not running:**
```bash
# Check workflow syntax
gh workflow view booking.yml

# Check repository settings
# Settings → Actions → General → Allow all actions
```

**UI deployment fails:**
```bash
# Check build locally
cd ui
npm run build
npm run serve

# Check environment variables
echo $VITE_API_URL
```

**Booking script errors:**
```bash
# Test with debug
DEBUG=* node booking-script.js

# Check API connectivity
curl -X POST https://www.loga.app/privateapi/booking/create_appointment
```

## 📈 Scaling

### Multiple Venues

```json
// booking-config.json
{
  "venues": [
    {
      "name": "Venue A",
      "slot_id": 12489,
      "autobookDays": [1, 3, 5]
    },
    {
      "name": "Venue B", 
      "slot_id": 12490,
      "autobookDays": [2, 4]
    }
  ]
}
```

### Load Balancing

```yaml
# docker-compose.yml
services:
  ui:
    image: badminton-ui
    deploy:
      replicas: 3
  
  nginx:
    image: nginx
    ports:
      - "80:80"
    depends_on:
      - ui
```

## 🔄 Updates

### Automated Updates

```yaml
# .github/workflows/update.yml
name: Auto Update
on:
  schedule:
    - cron: '0 2 * * 0'  # Weekly

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm update
      - run: cd ui && npm update
      - name: Create PR
        uses: peter-evans/create-pull-request@v5
```

### Manual Updates

```bash
# Update dependencies
npm update
cd ui && npm update

# Test
npm test
cd ui && npm run build

# Deploy
git add . && git commit -m "Update dependencies"
git push
```

## 📞 Support

- **GitHub Issues**: Report bugs and feature requests
- **Actions Logs**: Check workflow execution details
- **API Logs**: Monitor booking success/failure rates
- **UI Console**: Check browser developer tools for errors