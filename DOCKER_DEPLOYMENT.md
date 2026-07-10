# Docker Deployment Guide

## 🚀 Production Deployment

### ตัวเลือก 1: Simple Production (Port 80)
```bash
# Build and run
docker-compose up --build -d

# Check logs
docker-compose logs -f app

# Stop
docker-compose down
```

**ที่อยู่:** `http://localhost`

---

### ตัวเลือก 2: Production with Nginx Reverse Proxy (แนะนำ)
```bash
# Run with nginx
docker-compose -f docker-compose.prod.yml up --build -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop
docker-compose -f docker-compose.prod.yml down
```

**ที่อยู่:** `http://localhost`

**ประโยชน์:**
- ✅ Reverse proxy ด้วย Nginx
- ✅ Load balancing ready
- ✅ Security headers
- ✅ Gzip compression
- ✅ Health check
- ✅ Logging

---

## 📊 Health Check

```bash
# Test health
curl http://localhost/healthz

# Response: healthy
```

---

## 🔍 ตรวจสอบสถานะ

```bash
# ดู logs
docker-compose logs app

# ตรวจสอบ resources
docker stats

# ดู running containers
docker ps
```

---

## 📝 Configuration Files

| ไฟล์ | วัตถุประสงค์ |
|-----|-----------|
| `Dockerfile` | Build image สำหรับ Next.js |
| `docker-compose.yml` | Simple production setup |
| `docker-compose.prod.yml` | Production with Nginx |
| `nginx.conf` | Nginx reverse proxy config |
| `.env.production` | Production environment variables |

---

## 🔐 Security Features

- ✅ Non-root user (nextjs)
- ✅ Health checks
- ✅ Security headers (X-Frame-Options, CSP)
- ✅ Resource limits (CPU, Memory)
- ✅ Gzip compression
- ✅ HTTPS ready (สามารถเพิ่มได้ด้วย SSL certificate)

---

## 📦 Resource Limits

```yaml
limits:
  cpus: '1'        # Max 1 CPU core
  memory: 1G       # Max 1GB RAM
reservations:
  cpus: '0.5'      # Reserved 0.5 CPU
  memory: 512M     # Reserved 512MB RAM
```

---

## 🌐 Adding SSL/HTTPS (Optional)

สำหรับ HTTPS จำเป็นต้องมี:
1. SSL certificate
2. Update nginx.conf
3. Port 443 ใน docker-compose

---

## 📈 Scaling

ในอนาคต สามารถเพิ่ม multiple app instances:

```yaml
app:
  deploy:
    replicas: 3  # 3 instances
```

---

## 🛠️ Troubleshooting

```bash
# Clear everything
docker-compose down -v

# Rebuild without cache
docker-compose build --no-cache

# Run specific service
docker-compose up app

# Execute command in container
docker exec library-ai-lab-app npm run build
```
