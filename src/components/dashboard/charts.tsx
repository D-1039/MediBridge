"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { chartData, wasteData } from "@/services/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ChartPoint = { month: string; donations: number; distributed: number };
type WastePoint = { name: string; value: number; fill: string };

export function DonationsChart({ data = chartData }: { data?: ChartPoint[] }) {
  return (
    <Card className="glass-card border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">Donations vs Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorDistributed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
              }}
            />
            <Area
              type="monotone"
              dataKey="donations"
              stroke="#0ea5e9"
              fillOpacity={1}
              fill="url(#colorDonations)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="distributed"
              stroke="#14b8a6"
              fillOpacity={1}
              fill="url(#colorDistributed)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function WasteReductionChart({ data = wasteData }: { data?: WastePoint[] }) {
  const reduced = data.find((d) => d.name === "Reduced")?.value ?? 0;

  return (
    <Card className="glass-card border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">Waste Reduction</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <div className="text-center -mt-4">
          <p className="text-3xl font-bold gradient-text">{reduced}%</p>
          <p className="text-sm text-muted-foreground">Waste Reduced</p>
        </div>
      </CardContent>
    </Card>
  );
}
