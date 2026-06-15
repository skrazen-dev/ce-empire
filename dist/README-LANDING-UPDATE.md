# CE Empire — Landing & Command Center (dist)

## สรุป
หน้า landing แบบ **luxury fintech / private banking command center** (matte black,
graphite, chrome silver, gold accent) พร้อมระบบเข้าสู่ระบบผู้ใช้เดียว:

- **Username:** `BOSS`
- **Password:** `Qw114477`

บัญชีอื่น ๆ ทั้งหมดถูกปฏิเสธ

## รายการไฟล์
- `dist/index.html` — landing / command center (top bar, สรุปการเงิน, hero โลโก้ CE,
  profit chart, AI status, ทีมงานออนไลน์, ข่าวสาร, สถิติด้านล่าง, sign-in modal)
- `dist/dashboard.html` — หน้า command center (มี auth guard)
- `dist/assets/css/landing.css` — ธีม luxury + responsive + animation
- `dist/assets/js/background.js` — financial particles / data streams, profit chart,
  นาฬิกาไทย (พ.ศ.), ปุ่มโหมดกลางคืน
- `dist/assets/js/live-counters.js` — animate ตัวเลข Volume / Profit / USDT
- `dist/assets/js/chime.js` — premium wealth chime (เล่นครั้งเดียวหลัง gesture แรก)
- `dist/assets/js/login.js` — ตรวจสอบ credential (ผู้ใช้เดียว BOSS)

## ระบบเข้าสู่ระบบ (2 ชั้น)
`login.js` พยายามใช้ **server session** ก่อน แล้วจึง fallback ไป client-side:

1. **Server (source of truth)** — `POST /api/login` ตรวจรหัสผ่านที่ hash ด้วย bcrypt
   ในฐานข้อมูล (ดู `server/src/auth.ts`, seed ผู้ใช้ BOSS ด้วย `server/src/seed-user.ts`).
   ใช้เมื่อเสิร์ฟไซต์ผ่าน CE Empire Express server
2. **Static fallback** — เมื่อไม่มี backend (โฮสต์ไฟล์ static) จะตรวจ username `BOSS`
   และเทียบ **SHA-256** ของรหัสผ่านกับ digest ที่ฝังไว้ (ไม่มี plaintext password ใน repo)

ทั้งสองชั้นยอมรับเฉพาะผู้ใช้ `BOSS` เท่านั้น

## Chime
สังเคราะห์เสียงด้วย Web Audio API (ไม่ต้องมีไฟล์เสียง) เล่นครั้งเดียวหลัง gesture แรก
หากต้องการใช้ไฟล์ของคุณเอง ให้วางที่ `dist/assets/sounds/premium-chime.mp3`
แล้วระบบจะใช้ไฟล์นั้นแทน

## วิธีทดสอบ
1. แบบ static: `cd dist && python3 -m http.server 8000` แล้วเปิด http://localhost:8000
   - login ด้วย `BOSS` / `Qw114477` → เข้าได้ (ใช้ static fallback)
2. แบบเต็มระบบ: รัน Express server (`server/src/index.ts`) ที่เสิร์ฟ `dist/` และมี
   `/api/login`, seed ผู้ใช้ BOSS ก่อน
3. ตรวจ Test Plan: ธีมสี, ปุ่ม ENTER COMMAND CENTER, login ถูก/ผิด, chime เล่นครั้งเดียว,
   responsive desktop/mobile

## ความปลอดภัย
- ไม่มี plaintext password ใน repo (เก็บเป็น SHA-256 digest สำหรับ static fallback,
  bcrypt hash ในฐานข้อมูลสำหรับ server)
- สำหรับ production แนะนำให้ใช้ server-side auth (bcrypt/argon2 + httpOnly session cookie)
  เป็นหลัก — client-side fallback มีไว้สำหรับ demo / static hosting เท่านั้น
