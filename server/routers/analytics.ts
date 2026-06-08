import { protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { supabaseAdmin as sb } from "../supabase";

const MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

/**
 * Analytics Router
 * Provides endpoints for deposits, USDT, and profit data
 */

export const analyticsRouter = {
  /**
   * Get total deposits (THB) for today or custom date range
   */
  getDeposits: protectedProcedure
    .input(z.object({ startDate: z.date().optional(), endDate: z.date().optional() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const start = input.startDate ?? new Date(new Date().setHours(0, 0, 0, 0));
      const end = input.endDate ?? new Date(new Date().setHours(23, 59, 59, 999));
      const { data: slips } = await sb.from('deposit_slips').select('id,amount,slip_date,description')
        .eq('user_id', userId).eq('status', 'verified')
        .gte('slip_date', start.toISOString()).lte('slip_date', end.toISOString());
      const totalAmount = (slips ?? []).reduce((s: number, d: any) => s + parseFloat(d.amount ?? '0'), 0);
      return { totalAmount, count: (slips ?? []).length, slips: (slips ?? []).map((s: any) => ({ id: s.id, amount: parseFloat(s.amount), date: s.slip_date, description: s.description })) };
    }),

  /**
   * Get total USDT uploads for today or custom date range
   */
  getUSDT: protectedProcedure
    .input(z.object({ startDate: z.date().optional(), endDate: z.date().optional() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const start = input.startDate ?? new Date(new Date().setHours(0, 0, 0, 0));
      const end = input.endDate ?? new Date(new Date().setHours(23, 59, 59, 999));
      const { data: uploads } = await sb.from('usdt_uploads').select('id,usdt_amount,thb_equivalent,thb_rate,upload_date,description')
        .eq('user_id', userId).gte('upload_date', start.toISOString()).lte('upload_date', end.toISOString());
      const list = uploads ?? [];
      const totalUSDT = list.reduce((s: number, u: any) => s + parseFloat(u.usdt_amount ?? '0'), 0);
      const totalTHB = list.reduce((s: number, u: any) => s + parseFloat(u.thb_equivalent ?? '0'), 0);
      const avgRate = list.length > 0 ? list.reduce((s: number, u: any) => s + parseFloat(u.thb_rate ?? '0'), 0) / list.length : 0;
      return { totalUSDT, totalTHB, avgRate: parseFloat(avgRate.toFixed(2)), count: list.length, uploads: list.map((u: any) => ({ id: u.id, usdtAmount: parseFloat(u.usdt_amount), thbEquivalent: parseFloat(u.thb_equivalent), rate: parseFloat(u.thb_rate), date: u.upload_date, description: u.description })) };
    }),

  /**
   * Get profit records for today or custom date range
   */
  getProfitToday: protectedProcedure
    .input(z.object({ startDate: z.date().optional(), endDate: z.date().optional() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const start = input.startDate ?? new Date(new Date().setHours(0, 0, 0, 0));
      const end = input.endDate ?? new Date(new Date().setHours(23, 59, 59, 999));
      const { data: records } = await sb.from('profit_records').select('id,profit_thb,profit_percent,source,record_date,description')
        .eq('user_id', userId).gte('record_date', start.toISOString()).lte('record_date', end.toISOString());
      const list = records ?? [];
      const totalProfit = list.reduce((s: number, r: any) => s + parseFloat(r.profit_thb ?? '0'), 0);
      const avgPercent = list.length > 0 ? list.reduce((s: number, r: any) => s + parseFloat(r.profit_percent ?? '0'), 0) / list.length : 0;
      const bySource: Record<string, { total: number; count: number }> = {};
      list.forEach((r: any) => { if (!bySource[r.source]) bySource[r.source] = { total: 0, count: 0 }; bySource[r.source].total += parseFloat(r.profit_thb ?? '0'); bySource[r.source].count += 1; });
      return { totalProfit, avgPercent: parseFloat(avgPercent.toFixed(4)), count: list.length, bySource, records: list.map((r: any) => ({ id: r.id, profitThb: parseFloat(r.profit_thb), profitPercent: parseFloat(r.profit_percent), source: r.source, date: r.record_date, description: r.description })) };
    }),

  /**
   * Get daily chart data for last N days (deposits, USDT, fee, profit)
   */
  getDailyChart: protectedProcedure
    .input(z.object({ days: z.number().int().min(1).max(30).default(7) }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const result: Array<{ date: string; deposits: number; usdt: number; fee: number; profit: number }> = [];

      for (let i = input.days - 1; i >= 0; i--) {
        const day = new Date();
        day.setDate(day.getDate() - i);
        day.setHours(0, 0, 0, 0);
        const nextDay = new Date(day);
        nextDay.setDate(nextDay.getDate() + 1);

        const [{ data: deps }, { data: usdts }, { data: profits }] = await Promise.all([
          sb.from('deposit_slips').select('amount').eq('user_id', userId)
            .eq('status', 'verified').gte('slip_date', day.toISOString()).lt('slip_date', nextDay.toISOString()),
          sb.from('usdt_uploads').select('usdt_amount,thb_equivalent').eq('user_id', userId)
            .gte('upload_date', day.toISOString()).lt('upload_date', nextDay.toISOString()),
          sb.from('profit_records').select('profit_thb').eq('user_id', userId)
            .gte('record_date', day.toISOString()).lt('record_date', nextDay.toISOString()),
        ]);

        const totalDep = (deps ?? []).reduce((s: number, d: any) => s + parseFloat(d.amount ?? '0'), 0);
        const totalUsdt = (usdts ?? []).reduce((s: number, u: any) => s + parseFloat(u.usdt_amount ?? '0'), 0);
        const totalFee = (usdts ?? []).reduce((s: number, u: any) => s + parseFloat(u.thb_equivalent ?? '0'), 0);
        const totalProfit = (profits ?? []).reduce((s: number, p: any) => s + parseFloat(p.profit_thb ?? '0'), 0);
        const label = `${day.getDate().toString().padStart(2, '0')} ${MONTHS[day.getMonth()]}`;
        result.push({ date: label, deposits: totalDep, usdt: totalUsdt, fee: totalFee, profit: totalProfit });
      }
      return result;
    }),

  /**
   * Get summary dashboard data (deposits + USDT + profit today)
   */
  getSummaryToday: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [{ data: deps }, { data: usdts }, { data: profits }] = await Promise.all([
      sb.from('deposit_slips').select('amount').eq('user_id', userId)
        .eq('status', 'verified').gte('slip_date', today.toISOString()).lt('slip_date', tomorrow.toISOString()),
      sb.from('usdt_uploads').select('usdt_amount,thb_equivalent').eq('user_id', userId)
        .gte('upload_date', today.toISOString()).lt('upload_date', tomorrow.toISOString()),
      sb.from('profit_records').select('profit_thb').eq('user_id', userId)
        .gte('record_date', today.toISOString()).lt('record_date', tomorrow.toISOString()),
    ]);

    const totalDeposits = (deps ?? []).reduce((s: number, d: any) => s + parseFloat(d.amount ?? '0'), 0);
    const totalUSDT = (usdts ?? []).reduce((s: number, u: any) => s + parseFloat(u.usdt_amount ?? '0'), 0);
    const totalUSDTTHB = (usdts ?? []).reduce((s: number, u: any) => s + parseFloat(u.thb_equivalent ?? '0'), 0);
    const totalProfit = (profits ?? []).reduce((s: number, p: any) => s + parseFloat(p.profit_thb ?? '0'), 0);

    return {
      deposits: { total: parseFloat(totalDeposits.toFixed(2)), count: (deps ?? []).length },
      usdt: { total: parseFloat(totalUSDT.toFixed(4)), totalTHB: parseFloat(totalUSDTTHB.toFixed(2)), count: (usdts ?? []).length },
      profit: { total: parseFloat(totalProfit.toFixed(2)), count: (profits ?? []).length },
    };
  }),
};
