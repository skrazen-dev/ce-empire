import { useState } from 'react';
import { Plus, Users, Trash2, DollarSign, Calendar, Loader2, Phone, MessageSquare } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { formatDate } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function AgentsPage() {
  const utils = trpc.useUtils();
  const { data: agents = [], isLoading } = trpc.agents.list.useQuery();
  const { data: expenses = [] } = trpc.expenses.list.useQuery();

  const deleteMutation = trpc.agents.delete.useMutation({
    onSuccess: () => {
      utils.agents.list.invalidate();
      toast.success('ลบ Agent แล้ว');
    },
    onError: (e) => toast.error(e.message),
  });

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    lineId: '',
    note: '',
  });

  const createMutation = trpc.agents.create.useMutation({
    onSuccess: () => {
      utils.agents.list.invalidate();
      toast.success('เพิ่ม Agent แล้ว');
      setFormData({ name: '', phone: '', lineId: '', note: '' });
      setShowForm(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const handleAdd = () => {
    if (!formData.name.trim()) {
      toast.error('กรุณากรอกชื่อ Agent');
      return;
    }
    createMutation.mutate({
      name: formData.name.trim(),
      phone: formData.phone || undefined,
      lineId: formData.lineId || undefined,
      note: formData.note || undefined,
    });
  };

  // Derived stats
  const totalWithdraw = agents.reduce((s, a) => s + parseFloat(a.withdrawAmount || '0'), 0);
  const totalPending = agents.reduce((s, a) => s + parseFloat(a.pendingAmount || '0'), 0);

  return (
    <div className="animate-fade-up space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Agent</h2>
          <p className="text-xs text-[#A0A0A0]">{agents.length} คน</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="gap-2 bg-[#A855F7] hover:bg-[#9333EA] text-white font-semibold text-xs active:scale-95 transition-transform"
        >
          <Plus size={14} /> เพิ่ม Agent
        </Button>
      </div>

      {/* Summary Cards */}
      {agents.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl p-3 border" style={{ background: 'rgba(168,85,247,0.06)', borderColor: 'rgba(168,85,247,0.18)' }}>
            <p className="text-[10px] text-slate-400 mb-1">ยอดเบิกรวม</p>
            <p className="text-lg font-bold text-purple-400">฿{totalWithdraw.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</p>
            <p className="text-[9px] text-slate-500">{agents.length} Agent</p>
          </div>
          <div className="rounded-xl p-3 border" style={{ background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.18)' }}>
            <p className="text-[10px] text-slate-400 mb-1">ยอดค้างรวม</p>
            <p className="text-lg font-bold text-amber-400">฿{totalPending.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</p>
            <p className="text-[9px] text-slate-500">ค้างชำระ</p>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl bg-[#1A1F26] border border-[rgba(168,85,247,0.2)] p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#242B33]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-[#242B33] rounded w-1/2" />
                  <div className="h-2 bg-[#242B33] rounded w-1/3" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-8 bg-[#242B33] rounded" />
                <div className="h-8 bg-[#242B33] rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && agents.length === 0 ? (
        <Card className="bg-[#1A1F26] border-[rgba(255,255,255,0.06)]">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users size={36} className="text-[#A0A0A0]/30 mb-3" />
            <p className="text-sm text-[#A0A0A0]">ยังไม่มี Agent</p>
            <p className="text-xs text-[#A0A0A0]/60 mt-1">กดปุ่ม "เพิ่ม Agent" เพื่อเริ่มต้น</p>
          </CardContent>
        </Card>
      ) : (
        !isLoading && (
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 stagger-children">
            {agents.map((agent) => {
              const agentExpenses = expenses.filter((e) => e.agentId === agent.id);
              const totalAmount = agentExpenses.reduce((s, e) => s + parseFloat(e.amount || '0'), 0);

              return (
                <Card key={agent.id} className="bg-[#1A1F26] border-[rgba(168,85,247,0.2)] group hover:border-[#A855F7]/40 transition-colors card-hover animate-fade-up">
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A855F7]/20 to-[#7C3AED]/10 border border-[#A855F7]/20 flex items-center justify-center">
                          <span className="text-sm font-bold text-[#A855F7]">{agent.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{agent.name}</p>
                          <p className="text-[10px] text-[#A0A0A0]">เพิ่มเมื่อ {formatDate(new Date(agent.createdAt).toISOString())}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteMutation.mutate({ id: agent.id })}
                        disabled={deleteMutation.isPending}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-[#EF4444]/10 text-[#EF4444] transition-all active:scale-90 disabled:opacity-50"
                        aria-label="ลบ Agent"
                      >
                        {deleteMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>

                    {/* Details Grid */}
                    <div className="space-y-2.5 mb-3">
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-[#0F1419]/50">
                        <DollarSign size={14} className="text-[#14B8A6]" />
                        <div className="flex-1">
                          <p className="text-[10px] text-[#A0A0A0]">ยอดเบิก</p>
                          <p className="text-xs font-semibold text-white">฿{parseFloat(agent.withdrawAmount || '0').toLocaleString('th-TH', { minimumFractionDigits: 2 })}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2 rounded-lg bg-[#0F1419]/50">
                        <DollarSign size={14} className="text-[#F59E0B]" />
                        <div className="flex-1">
                          <p className="text-[10px] text-[#A0A0A0]">ยอดค้าง</p>
                          <p className="text-xs font-semibold text-white">฿{parseFloat(agent.pendingAmount || '0').toLocaleString('th-TH', { minimumFractionDigits: 2 })}</p>
                        </div>
                      </div>

                      {agent.startDate && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-[#0F1419]/50">
                          <Calendar size={14} className="text-[#06B6D4]" />
                          <div className="flex-1">
                            <p className="text-[10px] text-[#A0A0A0]">วันเริ่มงาน</p>
                            <p className="text-xs font-semibold text-white">{formatDate(new Date(agent.startDate).toISOString())}</p>
                          </div>
                        </div>
                      )}

                      {agent.phone && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-[#0F1419]/50">
                          <Phone size={14} className="text-[#A0A0A0]" />
                          <p className="text-xs text-[#A0A0A0]">{agent.phone}</p>
                        </div>
                      )}

                      {agent.lineId && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-[#0F1419]/50">
                          <MessageSquare size={14} className="text-[#06C755]" />
                          <p className="text-xs text-[#A0A0A0]">LINE: {agent.lineId}</p>
                        </div>
                      )}
                    </div>

                    {/* Expenses Summary */}
                    <div className="pt-2 border-t border-[rgba(255,255,255,0.06)] flex items-center gap-4 text-xs text-[#A0A0A0]">
                      <span>{agentExpenses.length} รายการ</span>
                      <span>฿{totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )
      )}

      {/* Add Agent Dialog */}
      <Dialog open={showForm} onOpenChange={(v) => { if (!v) setShowForm(false); }}>
        <DialogContent className="max-w-sm bg-[#1A1F26] border-[rgba(168,85,247,0.2)]">
          <DialogHeader>
            <DialogTitle className="text-white">เพิ่ม Agent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="agentName" className="text-[#A0A0A0]">ชื่อ Agent *</Label>
              <Input
                id="agentName"
                placeholder="ชื่อ..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-[#A0A0A0]">เบอร์โทร</Label>
              <Input
                id="phone"
                placeholder="0812345678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white"
              />
            </div>

            <div>
              <Label htmlFor="lineId" className="text-[#A0A0A0]">LINE ID</Label>
              <Input
                id="lineId"
                placeholder="@line_id"
                value={formData.lineId}
                onChange={(e) => setFormData({ ...formData, lineId: e.target.value })}
                className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white"
              />
            </div>

            <div>
              <Label htmlFor="agentNote" className="text-[#A0A0A0]">หมายเหตุ</Label>
              <Input
                id="agentNote"
                placeholder="บันทึกเพิ่มเติม..."
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="border-[rgba(255,255,255,0.08)] text-[#A0A0A0]">ยกเลิก</Button>
              <Button
                onClick={handleAdd}
                disabled={createMutation.isPending || !formData.name.trim()}
                className="bg-[#A855F7] hover:bg-[#9333EA] text-white font-semibold"
              >
                {createMutation.isPending ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
                เพิ่ม
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
