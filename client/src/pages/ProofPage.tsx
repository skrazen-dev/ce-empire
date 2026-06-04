import { Image as ImageIcon } from 'lucide-react';
import { useStore } from '@/lib/store';
import { money, formatDate } from '@/lib/format';
import { Card, CardContent } from '@/components/ui/card';

export default function ProofPage() {
  const { expenses } = useStore();
  const withSlip = expenses.filter((e) => e.slipImage);

  return (
    <div className="animate-fade-up space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">หลักฐาน</h2>
        <p className="text-sm text-muted-foreground">สลิปและหลักฐานการชำระเงิน</p>
      </div>

      {withSlip.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ImageIcon size={40} className="text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">ยังไม่มีหลักฐาน</p>
            <p className="text-xs text-muted-foreground/60 mt-1">แนบสลิปเมื่อเพิ่มค่าใช้จ่ายเพื่อเก็บเป็นหลักฐาน</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {withSlip.map((exp) => (
            <Card key={exp.id}>
              <CardContent className="p-4">
                <img src={exp.slipImage} alt="สลิป" className="w-full rounded-xl mb-3 border border-border" />
                <p className="text-sm font-medium text-foreground">{exp.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">{formatDate(exp.createdAt)}</span>
                  <span className="text-sm font-bold text-foreground">฿{money(exp.amount)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
