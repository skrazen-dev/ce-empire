// ─── AI OCR สำหรับสลิปธนาคารไทย ─────────────────────────────────────────────────
//
// ตัวช่วยอ่านสลิปธนาคาร/PromptPay ด้วย tesseract.js (client-side ทั้งหมด ไม่มี secret)
// คืนค่าฟิลด์: Amount (จำนวนเงิน), Bank (ธนาคาร), Date (วันที่), Time (เวลา),
// Reference (เลขที่อ้างอิง) โดยใช้ heuristics/regex ที่ปรับมาสำหรับสลิปภาษาไทย
//
// ใช้ร่วมกับฟอร์มบันทึกสลิป (ProofPage / ExpensesPage / OCRSlipScanner):
// ผลลัพธ์จะถูกนำไป auto-fill ฟอร์ม แต่ผู้ใช้ "ต้องยืนยันก่อนบันทึก" เสมอ
// (ไม่บันทึกอัตโนมัติ) — schema และ procedure การบันทึกไม่ถูกแก้ไข

import Tesseract from "tesseract.js";

export interface SlipOCRFields {
  /** จำนวนเงิน (string ตัวเลขล้วน ไม่มี comma) เพื่อให้ตรงกับ schema amount */
  amount: string;
  /** ชื่อ/รหัสธนาคารที่ตรวจพบ (ภาษาไทย) เช่น "ธ.กสิกรไทย" */
  bank: string;
  /** วันที่จากสลิป (เก็บตามรูปแบบที่อ่านได้ เช่น 12/06/2026 หรือ 12 มิ.ย. 67) */
  date: string;
  /** เวลาจากสลิป เช่น 14:30 */
  time: string;
  /** เลขที่อ้างอิง / Reference */
  reference: string;
  /** ข้อความดิบจาก OCR (ไว้ debug / ให้ผู้ใช้ตรวจสอบ) */
  rawText: string;
  /** ความแม่นยำ 0-100 จาก tesseract */
  confidence: number;
}

// ─── Bank heuristics (ไทย) ──────────────────────────────────────────────────────
// คำ/รหัสที่พบบ่อยบนสลิป → ชื่อย่อธนาคารภาษาไทย
const BANK_PATTERNS: Array<{ re: RegExp; name: string }> = [
  { re: /กสิกร|kasikorn|kbank|k\s*\+|k\s*plus/i, name: "ธ.กสิกรไทย" },
  { re: /ไทยพาณิชย์|scb|easy/i, name: "ธ.ไทยพาณิชย์" },
  { re: /กรุงเทพ|bangkok\s*bank|bbl|bualuang/i, name: "ธ.กรุงเทพ" },
  { re: /กรุงไทย|krung\s*thai|ktb|krungthai/i, name: "ธ.กรุงไทย" },
  { re: /กรุงศรี|krungsri|bay|ayudhya/i, name: "ธ.กรุงศรีอยุธยา" },
  { re: /ทหารไทย|ธนชาต|ttb|tmb|tbank/i, name: "ธ.ทหารไทยธนชาต" },
  { re: /ออมสิน|gsb|government\s*savings/i, name: "ธ.ออมสิน" },
  { re: /ธ\.?ก\.?ส\.?|baac|เพื่อการเกษตร/i, name: "ธ.ก.ส." },
  { re: /ยูโอบี|uob/i, name: "ธ.ยูโอบี" },
  { re: /ซีไอเอ็มบี|cimb/i, name: "ธ.ซีไอเอ็มบี" },
  { re: /แลนด์\s*แอนด์\s*เฮ้าส์|lh\s*bank|land\s*and\s*houses/i, name: "ธ.แลนด์ แอนด์ เฮ้าส์" },
  { re: /อิสลาม|islamic/i, name: "ธ.อิสลามแห่งประเทศไทย" },
  { re: /promptpay|พร้อมเพย์/i, name: "PromptPay" },
];

// เดือนภาษาไทยแบบย่อ (ไว้ตรวจจับวันที่รูปแบบ "12 มิ.ย. 67")
const THAI_MONTHS = "(?:ม\\.?ค\\.?|ก\\.?พ\\.?|มี\\.?ค\\.?|เม\\.?ย\\.?|พ\\.?ค\\.?|มิ\\.?ย\\.?|ก\\.?ค\\.?|ส\\.?ค\\.?|ก\\.?ย\\.?|ต\\.?ค\\.?|พ\\.?ย\\.?|ธ\\.?ค\\.?)";

/**
 * แยกข้อมูลจากข้อความ OCR ของสลิป (pure function — ทดสอบ/นำกลับมาใช้ได้)
 */
export function parseSlipText(text: string, confidence = 0): SlipOCRFields {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const fullText = lines.join(" ");

  // จำนวนเงิน: ลองหา label ก่อน แล้วค่อย fallback เป็นเลขทศนิยม 2 ตำแหน่ง / สัญลักษณ์บาท
  const amountMatch =
    fullText.match(/(?:จำนวน(?:เงิน)?|Amount|ยอด(?:เงิน)?)[:\s]*([0-9,]+\.?\d*)\s*(?:บาท|THB|฿)?/i) ||
    fullText.match(/([0-9,]+\.\d{2})\s*(?:บาท|THB|฿)/i) ||
    fullText.match(/฿\s*([0-9,]+\.?\d*)/) ||
    fullText.match(/([0-9,]+\.\d{2})\b/);
  const amount = amountMatch ? amountMatch[1].replace(/,/g, "") : "";

  // ธนาคาร: ตรวจจาก keyword
  let bank = "";
  for (const { re, name } of BANK_PATTERNS) {
    if (re.test(fullText)) {
      bank = name;
      break;
    }
  }

  // วันที่: รองรับ DD/MM/YYYY, DD-MM-YY, และ "12 มิ.ย. 67"
  const dateMatch =
    fullText.match(/(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/) ||
    fullText.match(new RegExp(`(\\d{1,2}\\s*${THAI_MONTHS}\\s*\\d{2,4})`, "i"));
  const date = dateMatch ? dateMatch[1].trim() : "";

  // เวลา: HH:MM หรือ HH:MM:SS
  const timeMatch = fullText.match(/(\d{1,2}:\d{2}(?::\d{2})?)\s*(?:น\.?)?/);
  const time = timeMatch ? timeMatch[1] : "";

  // เลขที่อ้างอิง: ลอง label ก่อน แล้ว fallback เป็นรหัสยาว
  const refMatch =
    fullText.match(/(?:เลขที่อ้างอิง|รหัสอ้างอิง|Ref(?:erence)?(?:\s*(?:No|ID))?|รหัส)[:\s.]*([A-Za-z0-9]{6,30})/i) ||
    fullText.match(/\b([A-Z0-9]{12,30})\b/);
  const reference = refMatch ? refMatch[1] : "";

  return { amount, bank, date, time, reference, rawText: text, confidence };
}

// ─── Image preprocessing (Canvas) เพื่อเพิ่มความแม่นยำ OCR ──────────────────────
async function preprocessImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(url);
        return;
      }
      const scale = Math.min(2, 2000 / Math.max(img.width, img.height));
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // grayscale + threshold เพื่อให้ตัวอักษรคมขึ้น
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const value = gray > 128 ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = value;
      }
      ctx.putImageData(imageData, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("ไม่สามารถโหลดรูปภาพได้"));
    };
    img.src = url;
  });
}

/**
 * รัน OCR บนไฟล์รูปสลิปแล้วคืนค่าฟิลด์ที่แยกได้
 * @param onProgress callback ความคืบหน้า 0-100 (optional)
 */
export async function runSlipOCR(
  file: File,
  onProgress?: (progress: number, message: string) => void
): Promise<SlipOCRFields> {
  onProgress?.(10, "ปรับปรุงคุณภาพรูปภาพ...");
  const processed = await preprocessImage(file);

  onProgress?.(20, "กำลังอ่านข้อความ...");
  const result = await Tesseract.recognize(processed, "tha+eng", {
    logger: (m) => {
      if (m.status === "recognizing text") {
        onProgress?.(20 + Math.round(m.progress * 70), `กำลังอ่านข้อความ... ${Math.round(m.progress * 100)}%`);
      }
    },
  });

  onProgress?.(95, "วิเคราะห์ข้อมูล...");
  const fields = parseSlipText(result.data.text, result.data.confidence);
  onProgress?.(100, "เสร็จสิ้น!");
  return fields;
}
