import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { supabaseAdmin } from "../supabase";

// ─── Pinned Accounts Router ───────────────────────────────────────────────────

export const pinnedRouter = router({
  /** ดึงรายการบัญชีปักหมุดพร้อมข้อมูลบัญชีจริง */
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const { data, error } = await supabaseAdmin
        .from("pinned_accounts")
        .select(
          `
          id,
          account_id,
          telegram_group,
          display_order,
          received_amount,
          note,
          is_active,
          created_at,
          updated_at,
          accounts (
            bank_code,
            bank_name,
            account_name,
            account_number,
            balance,
            note
          )
        `
        )
        .eq("user_id", ctx.user.id)
        .eq("is_active", "yes")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        accountId: row.account_id,
        telegramGroup: row.telegram_group,
        displayOrder: row.display_order,
        receivedAmount: row.received_amount,
        note: row.note,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        bankCode: row.accounts?.bank_code,
        bankName: row.accounts?.bank_name,
        accountName: row.accounts?.account_name,
        accountNumber: row.accounts?.account_number,
        balance: row.accounts?.balance,
        accountNote: row.accounts?.note,
      }));
    } catch (error) {
      console.error("[Pinned] Failed to list pinned accounts:", error);
      return [];
    }
  }),

  /** ปักหมุดบัญชีใหม่ */
  pin: protectedProcedure
    .input(
      z.object({
        accountId: z.number(),
        telegramGroup: z.string().optional(),
        displayOrder: z.number().default(999),
        receivedAmount: z.string().default("0.00"),
        note: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { data, error } = await supabaseAdmin
          .from("pinned_accounts")
          .insert({
            user_id: ctx.user.id,
            account_id: input.accountId,
            telegram_group: input.telegramGroup,
            display_order: input.displayOrder,
            received_amount: input.receivedAmount,
            note: input.note,
            is_active: "yes",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;

        return data;
      } catch (error) {
        console.error("[Pinned] Failed to pin account:", error);
        throw error;
      }
    }),

  /** ยกเลิกการปักหมุด */
  unpin: protectedProcedure
    .input(z.object({ pinnedId: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const { error } = await supabaseAdmin
          .from("pinned_accounts")
          .update({ is_active: "no", updated_at: new Date().toISOString() })
          .eq("id", input.pinnedId);

        if (error) throw error;

        return { success: true };
      } catch (error) {
        console.error("[Pinned] Failed to unpin account:", error);
        throw error;
      }
    }),

  /** อัปเดตลำดับการแสดง */
  updateOrder: protectedProcedure
    .input(
      z.object({
        pinnedId: z.number(),
        displayOrder: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { error } = await supabaseAdmin
          .from("pinned_accounts")
          .update({
            display_order: input.displayOrder,
            updated_at: new Date().toISOString(),
          })
          .eq("id", input.pinnedId);

        if (error) throw error;

        return { success: true };
      } catch (error) {
        console.error("[Pinned] Failed to update order:", error);
        throw error;
      }
    }),
});
