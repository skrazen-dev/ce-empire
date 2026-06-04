import { CreditCard, TrendingUp, TrendingDown, Receipt } from 'lucide-react';
import { useStore } from '@/lib/store';
import { money } from '@/lib/format';
import { Card, CardContent } from '@/components/ui/card';

export default function DashboardPage() {
  const { accounts, expenses } = useStore();
  const totalPaid = accounts.reduce((s, a) => s + a.paidAmount, 0);
  const totalDue = accounts.reduce((s, a) => s + a.dueAmount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  const metrics = [
    { label: 'บัญชีทั้งหมด', value: accounts.length.toString(), icon: CreditCard, color: 'text-cyan-400', bg: 'from-cyan-500/10 to-transparent', border: 'border-cyan-500/20' },
    { label: 'จ่ายแล้ว', value: `฿${money(totalPaid)}`, icon: TrendingUp, color: 'text-emerald-400', bg: 'from-emerald-500/10 to-transparent', border: 'border-emerald-500/20' },
    { label: 'ค้างจ่าย', value: `฿${money(totalDue)}`, icon: TrendingDown, color: 'text-red-400', bg: 'from-red-500/10 to-transparent', border: 'border-red-500/20' },
    { label: 'ค่าใช้จ่ายรวม', value: `฿${money(totalExpenses)}`, icon: Receipt, color: 'text-purple-400', bg: 'from-purple-500/10 to-transparent', border: 'border-purple-500/20' },
  ];

  return (
    <div className="animate-fade-up space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-card to-secondary border border-border">
        <div className="relative z-10">
          <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-2">Overview</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
            <span className="gradient-text">CE Empire</span>
          </h2>
          <p className="text-sm text-muted-foreground">ระบบจัดการบัญชีและค่าใช้จ่ายแบบครบวงจร</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/8 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-500/6 to-transparent rounded-full blur-3xl" />
      </section>

      {/* Metrics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label} className={`bg-gradient-to-br ${m.bg} ${m.border} hover:scale-[1.01] transition-transform duration-200`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">{m.label}</p>
                    <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{m.value}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl bg-background/50 ${m.color}`}>
                    <Icon size={20} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Recent Activity */}
      <Card>
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">กิจกรรมล่าสุด</h3>
          {expenses.length === 0 ? (
            <div className="text-center py-10">
              <Receipt size={32} className="mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">ยังไม่มีรายการ</p>
              <p className="text-xs text-muted-foreground/60 mt-1">เพิ่มบัญชีหรือค่าใช้จ่ายเพื่อเริ่มต้น</p>
            </div>
          ) : (
            <div className="space-y-2">
              {expenses.slice(-5).reverse().map((exp) => (
                <div key={exp.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${exp.type === 'paid' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{exp.description}</p>
                      <p className="text-xs text-muted-foreground">{exp.type === 'paid' ? 'จ่ายแล้ว' : 'ค้างจ่าย'}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-foreground">฿{money(exp.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
