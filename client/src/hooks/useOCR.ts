import { useState, useCallback } from "react";
import Tesseract from "tesseract.js";

export type OCRMode = "idcard" | "slip";

export interface IDCardData {
  idNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  rawText: string;
}

export interface SlipData {
  amount: string;
  date: string;
  time: string;
  senderName: string;
  receiverName: string;
  referenceNumber: string;
  rawText: string;
}

export interface OCRResult {
  mode: OCRMode;
  idCard?: IDCardData;
  slip?: SlipData;
  confidence: number;
}

export interface OCRState {
  isProcessing: boolean;
  progress: number;
  progressMessage: string;
  result: OCRResult | null;
  error: string | null;
}

// Image preprocessing using Canvas API
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

      // Scale up for better OCR accuracy
      const scale = Math.min(2, 2000 / Math.max(img.width, img.height));
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      // Draw original
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Enhance contrast
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Convert to grayscale
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;

        // Apply threshold for better text contrast
        const threshold = 128;
        const value = gray > threshold ? 255 : 0;

        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
      }

      ctx.putImageData(imageData, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

// Parse Thai ID card text
function parseIDCard(text: string): IDCardData {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const fullText = lines.join(" ");

  // Extract ID number (13 digits)
  const idMatch = fullText.match(/\b(\d[\s-]?\d[\s-]?\d{4}[\s-]?\d{5}[\s-]?\d{2}[\s-]?\d)\b/) ||
    fullText.match(/\b(\d{13})\b/);
  const idNumber = idMatch ? idMatch[1].replace(/[\s-]/g, "") : "";

  // Extract name (Thai pattern: นาย/นาง/นางสาว ชื่อ นามสกุล)
  const nameMatch = fullText.match(/(?:นาย|นาง(?:สาว)?|Mr\.|Mrs\.|Miss)\s+([ก-๙a-zA-Z]+)\s+([ก-๙a-zA-Z]+)/);
  const firstName = nameMatch ? nameMatch[1] : "";
  const lastName = nameMatch ? nameMatch[2] : "";

  // Extract date of birth (DD/MM/YYYY or DD MMM YYYY Thai)
  const dobMatch = fullText.match(/(\d{1,2})[\/\s](\d{1,2}|\w+)[\/\s](\d{4})/);
  const dateOfBirth = dobMatch ? `${dobMatch[1]}/${dobMatch[2]}/${dobMatch[3]}` : "";

  return { idNumber, firstName, lastName, dateOfBirth, rawText: text };
}

// Parse bank slip / PromptPay text
function parseSlip(text: string): SlipData {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const fullText = lines.join(" ");

  // Extract amount (Thai baht patterns)
  const amountMatch = fullText.match(/(?:จำนวน|Amount|ยอด)[:\s]*([0-9,]+\.?\d*)\s*(?:บาท|THB|฿)?/i) ||
    fullText.match(/([0-9,]+\.\d{2})\s*(?:บาท|THB|฿)/i) ||
    fullText.match(/฿\s*([0-9,]+\.?\d*)/);
  const amount = amountMatch ? amountMatch[1].replace(/,/g, "") : "";

  // Extract date
  const dateMatch = fullText.match(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/);
  const date = dateMatch ? dateMatch[1] : "";

  // Extract time
  const timeMatch = fullText.match(/(\d{1,2}:\d{2}(?::\d{2})?)/);
  const time = timeMatch ? timeMatch[1] : "";

  // Extract reference number
  const refMatch = fullText.match(/(?:เลขที่อ้างอิง|Ref(?:erence)?|รหัส)[:\s]*([A-Z0-9]{6,20})/i) ||
    fullText.match(/\b([A-Z0-9]{10,20})\b/);
  const referenceNumber = refMatch ? refMatch[1] : "";

  // Extract sender/receiver names
  const senderMatch = fullText.match(/(?:จาก|From|ผู้โอน)[:\s]+([ก-๙a-zA-Z\s]+?)(?:\s+(?:ไป|To|ผู้รับ)|$)/i);
  const receiverMatch = fullText.match(/(?:ถึง|To|ผู้รับ)[:\s]+([ก-๙a-zA-Z\s]+?)(?:\s|$)/i);

  const senderName = senderMatch ? senderMatch[1].trim() : "";
  const receiverName = receiverMatch ? receiverMatch[1].trim() : "";

  return { amount, date, time, senderName, receiverName, referenceNumber, rawText: text };
}

export function useOCR() {
  const [state, setState] = useState<OCRState>({
    isProcessing: false,
    progress: 0,
    progressMessage: "",
    result: null,
    error: null,
  });

  const processImage = useCallback(async (file: File, mode: OCRMode) => {
    setState({
      isProcessing: true,
      progress: 0,
      progressMessage: "กำลังเตรียมรูปภาพ...",
      result: null,
      error: null,
    });

    try {
      // Preprocess image
      setState((s) => ({ ...s, progress: 10, progressMessage: "ปรับปรุงคุณภาพรูปภาพ..." }));
      const processedImage = await preprocessImage(file);

      // Run Tesseract OCR
      setState((s) => ({ ...s, progress: 20, progressMessage: "กำลังอ่านข้อความ..." }));

      const lang = mode === "idcard" ? "tha+eng" : "tha+eng";

      const result = await Tesseract.recognize(processedImage, lang, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            const prog = 20 + Math.round(m.progress * 70);
            setState((s) => ({
              ...s,
              progress: prog,
              progressMessage: `กำลังอ่านข้อความ... ${Math.round(m.progress * 100)}%`,
            }));
          }
        },
      });

      setState((s) => ({ ...s, progress: 95, progressMessage: "วิเคราะห์ข้อมูล..." }));

      const text = result.data.text;
      const confidence = result.data.confidence;

      let ocrResult: OCRResult;
      if (mode === "idcard") {
        ocrResult = { mode, idCard: parseIDCard(text), confidence };
      } else {
        ocrResult = { mode, slip: parseSlip(text), confidence };
      }

      setState({
        isProcessing: false,
        progress: 100,
        progressMessage: "เสร็จสิ้น!",
        result: ocrResult,
        error: null,
      });
    } catch (err) {
      setState({
        isProcessing: false,
        progress: 0,
        progressMessage: "",
        result: null,
        error: err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการอ่านรูปภาพ",
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isProcessing: false,
      progress: 0,
      progressMessage: "",
      result: null,
      error: null,
    });
  }, []);

  return { ...state, processImage, reset };
}
