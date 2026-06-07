import { useState, useRef } from 'react';
import { Image as ImageIcon, Upload, X, ZoomIn, Download, Trash2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { money, formatDate } from '@/lib/format';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ProofPage() {
  const { expenses, updateExpense } = useStore();
  const withSlip = expenses.filter((e) => e.slipImage);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('ไฟล์ใหญ่เกิน 5MB');
      return;
    }
    toast.info('กรุณาเพิ่มค่าใช้จ่ายพร้อมแนบสลิปในหน้า "ค่าใช้จ่าย"', {
      description: 'สลิปจะถูกบันทึกพร้อมกับรายการค่าใช้จ่าย',
      duration: 4000,
    });
    e.target.value = '';
  };

  const handleDownload = (src: string, name: string) => {
    const a = document.createElement('a');
    a.href = src;
    a.download = name;
    a.click();
  };

  return (
    <div className="animate-fade-up space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">หลักฐาน</h2>
          <p className="text-xs text-[#A0A0A0]">สลิปและหลักฐานการชำระเงิน ({withSlip.length} รายการ)</p>
        </div>
        <button
          onClick={handleUploadClick}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] text-xs font-semibold hover:bg-[#F59E0B]/20 active:scale-95 transition-all"
        >
          <Upload size={14} /> อัปโหลดสลิป
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {withSlip.length === 0 ? (
        <Card className="bg-[#1A1F26] border-[rgba(255,255,255,0.06)]">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ImageIcon size={36} className="text-[#A0A0A0]/30 mb-3" />
            <p className="text-sm text-[#A0A0A0]">ยังไม่มีหลักฐาน</p>
            <p className="text-xs text-[#A0A0A0]/60 mt-1">แนบสลิปเมื่อเพิ่มค่าใช้จ่ายเพื่อเก็บเป็นหลักฐาน</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {withSlip.map((exp) => (
            <Card key={exp.id} className="bg-[#1A1F26] border-[rgba(255,255,255,0.06)] overflow-hidden group hover:border-[#F59E0B]/20 transition-colors">
              <div
                className="aspect-[3/4] relative overflow-hidden cursor-pointer"
                onClick={() => setLightbox(exp.slipImage!)}
              >
                <img
                  src={exp.slipImage}
                  alt="สลิป"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <div className="w-full">
                    <p className="text-xs font-medium text-white truncate">{exp.description}</p>
                    <p className="text-[9px] text-[#A0A0A0]">{formatDate(exp.createdAt)}</p>
                  </div>
                </div>
                {/* Zoom icon */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-1.5 rounded-lg bg-black/50 backdrop-blur-sm">
                    <ZoomIn size={12} className="text-white" />
                  </div>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="text-xs font-medium text-white truncate">{exp.description}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[9px] text-[#A0A0A0]">{formatDate(exp.createdAt)}</span>
                  <span className="text-xs font-bold text-[#F59E0B]">฿{money(exp.amount)}</span>
                </div>
                <div className="flex gap-1.5 mt-2">
                  <button
                    onClick={() => handleDownload(exp.slipImage!, `slip-${exp.id}.jpg`)}
                    className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg bg-[#1E2730] hover:bg-[#F59E0B]/10 text-[#A0A0A0] hover:text-[#F59E0B] text-[9px] transition-all active:scale-95"
                  >
                    <Download size={10} /> ดาวน์โหลด
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload hint card */}
      <Card
        className="bg-[#1A1F26] border-dashed border-[rgba(245,158,11,0.25)] hover:border-[#F59E0B]/50 transition-colors cursor-pointer active:scale-[0.99]"
        onClick={handleUploadClick}
      >
        <CardContent className="flex items-center justify-center gap-3 py-8">
          <Upload size={20} className="text-[#F59E0B]" />
          <div>
            <p className="text-xs font-medium text-[#F59E0B]">อัปโหลดหลักฐาน</p>
            <p className="text-[9px] text-[#A0A0A0]/60">รองรับ JPG, PNG ขนาดไม่เกิน 5MB</p>
          </div>
        </CardContent>
      </Card>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox} alt="สลิป" className="w-full rounded-xl object-contain max-h-[80vh]" />
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={() => handleDownload(lightbox, 'slip.jpg')}
                className="p-2 rounded-xl bg-black/60 backdrop-blur-sm text-white hover:bg-[#F59E0B]/20 hover:text-[#F59E0B] active:scale-95 transition-all"
              >
                <Download size={16} />
              </button>
              <button
                onClick={() => setLightbox(null)}
                className="p-2 rounded-xl bg-black/60 backdrop-blur-sm text-white hover:bg-[#EF4444]/20 hover:text-[#EF4444] active:scale-95 transition-all"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
