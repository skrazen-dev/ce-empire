import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, CheckCircle2, ClipboardList } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function MegaDashboard() {
  // ==========================================
  // 📊 1. ดึงข้อมูลสถิติสำหรับกราฟ (Queries)
  // ==========================================
  const { data: trendData, isLoading: isChartLoading } = trpc.analytics.getDepositTrend.useQuery();

  // ==========================================
  // 📋 2. ดึงข้อมูลงานและจัดการสถานะ (Tasks)
  // ==========================================
  const utils = trpc.useUtils();

  // ดึงรายการงานที่ต้องทำ
  const { data: tasks, isLoading: isTasksLoading } = trpc.tasks.getMyActiveTasks.useQuery();

  // ฟังก์ชันกดยืนยันปิดงาน (Mutation)
  const completeTaskMutation = trpc.tasks.completeTask.useMutation({
    onSuccess: () => {
      utils.tasks.getMyActiveTasks.invalidate();
      toast.success("ปิดงานเรียบร้อย เยี่ยมมาก!");
    },
    onError: (err) => {
      toast.error(`เกิดข้อผิดพลาด: ${err.message}`);
    },
  });

  return (
    <div className="relative min-h-screen bg-black text-white p-6">
      {/* 🚀 ปุ่ม Drawer เปิดหน้า Tasks */}
      <div className="absolute top-6 right-6 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <button className="flex items-center gap-2 bg-slate-900 border border-white/10 hover:border-cyan-500/50 px-4 py-2 rounded-full transition-all">
              <ClipboardList className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium">My Tasks ({tasks?.length || 0})</span>
            </button>
          </SheetTrigger>

          <SheetContent side="right" className="w-[400px] bg-slate-950 border-l border-white/10 overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-white flex items-center gap-2">
                <CheckCircle2 className="text-emerald-400" /> งานที่ต้องทำวันนี้
              </SheetTitle>
            </SheetHeader>

            <div className="mt-6 flex flex-col gap-4">
              {isTasksLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-cyan-500" />
                </div>
              ) : tasks?.length === 0 ? (
                <div className="text-center text-slate-500 py-10">ไม่มีงานค้างแล้ว ลุยงานอื่นต่อได้เลย! 🎉</div>
              ) : (
                tasks?.map((task: any) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center group"
                  >
                    <div>
                      <h4 className="text-sm font-medium text-white">{task.title}</h4>
                      {task.priority === "urgent" && (
                        <span className="text-[10px] px-2 py-1 rounded-md bg-rose-500/20 text-rose-400 mt-1 inline-block">
                          Urgent
                        </span>
                      )}
                    </div>
                    {/* ปุ่มกดเสร็จสิ้นงาน */}
                    <button
                      disabled={completeTaskMutation.isPending}
                      onClick={() => completeTaskMutation.mutate({ taskId: task.id })}
                      className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center hover:bg-emerald-500/20 hover:border-emerald-500 hover:text-emerald-400 transition-all"
                    >
                      {completeTaskMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* 📊 พื้นที่หลัก: กราฟ (Recharts) */}
      <div className="mt-16 h-[400px] w-full bg-slate-900/50 rounded-2xl border border-white/10 p-6">
        <h3 className="text-lg font-medium text-slate-300 mb-6">Deposit Trend (7 Days)</h3>

        {isChartLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData || []}>
              <defs>
                <linearGradient id="colorCyan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#475569" fontSize={12} />
              <YAxis stroke="#475569" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b" }} />
              <Area type="monotone" dataKey="amount" stroke="#06b6d4" strokeWidth={3} fill="url(#colorCyan)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
