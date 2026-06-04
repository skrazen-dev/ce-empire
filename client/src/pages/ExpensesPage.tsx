import { useState } from 'react';
import { Plus, Receipt, Filter } from 'lucide-react';
import { useStore } from '@/lib/store';
import { money, formatDate } from '@/lib/format';
import { getBankByCode } from '@/lib/banks';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'paid' | 'pending';

export default function ExpensesPage() {
  const { expenses, deleteExpense, accounts, agents } = useStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [showForm, setShowForm] = useState(false);

  const filtered = expenses.filter((e) => {
    if (filter === 'paid') return e.type === 'paid';
    if (filter === 'pending') return e.type === 'pending';
    return true;
  });

  return (
    <div className="animate-fade-up space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">ค่าใช้จ่าย</h2>
          <p className="text-sm text-muted-foreground">{filtered.length} รายการ</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus size={16} /> เพิ่มรายการ
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Filter size={14} className="text-muted-foreground" />
        {(['all', 'paid', 'pending'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
              filter === f
                ? 'bg-primary/10 text-primary border-primary/30'
                : 'text-muted-foreground border-transparent hover:bg-accent'
            )}
          >
            {f === 'all' ? 'ทั้งหมด' : f === 'paid' ? 'จ่ายแล้ว' : 'ค้างจ่าย'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Receipt size={40} className="text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">ยังไม่มีรายการค่าใช้จ่าย</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((exp) => {
            const acc = accounts.find((a) => a.id === exp.accountId);
            const bank = acc ? getBankByCode(acc.bankCode) : undefined;
            const agent = agents.find((a) => a.id === exp.agentId);
            return (
              <Card key={exp.id} className="group hover:border-primary/20 transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  {bank && <img src={bank.icon} alt={bank.name} className="w-8 h-8 rounded-lg object-contain bg-white/5 p-0.5" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{exp.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', exp.type === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400')}>
                        {exp.type === 'paid' ? 'จ่ายแล้ว' : 'ค้างจ่าย'}
                      </span>
                      {agent && <span className="text-[10px] text-muted-foreground">• {agent.name}</span>}
                      <span className="text-[10px] text-muted-foreground">• {formatDate(exp.createdAt)}</span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-foreground whitespace-nowrap">฿{money(exp.amount)}</span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ExpenseFormDialog open={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}

function ExpenseFormDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addExpense, accounts, agents } = useStore();
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'paid' | 'pending'>('pending');
  const [accountId, setAccountId] = useState('');
  const [agentId, setAgentId] = useState('');

  const reset = () => { setDesc(''); setAmount(''); setType('pending'); setAccountId(''); setAgentId(''); };

  const handleSubmit = () => {
    if (!desc || !amount) return;
    addExpense({
      description: desc,
      amount: parseFloat(amount) || 0,
      type,
      accountId: accountId || undefined,
      agentId: agentId || undefined,
    });
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>เพิ่มค่าใช้จ่าย</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="desc">รายละเอียด</Label>
            <Input id="desc" placeholder="ค่าอะไร..." value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="amount">จำนวนเงิน</Label>
              <Input id="amount" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <Label>สถานะ</Label>
              <Select value={type} onValueChange={(v) => setType(v as 'paid' | 'pending')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">จ่ายแล้ว</SelectItem>
                  <SelectItem value="pending">ค้างจ่าย</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {accounts.length > 0 && (
            <div>
              <Label>บัญชี (ไม่บังคับ)</Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger><SelectValue placeholder="เลือกบัญชี" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => {
                    const bank = getBankByCode(a.bankCode);
                    return <SelectItem key={a.id} value={a.id}>{bank?.name} - {a.accountNo}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
          )}
          {agents.length > 0 && (
            <div>
              <Label>Agent (ไม่บังคับ)</Label>
              <Select value={agentId} onValueChange={setAgentId}>
                <SelectTrigger><SelectValue placeholder="เลือก Agent" /></SelectTrigger>
                <SelectContent>
                  {agents.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => { reset(); onClose(); }}>ยกเลิก</Button>
            <Button onClick={handleSubmit} disabled={!desc || !amount}>เพิ่มรายการ</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
