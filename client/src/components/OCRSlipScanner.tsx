import { useState, useRef } from "react";
import { useOCR, SlipData } from "@/hooks/useOCR";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Receipt, Upload, CheckCircle, AlertCircle, Camera, RefreshCw, Scan, Save } from "lucide-react";
import { toast } from "sonner";

interface OCRSlipScannerProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: SlipData) => void;
}

export function OCRSlipScanner({ open, onClose, onConfirm }: OCRSlipScannerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isProcessing, progress, progressMessage, result, error, processImage, reset } = useOCR();
  const [preview, setPreview] = useState<string | null>(null);
  const [editData, setEditData] = useState<SlipData | null>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    setEditData(null);
    await processImage(file, "slip");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleReset = () => {
    reset();
    setPreview(null);
    setEditData(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // When OCR result comes in, initialize edit form
  if (result?.slip && !editData) {
    setEditData({ ...result.slip });
  }

  const handleConfirm = () => {
    if (!editData) return;
    if (!editData.amount) {
      toast.error("กรุณาระบุจำนวนเงิน");
      return;
    }
    onConfirm(editData);
    toast.success("บันทึกข้อมูลสลิปเรียบร้อย");
    handleReset();
    onClose();
  };

  const confidenceColor =
    (result?.confidence ?? 0) >= 80
      ? "text-emerald-400"
      : (result?.confidence ?? 0) >= 60
      ? "text-amber-400"
      : "text-red-400";

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { handleReset(); onClose(); } }}>
      <DialogContent className="max-w-lg bg-[#0d1117] border border-white/10 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-400">
            <Receipt className="w-5 h-5" />
            สแกนสลิปธนาคาร / PromptPay (OCR)
          </DialogTitle>
          <DialogDescription className="text-white/50">
            อัปโหลดสลิปเพื่ออ่านข้อมูลการโอนเงินอัตโนมัติ
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Zone */}
          {!preview && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-orange-500/50 hover:bg-orange-500/5 transition-all duration-200 group"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                  <Scan className="w-7 h-7 text-orange-400" />
                </div>
                <div>
                  <p className="text-white/80 font-medium">วางสลิปที่นี่ หรือคลิกเพื่อเลือก</p>
                  <p className="text-white/40 text-sm mt-1">รองรับ JPG, PNG, WEBP (สลิปธนาคาร / PromptPay)</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10">
                    <Upload className="w-4 h-4 mr-1" /> เลือกไฟล์
                  </Button>
                  <Button size="sm" variant="outline" className="border-white/20 text-white/60 hover:bg-white/5">
                    <Camera className="w-4 h-4 mr-1" /> ถ่ายภาพ
                  </Button>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
            </div>
          )}

          {/* Preview + Processing */}
          {preview && (
            <div className="relative rounded-xl overflow-hidden border border-white/10">
              <img src={preview} alt="สลิป" className="w-full max-h-56 object-contain bg-black/40" />
              {isProcessing && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="text-center space-y-2 px-4">
                    <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-orange-400 text-sm font-medium">{progressMessage}</p>
                  </div>
                </div>
              )}
              <button
                onClick={handleReset}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-white/70" />
              </button>
            </div>
          )}

          {/* Progress Bar */}
          {isProcessing && (
            <div className="space-y-1.5">
              <Progress value={progress} className="h-2 bg-white/10" />
              <p className="text-xs text-white/50 text-center">{progress}%</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* OCR Result - Edit Form */}
          {editData && !isProcessing && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-white/80">อ่านข้อมูลเสร็จแล้ว</span>
                </div>
                <span className={`text-xs font-medium ${confidenceColor}`}>
                  ความแม่นยำ {Math.round(result?.confidence ?? 0)}%
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                {/* Amount - highlight */}
                <div className="space-y-1">
                  <Label className="text-xs text-white/50">จำนวนเงิน (บาท) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 font-bold">฿</span>
                    <Input
                      value={editData.amount}
                      onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                      placeholder="0.00"
                      className="bg-orange-500/5 border-orange-500/20 text-orange-300 font-bold text-lg pl-8"
                    />
                  </div>
                </div>

                {/* ธนาคารที่ตรวจพบ (จาก slip-ocr heuristics) */}
                <div className="space-y-1">
                  <Label className="text-xs text-white/50">ธนาคาร</Label>
                  <Input
                    value={editData.bank}
                    onChange={(e) => setEditData({ ...editData, bank: e.target.value })}
                    placeholder="ธนาคารที่ตรวจพบ"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-white/50">วันที่</Label>
                    <Input
                      value={editData.date}
                      onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                      placeholder="DD/MM/YYYY"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-white/50">เวลา</Label>
                    <Input
                      value={editData.time}
                      onChange={(e) => setEditData({ ...editData, time: e.target.value })}
                      placeholder="HH:MM"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-white/50">ผู้โอน</Label>
                    <Input
                      value={editData.senderName}
                      onChange={(e) => setEditData({ ...editData, senderName: e.target.value })}
                      placeholder="ชื่อผู้โอน"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-white/50">ผู้รับ</Label>
                    <Input
                      value={editData.receiverName}
                      onChange={(e) => setEditData({ ...editData, receiverName: e.target.value })}
                      placeholder="ชื่อผู้รับ"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-white/50">เลขที่อ้างอิง</Label>
                  <Input
                    value={editData.referenceNumber}
                    onChange={(e) => setEditData({ ...editData, referenceNumber: e.target.value })}
                    placeholder="Reference Number"
                    className="bg-white/5 border-white/10 text-white font-mono"
                  />
                </div>
              </div>

              <p className="text-xs text-white/40 text-center">
                ตรวจสอบและแก้ไขข้อมูลก่อนกดบันทึก
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1 border-white/20 text-white/60 hover:bg-white/5"
                >
                  สแกนใหม่
                </Button>
                <Button
                  onClick={handleConfirm}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                >
                  <Save className="w-4 h-4 mr-1" />
                  บันทึกรายการ
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
