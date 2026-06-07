import { useState } from 'react';
import { Plus, Search, Trash2, Eye, EyeOff, Copy, Check, CreditCard, TrendingUp, AlertCircle, Wallet } from 'lucide-react';
import { toast } from 'sonner';  
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
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const togglePin = (id: string) => {
    setRevealedPins((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldId);
      toast.success('คัดลอกแล้ว', { duration: 1200 });
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  // Quick Stats
  const totalPaid = accounts.reduce((s, a) => s + a.paidAmount, 0);
  const totalDue = accounts.reduce((s, a) => s + a.dueAmount, 0);
  const totalBalance = totalPaid + totalDue;

  return (
    <div className="animate-fade-up space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">บัญชีทั้งหมด</h2>
          <p className="text-xs text-[#A0A0A0]">{accounts.length} บัญชี</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2 bg-[#FF8C42] hover:bg-[#E67E2F] text-white font-semibold text-xs active:scale-95 transition-transform">
          <Plus size={14} /> เพิ่มบัญชี
        </Button>
      </div>

      {/* Quick Stats Cards */}
      {accounts.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-xl p-3 border" style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.08) 0%, rgba(0,212,255,0.04) 100%)', borderColor: 'rgba(0,212,255,0.18)' }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <CreditCard size={12} className="text-[#00D4FF]" />
              <span className="text-[10px] text-slate-400">บัญชีทั้งหมด</span>
            </div>
            <p className="text-xl font-bold text-[#00D4FF]">{accounts.length}</p>
            <p className="text-[9px] text-slate-500">บัญชี</p>
          </div>
          <div className="rounded-xl p-3 border" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.04) 100%)', borderColor: 'rgba(16,185,129,0.18)' }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <TrendingUp size={12} className="text-emerald-400" />
              <span className="text-[10px] text-slate-400">จ่ายแล้ว</span>
            </div>
            <p className="text-xl font-bold text-emerald-400">฿{money(totalPaid)}</p>
            <p className="text-[9px] text-slate-500">ยอดรวม</p>
          </div>
          <div className="rounded-xl p-3 border" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(239,68,68,0.04) 100%)', borderColor: 'rgba(239,68,68,0.18)' }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <AlertCircle size={12} className="text-red-400" />
              <span className="text-[10px] text-slate-400">ค้างจ่าย</span>
            </div>
            <p className="text-xl font-bold text-red-400">฿{money(totalDue)}</p>
            <p className="text-[9px] text-slate-500">ยอดรวม</p>
          </div>
          <div className="rounded-xl p-3 border" style={{ background: 'linear-gradient(135deg, rgba(255,140,66,0.08) 0%, rgba(255,140,66,0.04) 100%)', borderColor: 'rgba(255,140,66,0.18)' }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Wallet size={12} className="text-[#FF8C42]" />
              <span className="text-[10px] text-slate-400">ยอดรวม</span>
            </div>
            <p className="text-xl font-bold text-[#FF8C42]">฿{money(totalBalance)}</p>
            <p className="text-[9px] text-slate-500">จ่าย+ค้าง</p>
          </div>
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[rgba(255,140,66,0.2)] bg-[#1A1F26]/60 flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-16 h-16 rounded-2xl bg-[#FF8C42]/10 flex items-center justify-center">
            <CreditCard size={28} className="text-[#FF8C42]/60" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white">ยังไม่มีบัญชี</p>
            <p className="text-xs text-[#A0A0A0] mt-1">เพิ่มบัญชีแรกเพื่อเริ่มต้นใช้งาน</p>
          </div>
          <Button onClick={() => setShowForm(true)} size="sm" className="bg-[#FF8C42] hover:bg-[#E67E2F] text-white text-xs gap-1.5">
            <Plus size={12} /> เพิ่มบัญชีแรก
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map((acc) => {
            const bank = getBankByCode(acc.bankCode);
            return (
              <Card key={acc.id} className="bg-[#1A1F26] border-[rgba(255,140,66,0.15)] group hover:border-[#FF8C42]/30 transition-colors">
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    {bank && (
                      <img src={bank.icon} alt={bank.name} className="w-10 h-10 rounded-xl object-contain bg-white/5 p-1" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{bank?.name || acc.bankCode}</p>
                      <p className="text-xs text-[#A0A0A0] font-mono">{maskAccountNo(acc.accountNo)}</p>
                    </div>
                    <button
                      onClick={() => deleteAccount(acc.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-[#EF4444]/10 text-[#EF4444] transition-all active:scale-90"
                      aria-label="ลบบัญชี"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Owner Info */}
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="text-[#A0A0A0]">{acc.firstName} {acc.lastName}</span>
                    <button
                      onClick={() => togglePin(acc.id)}
                      className="flex items-center gap-1 text-[#A0A0A0] hover:text-white transition-colors active:scale-95"
                    >
                      {revealedPins.has(acc.id) ? <EyeOff size={12} /> : <Eye size={12} />}
                      <span className="font-mono">{revealedPins.has(acc.id) ? acc.pin : '••••'}</span>
                    </button>
                  </div>

                  {/* Payment Status */}
                  <div className="grid grid-cols-2 gap-2 mb-3 pb-3 border-b border-[rgba(255,255,255,0.06)]">
                    <div>
                      <p className="text-[10px] text-[#A0A0A0]">จ่ายแล้ว</p>
                      <p className="text-sm font-semibold text-[#10B981]">฿{money(acc.paidAmount)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#A0A0A0]">ค้างจ่าย</p>
                      <p className="text-sm font-semibold text-[#EF4444]">฿{money(acc.dueAmount)}</p>
                    </div>
                  </div>

                  {/* Account Status Section */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-[#FF8C42] uppercase tracking-widest">สถานะบัญชี</p>

                    {/* Account Type & Credit Limit */}
                    {((acc.accountType && acc.accountType.length > 0) || acc.creditLimit) && (
                      <div className="space-y-1.5 mb-2">
                        {acc.accountType && acc.accountType.length > 0 && (
                          <div>
                            <p className="text-[9px] text-[#A0A0A0] mb-1">ประเภท</p>
                            <div className="flex flex-wrap gap-1">
                              {acc.accountType.map((t) => (
                                <span key={t} className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#FF8C42]/20 border border-[#FF8C42]/40 text-[#FF8C42]">
                                  {t === 'complete' ? 'แอคตัดครบ' : t.toUpperCase()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {acc.creditLimit && (
                          <div className="flex items-center gap-1.5">
                            <p className="text-[9px] text-[#A0A0A0]">วงเงิน:</p>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">{acc.creditLimit}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Account Details with Copy Buttons */}
                    <div className="space-y-1 text-[9px]">
                      {/* Account Number */}
                      <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#0F1419]/50 group/copy hover:bg-[#0F1419]/70 transition-colors">
                        <div className="flex-1 min-w-0">
                          <span className="text-[#A0A0A0]">เลขบช: </span>
                          <span className="text-white font-mono text-[8px]">{acc.accountNo}</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(acc.accountNo, `acc-${acc.id}`)}
                          className="ml-2 p-1 rounded hover:bg-[#FF8C42]/20 transition-all"
                          title="คัดลอก"
                        >
                          {copiedField === `acc-${acc.id}` ? (
                            <Check size={10} className="text-[#10B981]" />
                          ) : (
                            <Copy size={10} className="text-[#A0A0A0] hover:text-[#FF8C42]" />
                          )}
                        </button>
                      </div>

                      {/* Name */}
                      <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#0F1419]/50 group/copy hover:bg-[#0F1419]/70 transition-colors">
                        <div className="flex-1 min-w-0">
                          <span className="text-[#A0A0A0]">ชื่อ: </span>
                          <span className="text-white text-[8px]">{acc.firstName} {acc.lastName}</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(`${acc.firstName} ${acc.lastName}`, `name-${acc.id}`)}
                          className="ml-2 p-1 rounded hover:bg-[#FF8C42]/20 transition-all"
                        >
                          {copiedField === `name-${acc.id}` ? (
                            <Check size={10} className="text-[#10B981]" />
                          ) : (
                            <Copy size={10} className="text-[#A0A0A0] hover:text-[#FF8C42]" />
                          )}
                        </button>
                      </div>

                      {/* Phone */}
                      {acc.linkedPhone && (
                        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#0F1419]/50 group/copy hover:bg-[#0F1419]/70 transition-colors">
                          <div className="flex-1 min-w-0">
                            <span className="text-[#A0A0A0]">เบอร์: </span>
                            <span className="text-white font-mono text-[8px]">{acc.linkedPhone}</span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(acc.linkedPhone, `phone-${acc.id}`)}
                            className="ml-2 p-1 rounded hover:bg-[#FF8C42]/20 transition-all"
                          >
                            {copiedField === `phone-${acc.id}` ? (
                              <Check size={10} className="text-[#10B981]" />
                            ) : (
                              <Copy size={10} className="text-[#A0A0A0] hover:text-[#FF8C42]" />
                            )}
                          </button>
                        </div>
                      )}

                      {/* ID Card */}
                      {acc.idCardNumber && (
                        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#0F1419]/50 group/copy hover:bg-[#0F1419]/70 transition-colors">
                          <div className="flex-1 min-w-0">
                            <span className="text-[#A0A0A0]">บปป: </span>
                            <span className="text-white font-mono text-[8px]">{acc.idCardNumber}</span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(acc.idCardNumber || '', `id-${acc.id}`)}
                            className="ml-2 p-1 rounded hover:bg-[#FF8C42]/20 transition-all"
                          >
                            {copiedField === `id-${acc.id}` ? (
                              <Check size={10} className="text-[#10B981]" />
                            ) : (
                              <Copy size={10} className="text-[#A0A0A0] hover:text-[#FF8C42]" />
                            )}
                          </button>
                        </div>
                      )}

                      {/* Virtual Card */}
                      {acc.virtualCardNumber && (
                        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#0F1419]/50 group/copy hover:bg-[#0F1419]/70 transition-colors">
                          <div className="flex-1 min-w-0">
                            <span className="text-[#A0A0A0]">บัตรเสมือน: </span>
                            <span className="text-white font-mono text-[8px]">{acc.virtualCardNumber}</span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(acc.virtualCardNumber || '', `vcard-${acc.id}`)}
                            className="ml-2 p-1 rounded hover:bg-[#FF8C42]/20 transition-all"
                          >
                            {copiedField === `vcard-${acc.id}` ? (
                              <Check size={10} className="text-[#10B981]" />
                            ) : (
                              <Copy size={10} className="text-[#A0A0A0] hover:text-[#FF8C42]" />
                            )}
                          </button>
                        </div>
                      )}

                      {/* Email */}
                      {acc.accountEmail && (
                        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#0F1419]/50 group/copy hover:bg-[#0F1419]/70 transition-colors">
                          <div className="flex-1 min-w-0">
                            <span className="text-[#A0A0A0]">Email: </span>
                            <span className="text-white text-[8px]">{acc.accountEmail}</span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(acc.accountEmail || '', `email-${acc.id}`)}
                            className="ml-2 p-1 rounded hover:bg-[#FF8C42]/20 transition-all"
                          >
                            {copiedField === `email-${acc.id}` ? (
                              <Check size={10} className="text-[#10B981]" />
                            ) : (
                              <Copy size={10} className="text-[#A0A0A0] hover:text-[#FF8C42]" />
                            )}
                          </button>
                        </div>
                      )}

                      {/* Password */}
                      {acc.accountPassword && (
                        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#0F1419]/50 group/copy hover:bg-[#0F1419]/70 transition-colors">
                          <div className="flex-1 min-w-0">
                            <span className="text-[#A0A0A0]">Pass: </span>
                            <span className="text-white font-mono text-[8px]">••••••••</span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(acc.accountPassword || '', `pass-${acc.id}`)}
                            className="ml-2 p-1 rounded hover:bg-[#FF8C42]/20 transition-all"
                            title="คัดลอกรหัสผ่าน"
                          >
                            {copiedField === `pass-${acc.id}` ? (
                              <Check size={10} className="text-[#10B981]" />
                            ) : (
                              <Copy size={10} className="text-[#A0A0A0] hover:text-[#FF8C42]" />
                            )}
                          </button>
                        </div>
                      )}
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
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [idCardNumber, setIdCardNumber] = useState('');
  const [idCardPhoto, setIdCardPhoto] = useState<File | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [virtualCardNumber, setVirtualCardNumber] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardExpiryDate, setCardExpiryDate] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [accountTypes, setAccountTypes] = useState<('complete' | 'skrill' | 'neteller' | 'bigpay')[]>([]);  
  const [creditLimit, setCreditLimit] = useState<'50k' | '200k' | '500k' | ''>('');

  const reset = () => {
    setSelectedBank(''); setAccountNo(''); setPhone('');
    setFirstName(''); setLastName(''); setPin('');
    setPaid('0'); setDue('0');
    setProfilePhoto(null); setIdCardNumber(''); setIdCardPhoto(null);
    setDateOfBirth(''); setVirtualCardNumber(''); setCardCVV('');
    setCardExpiryDate(''); setAccountEmail(''); setAccountPassword('');
    setAccountTypes([]); setCreditLimit('');
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
      accountType: accountTypes.length > 0 ? accountTypes : undefined,
      creditLimit: creditLimit as any,
    });
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#1A1F26] border-[rgba(255,140,66,0.15)]">
        <DialogHeader>
          <DialogTitle className="text-white">เพิ่มบัญชี</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Bank Selection */}
          <div>
            <Label className="text-xs text-[#A0A0A0] mb-2 block">เลือกธนาคาร</Label>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[200px] overflow-y-auto">
              {BANKS.map((bank) => (
                <button
                  key={bank.code}
                  onClick={() => setSelectedBank(bank.code)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-xl border transition-all text-center active:scale-95',
                    selectedBank === bank.code
                      ? 'border-[#FF8C42] bg-[#FF8C42]/10 ring-2 ring-[#FF8C42]/30'
                      : 'border-[rgba(255,255,255,0.08)] hover:border-[#FF8C42]/30 hover:bg-[#242B33]'
                  )}
                  title={bank.fullname}
                >
                  <img src={bank.icon} alt={bank.name} className="w-8 h-8 rounded-lg object-contain" />
                  <span className="text-[8px] text-[#A0A0A0] truncate w-full">{bank.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="accountNo" className="text-[#A0A0A0]">เลขบัญชี</Label>
              <Input id="accountNo" placeholder="xxx-x-xxxxx-x" value={accountNo} onChange={(e) => setAccountNo(e.target.value)} className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white" />
            </div>
            <div>
              <Label htmlFor="phone" className="text-[#A0A0A0]">เบอร์ผูก</Label>
              <Input id="phone" placeholder="08x-xxx-xxxx" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="firstName" className="text-[#A0A0A0]">ชื่อ</Label>
              <Input id="firstName" placeholder="ชื่อ" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white" />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-[#A0A0A0]">สกุล</Label>
              <Input id="lastName" placeholder="สกุล" value={lastName} onChange={(e) => setLastName(e.target.value)} className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="pin" className="text-[#A0A0A0]">PIN</Label>
              <Input id="pin" type="password" placeholder="••••" value={pin} onChange={(e) => setPin(e.target.value)} className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white" />
            </div>
            <div>
              <Label htmlFor="paid" className="text-[#A0A0A0]">จ่ายแล้ว</Label>
              <Input id="paid" type="number" value={paid} onChange={(e) => setPaid(e.target.value)} className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white" />
            </div>
            <div>
              <Label htmlFor="due" className="text-[#A0A0A0]">ค้างจ่าย</Label>
              <Input id="due" type="number" value={due} onChange={(e) => setDue(e.target.value)} className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white" />
            </div>
          </div>

          {/* Account Status */}
          <div className="border-t border-[rgba(255,255,255,0.08)] pt-4 mt-4">
            <h4 className="text-xs font-semibold text-[#FF8C42] mb-3">สถานะบัญชี</h4>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[#A0A0A0] mb-2 block">ประเภทบัญชี <span className="text-[10px] text-slate-500">(เลือกได้หลาย)</span></Label>
              <div className="grid grid-cols-2 gap-2">
                {(['complete', 'skrill', 'neteller', 'bigpay'] as const).map((type) => {
                  const isSelected = accountTypes.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAccountTypes(prev =>
                        isSelected ? prev.filter(t => t !== type) : [...prev, type]
                      )}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#FF8C42] text-white ring-2 ring-[#FF8C42]/40'
                          : 'bg-[#242B33] border border-[rgba(255,255,255,0.08)] text-[#A0A0A0] hover:border-[#FF8C42]/30'
                      }`}
                    >
                      {isSelected && <span className="text-[10px]">✓</span>}
                      {type === 'complete' ? 'แอคตัดครบ' : type.toUpperCase()}
                    </button>
                  );
                })}</div>
            </div>
            <div>
              <Label className="text-[#A0A0A0] mb-2 block">วงเงิน</Label>
              <div className="grid grid-cols-3 gap-2">
                {['50k', '200k', '500k'].map((limit) => (
                  <button
                    key={limit}
                    onClick={() => setCreditLimit(limit as any)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      creditLimit === limit
                        ? 'bg-[#FF8C42] text-white border-[#FF8C42]'
                        : 'bg-[#242B33] border border-[rgba(255,255,255,0.08)] text-[#A0A0A0] hover:border-[#FF8C42]/30'
                    }`}
                  >
                    {limit}
                  </button>
                ))}</div>
            </div>
          </div>

          {/* Profile & Identity */}
          <div className="border-t border-[rgba(255,255,255,0.08)] pt-4 mt-4">
            <h4 className="text-xs font-semibold text-[#00D4FF] mb-3">ข้อมูลโปรไฟล์ & บัตรประชาชน</h4>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="profilePhoto" className="text-[#A0A0A0]">ภาพโปรไฟล์</Label>
              <Input id="profilePhoto" type="file" accept="image/*" onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)} className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white text-xs" />
            </div>
            <div>
              <Label htmlFor="dateOfBirth" className="text-[#A0A0A0]">วันเดือนปีเกิด</Label>
              <Input id="dateOfBirth" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="idCardNumber" className="text-[#A0A0A0]">เลขบัตรประชาชน</Label>
              <Input id="idCardNumber" placeholder="x-xxxx-xxxxx-xx-x" value={idCardNumber} onChange={(e) => setIdCardNumber(e.target.value)} className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white" />
            </div>
            <div>
              <Label htmlFor="idCardPhoto" className="text-[#A0A0A0]">ภาพบัตรประชาชน</Label>
              <Input id="idCardPhoto" type="file" accept="image/*" onChange={(e) => setIdCardPhoto(e.target.files?.[0] || null)} className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white text-xs" />
            </div>
          </div>

          {/* Virtual Card */}
          <div className="border-t border-[rgba(255,255,255,0.08)] pt-4 mt-4">
            <h4 className="text-xs font-semibold text-[#00D4FF] mb-3">บัตรเสมือน (Virtual Card)</h4>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="virtualCardNumber" className="text-[#A0A0A0]">เลขบัตร</Label>
              <Input id="virtualCardNumber" placeholder="xxxx-xxxx-xxxx-xxxx" value={virtualCardNumber} onChange={(e) => setVirtualCardNumber(e.target.value)} className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white" />
            </div>
            <div>
              <Label htmlFor="cardCVV" className="text-[#A0A0A0]">CVV</Label>
              <Input id="cardCVV" type="password" placeholder="xxx" value={cardCVV} onChange={(e) => setCardCVV(e.target.value)} className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white" />
            </div>
          </div>

          <div>
            <Label htmlFor="cardExpiryDate" className="text-[#A0A0A0]">วันหมดอายุ</Label>
            <Input id="cardExpiryDate" placeholder="MM/YY" value={cardExpiryDate} onChange={(e) => setCardExpiryDate(e.target.value)} className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white" />
          </div>

          {/* Account Credentials */}
          <div className="border-t border-[rgba(255,255,255,0.08)] pt-4 mt-4">
            <h4 className="text-xs font-semibold text-[#00D4FF] mb-3">ข้อมูลเข้าสู่ระบบ</h4>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="accountEmail" className="text-[#A0A0A0]">Email</Label>
              <Input id="accountEmail" type="email" placeholder="example@mail.com" value={accountEmail} onChange={(e) => setAccountEmail(e.target.value)} className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white" />
            </div>
            <div>
              <Label htmlFor="accountPassword" className="text-[#A0A0A0]">รหัสผ่าน</Label>
              <Input id="accountPassword" type="password" placeholder="••••••••" value={accountPassword} onChange={(e) => setAccountPassword(e.target.value)} className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-[rgba(255,255,255,0.08)]">
            <Button variant="outline" onClick={() => { reset(); onClose(); }} className="border-[rgba(255,255,255,0.08)] text-[#A0A0A0]">ยกเลิก</Button>
            <Button onClick={handleSubmit} disabled={!selectedBank || !accountNo} className="bg-[#FF8C42] hover:bg-[#E67E2F] text-white font-semibold">เพิ่มบัญชี</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
