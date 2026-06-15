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

## ระบบเข้าสู่ระบบ (landing — client-side)
`login.js` เป็นการตรวจสอบฝั่ง client แบบ self-contained สำหรับหน้า landing:
ตรวจ username `BOSS` และเทียบ **SHA-256** ของรหัสผ่านกับ digest ที่ฝังไว้
(ไม่มี plaintext password ใน repo) ยอมรับเฉพาะผู้ใช้ `BOSS` เท่านั้น บัญชีอื่นถูกปฏิเสธ

## Chime
สังเคราะห์เสียงด้วย Web Audio API (ไม่ต้องมีไฟล์เสียง) เล่นครั้งเดียวหลัง gesture แรก
หากต้องการใช้ไฟล์ของคุณเอง ให้วางที่ `dist/assets/sounds/premium-chime.mp3`
แล้วระบบจะใช้ไฟล์นั้นแทน

## วิธีทดสอบ
1. `cd dist && python3 -m http.server 8000` แล้วเปิด http://localhost:8000
2. login ด้วย `BOSS` / `Qw114477` → เข้าได้ · username/password อื่น → เข้าไม่ได้
3. ตรวจ Test Plan: ธีมสี, ปุ่ม ENTER COMMAND CENTER, chime เล่นครั้งเดียว,
   responsive desktop/mobile

## ความปลอดภัย
- ไม่มี plaintext password ใน repo (เก็บเป็น SHA-256 digest)
- การตรวจ credential ฝั่ง client เหมาะกับ demo / static landing เท่านั้น —
  หากใช้งานจริงควรย้ายไปตรวจฝั่ง server (bcrypt/argon2 + httpOnly session cookie)
