# Docker Deployment Guide

## Local Development With Docker

กรณีต้องการให้ web และ Supabase รันบน Docker ในเครื่องเดียวกัน:

```bash
npm run supabase:start
npm run supabase:status
```

จากนั้นคัดลอก `.env.local.example` เป็น `.env.local` แล้วใส่ค่า:

- `NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` จากผลลัพธ์ของ `npm run supabase:status`

เริ่ม web container:

```bash
docker compose --env-file .env.local -f docker-compose.dev.yml up --build
```

หยุดการทำงาน:

```bash
docker compose -f docker-compose.dev.yml down
npm run supabase:stop
```

## 🚀 Production Deployment

ก่อนเริ่ม ให้เตรียมไฟล์ environment:

```bash
cp .env.production.example .env.production
```

จากนั้นกรอกค่าเหล่านี้ใน `.env.production`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

ข้อสำคัญ:

- `NEXT_PUBLIC_SUPABASE_URL` ต้องเป็น URL ที่ browser ของผู้ใช้งานเข้าถึงได้จริง
- ห้ามใช้ `http://127.0.0.1:54321` หรือ `http://localhost:54321` สำหรับ production web app
- ถ้า app และ Supabase อยู่เครื่องเดียวกัน ก็ยังต้อง publish Supabase ออกผ่าน hostname หรือ reverse proxy เช่น `https://supabase.example.com`

## Supabase Self-Hosted Checklist

ถ้าจะย้าย Supabase local stack ขึ้น server จริงด้วย ให้ตรวจอย่างน้อย 3 จุดนี้:

1. เปิด public endpoint ของ Supabase API/Auth ให้เข้าถึงได้จาก browser ภายนอก
2. ตั้งค่า `site_url` และ `additional_redirect_urls` ใน `supabase/config.toml` หรือ config production ของ Supabase ให้ชี้ไปยังโดเมนจริงของเว็บ ไม่ใช่ `127.0.0.1`
3. ใช้ anon key ของ environment นั้นจริง และอย่าใช้ค่า local เดิมข้ามเครื่องโดยไม่ตรวจ endpoint ใหม่

ตัวอย่าง production values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://supabase.example.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
```

สำหรับ local development ค่าใน `supabase/config.toml` ที่เป็น `127.0.0.1` ยังใช้ได้ตามปกติ แต่ไม่ควรถูกนำไปใช้ตรง ๆ กับ production frontend

### ตัวเลือก 1: Simple Production (Port 80)
```bash
# Build and run
docker compose --env-file .env.production up --build -d

# Check logs
docker compose logs -f app

# Stop
docker compose down
```

**ที่อยู่:** `http://localhost`

---

### ตัวเลือก 2: Production with Nginx Reverse Proxy (แนะนำ)
```bash
# Run with nginx
docker compose --env-file .env.production -f docker-compose.prod.yml up --build -d

# Check logs
docker compose -f docker-compose.prod.yml logs -f

# Stop
docker compose -f docker-compose.prod.yml down
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
docker compose logs app

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
| `.env.production.example` | Template ของ production environment variables |
| `.env.production` | ค่าจริงสำหรับ production environment |

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
docker compose down -v

# Rebuild without cache
docker compose build --no-cache

# Run specific service
docker compose up app

# Execute command in container
docker exec library-ai-lab-app npm run build
```
