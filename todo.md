
## Grok AI Integration
- [x] ตั้งค่า XAI_API_KEY secret
- [x] สร้าง server/routers/grok.ts - tRPC router สำหรับ Grok chat + risk analysis
- [x] สร้าง GrokChatPanel.tsx - AI Chat UI ใน Dashboard
- [x] เชื่อ Grok กับ Risk Analysis page (วิเคราะห์ความเสี่ยงอัตโนมัติ)
- [x] ทดสอบ + Checkpoint

## Dashboard Charts (Deposits, USDT, Profit)
- [ ] ออกแบบ Schema: deposits_slips, usdt_uploads, profit_records tables
- [ ] สร้าง Backend: analytics.ts router (getDeposits, getUSDT, getProfitToday)
- [ ] สร้าง Frontend: Charts components (DepositChart, USDTChart, ProfitChart)
- [ ] เชื่อม Charts เข้า Dashboard page
- [ ] ทดสอบ + Checkpoint

## Task Management + Team Dashboard
- [ ] ออกแบบ Schema: projects, tasks, team_members, task_assignments tables
- [ ] สร้าง Backend: tasks.ts + team.ts routers
- [ ] สร้าง Frontend: KanbanBoard, TeamPanel, TaskDetailModal, Calendar components
- [ ] เชื่อม Task Management page เข้า Sidebar navigation
- [ ] ทดสอบ + Checkpoint

## Bank Account Extended Fields
- [x] เพิ่ม fields ใน accounts schema: profilePhoto, idCardNumber, dateOfBirth, virtualCardNumber, cardCVV, cardExpiry, accountEmail, accountPassword
- [x] อัปเดต Frontend: Account form + file upload สำหรับ profile photo + ID card
- [ ] อัปเดต Backend: accounts router + DB helpers + file upload
- [ ] เพิ่ม encryption สำหรับ sensitive data (card number, CVV, password)
- [ ] ทดสอบ + Checkpoint

## UI Refinement
- [x] ปรับแตง SummaryStatsCard: แสดงทั้งหมด + Edit/Copy buttons
- [x] ปรับแตง Agent cards: เพิ่มความกว้าง
- [x] เพิ่ม Slip upload ใน Expenses page
- [x] ลบ Grok chat เอาฟีเจอร์ที่มีประโยชน์มากกว่า
- [x] เชื่อ SummaryStatsCard ใน Dashboard
- [x] เชื่อ Slip upload backend

## Sidebar Restructure + Button Styling
- [x] รวมเมนูเป็นหมวดหมู่: Dashboard, Data Display, Tools, Settings
- [x] เพิ่มสีเฉพาะตัวให้แต่ละเมนู/หมวด
- [x] ปรับปุ่มให้เด่น ชัดเจน (ขนาด ขอบ เงา)
- [x] ทดสอบ Sidebar navigation
- [x] เพิ่ม Account Status section และ Copy buttons

## Agent Page Enhancement
- [x] เพิ่มฟิลด์ใน agents table: withdrawAmount, pendingAmount, startDate
- [x] อัปเดต Agent page: แสดง ยอดเบิก/ยอดค้าง/บัญชีรับผิดชอบ/วันเริ่มงาน
- [x] สร้าง Agent detail modal/card
- [x] เพิ่มแสดง บัญชีที่รับผิดชอบ (Linked Accounts)

## Accounts Page Enhancement
- [x] เพิ่มหมวด "Account Status" ใน Accounts page
- [x] เพิ่ม Checkbox: แอคตัดครบ/Skrill/Neteller/BigPay
- [x] เพิ่มตัวเลือกวงเงิน: 50k/200k/500k
- [x] อัปเดต accounts schema: accountType, accountStatus, creditLimit

## Expenses Page Enhancement
- [x] เพิ่มตัวเลือกวันที่ (date picker) ใน Expenses page
- [x] อัปเดต expenses schema: date field

## Testing & Checkpoint
- [x] ทดสอบทุกเมนู + ปุ่ม
- [x] เขียน Unit tests สำหรับ new features
- [x] Checkpoint

## Expenses Page Enhancement - Categories
- [x] เพิ่มหมวดหมู่ (Categories): นายหน้าเบิก, เด็กเบิก, ค่าข้าว, ค่าน้ำมัน/เดินทาง, ค่าธรรมเนียม, ค่าแรง
- [x] เพิ่มฟิลด์ผู้รับ (Recipient)
- [x] เพิ่มฟิลด์เวลา (Time)
- [x] เพิ่ม Checkbox ลงบัญชี (isRecorded)
- [x] แสดงหมวดหมู่ + ผู้รับ + เวลา + สถานะลงบัญชี ใน Expense card
