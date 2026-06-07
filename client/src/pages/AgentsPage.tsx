import { useState } from 'react';
import { Plus, Users, Trash2, DollarSign, Calendar } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatDate } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AgentsPage() {
  const { agents, addAgent, deleteAgent, expenses } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    withdrawAmount: '',
    pendingAmount: '',
    startDate: '',
  });

  const handleAdd = () => {
    if (!formData.name.trim()) return;
    addAgent({
      name: formData.name.trim(),
      withdrawAmount: parseFloat(formData.withdrawAmount) || 0,
      pendingAmount: parseFloat(formData.pendingAmount) || 0,
      startDate: formData.startDate ? new Date(formData.startDate) : new Date(),
    });
    setFormData({ name: '', withdrawAmount: '', pendingAmount: '', startDate: '' });
    setShowForm(false);
  };

  return (
    <div className="animate-fade-up space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Agent</h2>
          <p className="text-xs text-[#A0A0A0]">{agents.length} คน</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2 bg-[#A855F7] hover:bg-[#9333EA] text-white font-semibold text-xs active:scale-95 transition-transform">
          <Plus size={14} /> เพิ่ม Agent
        </Button>
      </div>

      {agents.length === 0 ? (
        <Card className="bg-[#1A1F26] border-[rgba(255,255,255,0.06)]">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users size={36} className="text-[#A0A0A0]/30 mb-3" />
            <p className="text-sm text-[#A0A0A0]">ยังไม่มี Agent</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {agents.map((agent) => {
            const agentExpenses = expenses.filter((e) => e.agentId === agent.id);
            const totalAmount = agentExpenses.reduce((s, e) => s + e.amount, 0);
            const linkedAccounts = useStore().accounts.filter((acc) => agentExpenses.some((e) => e.accountId === acc.id));
            return (
              <Card key={agent.id} className="bg-[#1A1F26] border-[rgba(168,85,247,0.2)] group hover:border-[#A855F7]/40 transition-colors">
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A855F7]/20 to-[#7C3AED]/10 border border-[#A855F7]/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-[#A855F7]">{agent.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{agent.name}</p>
                        <p className="text-[10px] text-[#A0A0A0]">เพิ่มเมื่อ {formatDate(agent.createdAt)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteAgent(agent.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-[#EF4444]/10 text-[#EF4444] transition-all active:scale-90"
                      aria-label="ลบ Agent"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-2.5 mb-3">
                    {/* Withdraw Amount */}
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-[#0F1419]/50">
                      <DollarSign size={14} className="text-[#14B8A6]" />
                      <div className="flex-1">
                        <p className="text-[10px] text-[#A0A0A0]">ยอดเบิก</p>
                        <p className="text-xs font-semibold text-white">฿{(agent.withdrawAmount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>

                    {/* Pending Amount */}
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-[#0F1419]/50">
                      <DollarSign size={14} className="text-[#F59E0B]" />
                      <div className="flex-1">
                        <p className="text-[10px] text-[#A0A0A0]">ยอดค้าง</p>
                        <p className="text-xs font-semibold text-white">฿{(agent.pendingAmount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>

                    {/* Start Date */}
                    {agent.startDate && (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-[#0F1419]/50">
                        <Calendar size={14} className="text-[#06B6D4]" />
                        <div className="flex-1">
                          <p className="text-[10px] text-[#A0A0A0]">วันเริ่มงาน</p>
                          <p className="text-xs font-semibold text-white">{formatDate(typeof agent.startDate === 'string' ? agent.startDate : new Date(agent.startDate).toISOString())}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Linked Accounts */}
                  {linkedAccounts.length > 0 && (
                    <div className="pt-2 mb-2 border-t border-[rgba(255,255,255,0.06)]">
                      <p className="text-[9px] font-bold text-[#A855F7] mb-1.5 uppercase">บัญชีที่รับผิดชอบ</p>
                      <div className="space-y-1">
                        {linkedAccounts.map((acc) => (
                          <div key={acc.id} className="text-[9px] px-2 py-1 rounded-lg bg-[#A855F7]/10 border border-[#A855F7]/20 text-[#A0A0A0]">
                            {acc.firstName} {acc.lastName} ({acc.accountNo})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
              <Label htmlFor="withdrawAmount" className="text-[#A0A0A0]">ยอดเบิก (฿)</Label>
              <Input 
                id="withdrawAmount" 
                type="number" 
                placeholder="0.00" 
                value={formData.withdrawAmount} 
                onChange={(e) => setFormData({ ...formData, withdrawAmount: e.target.value })} 
                className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white" 
              />
            </div>

            <div>
              <Label htmlFor="pendingAmount" className="text-[#A0A0A0]">ยอดค้าง (฿)</Label>
              <Input 
                id="pendingAmount" 
                type="number" 
                placeholder="0.00" 
                value={formData.pendingAmount} 
                onChange={(e) => setFormData({ ...formData, pendingAmount: e.target.value })} 
                className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white" 
              />
            </div>

            <div>
              <Label htmlFor="startDate" className="text-[#A0A0A0]">วันเริ่มงาน</Label>
              <Input 
                id="startDate" 
                type="date" 
                value={formData.startDate} 
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} 
                className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white" 
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="border-[rgba(255,255,255,0.08)] text-[#A0A0A0]">ยกเลิก</Button>
              <Button onClick={handleAdd} disabled={!formData.name.trim()} className="bg-[#A855F7] hover:bg-[#9333EA] text-white font-semibold">เพิ่ม</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
