import { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, EyeOff, Copy, Check, CreditCard, TrendingUp, AlertCircle, Wallet, Scan, Loader2, X } from 'lucide-react';
import { OCRIDCardScanner } from '@/components/OCRIDCardScanner';
import type { IDCardData } from '@/hooks/useOCR';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { getBankByCode, BANKS } from '@/lib/banks';
import { money, maskAccountNo } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function AccountsPage() {
  const utils = trpc.useUtils();
  const { data: accounts = [], isLoading } = trpc.accounts.list.useQuery();
  const deleteMutation = trpc.accounts.delete.useMutation({
    onSuccess: () => {
      utils.accounts.list.invalidate();
      toast.success('ลบบัญชีแล้ว');
    },
    onError: (e) => toast.error(e.message),
  });

  const [showForm, setShowForm] = useState(false);
  const [showOCR, setShowOCR] = useState(false);
  const [revealedPins, setRevealedPins] = useState<Set<number>>(new Set());
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [ocrPrefill, setOcrPrefill] = useState<Partial<IDCardData> | null>(null);

  const handleOCRConfirm = (data: IDCardData) => {
    setOcrPrefill(data);
    setShowForm(true);
  };

  const togglePin = (id: number) => {
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

  const totalBalance = accounts.reduce((s, a) => s + parseFloat(a.balance || '0'), 0);
  const activeAccounts = accounts.filter(a => a.isActive === 'yes').length;

  return (
    <div className="animate-fade-up space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">บัญชีทั้งหมด</h2>
          <p className="text-xs text-[#A0A0A0]">{accounts.length} บัญชี</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowOCR(true)}
            variant="outline"
            className="gap-1.5 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 text-xs active:scale-95 transition-transform"
          >
            <Scan size={13} /> สแกนบัตร
          </Button>
          <Button onClick={() => { setOcrPrefill(null); setShowForm(true); }} className="gap-2 bg-[#FF8C42] hover:bg-[#E67E2F] text-white font-semibold text-xs active:scale-95 transition-transform">
            <Plus size={14} /> เพิ่มบัญชี
          </Button>
        </div>
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
              <span className="text-[10px] text-slate-400">ใช้งานอยู่</span>
            </div>
            <p className="text-xl font-bold text-emerald-400">{activeAccounts}</p>
            <p className="text-[9px] text-slate-500">บัญชี active</p>
          </div>
          <div className="rounded-xl p-3 border" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(239,68,68,0.04) 100%)', borderColor: 'rgba(239,68,68,0.18)' }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <AlertCircle size={12} className="text-red-400" />
              <span className="text-[10px] text-slate-400">ไม่ใช้งาน</span>
            </div>
            <p className="text-xl font-bold text-red-400">{accounts.length - activeAccounts}</p>
            <p className="text-[9px] text-slate-500">บัญชี inactive</p>
          </div>
          <div className="rounded-xl p-3 border" style={{ background: 'linear-gradient(135deg, rgba(255,140,66,0.08) 0%, rgba(255,140,66,0.04) 100%)', borderColor: 'rgba(255,140,66,0.18)' }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Wallet size={12} className="text-[#FF8C42]" />
              <span className="text-[10px] text-slate-400">ยอดรวม</span>
            </div>
            <p className="text-xl font-bold text-[#FF8C42]">฿{money(totalBalance)}</p>
            <p className="text-[9px] text-slate-500">balance</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl bg-[#1A1F26] border border-[rgba(255,140,66,0.1)] p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#242B33]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-[#242B33] rounded w-1/3" />
                  <div className="h-2 bg-[#242B33] rounded w-1/4" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-8 bg-[#242B33] rounded-lg" />
                <div className="h-8 bg-[#242B33] rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && accounts.length === 0 ? (
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
        !isLoading && (
          <div className="space-y-3 stagger-children">
            {accounts.map((acc) => {
              const bank = getBankByCode(acc.bankCode);
              return (
                <Card key={acc.id} className="bg-[#1A1F26] border-[rgba(255,140,66,0.15)] group hover:border-[#FF8C42]/30 transition-colors card-hover animate-fade-up">
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      {bank && (
                        <img src={bank.icon} alt={bank.name} className="w-10 h-10 rounded-xl object-contain bg-white/5 p-1" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{bank?.name || acc.bankCode}</p>
                        <p className="text-xs text-[#A0A0A0] font-mono">{maskAccountNo(acc.accountNumber)}</p>
                      </div>
                      <button
                        onClick={() => deleteMutation.mutate({ id: acc.id })}
                        disabled={deleteMutation.isPending}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-[#EF4444]/10 text-[#EF4444] transition-all active:scale-90 disabled:opacity-50"
                        aria-label="ลบบัญชี"
                      >
                        {deleteMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>

                    {/* Owner Info */}
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="text-[#A0A0A0] truncate">{acc.accountName}</span>
                      <button
                        onClick={() => togglePin(acc.id)}
                        className="flex items-center gap-1 text-[#A0A0A0] hover:text-white transition-colors active:scale-95 ml-2 flex-shrink-0"
                      >
                        {revealedPins.has(acc.id) ? <EyeOff size={12} /> : <Eye size={12} />}
                        <span className="font-mono text-[10px]">{revealedPins.has(acc.id) ? acc.accountNumber : '••••'}</span>
                      </button>
                    </div>

                    {/* Balance */}
                    <div className="grid grid-cols-2 gap-2 mb-3 pb-3 border-b border-[rgba(255,255,255,0.06)]">
                      <div>
                        <p className="text-[10px] text-[#A0A0A0]">ยอดคงเหลือ</p>
                        <p className="text-sm font-semibold text-[#10B981]">฿{money(parseFloat(acc.balance || '0'))}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#A0A0A0]">สถานะ</p>
                        <span className={cn(
                          "text-xs font-semibold px-2 py-0.5 rounded-full",
                          acc.isActive === 'yes' ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                        )}>
                          {acc.isActive === 'yes' ? 'ใช้งาน' : 'ปิด'}
                        </span>
                      </div>
                    </div>

                    {/* Account Status Section */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-[#FF8C42] uppercase tracking-widest">ข้อมูลบัญชี</p>

                      {/* Account Type & Credit Limit */}
                      {(acc.accountType || acc.creditLimit) && (
                        <div className="space-y-1.5 mb-2">
                          {acc.accountType && (
                            <div>
                              <p className="text-[9px] text-[#A0A0A0] mb-1">ประเภท</p>
                              <div className="flex flex-wrap gap-1">
                                {(() => {
                                  try {
                                    const types = typeof acc.accountType === 'string' ? JSON.parse(acc.accountType) : acc.accountType;
                                    return Array.isArray(types) ? types : [types];
                                  } catch {
                                    return [acc.accountType];
                                  }
                                })().map((type: string) => {
                                  const label = type === 'complete' ? 'แอคตัดครบ' : type.toUpperCase();
                                  return (
                                    <span key={type} className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#FF8C42]/20 border border-[#FF8C42]/40 text-[#FF8C42]">
                                      {label}
                                    </span>
                                  );
                                })}
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
                        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#0F1419]/50 hover:bg-[#0F1419]/70 transition-colors">
                          <div className="flex-1 min-w-0">
                            <span className="text-[#A0A0A0]">เลขบช: </span>
                            <span className="text-white font-mono text-[8px] truncate">{acc.accountNumber}</span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(acc.accountNumber, `acc-${acc.id}`)}
                            className="ml-2 p-1 rounded hover:bg-[#FF8C42]/20 transition-all"
                          >
                            {copiedField === `acc-${acc.id}` ? <Check size={10} className="text-[#10B981]" /> : <Copy size={10} className="text-[#A0A0A0] hover:text-[#FF8C42]" />}
                          </button>
                        </div>

                        {/* Account Name */}
                        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#0F1419]/50 hover:bg-[#0F1419]/70 transition-colors">
                          <div className="flex-1 min-w-0">
                            <span className="text-[#A0A0A0]">ชื่อ: </span>
                            <span className="text-white text-[8px] truncate">{acc.accountName}</span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(acc.accountName, `name-${acc.id}`)}
                            className="ml-2 p-1 rounded hover:bg-[#FF8C42]/20 transition-all"
                          >
                            {copiedField === `name-${acc.id}` ? <Check size={10} className="text-[#10B981]" /> : <Copy size={10} className="text-[#A0A0A0] hover:text-[#FF8C42]" />}
                          </button>
                        </div>

                        {/* ID Card */}
                        {acc.idCardNumber && (
                          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#0F1419]/50 hover:bg-[#0F1419]/70 transition-colors">
                            <div className="flex-1 min-w-0">
                              <span className="text-[#A0A0A0]">บปป: </span>
                              <span className="text-white font-mono text-[8px]">{acc.idCardNumber}</span>
                            </div>
                            <button
                              onClick={() => copyToClipboard(acc.idCardNumber!, `id-${acc.id}`)}
                              className="ml-2 p-1 rounded hover:bg-[#FF8C42]/20 transition-all"
                            >
                              {copiedField === `id-${acc.id}` ? <Check size={10} className="text-[#10B981]" /> : <Copy size={10} className="text-[#A0A0A0] hover:text-[#FF8C42]" />}
                            </button>
                          </div>
                        )}

                        {/* Virtual Card */}
                        {acc.virtualCardNumber && (
                          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#0F1419]/50 hover:bg-[#0F1419]/70 transition-colors">
                            <div className="flex-1 min-w-0">
                              <span className="text-[#A0A0A0]">บัตรเสมือน: </span>
                              <span className="text-white font-mono text-[8px]">{acc.virtualCardNumber}</span>
                            </div>
                            <button
                              onClick={() => copyToClipboard(acc.virtualCardNumber!, `vcard-${acc.id}`)}
                              className="ml-2 p-1 rounded hover:bg-[#FF8C42]/20 transition-all"
                            >
                              {copiedField === `vcard-${acc.id}` ? <Check size={10} className="text-[#10B981]" /> : <Copy size={10} className="text-[#A0A0A0] hover:text-[#FF8C42]" />}
                            </button>
                          </div>
                        )}

                        {/* Email */}
                        {acc.accountEmail && (
                          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#0F1419]/50 hover:bg-[#0F1419]/70 transition-colors">
                            <div className="flex-1 min-w-0">
                              <span className="text-[#A0A0A0]">Email: </span>
                              <span className="text-white text-[8px]">{acc.accountEmail}</span>
                            </div>
                            <button
                              onClick={() => copyToClipboard(acc.accountEmail!, `email-${acc.id}`)}
                              className="ml-2 p-1 rounded hover:bg-[#FF8C42]/20 transition-all"
                            >
                              {copiedField === `email-${acc.id}` ? <Check size={10} className="text-[#10B981]" /> : <Copy size={10} className="text-[#A0A0A0] hover:text-[#FF8C42]" />}
                            </button>
                          </div>
                        )}

                        {/* Password */}
                        {acc.accountPassword && (
                          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#0F1419]/50 hover:bg-[#0F1419]/70 transition-colors">
                            <div className="flex-1 min-w-0">
                              <span className="text-[#A0A0A0]">Pass: </span>
                              <span className="text-white font-mono text-[8px]">••••••••</span>
                            </div>
                            <button
                              onClick={() => copyToClipboard(acc.accountPassword!, `pass-${acc.id}`)}
                              className="ml-2 p-1 rounded hover:bg-[#FF8C42]/20 transition-all"
                              title="คัดลอกรหัสผ่าน"
                            >
                              {copiedField === `pass-${acc.id}` ? <Check size={10} className="text-[#10B981]" /> : <Copy size={10} className="text-[#A0A0A0] hover:text-[#FF8C42]" />}
                            </button>
                          </div>
                        )}

                        {/* Note */}
                        {acc.note && (
                          <div className="px-2 py-1.5 rounded-lg bg-[#0F1419]/50">
                            <span className="text-[#A0A0A0]">หมายเหตุ: </span>
                            <span className="text-white text-[8px]">{acc.note}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )
      )}

      <AccountFormDialog open={showForm} onClose={() => { setShowForm(false); setOcrPrefill(null); }} ocrPrefill={ocrPrefill} />
      <OCRIDCardScanner open={showOCR} onClose={() => setShowOCR(false)} onConfirm={handleOCRConfirm} />
    </div>
  );
}

function AccountFormDialog({ open, onClose, ocrPrefill }: { open: boolean; onClose: () => void; ocrPrefill?: Partial<IDCardData> | null }) {
  const utils = trpc.useUtils();
  const createMutation = trpc.accounts.create.useMutation({
    onSuccess: () => {
      utils.accounts.list.invalidate();
      toast.success('เพิ่มบัญชีแล้ว');
      reset();
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  const [selectedBank, setSelectedBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [balance, setBalance] = useState('0');
  const [note, setNote] = useState('');
  const [idCardNumber, setIdCardNumber] = useState('');
  const [virtualCardNumber, setVirtualCardNumber] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardExpiryDate, setCardExpiryDate] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [accountTypes, setAccountTypes] = useState<string[]>([]);
  const [creditLimit, setCreditLimit] = useState<'50k' | '200k' | '500k' | ''>('');

  // Prefill from OCR
  useEffect(() => {
    if (ocrPrefill && open) {
      if (ocrPrefill.firstName || ocrPrefill.lastName) {
        setAccountName(`${ocrPrefill.firstName || ''} ${ocrPrefill.lastName || ''}`.trim());
      }
      if (ocrPrefill.idNumber) setIdCardNumber(ocrPrefill.idNumber);
    }
  }, [ocrPrefill, open]);

  const reset = () => {
    setSelectedBank(''); setAccountNumber(''); setAccountName('');
    setBalance('0'); setNote(''); setIdCardNumber('');
    setVirtualCardNumber(''); setCardCVV(''); setCardExpiryDate('');
    setAccountEmail(''); setAccountPassword('');
    setAccountTypes([]); setCreditLimit('');
  };

  const handleSubmit = () => {
    if (!selectedBank || !accountNumber || !accountName) {
      toast.error('กรุณากรอกข้อมูลให้ครบ');
      return;
    }
    const bank = BANKS.find(b => b.code === selectedBank);
    createMutation.mutate({
      bankCode: selectedBank,
      bankName: bank?.fullname || selectedBank,
      accountName,
      accountNumber,
      balance,
      note: note || undefined,
      isActive: 'yes',
      accountType: accountTypes.length > 0 ? JSON.stringify(accountTypes) : undefined,
      creditLimit: creditLimit || undefined,
      idCardNumber: idCardNumber || undefined,
      virtualCardNumber: virtualCardNumber || undefined,
      cardCVV: cardCVV || undefined,
      cardExpiryDate: cardExpiryDate || undefined,
      accountEmail: accountEmail || undefined,
      accountPassword: accountPassword || undefined,
    });
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
              <Label htmlFor="accountNumber" className="text-[#A0A0A0]">เลขบัญชี *</Label>
              <Input id="accountNumber" placeholder="xxx-x-xxxxx-x" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white" />
            </div>
            <div>
              <Label htmlFor="accountName" className="text-[#A0A0A0]">ชื่อบัญชี *</Label>
              <Input id="accountName" placeholder="ชื่อ-นามสกุล" value={accountName} onChange={(e) => setAccountName(e.target.value)} className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="balance" className="text-[#A0A0A0]">ยอดคงเหลือ</Label>
              <Input id="balance" type="number" value={balance} onChange={(e) => setBalance(e.target.value)} className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white" />
            </div>
            <div>
              <Label htmlFor="idCardNumber" className="text-[#A0A0A0]">เลขบัตรประชาชน</Label>
              <Input id="idCardNumber" placeholder="1-xxxx-xxxxx-xx-x" value={idCardNumber} onChange={(e) => setIdCardNumber(e.target.value)} className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white" />
            </div>
          </div>

          {/* Account Status */}
          <div className="border-t border-[rgba(255,255,255,0.08)] pt-4 mt-4">
            <h4 className="text-xs font-semibold text-[#FF8C42] mb-3">สถานะบัญชี</h4>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[#A0A0A0] mb-2 block">ประเภทบัญชี (เลือกได้หลายตัว)</Label>
              <div className="grid grid-cols-2 gap-2">
                {(['complete', 'skrill', 'neteller', 'bigpay'] as const).map((type) => {
                  const label = type === 'complete' ? 'แอคตัดครบ' : type.toUpperCase();
                  const isSelected = accountTypes.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAccountTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])}
                      className={cn(
                        'px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all active:scale-95',
                        isSelected
                          ? 'border-[#FF8C42] bg-[#FF8C42]/20 text-[#FF8C42]'
                          : 'border-[rgba(255,255,255,0.08)] text-[#A0A0A0] hover:border-[#FF8C42]/30'
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <Label className="text-[#A0A0A0] mb-2 block">วงเงิน</Label>
              <div className="flex flex-col gap-2">
                {(['50k', '200k', '500k'] as const).map((limit) => (
                  <button
                    key={limit}
                    type="button"
                    onClick={() => setCreditLimit(prev => prev === limit ? '' : limit)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg border text-[10px] font-semibold transition-all active:scale-95',
                      creditLimit === limit
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                        : 'border-[rgba(255,255,255,0.08)] text-[#A0A0A0] hover:border-emerald-500/30'
                    )}
                  >
                    {limit}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Extra Fields */}
          <div className="border-t border-[rgba(255,255,255,0.08)] pt-4">
            <h4 className="text-xs font-semibold text-[#A0A0A0] mb-3">ข้อมูลเพิ่มเติม (ไม่บังคับ)</h4>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="accountEmail" className="text-[#A0A0A0]">Email</Label>
              <Input id="accountEmail" type="email" placeholder="email@example.com" value={accountEmail} onChange={(e) => setAccountEmail(e.target.value)} className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white" />
            </div>
            <div>
              <Label htmlFor="accountPassword" className="text-[#A0A0A0]">Password</Label>
              <Input id="accountPassword" type="password" placeholder="••••••••" value={accountPassword} onChange={(e) => setAccountPassword(e.target.value)} className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="virtualCardNumber" className="text-[#A0A0A0]">บัตรเสมือน</Label>
              <Input id="virtualCardNumber" placeholder="xxxx xxxx xxxx xxxx" value={virtualCardNumber} onChange={(e) => setVirtualCardNumber(e.target.value)} className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white" />
            </div>
            <div>
              <Label htmlFor="cardCVV" className="text-[#A0A0A0]">CVV</Label>
              <Input id="cardCVV" placeholder="xxx" maxLength={4} value={cardCVV} onChange={(e) => setCardCVV(e.target.value)} className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white" />
            </div>
            <div>
              <Label htmlFor="cardExpiryDate" className="text-[#A0A0A0]">หมดอายุ</Label>
              <Input id="cardExpiryDate" placeholder="MM/YY" maxLength={5} value={cardExpiryDate} onChange={(e) => setCardExpiryDate(e.target.value)} className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white" />
            </div>
          </div>

          <div>
            <Label htmlFor="note" className="text-[#A0A0A0]">หมายเหตุ</Label>
            <Input id="note" placeholder="บันทึกเพิ่มเติม..." value={note} onChange={(e) => setNote(e.target.value)} className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white" />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 border-[rgba(255,255,255,0.1)] text-[#A0A0A0]">
              ยกเลิก
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              className="flex-1 bg-[#FF8C42] hover:bg-[#E67E2F] text-white font-semibold"
            >
              {createMutation.isPending ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
              บันทึก
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
