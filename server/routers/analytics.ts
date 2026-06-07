import { protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { depositSlips, usdtUploads, profitRecords } from "../../drizzle/schema";
import { eq, and, gte, lte } from "drizzle-orm";

/**
 * Analytics Router
 * Provides endpoints for deposits, USDT, and profit data
 */

export const analyticsRouter = {
  /**
   * Get total deposits (THB) for today or custom date range
   */
  getDeposits: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userId = ctx.user.id;

      const start = input.startDate || new Date(new Date().setHours(0, 0, 0, 0));
      const end = input.endDate || new Date(new Date().setHours(23, 59, 59, 999));

      const slips = await db
        .select()
        .from(depositSlips)
        .where(
          and(
            eq(depositSlips.userId, userId),
            gte(depositSlips.slipDate, start),
            lte(depositSlips.slipDate, end),
            eq(depositSlips.status, "verified")
          )
        );

      const totalAmount = slips.reduce((sum, slip) => {
        return sum + parseFloat(slip.amount.toString());
      }, 0);

      const count = slips.length;

      return {
        totalAmount,
        count,
        slips: slips.map((s) => ({
          id: s.id,
          amount: parseFloat(s.amount.toString()),
          date: s.slipDate,
          description: s.description,
        })),
      };
    }),

  /**
   * Get total USDT uploads for today or custom date range
   */
  getUSDT: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userId = ctx.user.id;

      const start = input.startDate || new Date(new Date().setHours(0, 0, 0, 0));
      const end = input.endDate || new Date(new Date().setHours(23, 59, 59, 999));

      const uploads = await db
        .select()
        .from(usdtUploads)
        .where(
          and(
            eq(usdtUploads.userId, userId),
            gte(usdtUploads.uploadDate, start),
            lte(usdtUploads.uploadDate, end)
          )
        );

      const totalUSDT = uploads.reduce((sum, upload) => {
        return sum + parseFloat(upload.usdtAmount.toString());
      }, 0);

      const totalTHB = uploads.reduce((sum, upload) => {
        return sum + parseFloat(upload.thbEquivalent.toString());
      }, 0);

      const avgRate =
        uploads.length > 0
          ? uploads.reduce((sum, u) => sum + parseFloat(u.thbRate.toString()), 0) /
            uploads.length
          : 0;

      return {
        totalUSDT,
        totalTHB,
        avgRate: parseFloat(avgRate.toFixed(2)),
        count: uploads.length,
        uploads: uploads.map((u) => ({
          id: u.id,
          usdtAmount: parseFloat(u.usdtAmount.toString()),
          thbEquivalent: parseFloat(u.thbEquivalent.toString()),
          rate: parseFloat(u.thbRate.toString()),
          date: u.uploadDate,
          description: u.description,
        })),
      };
    }),

  /**
   * Get profit records for today or custom date range
   */
  getProfitToday: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userId = ctx.user.id;

      const start = input.startDate || new Date(new Date().setHours(0, 0, 0, 0));
      const end = input.endDate || new Date(new Date().setHours(23, 59, 59, 999));

      const records = await db
        .select()
        .from(profitRecords)
        .where(
          and(
            eq(profitRecords.userId, userId),
            gte(profitRecords.recordDate, start),
            lte(profitRecords.recordDate, end)
          )
        );

      const totalProfit = records.reduce((sum, record) => {
        return sum + parseFloat(record.profitThb.toString());
      }, 0);

      const avgPercent =
        records.length > 0
          ? records.reduce((sum, r) => sum + parseFloat(r.profitPercent.toString()), 0) /
            records.length
          : 0;

      // Group by source
      const bySource: Record<string, { total: number; count: number }> = {};
      records.forEach((r) => {
        if (!bySource[r.source]) {
          bySource[r.source] = { total: 0, count: 0 };
        }
        bySource[r.source].total += parseFloat(r.profitThb.toString());
        bySource[r.source].count += 1;
      });

      return {
        totalProfit,
        avgPercent: parseFloat(avgPercent.toFixed(4)),
        count: records.length,
        bySource,
        records: records.map((r) => ({
          id: r.id,
          profitThb: parseFloat(r.profitThb.toString()),
          profitPercent: parseFloat(r.profitPercent.toString()),
          source: r.source,
          date: r.recordDate,
          description: r.description,
        })),
      };
    }),

  /**
   * Get daily chart data for last N days (deposits, USDT, fee, profit)
   */
  getDailyChart: protectedProcedure
    .input(z.object({ days: z.number().int().min(1).max(30).default(7) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      const userId = ctx.user.id;

      const result: Array<{ date: string; deposits: number; usdt: number; fee: number; profit: number }> = [];
      const MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

      for (let i = input.days - 1; i >= 0; i--) {
        const day = new Date();
        day.setDate(day.getDate() - i);
        day.setHours(0, 0, 0, 0);
        const nextDay = new Date(day);
        nextDay.setDate(nextDay.getDate() + 1);

        const [deps, usdts, profits] = await Promise.all([
          db.select().from(depositSlips).where(
            and(eq(depositSlips.userId, userId), gte(depositSlips.slipDate, day), lte(depositSlips.slipDate, nextDay), eq(depositSlips.status, 'verified'))
          ),
          db.select().from(usdtUploads).where(
            and(eq(usdtUploads.userId, userId), gte(usdtUploads.uploadDate, day), lte(usdtUploads.uploadDate, nextDay))
          ),
          db.select().from(profitRecords).where(
            and(eq(profitRecords.userId, userId), gte(profitRecords.recordDate, day), lte(profitRecords.recordDate, nextDay))
          ),
        ]);

        const totalDep = deps.reduce((s, d) => s + parseFloat(d.amount.toString()), 0);
        const totalUsdt = usdts.reduce((s, u) => s + parseFloat(u.usdtAmount.toString()), 0);
        const totalFee = usdts.reduce((s, u) => s + parseFloat(u.thbEquivalent.toString()), 0);
        const totalProfit = profits.reduce((s, p) => s + parseFloat(p.profitThb.toString()), 0);

        const label = `${day.getDate().toString().padStart(2, '0')} ${MONTHS[day.getMonth()]}`;
        result.push({ date: label, deposits: totalDep, usdt: totalUsdt, fee: totalFee, profit: totalProfit });
      }

      return result;
    }),

  /**
   * Get summary dashboard data (deposits + USDT + profit today)
   */
  getSummaryToday: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    const userId = ctx.user.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get deposits
    const depositsData = await db
      .select()
      .from(depositSlips)
      .where(
        and(
          eq(depositSlips.userId, userId),
          gte(depositSlips.slipDate, today),
          lte(depositSlips.slipDate, tomorrow),
          eq(depositSlips.status, "verified")
        )
      );

    const totalDeposits = depositsData.reduce((sum: number, d: any) => sum + parseFloat(d.amount.toString()), 0);

    // Get USDT
    const usdtData = await db
      .select()
      .from(usdtUploads)
      .where(
        and(
          eq(usdtUploads.userId, userId),
          gte(usdtUploads.uploadDate, today),
          lte(usdtUploads.uploadDate, tomorrow)
        )
      );

    const totalUSDT = usdtData.reduce((sum: number, u: any) => sum + parseFloat(u.usdtAmount.toString()), 0);
    const totalUSDTTHB = usdtData.reduce((sum: number, u: any) => sum + parseFloat(u.thbEquivalent.toString()), 0);

    // Get profit
    const profitData = await db
      .select()
      .from(profitRecords)
      .where(
        and(
          eq(profitRecords.userId, userId),
          gte(profitRecords.recordDate, today),
          lte(profitRecords.recordDate, tomorrow)
        )
      );

    const totalProfit = profitData.reduce((sum: number, p: any) => sum + parseFloat(p.profitThb.toString()), 0);

    return {
      deposits: {
        total: parseFloat(totalDeposits.toFixed(2)),
        count: depositsData.length,
      },
      usdt: {
        total: parseFloat(totalUSDT.toFixed(4)),
        totalTHB: parseFloat(totalUSDTTHB.toFixed(2)),
        count: usdtData.length,
      },
      profit: {
        total: parseFloat(totalProfit.toFixed(2)),
        count: profitData.length,
      },
    };
  }),
};
