import { useState, useCallback } from 'react';
import { DollarSign, Copy, RotateCcw, TrendingUp, TrendingDown, Calculator } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

function formatNumber(n: number, decimals = 4): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatSmart(n: number): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });
}

export default function UsdtCalcPage() {
  const [thb, setThb] = useState('500');
  const [usd, setUsd] = useState('15');
  const [sellRate, setSellRate] = useState('34.5');

  const thbNum = parseFloat(thb) || 0;
  const usdNum = parseFloat(usd) || 0;
  const sellRateNum = parseFloat(sellRate) || 0;

  const costPerUsd = usdNum > 0 ? thbNum / usdNum : 0;
  const sellTotal = usdNum * sellRateNum;
  const profit = sellTotal - thbNum;
  const profitPercent = thbNum > 0 ? (profit / thbNum) * 100 : 0;
  const isProfit = profit > 0;

  const handleCopy = useCallback(async () => {
    const text = `ต้นทุน: ${formatNumber(costPerUsd)} THB/USD | ขาย: ${formatSmart(sellRateNum)} THB/USD | กำไร: ${profit >= 0 ? '+' : ''}${formatNumber(profit, 2)} THB (${profitPercent >= 0 ? '+' : ''}${formatNumber(profitPercent, 2)}%)`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success('คัดลอกแล้ว');
    } catch {
      toast.error('คัดลอกไม่สำเร็จ');
    }
  }, [costPerUsd, sellRateNum, profit, profitPercent]);

  const handleClear = () => {
    setThb('');
    setUsd('');
    setSellRate('');
  };

  return (
    <div className="animate-fade-up space-y-4">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <DollarSign size={20} className="text-[#F59E0B]" />
          คำนวณกำไร USDT
        </h2>
        <p className="text-xs text-[#A0A0A0] mt-0.5">คำนวณต้นทุน เรทขาย และกำไรจากการเทรด USDT</p>
      </div>

      {/* Input Section */}
      <Card className="bg-[#1A1F26] border-[rgba(255,255,255,0.06)]">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-[#A0A0A0] uppercase tracking-wider mb-1.5 block">
                ยอดซื้อรวม (THB)
              </label>
              <Input
                type="number"
                inputMode="decimal"
                placeholder="เช่น 500"
                value={thb}
                onChange={(e) => setThb(e.target.value)}
                className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white text-base font-semibold placeholder:text-[#A0A0A0]/50 focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]/50 h-12"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#A0A0A0] uppercase tracking-wider mb-1.5 block">
                USD ที่ได้
              </label>
              <Input
                type="number"
                inputMode="decimal"
                placeholder="เช่น 15"
                value={usd}
                onChange={(e) => setUsd(e.target.value)}
                className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white text-base font-semibold placeholder:text-[#A0A0A0]/50 focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]/50 h-12"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-[#A0A0A0] uppercase tracking-wider mb-1.5 block">
              เรทขาย (THB/USD)
            </label>
            <Input
              type="number"
              inputMode="decimal"
              placeholder="เช่น 34.5"
              value={sellRate}
              onChange={(e) => setSellRate(e.target.value)}
              className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white text-base font-semibold placeholder:text-[#A0A0A0]/50 focus:ring-2 focus:ring-[#00D4FF]/30 focus:border-[#00D4FF]/50 h-12"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="grid grid-cols-2 gap-3">
        {/* Cost per USD */}
        <Card className="bg-[#1A1F26] border-[rgba(255,255,255,0.06)] metric-glow-gold">
          <CardContent className="p-3.5">
            <p className="text-[9px] text-[#A0A0A0] uppercase tracking-wider mb-1">ต้นทุน/1 USD</p>
            <p className="text-lg font-bold text-white">
              {usdNum > 0 ? formatNumber(costPerUsd, 2) : '0.00'}
            </p>
            <p className="text-[9px] text-[#A0A0A0] mt-1">THB</p>
          </CardContent>
        </Card>

        {/* Sell Total */}
        <Card className="bg-[#1A1F26] border-[rgba(255,255,255,0.06)] metric-glow-cyan">
          <CardContent className="p-3.5">
            <p className="text-[9px] text-[#A0A0A0] uppercase tracking-wider mb-1">ยอดขายรวม</p>
            <p className="text-lg font-bold text-white">
              {formatNumber(sellTotal, 2)}
            </p>
            <p className="text-[9px] text-[#A0A0A0] mt-1">THB</p>
          </CardContent>
        </Card>
      </div>

      {/* Profit Card */}
      <Card className={`border ${isProfit ? 'bg-[#10B981]/5 border-[#10B981]/20 metric-glow-green' : profit < 0 ? 'bg-[#EF4444]/5 border-[#EF4444]/20 metric-glow-red' : 'bg-[#1A1F26] border-[rgba(255,255,255,0.06)]'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-[#A0A0A0] uppercase tracking-wider mb-1">กำไร / ขาดทุน</p>
              <p className={`text-2xl font-bold ${isProfit ? 'text-[#10B981]' : profit < 0 ? 'text-[#EF4444]' : 'text-white'}`}>
                {profit >= 0 ? '+' : ''}{formatNumber(profit, 2)} THB
              </p>
              <p className={`text-xs mt-1 font-medium ${isProfit ? 'text-[#10B981]' : profit < 0 ? 'text-[#EF4444]' : 'text-[#A0A0A0]'}`}>
                {profitPercent >= 0 ? '+' : ''}{formatNumber(profitPercent, 2)}%
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isProfit ? 'bg-[#10B981]/10' : profit < 0 ? 'bg-[#EF4444]/10' : 'bg-[#242B33]'}`}>
              {isProfit ? (
                <TrendingUp size={24} className="text-[#10B981]" />
              ) : profit < 0 ? (
                <TrendingDown size={24} className="text-[#EF4444]" />
              ) : (
                <Calculator size={24} className="text-[#A0A0A0]" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formula */}
      <Card className="bg-[#1A1F26] border-[rgba(255,255,255,0.06)]">
        <CardContent className="p-3.5 space-y-2">
          <p className="text-[10px] font-semibold text-[#A0A0A0] uppercase tracking-wider">สูตรคำนวณ</p>
          <div className="space-y-1.5 text-xs text-[#A0A0A0]">
            <p>ต้นทุน: <span className="text-white font-medium">{formatSmart(thbNum)} ÷ {formatSmart(usdNum)} = {usdNum > 0 ? formatNumber(costPerUsd) : '?'} THB/USD</span></p>
            <p>ยอดขาย: <span className="text-white font-medium">{formatSmart(usdNum)} × {formatSmart(sellRateNum)} = {formatNumber(sellTotal, 2)} THB</span></p>
            <p>กำไร: <span className={`font-medium ${isProfit ? 'text-[#10B981]' : profit < 0 ? 'text-[#EF4444]' : 'text-white'}`}>{formatNumber(sellTotal, 2)} - {formatSmart(thbNum)} = {profit >= 0 ? '+' : ''}{formatNumber(profit, 2)} THB</span></p>
          </div>
          <p className="text-[9px] text-[#A0A0A0]/60 mt-2 pt-2 border-t border-[rgba(255,255,255,0.04)]">
            * ตรวจสอบว่า USD ที่ใส่เป็นยอดสุทธิหลังหัก fee แล้ว
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={handleCopy}
          className="flex-1 bg-[#F59E0B] hover:bg-[#D97706] text-[#0F1419] font-semibold text-xs h-11 active:scale-95 transition-transform"
        >
          <Copy size={14} className="mr-1.5" /> คัดลอกผลลัพธ์
        </Button>
        <Button
          onClick={handleClear}
          variant="outline"
          className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white hover:bg-[#2A323C] text-xs h-11 active:scale-95 transition-transform"
        >
          <RotateCcw size={14} className="mr-1.5" /> ล้างค่า
        </Button>
      </div>
    </div>
  );
}
