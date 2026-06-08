import { useState, useEffect } from 'react';
import { Plus, Receipt, Filter, Check, Scan, Loader2, Trash2 } from 'lucide-react';
import { OCRSlipScanner } from '@/components/OCRSlipScanner';
import type { SlipData } from '@/hooks/useOCR';
import { trpc } from '@/lib/trpc';
import { money, formatDate } from '@/lib/format';
import { getBankByCode } from '@/lib/banks';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type FilterType = 'all' | 'paid' | 'pending';
type CategoryType = 'นายหน้าเบิก' | 'เด็กเบิก' | 'ค่าข้าว' | 'ค่าน้ำมัน/เดินทาง' | 'ค่าธรรมเนียม' | 'ค่าแรง';

const EXPENSE_CATEGORIES: { value: CategoryType; label: string; color: string }[] = [
  { value: 'นายหน้าเบิก', label: 'นายหน้าเบิก', color: '#FF8C42' },
  { value: 'เด็กเบิก', label: 'เด็กเบิก', color: '#A855F7' },
  { value: 'ค่าข้าว', label: 'ค่าข้าว', color: '#10B981' },
  { value: 'ค่าน้ำมัน/เดินทาง', label: 'ค่าน้ำมัน/เดินทาง', color: '#F59E0B' },
  { value: 'ค่าธรรมเนียม', label: 'ค่าธรรมเนียม', color: '#06B6D4' },
  { value: 'ค่าแรง', label: 'ค่าแรง', color: '#EF4444' },
];

export default function ExpensesPage() {
  const utils = trpc.useUtils();
  const { data: expenses = [], isLoading } = trpc.expenses.list.useQuery();
  const { data: accounts = [] } = trpc.accounts.list.useQuery();
  const { data: agents = [] } = trpc.agents.list.useQuery();

  const deleteMutation = trpc.expenses.delete.useMutation({
    onSuccess: () => {
      utils.expenses.list.invalidate();
      toast.success('ลบรายการแล้ว');
    },
    onError: (e) => toast.error(e.message),
  });

  const [filter, setFilter] = useState<FilterType>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryType | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [showSlipOCR, setShowSlipOCR] = useState(false);
  const [slipPrefill, setSlipPrefill] = useState<Partial<SlipData> | null>(null);

  const handleSlipOCRConfirm = (data: SlipData) => {
    setSlipPrefill(data);
    setShowForm(true);
  };

  const filtered = expenses.filter((e) => {
    if (filter === 'paid' && e.status !== 'paid') return false;
    if (filter === 'pending' && e.status !== 'pending') return false;
    if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
    return true;
  });

  const totalPaid = expenses.filter(e => e.status === 'paid').reduce((s, e) => s + parseFloat(e.amount || '0'), 0);
  const totalPending = expenses.filter(e => e.status === 'pending').reduce((s, e) => s + parseFloat(e.amount || '0'), 0);

  return (
    <div className="animate-fade-up space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">ค่าใช้จ่าย</h2>
          <p className="text-xs text-[#A0A0A0]">{filtered.length} รายการ</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowSlipOCR(true)}
            variant="outline"
            className="gap-1.5 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs active:scale-95 transition-transform"
          >
            <Scan size={13} /> สแกนสลิป
          </Button>
          <Button onClick={() => { setSlipPrefill(null); setShowForm(true); }} className="gap-2 bg-[#10B981] hover:bg-[#059669] text-white font-semibold text-xs active:scale-95 transition-transform">
            <Plus size={14} /> เพิ่มรายการ
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {expenses.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl p-3 border" style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.18)' }}>
            <p className="text-[10px] text-slate-400 mb-1">จ่ายแล้ว</p>
            <p className="text-lg font-bold text-emerald-400">฿{money(totalPaid)}</p>
            <p className="text-[9px] text-slate-500">              {expenses.filter(e => e.status === 'paid').length} รายการ</p>
          </div>
          <div className="rounded-xl p-3 border" style={{ background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.18)' }}>
            <p className="text-[10px] text-slate-400 mb-1">ค้างจ่าย</p>
            <p className="text-lg font-bold text-amber-400">฿{money(totalPending)}</p>
            <p className="text-[9px] text-slate-500">              {expenses.filter(e => e.status === 'pending').length} รายการ</p>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <Filter size={13} className="text-[#A0A0A0] shrink-0" />
        {(['all', 'paid', 'pending'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border whitespace-nowrap active:scale-95',
              filter === f
                ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'
                : 'text-[#A0A0A0] border-transparent hover:bg-[#1E2730]'
            )}
          >
            {f === 'all' ? 'ทั้งหมด' : f === 'paid' ? 'จ่ายแล้ว' : 'ค้างจ่าย'}
          </button>
        ))}
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setCategoryFilter('all')}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border transition-all active:scale-95',
            categoryFilter === 'all'
              ? 'bg-white/10 text-white border-white/30'
              : 'text-[#A0A0A0] border-transparent hover:bg-[#1E2730]'
          )}
        >
          ทั้งหมด
        </button>
        {EXPENSE_CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategoryFilter(categoryFilter === cat.value ? 'all' : cat.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border transition-all active:scale-95"
            style={{
              borderColor: cat.color,
              color: categoryFilter === cat.value ? '#fff' : cat.color,
              backgroundColor: categoryFilter === cat.value ? cat.color : `${cat.color}10`,
              boxShadow: categoryFilter === cat.value ? `0 0 8px ${cat.color}60` : 'none',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl bg-[#1A1F26] border border-[rgba(255,255,255,0.06)] p-3.5 animate-pulse flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#242B33] shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-[#242B33] rounded w-1/2" />
                <div className="h-2 bg-[#242B33] rounded w-1/3" />
              </div>
              <div className="h-4 bg-[#242B33] rounded w-16" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 ? (
        <Card className="bg-[#1A1F26] border-[rgba(255,255,255,0.06)]">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Receipt size={36} className="text-[#A0A0A0]/30 mb-3" />
            <p className="text-sm text-[#A0A0A0]">ยังไม่มีรายการค่าใช้จ่าย</p>
          </CardContent>
        </Card>
      ) : (
        !isLoading && (
          <div className="space-y-2 stagger-children">
            {filtered.map((exp) => {
              const acc = accounts.find((a) => a.id === exp.accountId);
              const bank = acc ? getBankByCode(acc.bankCode) : undefined;
              const agent = agents.find((a) => a.id === exp.agentId);
              const categoryInfo = EXPENSE_CATEGORIES.find((c) => c.value === exp.category);

              return (
                <Card key={exp.id} className="bg-[#1A1F26] border-[rgba(255,255,255,0.06)] hover:border-[#10B981]/15 transition-colors card-hover animate-fade-up group">
                  <CardContent className="p-3.5 flex items-center gap-3">
                    {bank && <img src={bank.icon} alt={bank.name} className="w-8 h-8 rounded-lg object-contain bg-white/5 p-0.5 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-xs sm:text-sm font-medium text-white truncate">{exp.title}</p>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        {categoryInfo && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${categoryInfo.color}20`, color: categoryInfo.color }}>
                            {categoryInfo.label}
                          </span>
                        )}
                        <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full font-medium', exp.status === 'paid' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#F59E0B]/10 text-[#F59E0B]')}>
                          {exp.status === 'paid' ? 'จ่ายแล้ว' : 'ค้างจ่าย'}
                        </span>
                        {agent && <span className="text-[9px] text-[#A0A0A0]">{agent.name}</span>}
                        <span className="text-[9px] text-[#A0A0A0]">{formatDate(exp.expenseDate ? new Date(exp.expenseDate).toISOString() : new Date(exp.createdAt).toISOString())}</span>
                        {exp.note && <span className="text-[9px] text-[#A0A0A0] truncate max-w-[80px]">{exp.note}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-white whitespace-nowrap">฿{money(parseFloat(exp.amount || '0'))}</span>
                      <button
                        onClick={() => deleteMutation.mutate({ id: exp.id })}
                        disabled={deleteMutation.isPending}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-[#EF4444]/10 text-[#EF4444] transition-all active:scale-90 disabled:opacity-50"
                        aria-label="ลบ"
                      >
                        {deleteMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )
      )}

      <ExpenseFormDialog
        open={showForm}
        onClose={() => { setShowForm(false); setSlipPrefill(null); }}
        slipPrefill={slipPrefill}
        accounts={accounts}
        agents={agents}
      />
      <OCRSlipScanner open={showSlipOCR} onClose={() => setShowSlipOCR(false)} onConfirm={handleSlipOCRConfirm} />
    </div>
  );
}

function ExpenseFormDialog({
  open, onClose, slipPrefill, accounts, agents,
}: {
  open: boolean;
  onClose: () => void;
  slipPrefill?: Partial<SlipData> | null;
  accounts: Array<{ id: number; bankCode: string; accountNumber: string; accountName: string }>;
  agents: Array<{ id: number; name: string }>;
}) {
  const utils = trpc.useUtils();
  const createMutation = trpc.expenses.create.useMutation({
    onSuccess: () => {
      utils.expenses.list.invalidate();
      toast.success('เพิ่มรายการแล้ว');
      reset();
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'paid' | 'pending'>('pending');
  const [category, setCategory] = useState<CategoryType | ''>('');

  const [accountId, setAccountId] = useState('');
  const [agentId, setAgentId] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseTime, setExpenseTime] = useState('');
  const [noteText, setNoteText] = useState('');

  // Prefill from OCR Slip
  useEffect(() => {
    if (slipPrefill && open) {
      if (slipPrefill.amount) setAmount(slipPrefill.amount);
      if (slipPrefill.date) setExpenseDate(slipPrefill.date);
      if (slipPrefill.time) setExpenseTime(slipPrefill.time);
      if (slipPrefill.senderName) setNoteText(`ผู้โอน: ${slipPrefill.senderName}`);
      if (slipPrefill.referenceNumber) setDesc(`โอนเงิน Ref: ${slipPrefill.referenceNumber}`);
      else if (slipPrefill.receiverName) setDesc(`โอนให้ ${slipPrefill.receiverName}`);
    }
  }, [slipPrefill, open]);

  const reset = () => {
    setDesc(''); setAmount(''); setStatus('pending'); setCategory('');
    setAccountId(''); setAgentId('');
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setExpenseTime(''); setNoteText('');
  };

  const handleSubmit = () => {
    if (!desc || !amount) {
      toast.error('กรุณากรอกรายละเอียดและจำนวนเงิน');
      return;
    }
    createMutation.mutate({
      title: desc,
      amount,
      status,
      category: category || undefined,
      accountId: accountId ? parseInt(accountId) : undefined,
      agentId: agentId ? parseInt(agentId) : undefined,
      dueDate: new Date(expenseDate),
      note: noteText || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#1A1F26] border-[rgba(16,185,129,0.15)]">
        <DialogHeader>
          <DialogTitle className="text-white">เพิ่มค่าใช้จ่าย</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="desc" className="text-[#A0A0A0]">รายละเอียด *</Label>
            <Input id="desc" placeholder="ค่าอะไร..." value={desc} onChange={(e) => setDesc(e.target.value)} className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="amount" className="text-[#A0A0A0]">จำนวนเงิน *</Label>
              <Input id="amount" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white" />
            </div>
            <div>
              <Label className="text-[#A0A0A0]">สถานะ</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as 'paid' | 'pending')}>
                <SelectTrigger className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#242B33] border-[rgba(255,255,255,0.08)]">
                  <SelectItem value="paid">จ่ายแล้ว</SelectItem>
                  <SelectItem value="pending">ค้างจ่าย</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category */}
          <div>
            <Label className="text-[#A0A0A0] mb-2 block">หมวดหมู่</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className="px-3 py-2 rounded-lg text-xs font-medium transition-all border"
                  style={{
                    borderColor: category === cat.value ? cat.color : 'rgba(255,255,255,0.08)',
                    backgroundColor: category === cat.value ? `${cat.color}20` : '#242B33',
                    color: category === cat.value ? cat.color : '#A0A0A0',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="noteText" className="text-[#A0A0A0]">หมายเหตุ</Label>
              <Input id="noteText" placeholder="บันทึกเพิ่มเติม..." value={noteText} onChange={(e) => setNoteText(e.target.value)} className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white" />
            </div>
            <div>
              <Label htmlFor="expenseTime" className="text-[#A0A0A0]">เวลา</Label>
              <Input id="expenseTime" type="time" value={expenseTime} onChange={(e) => setExpenseTime(e.target.value)} className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white" />
            </div>
          </div>



          {accounts.length > 0 && (
            <div>
              <Label className="text-[#A0A0A0]">บัญชี (ไม่บังคับ)</Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white"><SelectValue placeholder="เลือกบัญชี" /></SelectTrigger>
                <SelectContent className="bg-[#242B33] border-[rgba(255,255,255,0.08)]">
                  {accounts.map((a) => {
                    const bank = getBankByCode(a.bankCode);
                    return <SelectItem key={a.id} value={String(a.id)}>{bank?.name} - {a.accountNumber}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          {agents.length > 0 && (
            <div>
              <Label className="text-[#A0A0A0]">Agent (ไม่บังคับ)</Label>
              <Select value={agentId} onValueChange={setAgentId}>
                <SelectTrigger className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white"><SelectValue placeholder="เลือก Agent" /></SelectTrigger>
                <SelectContent className="bg-[#242B33] border-[rgba(255,255,255,0.08)]">
                  {agents.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}



          <div className="flex justify-end gap-2 pt-2 border-t border-[rgba(255,255,255,0.08)]">
            <Button variant="outline" onClick={() => { reset(); onClose(); }} className="border-[rgba(255,255,255,0.08)] text-[#A0A0A0]">ยกเลิก</Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || !desc || !amount}
              className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold"
            >
              {createMutation.isPending ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
              เพิ่มรายการ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
