import { useState } from 'react';
import { Plus, Users, Trash2 } from 'lucide-react';
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
  const [name, setName] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    addAgent(name.trim());
    setName('');
    setShowForm(false);
  };

  return (
    <div className="animate-fade-up space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Agent</h2>
          <p className="text-sm text-muted-foreground">{agents.length} คน</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus size={16} /> เพิ่ม Agent
        </Button>
      </div>

      {agents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users size={40} className="text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">ยังไม่มี Agent</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => {
            const agentExpenses = expenses.filter((e) => e.agentId === agent.id);
            const totalAmount = agentExpenses.reduce((s, e) => s + e.amount, 0);
            return (
              <Card key={agent.id} className="group hover:border-primary/20 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-purple-300">{agent.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{agent.name}</p>
                        <p className="text-[10px] text-muted-foreground">เพิ่มเมื่อ {formatDate(agent.createdAt)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteAgent(agent.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-all"
                      aria-label="ลบ Agent"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{agentExpenses.length} รายการ</span>
                    <span>฿{totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={(v) => { if (!v) setShowForm(false); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>เพิ่ม Agent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="agentName">ชื่อ Agent</Label>
              <Input id="agentName" placeholder="ชื่อ..." value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>ยกเลิก</Button>
              <Button onClick={handleAdd} disabled={!name.trim()}>เพิ่ม</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
