import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useStore } from '@/lib/store';
import { money, formatDate } from '@/lib/format';
import { getBankByCode } from '@/lib/banks';
import { Card, CardContent } from '@/components/ui/card';

export default function StatusPage() {
  const { expenses, accounts } = useStore();
  const paid = expenses.filter((e) => e.type === 'paid');
  const pending = expenses.filter((e) => e.type === 'pending');

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">สถานะ</h2>
        <p className="text-sm text-muted-foreground">ภาพรวมสถานะการชำระเงิน</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
          <CardContent className="p-5 text-center">
            <CheckCircle2 size={28} className="mx-auto text-emerald-400 mb-2" />
            <p className="text-2xl font-bold text-foreground">{paid.length}</p>
            <p className="text-xs text-muted-foreground">จ่ายแล้ว</p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
          <CardContent className="p-5 text-center">
            <Clock size={28} className="mx-auto text-amber-400 mb-2" />
            <p className="text-2xl font-bold text-foreground">{pending.length}</p>
            <p className="text-xs text-muted-foreground">ค้างจ่าย</p>
          </CardContent>
        </Card>
      </div>

      {pending.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2 mb-3">
            <AlertCircle size={14} /> รายการค้างจ่าย
          </h3>
          <div className="space-y-2">
            {pending.map((exp) => {
              const acc = accounts.find((a) => a.id === exp.accountId);
              const bank = acc ? getBankByCode(acc.bankCode) : undefined;
              return (
                <Card key={exp.id}>
                  <CardContent className="p-4 flex items-center gap-3">
                    {bank && <img src={bank.icon} alt={bank.name} className="w-7 h-7 rounded-lg object-contain bg-white/5 p-0.5" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{exp.description}</p>
                      <p className="text-[10px] text-muted-foreground">{formatDate(exp.createdAt)}</p>
                    </div>
                    <span className="text-sm font-bold text-amber-400">฿{money(exp.amount)}</span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {paid.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-3">
            <CheckCircle2 size={14} /> รายการจ่ายแล้ว
          </h3>
          <div className="space-y-2">
            {paid.map((exp) => {
              const acc = accounts.find((a) => a.id === exp.accountId);
              const bank = acc ? getBankByCode(acc.bankCode) : undefined;
              return (
                <Card key={exp.id}>
                  <CardContent className="p-4 flex items-center gap-3">
                    {bank && <img src={bank.icon} alt={bank.name} className="w-7 h-7 rounded-lg object-contain bg-white/5 p-0.5" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{exp.description}</p>
                      <p className="text-[10px] text-muted-foreground">{formatDate(exp.createdAt)}</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-400">฿{money(exp.amount)}</span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {expenses.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CheckCircle2 size={40} className="text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">ยังไม่มีรายการ</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
