// ─── Vercel Cron Handler: Daily Brief ───────────────────────────────────────────
//
// Serverless handler ที่ Vercel Cron เรียกตามตารางเวลา เพื่อส่งสรุปประจำวัน
// เข้า Telegram (เวลา 22:00)
//
// === ต้องเพิ่ม snippet นี้ใน vercel.json (อย่าให้ AI แก้ vercel.json เอง) ===
//
//   {
//     "crons": [
//       { "path": "/api/cron/daily-brief", "schedule": "0 22 * * *" }
//     ]
//   }
//
// หมายเหตุ: เวลา cron ของ Vercel เป็น UTC. "0 22 * * *" = 22:00 UTC.
// ถ้าต้องการ 22:00 เวลาไทย (UTC+7) ให้ใช้ "0 15 * * *".
//
// === Environment variables ที่ต้องตั้ง ===
//   - SUPABASE_SERVICE_ROLE_KEY (หรือ VITE_SUPABASE_PUBLISHABLE_KEY) + VITE_SUPABASE_URL
//   - TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID
//   - (ตัวเลือก) DAILY_BRIEF_USER_ID เพื่อจำกัดเฉพาะเจ้าของ
//   - (แนะนำ) CRON_SECRET — Vercel จะส่ง Authorization: Bearer <CRON_SECRET>
//     เราจะตรวจสอบเพื่อกัน endpoint ถูกเรียกจากภายนอก
//
// TODO(secret): set TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID / CRON_SECRET

import { sendDailyBrief, generateDailyBrief } from "../../server/services/daily-brief";

// ใช้ type หลวม ๆ เพื่อไม่ผูกกับ @vercel/node (อาจไม่ได้ติดตั้ง)
interface VercelLikeRequest {
  headers: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[] | undefined>;
}
interface VercelLikeResponse {
  status: (code: number) => VercelLikeResponse;
  json: (body: unknown) => void;
}

export default async function handler(
  req: VercelLikeRequest,
  res: VercelLikeResponse
): Promise<void> {
  // ตรวจสอบ CRON_SECRET ถ้าตั้งไว้ (Vercel cron ส่ง Authorization header ให้)
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers["authorization"];
    if (auth !== `Bearer ${cronSecret}`) {
      res.status(401).json({ ok: false, error: "unauthorized" });
      return;
    }
  }

  try {
    const brief = await generateDailyBrief();
    const sent = await sendDailyBrief();
    res.status(200).json({ ok: true, sent, brief });
  } catch (err) {
    console.error("[Cron][daily-brief] ล้มเหลว:", err);
    res.status(500).json({ ok: false, error: String(err) });
  }
}
