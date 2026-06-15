// ─── Telegram Notification Service ──────────────────────────────────────────────
//
// โมดูลส่งข้อความเข้า Telegram ผ่าน Bot API ด้วย axios
// อ่านค่า token/chat id จาก environment variables:
//   - TELEGRAM_BOT_TOKEN
//   - TELEGRAM_CHAT_ID
//
// ถ้าไม่ได้ตั้งค่า env จะ "no-op + warn" (ไม่ throw / ไม่ crash การทำงานหลัก)
//
// TODO(secret): set TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID
// (ตั้งบน Vercel env หรือ .env ฝั่งเซิร์ฟเวอร์ก่อนเปิดใช้งานการแจ้งเตือน)

import axios from "axios";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

function fmt(n: number): string {
  return n.toLocaleString("th-TH", { maximumFractionDigits: 2 });
}

/**
 * ส่งข้อความเข้า Telegram chat ที่กำหนดไว้ใน env
 * @returns true ถ้าส่งสำเร็จ, false ถ้าไม่ได้ตั้งค่า env หรือส่งล้มเหลว
 */
export async function sendTelegram(text: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn(
      "[Telegram] ข้ามการส่ง — ยังไม่ได้ตั้งค่า TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID"
    );
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const res = await axios.post(url, {
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
    return res.status >= 200 && res.status < 300;
  } catch (err) {
    console.error("[Telegram] ส่งข้อความล้มเหลว:", err);
    return false;
  }
}

// ─── Helper notifiers (ข้อความภาษาไทย) ──────────────────────────────────────────

/** แจ้งเตือนธุรกรรม/รายการฝากใหม่ */
export async function notifyNewTransaction(opts: {
  title: string;
  amount: number;
  bank?: string;
  reference?: string;
}): Promise<boolean> {
  const lines = [
    "💰 <b>ธุรกรรมใหม่</b>",
    `รายการ: ${opts.title}`,
    `จำนวน: ฿${fmt(opts.amount)}`,
  ];
  if (opts.bank) lines.push(`ธนาคาร: ${opts.bank}`);
  if (opts.reference) lines.push(`อ้างอิง: ${opts.reference}`);
  return sendTelegram(lines.join("\n"));
}

/** แจ้งเตือนเมื่อบัญชีธนาคารใกล้เต็มวงเงิน */
export async function notifyBankLimit(opts: {
  bankName: string;
  accountName: string;
  balance: number;
  limit: number;
}): Promise<boolean> {
  const pct = opts.limit > 0 ? (opts.balance / opts.limit) * 100 : 0;
  const text = [
    "⚠️ <b>ธนาคารใกล้เต็มวงเงิน</b>",
    `${opts.bankName} — ${opts.accountName}`,
    `ใช้ไป ${pct.toFixed(0)}% (฿${fmt(opts.balance)} / ฿${fmt(opts.limit)})`,
  ].join("\n");
  return sendTelegram(text);
}

/** แจ้งเตือนงานใหม่ */
export async function notifyNewTask(opts: {
  title: string;
  priority?: string;
  dueDate?: string;
}): Promise<boolean> {
  const lines = ["📋 <b>งานใหม่</b>", `งาน: ${opts.title}`];
  if (opts.priority) lines.push(`ความสำคัญ: ${opts.priority}`);
  if (opts.dueDate) lines.push(`กำหนดส่ง: ${opts.dueDate}`);
  return sendTelegram(lines.join("\n"));
}

/** แจ้งเตือนความเสี่ยง (risk alert) */
export async function notifyRiskAlert(opts: {
  accountName?: string;
  riskLevel: string;
  message: string;
}): Promise<boolean> {
  const levelEmoji: Record<string, string> = {
    low: "🟢",
    medium: "🟡",
    high: "🟠",
    critical: "🔴",
  };
  const emoji = levelEmoji[opts.riskLevel] ?? "🚨";
  const lines = [
    `${emoji} <b>แจ้งเตือนความเสี่ยง (${opts.riskLevel})</b>`,
  ];
  if (opts.accountName) lines.push(`บัญชี: ${opts.accountName}`);
  lines.push(opts.message);
  return sendTelegram(lines.join("\n"));
}
