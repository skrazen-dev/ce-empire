import { useState } from 'react';
import { Plus, Search, Trash2, Edit3, Eye, EyeOff } from 'lucide-react';
import { useStore } from '@/lib/store';
import { getBankByCode, BANKS } from '@/lib/banks';
import { money, maskAccountNo } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function AccountsPage() {
  const { accounts, addAccount, deleteAccount } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [revealedPins, setRevealedPins] = useState<Set<string>>(new Set());

  const togglePin = (id: string) => {
    setRevealedPins((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="animate-fade-up space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">บัญชีทั้งหมด</h2>
          <p className="text-sm text-muted-foreground">{accounts.length} บัญชี</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus size={16} /> เพิ่มบัญชี
        </Button>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Search size={40} className="text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">ยังไม่มีบัญชี — เพิ่มบัญชีแรกของคุณ</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {accounts.map((acc) => {
            const bank = getBankByCode(acc.bankCode);
            return (
              <Card key={acc.id} className="group hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {bank && (
                      <img src={bank.icon} alt={bank.name} className="w-10 h-10 rounded-lg object-contain bg-white/5 p-1" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{bank?.name || acc.bankCode}</p>
                      <p className="text-xs text-muted-foreground font-mono">{maskAccountNo(acc.accountNo)}</p>
                    </div>
                    <button
                      onClick={() => deleteAccount(acc.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-all"
                      aria-label="ลบบัญชี"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{acc.firstName} {acc.lastName}</span>
                    <button
                      onClick={() => togglePin(acc.id)}
                      className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {revealedPins.has(acc.id) ? <EyeOff size={12} /> : <Eye size={12} />}
                      <span className="font-mono">{revealedPins.has(acc.id) ? acc.pin : '••••'}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border/50">
                    <div>
                      <p className="text-[10px] text-muted-foreground">จ่ายแล้ว</p>
                      <p className="text-sm font-semibold text-emerald-400">฿{money(acc.paidAmount)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">ค้างจ่าย</p>
                      <p className="text-sm font-semibold text-red-400">฿{money(acc.dueAmount)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AccountFormDialog open={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}

function AccountFormDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addAccount } = useStore();
  const [selectedBank, setSelectedBank] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [pin, setPin] = useState('');
  const [paid, setPaid] = useState('0');
  const [due, setDue] = useState('0');

  const reset = () => {
    setSelectedBank(''); setAccountNo(''); setPhone('');
    setFirstName(''); setLastName(''); setPin('');
    setPaid('0'); setDue('0');
  };

  const handleSubmit = () => {
    if (!selectedBank || !accountNo) return;
    addAccount({
      bankCode: selectedBank,
      accountNo,
      linkedPhone: phone,
      firstName,
      lastName,
      pin,
      paidAmount: parseFloat(paid) || 0,
      dueAmount: parseFloat(due) || 0,
    });
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>เพิ่มบัญชี</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">เลือกธนาคาร</Label>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {BANKS.map((bank) => (
                <button
                  key={bank.code}
                  onClick={() => setSelectedBank(bank.code)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-xl border transition-all text-center',
                    selectedBank === bank.code
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                      : 'border-border hover:border-primary/30 hover:bg-accent/50'
                  )}
                  title={bank.fullname}
                >
                  <img src={bank.icon} alt={bank.name} className="w-8 h-8 rounded-lg object-contain" />
                  <span className="text-[9px] text-muted-foreground truncate w-full">{bank.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="accountNo">เลขบัญชี</Label>
              <Input id="accountNo" placeholder="xxx-x-xxxxx-x" value={accountNo} onChange={(e) => setAccountNo(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="phone">เบอร์ผูก</Label>
              <Input id="phone" placeholder="08x-xxx-xxxx" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="firstName">ชื่อ</Label>
              <Input id="firstName" placeholder="ชื่อ" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="lastName">สกุล</Label>
              <Input id="lastName" placeholder="สกุล" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="pin">PIN</Label>
              <Input id="pin" type="password" placeholder="••••" value={pin} onChange={(e) => setPin(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="paid">จ่ายแล้ว</Label>
              <Input id="paid" type="number" value={paid} onChange={(e) => setPaid(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="due">ค้างจ่าย</Label>
              <Input id="due" type="number" value={due} onChange={(e) => setDue(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => { reset(); onClose(); }}>ยกเลิก</Button>
            <Button onClick={handleSubmit} disabled={!selectedBank || !accountNo}>เพิ่มบัญชี</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
