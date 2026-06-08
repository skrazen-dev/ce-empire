import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { riskRouter } from "./routers/risk";
import { pinnedRouter } from "./routers/pinned";
import { grokRouter } from "./routers/grok";
import { tasksRouter } from "./routers/tasks";
import { teamRouter } from "./routers/team";
import { analyticsRouter } from "./routers/analytics";
import {
  getAccountsSb,
  createAccountSb,
  updateAccountSb,
  deleteAccountSb,
  getAgentsSb,
  createAgentSb,
  updateAgentSb,
  deleteAgentSb,
  getExpensesSb,
  createExpenseSb,
  updateExpenseSb,
  deleteExpenseSb,
  getUsdtCalculationsSb,
  createUsdtCalculationSb,
  deleteUsdtCalculationSb,
  clearUsdtCalculationsSb,
  getSettingsSb,
  upsertSettingsSb,
} from "./db-supabase";

// ─── Accounts Router ──────────────────────────────────────────────────────────
const accountsRouter = router({
  list: protectedProcedure.query(({ ctx }) => getAccountsSb(ctx.user.id)),

  create: protectedProcedure
    .input(
      z.object({
        bankCode: z.string().min(1),
        bankName: z.string().min(1),
        accountName: z.string().min(1),
        accountNumber: z.string().min(1),
        balance: z.string().default("0.00"),
        note: z.string().optional(),
        isActive: z.enum(["yes", "no"]).default("yes"),
      })
    )
    .mutation(({ ctx, input }) =>
      createAccountSb({ userId: ctx.user.id, ...input })
    ),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        bankCode: z.string().min(1).optional(),
        bankName: z.string().min(1).optional(),
        accountName: z.string().min(1).optional(),
        accountNumber: z.string().min(1).optional(),
        balance: z.string().optional(),
        note: z.string().optional().nullable(),
        isActive: z.enum(["yes", "no"]).optional(),
        profilePhotoUrl: z.string().optional().nullable(),
        idCardNumber: z.string().optional().nullable(),
        idCardPhotoUrl: z.string().optional().nullable(),
        dateOfBirth: z.date().optional().nullable(),
        virtualCardNumber: z.string().optional().nullable(),
        cardCvv: z.string().optional().nullable(),
        cardExpiryDate: z.string().optional().nullable(),
        accountEmail: z.string().optional().nullable(),
        accountPassword: z.string().optional().nullable(),
        accountType: z.string().optional().nullable(),
        accountStatus: z.string().optional().nullable(),
        creditLimit: z.string().optional().nullable(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input;
      return updateAccountSb(id, ctx.user.id, data);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(({ ctx, input }) => deleteAccountSb(input.id, ctx.user.id)),
});

// ─── Agents Router ────────────────────────────────────────────────────────────
const agentsRouter = router({
  list: protectedProcedure.query(({ ctx }) => getAgentsSb(ctx.user.id)),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        phone: z.string().optional(),
        lineId: z.string().optional(),
        note: z.string().optional(),
        isActive: z.enum(["yes", "no"]).default("yes"),
      })
    )
    .mutation(({ ctx, input }) =>
      createAgentSb({ userId: ctx.user.id, ...input })
    ),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        name: z.string().min(1).optional(),
        phone: z.string().optional().nullable(),
        lineId: z.string().optional().nullable(),
        note: z.string().optional().nullable(),
        isActive: z.enum(["yes", "no"]).optional(),
        withdrawAmount: z.string().optional(),
        pendingAmount: z.string().optional(),
        startDate: z.date().optional().nullable(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input;
      return updateAgentSb(id, ctx.user.id, data);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(({ ctx, input }) => deleteAgentSb(input.id, ctx.user.id)),
});

// ─── Expenses Router ──────────────────────────────────────────────────────────
const expensesRouter = router({
  list: protectedProcedure.query(({ ctx }) => getExpensesSb(ctx.user.id)),

  create: protectedProcedure
    .input(
      z.object({
        accountId: z.number().int().positive().optional().nullable(),
        agentId: z.number().int().positive().optional().nullable(),
        title: z.string().min(1),
        amount: z.string(),
        category: z.string().optional(),
        status: z.enum(["pending", "paid", "cancelled"]).default("pending"),
        proofUrl: z.string().optional().nullable(),
        proofKey: z.string().optional().nullable(),
        dueDate: z.date().optional().nullable(),
        paidAt: z.date().optional().nullable(),
        note: z.string().optional().nullable(),
      })
    )
    .mutation(({ ctx, input }) =>
      createExpenseSb({ userId: ctx.user.id, ...input })
    ),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        accountId: z.number().int().positive().optional().nullable(),
        agentId: z.number().int().positive().optional().nullable(),
        title: z.string().min(1).optional(),
        amount: z.string().optional(),
        category: z.string().optional().nullable(),
        status: z.enum(["pending", "paid", "cancelled"]).optional(),
        proofUrl: z.string().optional().nullable(),
        proofKey: z.string().optional().nullable(),
        dueDate: z.date().optional().nullable(),
        paidAt: z.date().optional().nullable(),
        note: z.string().optional().nullable(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input;
      return updateExpenseSb(id, ctx.user.id, data);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(({ ctx, input }) => deleteExpenseSb(input.id, ctx.user.id)),
});

// ─── USDT Calculations Router ─────────────────────────────────────────────────
const usdtCalcsRouter = router({
  list: protectedProcedure.query(({ ctx }) =>
    getUsdtCalculationsSb(ctx.user.id)
  ),

  create: protectedProcedure
    .input(
      z.object({
        buyAmountThb: z.string(),
        usdtReceived: z.string(),
        sellRate: z.string(),
        costPerUsdt: z.string(),
        sellAmountThb: z.string(),
        profitThb: z.string(),
        profitPercent: z.string(),
        isProfit: z.enum(["yes", "no"]),
        note: z.string().optional().nullable(),
      })
    )
    .mutation(({ ctx, input }) =>
      createUsdtCalculationSb({ userId: ctx.user.id, ...input })
    ),

  delete: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(({ ctx, input }) =>
      deleteUsdtCalculationSb(input.id, ctx.user.id)
    ),

  clear: protectedProcedure.mutation(({ ctx }) =>
    clearUsdtCalculationsSb(ctx.user.id)
  ),
});

// ─── Settings Router ──────────────────────────────────────────────────────────
const settingsRouter = router({
  get: protectedProcedure.query(({ ctx }) => getSettingsSb(ctx.user.id)),

  update: protectedProcedure
    .input(
      z.object({
        telegramBotToken: z.string().optional().nullable(),
        telegramChatId: z.string().optional().nullable(),
        telegramEnabled: z.enum(["yes", "no"]).optional(),
        notifyThreshold: z.string().optional().nullable(),
        soundEnabled: z.enum(["yes", "no"]).optional(),
      })
    )
    .mutation(({ ctx, input }) => upsertSettingsSb(ctx.user.id, input)),
});

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  accounts: accountsRouter,
  agents: agentsRouter,
  expenses: expensesRouter,
  usdtCalcs: usdtCalcsRouter,
  settings: settingsRouter,
  risk: riskRouter,
  pinned: pinnedRouter,
  grok: grokRouter,
  tasks: tasksRouter,
  team: teamRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;
