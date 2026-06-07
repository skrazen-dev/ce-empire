import {
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Accounts (บัญชีธนาคาร) ────────────────────────────────────────────────────
export const accounts = mysqlTable("accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  bankCode: varchar("bankCode", { length: 20 }).notNull(),
  bankName: varchar("bankName", { length: 100 }).notNull(),
  accountName: varchar("accountName", { length: 200 }).notNull(),
  accountNumber: varchar("accountNumber", { length: 50 }).notNull(),
  balance: decimal("balance", { precision: 15, scale: 2 }).default("0.00").notNull(),
  note: text("note"),
  isActive: mysqlEnum("isActive", ["yes", "no"]).default("yes").notNull(),
  profilePhotoUrl: text("profilePhotoUrl"),
  idCardNumber: varchar("idCardNumber", { length: 50 }),
  idCardPhotoUrl: text("idCardPhotoUrl"),
  dateOfBirth: timestamp("dateOfBirth"),
  virtualCardNumber: varchar("virtualCardNumber", { length: 100 }),
  cardCVV: varchar("cardCVV", { length: 10 }),
  cardExpiryDate: varchar("cardExpiryDate", { length: 10 }),
  accountEmail: varchar("accountEmail", { length: 320 }),
  accountPassword: varchar("accountPassword", { length: 255 }),
  accountType: mysqlEnum("accountType", ["complete", "skrill", "neteller", "bigpay"]),
  accountStatus: varchar("accountStatus", { length: 50 }),
  creditLimit: mysqlEnum("creditLimit", ["50k", "200k", "500k"]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Account = typeof accounts.$inferSelect;
export type InsertAccount = typeof accounts.$inferInsert;

// ─── Agents (ตัวแทน) ────────────────────────────────────────────────────────────
export const agents = mysqlTable("agents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  lineId: varchar("lineId", { length: 100 }),
  note: text("note"),
  isActive: mysqlEnum("isActive", ["yes", "no"]).default("yes").notNull(),
  withdrawAmount: decimal("withdrawAmount", { precision: 15, scale: 2 }).default("0.00"),
  pendingAmount: decimal("pendingAmount", { precision: 15, scale: 2 }).default("0.00"),
  startDate: timestamp("startDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

// ─── Expenses (ค่าใช้จ่าย) ──────────────────────────────────────────────────────
export const expenses = mysqlTable("expenses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  accountId: int("accountId"),
  agentId: int("agentId"),
  title: varchar("title", { length: 300 }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  category: varchar("category", { length: 100 }),
  status: mysqlEnum("status", ["pending", "paid", "cancelled"]).default("pending").notNull(),
  proofUrl: text("proofUrl"),
  proofKey: text("proofKey"),
  expenseDate: timestamp("expenseDate"),
  dueDate: timestamp("dueDate"),
  paidAt: timestamp("paidAt"),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;

// ─── USDT Calculations (ประวัติการคำนวณ) ────────────────────────────────────────
export const usdtCalculations = mysqlTable("usdt_calculations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  buyAmountThb: decimal("buyAmountThb", { precision: 15, scale: 2 }).notNull(),
  usdtReceived: decimal("usdtReceived", { precision: 15, scale: 4 }).notNull(),
  sellRate: decimal("sellRate", { precision: 10, scale: 4 }).notNull(),
  costPerUsdt: decimal("costPerUsdt", { precision: 10, scale: 4 }).notNull(),
  sellAmountThb: decimal("sellAmountThb", { precision: 15, scale: 2 }).notNull(),
  profitThb: decimal("profitThb", { precision: 15, scale: 2 }).notNull(),
  profitPercent: decimal("profitPercent", { precision: 8, scale: 4 }).notNull(),
  isProfit: mysqlEnum("isProfit", ["yes", "no"]).notNull(),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UsdtCalculation = typeof usdtCalculations.$inferSelect;
export type InsertUsdtCalculation = typeof usdtCalculations.$inferInsert;

// ─── Settings (การตั้งค่า) ───────────────────────────────────────────────────────
export const settings = mysqlTable("settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  telegramBotToken: text("telegramBotToken"),
  telegramChatId: varchar("telegramChatId", { length: 100 }),
  telegramEnabled: mysqlEnum("telegramEnabled", ["yes", "no"]).default("no").notNull(),
  notifyThreshold: decimal("notifyThreshold", { precision: 5, scale: 2 }).default("5.00"),
  soundEnabled: mysqlEnum("soundEnabled", ["yes", "no"]).default("yes").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = typeof settings.$inferInsert;

// ─── Account Orders (ออเดอร์/ยอดที่รับเข้าบัญชี) ────────────────────────────────
export const accountOrders = mysqlTable("account_orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  accountId: int("accountId").notNull(),
  orderAmount: decimal("orderAmount", { precision: 15, scale: 2 }).notNull(),
  scheduledAt: timestamp("scheduledAt").notNull(),
  completedAt: timestamp("completedAt"),
  status: mysqlEnum("status", ["pending", "completed", "cancelled"]).default("pending").notNull(),
  telegramGroup: varchar("telegramGroup", { length: 200 }),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AccountOrder = typeof accountOrders.$inferSelect;
export type InsertAccountOrder = typeof accountOrders.$inferInsert;

// ─── Risk Alerts (บันทึกการแจ้งเตือนความเสี่ยง) ───────────────────────────────
export const riskAlerts = mysqlTable("risk_alerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  accountId: int("accountId").notNull(),
  riskLevel: mysqlEnum("riskLevel", ["low", "medium", "high", "critical"]).notNull(),
  riskType: varchar("riskType", { length: 100 }).notNull(),
  message: text("message").notNull(),
  details: text("details"),
  isRead: mysqlEnum("isRead", ["yes", "no"]).default("no").notNull(),
  telegramSent: mysqlEnum("telegramSent", ["yes", "no"]).default("no").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RiskAlert = typeof riskAlerts.$inferSelect;
export type InsertRiskAlert = typeof riskAlerts.$inferInsert;

// ─── Pinned Accounts (บัญชีปักหมุดในกลุ่ม) ─────────────────────────────────────
export const pinnedAccounts = mysqlTable("pinned_accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  accountId: int("accountId").notNull(),
  telegramGroup: varchar("telegramGroup", { length: 200 }).notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  receivedAmount: decimal("receivedAmount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  note: text("note"),
  isActive: mysqlEnum("isActive", ["yes", "no"]).default("yes").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PinnedAccount = typeof pinnedAccounts.$inferSelect;
export type InsertPinnedAccount = typeof pinnedAccounts.$inferInsert;

// ─── Deposit Slips (สลิปเงินบาทที่อัพ) ──────────────────────────────────────────
export const depositSlips = mysqlTable("deposit_slips", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  accountId: int("accountId"),
  slipImageUrl: text("slipImageUrl").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  slipDate: timestamp("slipDate").notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "verified", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DepositSlip = typeof depositSlips.$inferSelect;
export type InsertDepositSlip = typeof depositSlips.$inferInsert;

// ─── USDT Uploads (ยอด USDT ที่อัพ) ────────────────────────────────────────────
export const usdtUploads = mysqlTable("usdt_uploads", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  usdtAmount: decimal("usdtAmount", { precision: 15, scale: 4 }).notNull(),
  thbRate: decimal("thbRate", { precision: 8, scale: 2 }).notNull(),
  thbEquivalent: decimal("thbEquivalent", { precision: 15, scale: 2 }).notNull(),
  description: text("description"),
  uploadDate: timestamp("uploadDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UsdtUpload = typeof usdtUploads.$inferSelect;
export type InsertUsdtUpload = typeof usdtUploads.$inferInsert;

// ─── Profit Records (บันทึกกำไร) ──────────────────────────────────────────────
export const profitRecords = mysqlTable("profit_records", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  profitThb: decimal("profitThb", { precision: 15, scale: 2 }).notNull(),
  profitPercent: decimal("profitPercent", { precision: 8, scale: 4 }).notNull(),
  source: varchar("source", { length: 100 }).notNull(), // 'deposit', 'usdt', 'trading', etc.
  description: text("description"),
  recordDate: timestamp("recordDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProfitRecord = typeof profitRecords.$inferSelect;
export type InsertProfitRecord = typeof profitRecords.$inferInsert;

// ─── Projects (โปรเจกต์) ─────────────────────────────────────────────────────
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["active", "archived", "completed"]).default("active").notNull(),
  color: varchar("color", { length: 7 }).default("#00d4ff").notNull(), // Hex color
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

// ─── Tasks (งาน) ──────────────────────────────────────────────────────────────
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["todo", "in_progress", "done"]).default("todo").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  dueDate: timestamp("dueDate"),
  assignedTo: int("assignedTo"), // User ID
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

// ─── Team Members (สมาชิกทีม) ────────────────────────────────────────────────
export const teamMembers = mysqlTable("team_members", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId").notNull(),
  memberId: int("memberId").notNull(), // User ID of team member
  role: mysqlEnum("role", ["owner", "lead", "member", "viewer"]).default("member").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;

// ─── Task Assignments (การมอบหมายงาน) ──────────────────────────────────────
export const taskAssignments = mysqlTable("task_assignments", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("taskId").notNull(),
  assignedToUserId: int("assignedToUserId").notNull(),
  assignedByUserId: int("assignedByUserId").notNull(),
  assignedAt: timestamp("assignedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type TaskAssignment = typeof taskAssignments.$inferSelect;
export type InsertTaskAssignment = typeof taskAssignments.$inferInsert;
