# CE Empire — Landing & Demo Command Center (Local patch)

## สรุป
- ไฟล์ชุดนี้เป็นตัวอย่าง landing page แบบ "luxury fintech / private banking command center" พร้อมระบบล็อกอิน client-side ที่ยอมรับเฉพาะ:
  - Username: `BOSS`
  - Password: `Qw114477`
- Chime จะเล่นครั้งเดียวหลัง interaction แรก (pointerdown/click/touch)
- วางไฟล์เหล่านี้ลงในโฟลเดอร์: `dist/`

## รายการไฟล์
- `dist/index.html` — landing page (แทนหน้าเดิมชั่วคราว)
- `dist/assets/css/landing.css` — สไตล์หน้า landing / dashboard แสดงตัวอย่าง
- `dist/assets/js/chime.js` — เล่น chime ครั้งเดียวหลัง gesture แรก
- `dist/assets/js/live-counters.js` — animate counters
- `dist/assets/js/login.js` — ตรวจ credential (เฉพาะ BOSS)
- `dist/dashboard.html` — หน้า command center ตัวอย่าง
- `README-LANDING-UPDATE.md` — ไฟล์นี้

## การเตรียมไฟล์เสียง (สำคัญ)
- วางไฟล์ chime ที่ชื่อ `premium-chime.mp3` ที่ path:
  `dist/assets/sounds/premium-chime.mp3`
- คุณสามารถใช้ไฟล์เสียง chime สั้น ๆ จาก resource ของคุณเอง หรือดาวน์โหลด audio เสียงชิมที่อนุญาตใช้

## วิธีทดสอบ (ขั้นตอนแนะนำ)
1. รันเว็บเซิร์ฟเวอร์แบบง่าย (แนะนำ):
   - Python 3: `cd dist` then `python -m http.server 8000`
   - จากนั้นเปิดเบราเซอร์ที่ http://localhost:8000
2. ทดสอบตาม Test Plan:
   - หน้า landing ดูโทนสีและ layout (matte black, graphite, chrome silver, gold accent)
   - คลิก `ENTER COMMAND CENTER` จะไปหน้า dashboard
   - ตรวจ login box ด้านขวาล่าง — ใส่ BOSS/Qw114477 ต้องเข้าได้
   - ทดสอบ username/password อื่น ๆ ต้องเข้าไม่ได้
   - การคลิกหน้าแรกจะทำให้เสียง chime เล่นครั้งเดียว (ต้องวางไฟล์เสียงก่อน)
   - ตรวจ mobile/desktop responsiveness

## คำเตือนด้านความปลอดภัย
- โค้ดนี้เก็บรหัสผ่านใน client-side (JS) เพื่อวัตถุประสงค์การแสดงตัวอย่าง / local demo เท่านั้น — หากระบบจะใช้งานจริงบนอินเทอร์เน็ต ต้องย้ายการตรวจสอบไปรันที่ฝั่งเซิร์ฟเวอร์ (hash รหัสผ่าน เช่น bcrypt/argon2 และส่ง session cookie หรือ token)
- อย่าเก็บรหัสผ่าน plaintext ใน repo สาธารณะ

## สถานะ commit
สร้าง PR จาก branch `landing-ux-update` — ตรวจสอบไฟล์ และ approve เพื่อ merge ลงใน main
