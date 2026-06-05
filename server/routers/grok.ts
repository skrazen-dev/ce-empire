import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";

const GROK_API_URL = "https://api.x.ai/v1/chat/completions";
const GROK_API_KEY = process.env.XAI_API_KEY;

interface GrokMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function callGrokAPI(
  messages: GrokMessage[],
  model: string = "grok-2",
  temperature: number = 0.7
): Promise<string> {
  if (!GROK_API_KEY) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Grok API key not configured",
    });
  }

  try {
    const response = await fetch(GROK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[Grok API Error]", response.status, error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Grok API error: ${response.status}`,
      });
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    return data.choices[0]?.message?.content || "No response from Grok";
  } catch (err) {
    console.error("[Grok Call Error]", err);
    if (err instanceof TRPCError) throw err;
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to call Grok API",
    });
  }
}

export const grokRouter = router({
  // ── Chat: ส่งข้อความและรับ response จาก Grok
  chat: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1),
        conversationHistory: z
          .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      const messages: GrokMessage[] = [
        {
          role: "system",
          content:
            "You are a helpful financial assistant for CE Empire, a cryptocurrency trading platform. " +
            "Help users analyze account risks, provide trading insights, and answer questions about account management. " +
            "Always respond in Thai language. Be concise and practical.",
        },
      ];

      // เพิ่ม conversation history
      if (input.conversationHistory && input.conversationHistory.length > 0) {
        messages.push(
          ...input.conversationHistory.map((msg) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          }))
        );
      }

      // เพิ่ม user message ล่าสุด
      messages.push({
        role: "user",
        content: input.message,
      });

      const response = await callGrokAPI(messages);
      return { response };
    }),

  // ── Analyze Risk: วิเคราะห์ความเสี่ยงบัญชีด้วย AI
  analyzeRisk: protectedProcedure
    .input(
      z.object({
        accountName: z.string(),
        bankName: z.string(),
        balance: z.number(),
        receivedAmount: z.number(),
        lastOrderTime: z.string().optional(),
        nextOrderTime: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const riskRatio = input.balance > 0 ? (input.receivedAmount / input.balance) * 100 : 0;

      const prompt = `
วิเคราะห์ความเสี่ยงของบัญชีธนาคารนี้:
- ชื่อบัญชี: ${input.accountName}
- ธนาคาร: ${input.bankName}
- วงเงินรวม: ฿${input.balance.toLocaleString()}
- รับยอดแล้ว: ฿${input.receivedAmount.toLocaleString()}
- ใช้ไปแล้ว: ${riskRatio.toFixed(1)}%
${input.lastOrderTime ? `- ออเดอร์ล่าสุด: ${input.lastOrderTime}` : ""}
${input.nextOrderTime ? `- ออเดอร์ถัดไป: ${input.nextOrderTime}` : ""}

ให้คำแนะนำ:
1. ระดับความเสี่ยง (ปลอดภัย/ระวัง/เสี่ยงสูง/วิกฤต)
2. สาเหตุหลัก
3. การแนะนำเพื่อลดความเสี่ยง
ตอบสั้น ๆ ประมาณ 3-4 บรรทัด`;

      const response = await callGrokAPI([
        {
          role: "system",
          content:
            "You are a financial risk analyst for cryptocurrency trading. " +
            "Provide practical risk assessment and recommendations in Thai. Be concise.",
        },
        {
          role: "user",
          content: prompt,
        },
      ]);

      return { analysis: response, riskRatio };
    }),

  // ── Get Models: ดึงรายชื่อ models ที่ใช้ได้
  getModels: publicProcedure.query(async () => {
    if (!GROK_API_KEY) {
      return { models: ["grok-2", "grok-3"], available: false };
    }

    try {
      const response = await fetch("https://api.x.ai/v1/models", {
        headers: {
          Authorization: `Bearer ${GROK_API_KEY}`,
        },
      });

      if (!response.ok) {
        console.warn("[Grok Models] Failed to fetch, using defaults");
        return { models: ["grok-2", "grok-3"], available: false };
      }

      const data = (await response.json()) as { data: Array<{ id: string }> };
      const models = data.data.map((m) => m.id);
      return { models, available: true };
    } catch (err) {
      console.warn("[Grok Models Error]", err);
      return { models: ["grok-2", "grok-3"], available: false };
    }
  }),

  // ── Test Connection: ทดสอบการเชื่อมต่อ Grok API
  testConnection: publicProcedure.query(async () => {
    if (!GROK_API_KEY) {
      return { connected: false, error: "API key not configured" };
    }

    try {
      const response = await callGrokAPI(
        [
          {
            role: "system",
            content: "You are a helpful assistant.",
          },
          {
            role: "user",
            content: "Say 'OK' in one word.",
          },
        ],
        "grok-2",
        0.1
      );

      return { connected: true, response };
    } catch (err) {
      return {
        connected: false,
        error: err instanceof TRPCError ? err.message : "Connection failed",
      };
    }
  }),
});
