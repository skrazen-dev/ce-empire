/**
 * Supabase Query Helpers
 * Returns data in camelCase format matching the original Drizzle types.
 * This allows frontend code to work without any changes.
 */
import { supabaseAdmin } from "./supabase";
import { ENV } from "./_core/env";
import type {
  Account,
  Agent,
  Expense,
  UsdtCalculation,
  Settings,
  InsertUser,
  User,
} from "../drizzle/schema";

// ─── Mappers (snake_case → camelCase) ────────────────────────────────────────

function mapAccount(row: Record<string, unknown>): Account {
  return {
    id: row.id as number,
    userId: row.user_id as number,
    bankCode: row.bank_code as string,
    bankName: row.bank_name as string,
    accountName: row.account_name as string,
    accountNumber: row.account_number as string,
    balance: row.balance as string,
    note: (row.note as string | null) ?? null,
    isActive: (row.is_active as "yes" | "no") ?? "yes",
    profilePhotoUrl: (row.profile_photo_url as string | null) ?? null,
    idCardNumber: (row.id_card_number as string | null) ?? null,
    idCardPhotoUrl: (row.id_card_photo_url as string | null) ?? null,
    dateOfBirth: row.date_of_birth ? new Date(row.date_of_birth as string) : null,
    virtualCardNumber: (row.virtual_card_number as string | null) ?? null,
    cardCVV: (row.card_cvv as string | null) ?? null,
    cardExpiryDate: (row.card_expiry_date as string | null) ?? null,
    accountEmail: (row.account_email as string | null) ?? null,
    accountPassword: (row.account_password as string | null) ?? null,
    accountType: (row.account_type as "complete" | "skrill" | "neteller" | "bigpay" | null) ?? null,
    accountStatus: (row.account_status as string | null) ?? null,
    creditLimit: (row.credit_limit as "50k" | "200k" | "500k" | null) ?? null,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

function mapAgent(row: Record<string, unknown>): Agent {
  return {
    id: row.id as number,
    userId: row.user_id as number,
    name: row.name as string,
    phone: (row.phone as string | null) ?? null,
    lineId: (row.line_id as string | null) ?? null,
    note: (row.note as string | null) ?? null,
    isActive: (row.is_active as "yes" | "no") ?? "yes",
    withdrawAmount: (row.withdraw_amount as string | null) ?? "0.00",
    pendingAmount: (row.pending_amount as string | null) ?? "0.00",
    startDate: row.start_date ? new Date(row.start_date as string) : null,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

function mapExpense(row: Record<string, unknown>): Expense {
  return {
    id: row.id as number,
    userId: row.user_id as number,
    accountId: (row.account_id as number | null) ?? null,
    agentId: (row.agent_id as number | null) ?? null,
    title: row.title as string,
    amount: row.amount as string,
    category: (row.category as string | null) ?? null,
    status: (row.status as "pending" | "paid" | "cancelled") ?? "pending",
    proofUrl: (row.proof_url as string | null) ?? null,
    proofKey: (row.proof_key as string | null) ?? null,
    expenseDate: row.expense_date ? new Date(row.expense_date as string) : null,
    dueDate: row.due_date ? new Date(row.due_date as string) : null,
    paidAt: row.paid_at ? new Date(row.paid_at as string) : null,
    note: (row.note as string | null) ?? null,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

function mapUsdtCalc(row: Record<string, unknown>): UsdtCalculation {
  return {
    id: row.id as number,
    userId: row.user_id as number,
    buyAmountThb: row.buy_amount_thb as string,
    usdtReceived: row.usdt_received as string,
    sellRate: row.sell_rate as string,
    costPerUsdt: row.cost_per_usdt as string,
    sellAmountThb: row.sell_amount_thb as string,
    profitThb: row.profit_thb as string,
    profitPercent: row.profit_percent as string,
    isProfit: row.is_profit as "yes" | "no",
    note: (row.note as string | null) ?? null,
    createdAt: new Date(row.created_at as string),
  };
}

function mapSettings(row: Record<string, unknown>): Settings {
  return {
    id: row.id as number,
    userId: row.user_id as number,
    telegramBotToken: (row.telegram_bot_token as string | null) ?? null,
    telegramChatId: (row.telegram_chat_id as string | null) ?? null,
    telegramEnabled: (row.telegram_enabled as "yes" | "no") ?? "no",
    notifyThreshold: (row.notify_threshold as string | null) ?? "5.00",
    soundEnabled: (row.sound_enabled as "yes" | "no") ?? "yes",
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

function mapUser(row: Record<string, unknown>): User {
  return {
    id: row.id as number,
    openId: row.open_id as string,
    name: (row.name as string | null) ?? null,
    email: (row.email as string | null) ?? null,
    loginMethod: (row.login_method as string | null) ?? null,
    role: (row.role as "user" | "admin") ?? "user",
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
    lastSignedIn: new Date(row.last_signed_in as string),
  };
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUserSb(user: InsertUser): Promise<void> {
  const role = user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user");

  const { error } = await supabaseAdmin
    .from("users")
    .upsert(
      {
        open_id: user.openId,
        name: user.name ?? null,
        email: user.email ?? null,
        login_method: user.loginMethod ?? null,
        role,
        last_signed_in: (user.lastSignedIn ?? new Date()).toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "open_id" }
    );

  if (error) {
    console.error("[Supabase] upsertUser error:", error.message);
    throw new Error(error.message);
  }
}

export async function getUserByOpenIdSb(openId: string): Promise<User | undefined> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("open_id", openId)
    .limit(1)
    .single();

  if (error || !data) return undefined;
  return mapUser(data as Record<string, unknown>);
}

// ─── Accounts ─────────────────────────────────────────────────────────────────

export async function getAccountsSb(userId: number): Promise<Account[]> {
  const { data, error } = await supabaseAdmin
    .from("accounts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Supabase] getAccounts error:", error.message);
    return [];
  }
  return (data ?? []).map((row) => mapAccount(row as Record<string, unknown>));
}

export async function createAccountSb(data: {
  userId: number;
  bankCode: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  balance?: string;
  note?: string;
  isActive?: "yes" | "no";
}): Promise<Account> {
  const { data: inserted, error } = await supabaseAdmin
    .from("accounts")
    .insert({
      user_id: data.userId,
      bank_code: data.bankCode,
      bank_name: data.bankName,
      account_name: data.accountName,
      account_number: data.accountNumber,
      balance: data.balance ?? "0.00",
      note: data.note ?? null,
      is_active: data.isActive ?? "yes",
    })
    .select()
    .single();

  if (error || !inserted) throw new Error(error?.message ?? "Insert failed");
  return mapAccount(inserted as Record<string, unknown>);
}

export async function updateAccountSb(
  id: number,
  userId: number,
  data: Partial<{
    bankCode: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    balance: string;
    note: string | null;
    isActive: "yes" | "no";
    profilePhotoUrl: string | null;
    idCardNumber: string | null;
    idCardPhotoUrl: string | null;
    dateOfBirth: Date | null;
    virtualCardNumber: string | null;
    cardCvv: string | null;
    cardExpiryDate: string | null;
    accountEmail: string | null;
    accountPassword: string | null;
    accountType: string | null;
    accountStatus: string | null;
    creditLimit: string | null;
  }>
): Promise<Account | null> {
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (data.bankCode !== undefined) updateData.bank_code = data.bankCode;
  if (data.bankName !== undefined) updateData.bank_name = data.bankName;
  if (data.accountName !== undefined) updateData.account_name = data.accountName;
  if (data.accountNumber !== undefined) updateData.account_number = data.accountNumber;
  if (data.balance !== undefined) updateData.balance = data.balance;
  if (data.note !== undefined) updateData.note = data.note;
  if (data.isActive !== undefined) updateData.is_active = data.isActive;
  if (data.profilePhotoUrl !== undefined) updateData.profile_photo_url = data.profilePhotoUrl;
  if (data.idCardNumber !== undefined) updateData.id_card_number = data.idCardNumber;
  if (data.idCardPhotoUrl !== undefined) updateData.id_card_photo_url = data.idCardPhotoUrl;
  if (data.dateOfBirth !== undefined) updateData.date_of_birth = data.dateOfBirth?.toISOString() ?? null;
  if (data.virtualCardNumber !== undefined) updateData.virtual_card_number = data.virtualCardNumber;
  if (data.cardCvv !== undefined) updateData.card_cvv = data.cardCvv;
  if (data.cardExpiryDate !== undefined) updateData.card_expiry_date = data.cardExpiryDate;
  if (data.accountEmail !== undefined) updateData.account_email = data.accountEmail;
  if (data.accountPassword !== undefined) updateData.account_password = data.accountPassword;
  if (data.accountType !== undefined) updateData.account_type = data.accountType;
  if (data.accountStatus !== undefined) updateData.account_status = data.accountStatus;
  if (data.creditLimit !== undefined) updateData.credit_limit = data.creditLimit;

  const { data: updated, error } = await supabaseAdmin
    .from("accounts")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) return null;
  return mapAccount(updated as Record<string, unknown>);
}

export async function deleteAccountSb(id: number, userId: number): Promise<void> {
  const { error } = await supabaseAdmin
    .from("accounts")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

// ─── Agents ───────────────────────────────────────────────────────────────────

export async function getAgentsSb(userId: number): Promise<Agent[]> {
  const { data, error } = await supabaseAdmin
    .from("agents")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []).map((row) => mapAgent(row as Record<string, unknown>));
}

export async function createAgentSb(data: {
  userId: number;
  name: string;
  phone?: string;
  lineId?: string;
  note?: string;
  isActive?: "yes" | "no";
}): Promise<Agent> {
  const { data: inserted, error } = await supabaseAdmin
    .from("agents")
    .insert({
      user_id: data.userId,
      name: data.name,
      phone: data.phone ?? null,
      line_id: data.lineId ?? null,
      note: data.note ?? null,
      is_active: data.isActive ?? "yes",
    })
    .select()
    .single();

  if (error || !inserted) throw new Error(error?.message ?? "Insert failed");
  return mapAgent(inserted as Record<string, unknown>);
}

export async function updateAgentSb(
  id: number,
  userId: number,
  data: Partial<{
    name: string;
    phone: string | null;
    lineId: string | null;
    note: string | null;
    isActive: "yes" | "no";
    withdrawAmount: string;
    pendingAmount: string;
    startDate: Date | null;
  }>
): Promise<Agent | null> {
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (data.name !== undefined) updateData.name = data.name;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.lineId !== undefined) updateData.line_id = data.lineId;
  if (data.note !== undefined) updateData.note = data.note;
  if (data.isActive !== undefined) updateData.is_active = data.isActive;
  if (data.withdrawAmount !== undefined) updateData.withdraw_amount = data.withdrawAmount;
  if (data.pendingAmount !== undefined) updateData.pending_amount = data.pendingAmount;
  if (data.startDate !== undefined) updateData.start_date = data.startDate?.toISOString() ?? null;

  const { data: updated, error } = await supabaseAdmin
    .from("agents")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) return null;
  return mapAgent(updated as Record<string, unknown>);
}

export async function deleteAgentSb(id: number, userId: number): Promise<void> {
  const { error } = await supabaseAdmin
    .from("agents")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export async function getExpensesSb(userId: number): Promise<Expense[]> {
  const { data, error } = await supabaseAdmin
    .from("expenses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []).map((row) => mapExpense(row as Record<string, unknown>));
}

export async function createExpenseSb(data: {
  userId: number;
  accountId?: number | null;
  agentId?: number | null;
  title: string;
  amount: string;
  category?: string;
  status?: "pending" | "paid" | "cancelled";
  proofUrl?: string | null;
  proofKey?: string | null;
  dueDate?: Date | null;
  paidAt?: Date | null;
  note?: string | null;
}): Promise<Expense> {
  const { data: inserted, error } = await supabaseAdmin
    .from("expenses")
    .insert({
      user_id: data.userId,
      account_id: data.accountId ?? null,
      agent_id: data.agentId ?? null,
      title: data.title,
      amount: data.amount,
      category: data.category ?? null,
      status: data.status ?? "pending",
      proof_url: data.proofUrl ?? null,
      proof_key: data.proofKey ?? null,
      due_date: data.dueDate?.toISOString() ?? null,
      paid_at: data.paidAt?.toISOString() ?? null,
      note: data.note ?? null,
    })
    .select()
    .single();

  if (error || !inserted) throw new Error(error?.message ?? "Insert failed");
  return mapExpense(inserted as Record<string, unknown>);
}

export async function updateExpenseSb(
  id: number,
  userId: number,
  data: Partial<{
    accountId: number | null;
    agentId: number | null;
    title: string;
    amount: string;
    category: string | null;
    status: "pending" | "paid" | "cancelled";
    proofUrl: string | null;
    proofKey: string | null;
    dueDate: Date | null;
    paidAt: Date | null;
    note: string | null;
  }>
): Promise<Expense | null> {
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (data.accountId !== undefined) updateData.account_id = data.accountId;
  if (data.agentId !== undefined) updateData.agent_id = data.agentId;
  if (data.title !== undefined) updateData.title = data.title;
  if (data.amount !== undefined) updateData.amount = data.amount;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.proofUrl !== undefined) updateData.proof_url = data.proofUrl;
  if (data.proofKey !== undefined) updateData.proof_key = data.proofKey;
  if (data.dueDate !== undefined) updateData.due_date = data.dueDate?.toISOString() ?? null;
  if (data.paidAt !== undefined) updateData.paid_at = data.paidAt?.toISOString() ?? null;
  if (data.note !== undefined) updateData.note = data.note;

  const { data: updated, error } = await supabaseAdmin
    .from("expenses")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) return null;
  return mapExpense(updated as Record<string, unknown>);
}

export async function deleteExpenseSb(id: number, userId: number): Promise<void> {
  const { error } = await supabaseAdmin
    .from("expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

// ─── USDT Calculations ────────────────────────────────────────────────────────

export async function getUsdtCalculationsSb(userId: number): Promise<UsdtCalculation[]> {
  const { data, error } = await supabaseAdmin
    .from("usdt_calculations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return [];
  return (data ?? []).map((row) => mapUsdtCalc(row as Record<string, unknown>));
}

export async function createUsdtCalculationSb(data: {
  userId: number;
  buyAmountThb: string;
  usdtReceived: string;
  sellRate: string;
  costPerUsdt: string;
  sellAmountThb: string;
  profitThb: string;
  profitPercent: string;
  isProfit: "yes" | "no";
  note?: string | null;
}): Promise<UsdtCalculation> {
  const { data: inserted, error } = await supabaseAdmin
    .from("usdt_calculations")
    .insert({
      user_id: data.userId,
      buy_amount_thb: data.buyAmountThb,
      usdt_received: data.usdtReceived,
      sell_rate: data.sellRate,
      cost_per_usdt: data.costPerUsdt,
      sell_amount_thb: data.sellAmountThb,
      profit_thb: data.profitThb,
      profit_percent: data.profitPercent,
      is_profit: data.isProfit,
      note: data.note ?? null,
    })
    .select()
    .single();

  if (error || !inserted) throw new Error(error?.message ?? "Insert failed");
  return mapUsdtCalc(inserted as Record<string, unknown>);
}

export async function deleteUsdtCalculationSb(id: number, userId: number): Promise<void> {
  const { error } = await supabaseAdmin
    .from("usdt_calculations")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

export async function clearUsdtCalculationsSb(userId: number): Promise<void> {
  const { error } = await supabaseAdmin
    .from("usdt_calculations")
    .delete()
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function getSettingsSb(userId: number): Promise<Settings | null> {
  const { data, error } = await supabaseAdmin
    .from("settings")
    .select("*")
    .eq("user_id", userId)
    .limit(1)
    .single();

  if (error || !data) return null;
  return mapSettings(data as Record<string, unknown>);
}

export async function upsertSettingsSb(
  userId: number,
  data: Partial<{
    telegramBotToken: string | null;
    telegramChatId: string | null;
    telegramEnabled: "yes" | "no";
    notifyThreshold: string | null;
    soundEnabled: "yes" | "no";
  }>
): Promise<Settings> {
  const upsertData: Record<string, unknown> = {
    user_id: userId,
    updated_at: new Date().toISOString(),
  };
  if (data.telegramBotToken !== undefined) upsertData.telegram_bot_token = data.telegramBotToken;
  if (data.telegramChatId !== undefined) upsertData.telegram_chat_id = data.telegramChatId;
  if (data.telegramEnabled !== undefined) upsertData.telegram_enabled = data.telegramEnabled;
  if (data.notifyThreshold !== undefined) upsertData.notify_threshold = data.notifyThreshold;
  if (data.soundEnabled !== undefined) upsertData.sound_enabled = data.soundEnabled;

  const { data: result, error } = await supabaseAdmin
    .from("settings")
    .upsert(upsertData, { onConflict: "user_id" })
    .select()
    .single();

  if (error || !result) throw new Error(error?.message ?? "Upsert failed");
  return mapSettings(result as Record<string, unknown>);
}
