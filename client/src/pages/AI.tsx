// ─── AI Assistant (ผู้ช่วย AI) ──────────────────────────────────────────────────
//
// แชทถาม-ตอบภาษาไทย เช่น "วันนี้กำไรเท่าไร", "รายการไม่มีสลิป",
// "ธนาคารใกล้เต็ม", "งานค้าง"
//
// ใช้ Grok router ที่มีอยู่ (trpc.grok.chat) โดย "ฉีดข้อมูลจริงจาก DB"
// เข้าไปใน context ของข้อความ — ตัวเลขทั้งหมดมาจาก tRPC procedures จริง
// (analytics / expenses / accounts / tasks / risk) ห้าม AI แต่งตัวเลขเอง
//
// ถ้าไม่ได้ตั้งค่า XAI_API_KEY จะแสดงสถานะแนะนำแทนการ crash

import { useState, useRef, useEffect, useMemo } from "react";
import { Send, Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const GOLD = "#D4AF37";

const SUGGESTIONS = [
  "วันนี้กำไรเท่าไร",
  "รายการไม่มีสลิป",
  "ธนาคารใกล้เต็ม",
  "งานค้าง",
];

// แปลง creditLimit enum ("50k"|"200k"|"500k") → ตัวเลขวงเงิน (บาท)
function creditLimitToNumber(limit?: string | null): number | null {
  if (!limit) return null;
  if (limit === "50k") return 50_000;
  if (limit === "200k") return 200_000;
  if (limit === "500k") return 500_000;
  return null;
}

function fmt(n: number): string {
  return n.toLocaleString("th-TH", { maximumFractionDigits: 2 });
}

export default function AI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── ดึงข้อมูลจริงจาก DB ผ่าน tRPC procedures ที่มีอยู่ ──
  const summaryQuery = trpc.analytics.getSummaryToday.useQuery();
  const accountsQuery = trpc.accounts.list.useQuery();
  const expensesQuery = trpc.expenses.list.useQuery();
  const tasksQuery = trpc.tasks.getMyActiveTasks.useQuery();
  const alertsQuery = trpc.risk.listAlerts.useQuery({ limit: 20 });

  // ตรวจสอบว่า Grok API พร้อมใช้งานไหม (XAI_API_KEY)
  const connectionQuery = trpc.grok.testConnection.useQuery(undefined, {
    retry: false,
  });

  const chatMutation = trpc.grok.chat.useMutation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ── สร้าง context จากข้อมูลจริง เพื่อ ground คำตอบของ AI ──
  const dataContext = useMemo(() => {
    const lines: string[] = [];

    // สรุปวันนี้ (deposits / usdt / profit)
    const s = summaryQuery.data;
    if (s) {
      lines.push(
        `[สรุปวันนี้] ยอดฝากที่ยืนยันแล้ว: ฿${fmt(s.deposits.total)} (${s.deposits.count} รายการ), ` +
          `USDT ที่อัพ: ${fmt(s.usdt.total)} USDT (≈฿${fmt(s.usdt.totalTHB)}), ` +
          `กำไรวันนี้: ฿${fmt(s.profit.total)} (${s.profit.count} รายการ)`
      );
    }

    // ธุรกรรม/ค่าใช้จ่ายที่ไม่มีสลิป (proofUrl ว่าง)
    const expenses = expensesQuery.data ?? [];
    if (expenses.length) {
      const noSlip = expenses.filter(
        (e: any) => !e.proofUrl && !e.proof_url
      );
      lines.push(
        `[ธุรกรรม] ทั้งหมด ${expenses.length} รายการ, ไม่มีสลิป/หลักฐาน ${noSlip.length} รายการ` +
          (noSlip.length
            ? ": " +
              noSlip
                .slice(0, 10)
                .map(
                  (e: any) =>
                    `${e.title ?? e.description ?? "ไม่ระบุ"} (฿${fmt(parseFloat(e.amount ?? "0"))})`
                )
                .join(", ")
            : "")
      );
    }

    // ธนาคารใกล้เต็มวงเงิน (balance เทียบ creditLimit)
    const accounts = accountsQuery.data ?? [];
    if (accounts.length) {
      const withLimit = accounts
        .map((a: any) => {
          const limit = creditLimitToNumber(a.creditLimit ?? a.credit_limit);
          const balance = parseFloat(a.balance ?? "0");
          const usedPct = limit ? (balance / limit) * 100 : null;
          return {
            name: a.accountName ?? a.account_name ?? a.bankName ?? "บัญชี",
            bank: a.bankName ?? a.bank_name ?? "",
            balance,
            limit,
            usedPct,
          };
        })
        .filter((a) => a.usedPct !== null)
        .sort((x, y) => (y.usedPct ?? 0) - (x.usedPct ?? 0));

      lines.push(
        `[ธนาคาร] ทั้งหมด ${accounts.length} บัญชี` +
          (withLimit.length
            ? ", เรียงตามการใช้วงเงิน: " +
              withLimit
                .slice(0, 8)
                .map(
                  (a) =>
                    `${a.bank} ${a.name} ใช้ไป ${a.usedPct!.toFixed(0)}% (฿${fmt(a.balance)}/฿${fmt(a.limit!)})`
                )
                .join(", ")
            : "")
      );
    }

    // งานค้าง
    const tasks = tasksQuery.data ?? [];
    if (tasks.length) {
      lines.push(
        `[งานค้าง] ${tasks.length} งาน: ` +
          tasks
            .slice(0, 10)
            .map((t: any) => `${t.title}${t.priority ? ` [${t.priority}]` : ""}`)
            .join(", ")
      );
    } else {
      lines.push("[งานค้าง] ไม่มีงานค้าง");
    }

    // Risk alerts ที่ยังไม่แก้ไข
    const alerts = (alertsQuery.data ?? []).filter((a: any) => !a.isResolved);
    if (alerts.length) {
      lines.push(
        `[ความเสี่ยง] มี ${alerts.length} การแจ้งเตือนที่ยังไม่แก้: ` +
          alerts
            .slice(0, 8)
            .map((a: any) => `${a.riskLevel}: ${a.message}`)
            .join(" | ")
      );
    }

    return lines.join("\n");
  }, [
    summaryQuery.data,
    expensesQuery.data,
    accountsQuery.data,
    tasksQuery.data,
    alertsQuery.data,
  ]);

  const apiUnavailable =
    connectionQuery.data && connectionQuery.data.connected === false;

  const sendMessage = async (text: string) => {
    const userMessage = text.trim();
    if (!userMessage || isLoading) return;

    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage, timestamp: Date.now() },
    ]);
    setIsLoading(true);

    try {
      // ฉีดข้อมูลจริงเข้าไปในข้อความ เพื่อให้ AI ตอบจากตัวเลขจริงเท่านั้น
      const groundedMessage =
        `ข้อมูลจริงจากระบบ (ใช้ตอบโดยห้ามแต่งตัวเลขเพิ่ม):\n${dataContext}\n\n` +
        `คำถามจากเจ้าของกิจการ: ${userMessage}`;

      const response = await chatMutation.mutateAsync({
        message: groundedMessage,
        conversationHistory: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.response, timestamp: Date.now() },
      ]);
    } catch (err: any) {
      const msg = String(err?.message ?? "");
      if (/api key|XAI_API_KEY|not configured/i.test(msg)) {
        toast.error("ตั้งค่า XAI_API_KEY ก่อนใช้งาน");
      } else {
        toast.error("ไม่สามารถส่งข้อความได้");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const dataLoading =
    summaryQuery.isLoading ||
    accountsQuery.isLoading ||
    expensesQuery.isLoading ||
    tasksQuery.isLoading;

  return (
    <div className="max-w-3xl mx-auto px-1 sm:px-2">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${GOLD}18`, boxShadow: `0 0 16px ${GOLD}40` }}
        >
          <Sparkles size={20} style={{ color: GOLD }} />
        </div>
        <div>
          <h1 className="font-heading text-xl font-bold text-white tracking-tight">
            ผู้ช่วย AI
          </h1>
          <p className="text-xs text-slate-400">
            ถามข้อมูลธุรกิจของคุณเป็นภาษาไทย — ตอบจากข้อมูลจริงในระบบ
          </p>
        </div>
        {!dataLoading && (
          <span className="ml-auto text-[10px] text-slate-500 hidden sm:block">
            อ้างอิงข้อมูลสด
          </span>
        )}
      </div>

      {/* แจ้งเตือนเมื่อ XAI_API_KEY ไม่พร้อม */}
      {apiUnavailable && (
        <div className="mb-4 flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-amber-300">ตั้งค่า XAI_API_KEY ก่อนใช้งาน</p>
            <p className="text-amber-200/70 text-xs mt-1">
              ผู้ช่วย AI ต้องใช้ Grok (xAI) — โปรดตั้งค่าตัวแปรสภาพแวดล้อม{" "}
              <code className="font-mono">XAI_API_KEY</code> ที่ฝั่งเซิร์ฟเวอร์
              ก่อนเริ่มสนทนา
            </p>
          </div>
        </div>
      )}

      {/* Chat container */}
      <div
        className="rounded-2xl flex flex-col overflow-hidden h-[calc(100vh-260px)] min-h-[420px]"
        style={{
          background:
            "linear-gradient(135deg, rgba(13,24,41,0.95) 0%, rgba(10,16,32,0.9) 100%)",
          border: `1.5px solid ${GOLD}33`,
          boxShadow: `0 0 24px ${GOLD}1f, inset 0 1px 0 rgba(255,255,255,0.05)`,
        }}
      >
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4">
              <Sparkles size={36} style={{ color: `${GOLD}99` }} />
              <div>
                <p className="text-sm text-slate-300 font-medium">
                  ถามอะไรก็ได้เกี่ยวกับธุรกิจของคุณ
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  คำตอบอ้างอิงจากยอดฝาก กำไร ธนาคาร งาน และความเสี่ยงจริง
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-w-md">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-full text-xs text-slate-300 border transition-all hover:text-white disabled:opacity-50"
                    style={{
                      borderColor: `${GOLD}44`,
                      background: `${GOLD}0d`,
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className="max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                    style={
                      msg.role === "user"
                        ? {
                            background: `${GOLD}22`,
                            border: `1px solid ${GOLD}44`,
                            color: "#F5E6B3",
                          }
                        : {
                            background: "rgba(148,163,184,0.08)",
                            border: "1px solid rgba(148,163,184,0.18)",
                            color: "#E2E8F0",
                          }
                    }
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-700/30 text-slate-300 px-4 py-2.5 rounded-2xl text-sm flex items-center gap-2 border border-slate-600/20">
                    <Loader2 size={14} className="animate-spin" />
                    กำลังคิด...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="px-3 pb-3 pt-2 border-t border-white/5">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                apiUnavailable
                  ? "ตั้งค่า XAI_API_KEY ก่อนใช้งาน"
                  : "พิมพ์คำถาม เช่น วันนี้กำไรเท่าไร..."
              }
              disabled={isLoading}
              className="bg-slate-900/60 border-white/10 text-white placeholder:text-slate-600"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 font-semibold"
              style={{ background: GOLD, color: "#1a1205" }}
            >
              <Send size={16} />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
