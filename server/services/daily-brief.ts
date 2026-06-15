// ─── Daily Brief Service (สรุปประจำวัน) ─────────────────────────────────────────
//
// สร้างสรุปรายวันภาษาไทย: รายรับ / รายจ่าย / กำไร / USDT / งาน / ความเสี่ยง
// ดึงจากชั้นข้อมูลจริง (Supabase ผ่าน supabaseAdmin) โดยใช้คอลัมน์/ตารางเดียวกับ
// analytics router ที่มีอยู่ (deposit_slips, usdt_uploads, profit_records, tasks,
// risk_alerts, expenses) — ไม่แตะ schema หรือสูตรการเงินใด ๆ
//
// ใช้คู่กับ Vercel cron: api/cron/daily-brief.ts (เวลา 22:00)
//
// TODO(secret): ต้องตั้งค่า SUPABASE_SERVICE_ROLE_KEY (มีอยู่แล้วใน server/supabase.ts)
//   และ TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID (สำหรับ sendDailyBrief)
//   ถ้าต้องการจำกัดเฉพาะเจ้าของ ให้ตั้ง DAILY_BRIEF_USER_ID = user_id ของเจ้าของ

import { supabaseAdmin as sb } from "../supabase";
import { sendTelegram } from "./telegram";

function fmt(n: number): string {
  return n.toLocaleString("th-TH", { maximumFractionDigits: 2 });
}

function sumDecimal(rows: any[] | null, key: string): number {
  return (rows ?? []).reduce((s, r) => s + parseFloat(r[key] ?? "0"), 0);
}

export interface DailyBriefData {
  date: string;
  revenue: number; // ยอดฝากที่ยืนยันแล้ว (deposit_slips status=verified)
  expense: number; // ค่าใช้จ่ายที่จ่ายแล้ว (expenses status=paid)
  profit: number; // กำไร (profit_records)
  usdt: number; // ยอด USDT ที่อัพ
  usdtThb: number; // มูลค่า THB ของ USDT
  pendingTasks: number;
  openRisks: number;
}

/**
 * ดึงข้อมูลสรุปของวันนี้จาก Supabase
 * ถ้าตั้ง DAILY_BRIEF_USER_ID จะ scope เฉพาะ user นั้น ไม่งั้นรวมทุก user
 */
export async function getDailyBriefData(): Promise<DailyBriefData> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const userId = process.env.DAILY_BRIEF_USER_ID;
  const scope = <T>(q: T): T =>
    userId ? ((q as any).eq("user_id", userId) as T) : q;

  const [
    { data: deps },
    { data: usdts },
    { data: profits },
    { data: expenses },
    { data: tasks },
    { data: risks },
  ] = await Promise.all([
    scope(
      sb
        .from("deposit_slips")
        .select("amount")
        .eq("status", "verified")
        .gte("slip_date", today.toISOString())
        .lt("slip_date", tomorrow.toISOString())
    ),
    scope(
      sb
        .from("usdt_uploads")
        .select("usdt_amount,thb_equivalent")
        .gte("upload_date", today.toISOString())
        .lt("upload_date", tomorrow.toISOString())
    ),
    scope(
      sb
        .from("profit_records")
        .select("profit_thb")
        .gte("record_date", today.toISOString())
        .lt("record_date", tomorrow.toISOString())
    ),
    scope(
      sb
        .from("expenses")
        .select("amount,status")
        .eq("status", "paid")
        .gte("created_at", today.toISOString())
        .lt("created_at", tomorrow.toISOString())
    ),
    scope(sb.from("tasks").select("id,status").neq("status", "done")),
    scope(sb.from("risk_alerts").select("id,is_resolved").eq("is_resolved", false)),
  ]);

  return {
    date: today.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    revenue: sumDecimal(deps, "amount"),
    expense: sumDecimal(expenses, "amount"),
    profit: sumDecimal(profits, "profit_thb"),
    usdt: sumDecimal(usdts, "usdt_amount"),
    usdtThb: sumDecimal(usdts, "thb_equivalent"),
    pendingTasks: (tasks ?? []).length,
    openRisks: (risks ?? []).length,
  };
}

/**
 * สร้างข้อความสรุปประจำวันเป็นภาษาไทย
 */
export async function generateDailyBrief(): Promise<string> {
  const d = await getDailyBriefData();

  return [
    `🌙 <b>สรุปประจำวัน ${d.date}</b>`,
    "",
    `📈 รายรับ (ยอดฝากยืนยันแล้ว): ฿${fmt(d.revenue)}`,
    `📉 รายจ่าย (จ่ายแล้ววันนี้): ฿${fmt(d.expense)}`,
    `💎 กำไร: ฿${fmt(d.profit)}`,
    `🪙 USDT ที่อัพ: ${fmt(d.usdt)} USDT (≈฿${fmt(d.usdtThb)})`,
    "",
    `📋 งานค้าง: ${d.pendingTasks} งาน`,
    `⚠️ ความเสี่ยงที่ยังไม่แก้: ${d.openRisks} รายการ`,
  ].join("\n");
}

/**
 * สร้างสรุปแล้วส่งเข้า Telegram
 * @returns true ถ้าส่งสำเร็จ
 */
export async function sendDailyBrief(): Promise<boolean> {
  const brief = await generateDailyBrief();
  return sendTelegram(brief);
}
