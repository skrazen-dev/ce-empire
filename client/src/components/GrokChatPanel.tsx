import { useState, useRef, useEffect } from "react";
import { Send, Loader2, AlertCircle, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export default function GrokChatPanel({ accountData }: { accountData?: any }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.grok.chat.useMutation();
  const analyzeRiskMutation = trpc.grok.analyzeRisk.useMutation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage, timestamp: Date.now() }]);
    setIsLoading(true);

    try {
      const response = await chatMutation.mutateAsync({
        message: userMessage,
        conversationHistory: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.response, timestamp: Date.now() },
      ]);
    } catch (err) {
      toast.error("ไม่สามารถส่งข้อความได้");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeRisk = async () => {
    if (!accountData) {
      toast.error("ไม่พบข้อมูลบัญชี");
      return;
    }

    setIsLoading(true);
    try {
      const response = await analyzeRiskMutation.mutateAsync({
        accountName: accountData.accountName || "Unknown",
        bankName: accountData.bankName || "Unknown",
        balance: parseFloat(accountData.balance || "0"),
        receivedAmount: parseFloat(accountData.receivedAmount || "0"),
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `📊 **วิเคราะห์ความเสี่ยง** (${response.riskRatio.toFixed(1)}%)\n\n${response.analysis}`,
          timestamp: Date.now(),
        },
      ]);
    } catch (err) {
      toast.error("ไม่สามารถวิเคราะห์ความเสี่ยงได้");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl h-[500px] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700/50 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
        <h3 className="font-heading text-sm font-semibold text-white">Grok AI Assistant</h3>
        <span className="text-[10px] text-slate-500 ml-auto">ตัวช่วยวิเคราะห์ AI</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <Zap size={32} className="text-slate-600 mb-2" />
            <p className="text-xs text-slate-500">ยังไม่มีข้อความ</p>
            <p className="text-[10px] text-slate-600 mt-1">พิมพ์คำถามหรือกดวิเคราะห์ความเสี่ยง</p>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600/30 text-blue-100 border border-blue-500/30"
                      : "bg-slate-700/40 text-slate-200 border border-slate-600/30"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-700/40 text-slate-300 px-3 py-2 rounded-lg text-xs flex items-center gap-2">
                  <Loader2 size={12} className="animate-spin" />
                  กำลังคิด...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="px-3 pb-3 pt-2 border-t border-slate-700/50 space-y-2">
        {accountData && (
          <Button
            onClick={handleAnalyzeRisk}
            disabled={isLoading}
            size="sm"
            className="w-full btn-secondary text-xs h-7"
          >
            {isLoading ? (
              <>
                <Loader2 size={12} className="animate-spin mr-1" />
                กำลังวิเคราะห์...
              </>
            ) : (
              <>
                <Zap size={12} className="mr-1" />
                วิเคราะห์ความเสี่ยง
              </>
            )}
          </Button>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-1.5">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="พิมพ์คำถาม..."
            disabled={isLoading}
            className="h-8 text-xs bg-slate-800/50 border-slate-600/30 placeholder:text-slate-600"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            size="sm"
            className="btn-primary h-8 px-2"
          >
            <Send size={12} />
          </Button>
        </form>
      </div>
    </div>
  );
}
