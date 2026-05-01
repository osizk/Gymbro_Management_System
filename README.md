# 📦 GymBro Project

Fullstack app (React + Vite + Node.js + PostgreSQL) ใช้ Docker สำหรับ
development

------------------------------------------------------------------------

## 🚀 วิธีเริ่มต้น (สำหรับคนมาทำต่อ)

### 1. Clone โปรเจกต์

git clone `<repo-url>`{=html} cd `<project-folder>`{=html}

------------------------------------------------------------------------

### 2. สร้างไฟล์ `.env`

DB_HOST=db DB_PORT=5432 DB_USER=postgres DB_PASSWORD=postgres
DB_NAME=gymbro

------------------------------------------------------------------------

### 3. รัน Docker

docker compose down -v docker compose up --build

------------------------------------------------------------------------

## 🌐 URL

Frontend: http://localhost:5173\
Backend: http://localhost:5000\
Test API: http://localhost:5000/api/v1/test

------------------------------------------------------------------------

## 🛠️ โครงสร้าง

frontend/ → React (Vite)\
backend/ → Node.js\
db/ → PostgreSQL

------------------------------------------------------------------------

## 🔄 การพัฒนา

docker compose up

-   Frontend auto reload
-   Backend ใช้ nodemon auto restart

------------------------------------------------------------------------

## 🧪 ทดสอบระบบ

เข้า http://localhost:5173\
ควรเห็น API Status และ Database Time

------------------------------------------------------------------------

## 🐛 ปัญหาที่เจอบ่อย

### Frontend ขึ้น Waiting

-   เช็ค vite proxy
-   หรือใช้ http://backend:5000

### Backend ต่อ DB ไม่ได้

docker compose down -v docker compose up

### node_modules พัง

rm -rf node_modules package-lock.json npm install

### Vite error

ใช้ node:20-slim แทน alpine

------------------------------------------------------------------------

## 💡 Tips

-   ใช้ service name เช่น backend, db แทน localhost
-   ถ้าพัง ลอง down -v แล้ว up ใหม่
