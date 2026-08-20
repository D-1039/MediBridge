"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RequestAnalytics } from "@/types/api";

export function RequestVolumeChart({
  data,
}: {
  data: RequestAnalytics["monthly_volume"];
}) {
  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle className="text-base">Request Volume</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip />
            <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function CompletionRateChart({ rate }: { rate: number }) {
  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle className="text-base">Completion Rate</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-5xl font-bold text-green-600">{rate}%</p>
          <p className="text-sm text-muted-foreground mt-2">
            Requests successfully completed
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function DistributionTrendChart({
  data,
}: {
  data: RequestAnalytics["distribution_trend"];
}) {
  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle className="text-base">Distribution Trends</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#16A34A"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
