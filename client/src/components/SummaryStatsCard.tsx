import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { TrendingUp, TrendingDown, DollarSign, Zap, Copy, Edit2 } from "lucide-react";
import { useState } from "react";


export function SummaryStatsCard() {
  const { data: summary, isLoading, error } = trpc.analytics.getSummaryToday.useQuery();
  const [editMode, setEditMode] = useState(false);

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="pt-6 text-red-600">
          Error loading summary data
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      label: "รวมยอดฝาก (THB)",
      value: summary?.deposits.total ?? 0,
      unit: "฿",
      icon: DollarSign,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
    },
    {
      label: "รวม USDT วันนี้",
      value: summary?.usdt.total ?? 0,
      unit: "USDT",
      icon: Zap,
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50",
    },
    {
      label: "รวมส่วนต่าง (THB)",
      value: summary?.usdt.totalTHB ?? 0,
      unit: "฿",
      icon: TrendingDown,
      color: "from-red-500 to-pink-500",
      bgColor: "bg-red-50",
    },
    {
      label: "รวมกำไรวันนี้",
      value: summary?.profit.total ?? 0,
      unit: "฿",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
    },
  ];

  const handleCopy = (value: number, label: string) => {
    navigator.clipboard.writeText(value.toString());
    alert(`คัดลอก ${label}: ${value}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">สรุปยอดรวมวันนี้</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditMode(!editMode)}
          className="gap-2"
        >
          <Edit2 className="w-4 h-4" />
          {editMode ? "เสร็จสิ้น" : "แก้ไข"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card
              key={idx}
              className={`${stat.bgColor} border-0 shadow-lg hover:shadow-xl transition-shadow duration-300`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </CardTitle>
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-gray-900">
                        {typeof stat.value === "number"
                          ? stat.value.toLocaleString("th-TH", {
                              maximumFractionDigits: 2,
                              minimumFractionDigits: 2,
                            })
                          : stat.value}
                      </span>
                      <span className="text-sm text-gray-500">{stat.unit}</span>
                    </div>
                    {editMode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(stat.value as number, stat.label)}
                        className="w-full gap-2 text-xs"
                      >
                        <Copy className="w-3 h-3" />
                        คัดลอก
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
