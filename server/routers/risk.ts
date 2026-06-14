import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { supabaseAdmin } from "../supabase";
import {
  analyzeAccountRisk,
  formatRiskAlertForTelegram,
  type AccountInfo,
} from "../riskEngine";

// ─── DB Helpers ───────────────────────────────────────────────────────────────

async function getAccountWithOrders(
  accountId: number,
  userId: string | number
): Promise<AccountInfo | null> {
  try {
    const { data: account, error: accountError } = await supabaseAdmin
      .from("accounts")
      .select("*")
      .eq("id", accountId)
      .eq("user_id", userId)
      .single();

    if (accountError || !account) return null;

    const { data: orders, error: ordersError } = await supabaseAdmin
      .from("account_orders")
      .select("*")
      .eq("account_id", accountId)
      .eq("user_id", userId)
      .order("scheduled_at", { ascending: false });

    if (ordersError) return null;

    return {
      id: account.id,
      accountName: account.account_name,
      accountNumber: account.account_number,
      bankName: account.bank_name,
      balance: parseFloat(account.balance || "0"),
      orders: (orders || []).map((o: any) => ({
        id: o.id,
        amount: parseFloat(o.order_amount || "0"),
        scheduledAt: o.scheduled_at,
        completedAt: o.completed_at ?? null,
        status: o.status,
      })),
    };
  } catch (error) {
    console.error("[Risk] Failed to get account with orders:", error);
    return null;
  }
}

async function sendTelegramAlert(
  botToken: string,
  chatId: string,
  text: string
): Promise<boolean> {
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
        }),
      }
    );

    return res.ok;
  } catch (error) {
    console.error("[Risk] Failed to send Telegram alert:", error);
    return false;
  }
}

// ─── Risk Router ──────────────────────────────────────────────────────────────

export const riskRouter = router({
  /** ดึงรายการ Risk Alerts */
  listAlerts: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const { data, error } = await supabaseAdmin
          .from("risk_alerts")
          .select("*")
          .eq("user_id", ctx.user.id)
          .order("created_at", { ascending: false })
          .range(input.offset, input.offset + input.limit - 1);

        if (error) throw error;

        return (data || []).map((alert: any) => ({
          id: alert.id,
          accountId: alert.account_id,
          riskLevel: alert.risk_level,
          message: alert.message,
          isResolved: alert.is_resolved,
          createdAt: alert.created_at,
          resolvedAt: alert.resolved_at,
        }));
      } catch (error) {
        console.error("[Risk] Failed to list alerts:", error);
        return [];
      }
    }),

  /** วิเคราะห์ Risk สำหรับบัญชี */
  analyzeAccount: protectedProcedure
    .input(z.object({ accountId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const account = await getAccountWithOrders(input.accountId, ctx.user.id);
        if (!account) throw new Error("Account not found");

        const analysis = analyzeAccountRisk(account);

        // บันทึก Alert ถ้า risk level สูง
        if (analysis.overallLevel !== "low") {
          const { error } = await supabaseAdmin
            .from("risk_alerts")
            .insert({
              user_id: ctx.user.id,
              account_id: input.accountId,
              risk_level: analysis.overallLevel,
              message: analysis.recommendation,
              is_resolved: false,
              created_at: new Date().toISOString(),
            });

          if (error) console.error("[Risk] Failed to insert alert:", error);
        }

        return analysis;
      } catch (error) {
        console.error("[Risk] Failed to analyze account:", error);
        throw error;
      }
    }),

  /** ส่ง Telegram Alert */
  sendAlert: protectedProcedure
    .input(
      z.object({
        accountId: z.number(),
        botToken: z.string(),
        chatId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const account = await getAccountWithOrders(input.accountId, ctx.user.id);
        if (!account) throw new Error("Account not found");

        const analysis = analyzeAccountRisk(account);
        const message = formatRiskAlertForTelegram(analysis);

        const success = await sendTelegramAlert(
          input.botToken,
          input.chatId,
          message
        );

        return { success };
      } catch (error) {
        console.error("[Risk] Failed to send alert:", error);
        throw error;
      }
    }),

  /** ทำเครื่องหมายว่า Alert แก้ไขแล้ว */
  resolveAlert: protectedProcedure
    .input(z.object({ alertId: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const { error } = await supabaseAdmin
          .from("risk_alerts")
          .update({
            is_resolved: true,
            resolved_at: new Date().toISOString(),
          })
          .eq("id", input.alertId);

        if (error) throw error;

        return { success: true };
      } catch (error) {
        console.error("[Risk] Failed to resolve alert:", error);
        throw error;
      }
    }),
});
