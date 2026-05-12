# 📦 GymBro Project

Fullstack app (React + Vite + Node.js + PostgreSQL) ใช้ Docker สำหรับ
development

------------------------------------------------------------------------

## 🚀 วิธีเริ่มต้น (สำหรับคนมาทำต่อ)

### 1. Clone โปรเจกต์

git clone `<repo-url>`{=html} cd `<project-folder>`{=html}

------------------------------------------------------------------------

### 2. สร้างไฟล์ `.env`


------------------------------------------------------------------------

### 3. รัน Docker
docker-compose --build
(ถ้า error ลบ folder node_modules ออกจาก server, client)

คำสั่งเพิ่มเติม
docker-compose up = Starts everything (locks up your terminal).

docker-compose up -d = Starts everything in the background (frees your terminal).

docker-compose down = Turns everything off (saves your data).

docker-compose down -v = Turns everything off and deletes your database memory.

------------------------------------------------------------------------

## 🌐 URL

Frontend: http://localhost:5173
Backend: http://localhost:5000
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

เข้า http://localhost:5173
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
-   run in adminer if key duplicate error
SELECT setval(pg_get_serial_sequence('subscription_line_item', 'id'),
              COALESCE((SELECT MAX(id) FROM subscription_line_item), 1));

SELECT setval(pg_get_serial_sequence('merchandise_line_item', 'id'),
              COALESCE((SELECT MAX(id) FROM merchandise_line_item), 1));

SELECT setval(pg_get_serial_sequence('expense_line_item', 'id'),
              COALESCE((SELECT MAX(id) FROM expense_line_item), 1));

SELECT setval(pg_get_serial_sequence('training_session', 'id'),
              COALESCE((SELECT MAX(id) FROM training_session), 1));

SELECT setval(pg_get_serial_sequence('member', 'id'),
              COALESCE((SELECT MAX(id) FROM member), 1));

SELECT setval(pg_get_serial_sequence('product_category', 'id'),
              COALESCE((SELECT MAX(id) FROM product_category), 1));

SELECT setval(pg_get_serial_sequence('product', 'id'),
              COALESCE((SELECT MAX(id) FROM product), 1));
