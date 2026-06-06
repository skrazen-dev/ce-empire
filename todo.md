
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
