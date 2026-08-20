"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartPoint {
  month: string;
  count?: number;
  donations?: number;
  requests?: number;
  name?: string;
}

export function MonthlyDonationChart({ data }: { data: ChartPoint[] }) {
  const chartData = data.map((d) => ({
    month: d.month,
    donations: d.count ?? d.donations ?? 0,
  }));

  return (
    <Card className="glass-card border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-base">Monthly Donation Growth</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="donations"
              stroke="#2563EB"
              strokeWidth={2}
              dot={{ fill: "#2563EB" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function VerificationRateChart({ rate }: { rate: number }) {
  const data = [
    { name: "Approved", value: rate },
    { name: "Other", value: 100 - rate },
  ];

  return (
    <Card className="glass-card border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-base">Verification Success Rate</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              dataKey="value"
              label={({ name, value }) =>
                name === "Approved" ? `${value}%` : ""
              }
            >
              <Cell fill="#16A34A" />
              <Cell fill="#e2e8f0" />
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <p className="text-center text-2xl font-bold text-green-600 mt-2">
          {rate}%
        </p>
      </CardContent>
    </Card>
  );
}

export function TopMedicinesBarChart({
  data,
  title,
  dataKey = "donations",
}: {
  data: { name: string; donations?: number; requests?: number }[];
  title: string;
  dataKey?: "donations" | "requests";
}) {
  return (
    <Card className="glass-card border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data.slice(0, 6)} layout="vertical" margin={{ left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tick={{ fontSize: 10 }}
            />
            <Tooltip />
            <Bar dataKey={dataKey} fill="#16A34A" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ExpiryTrendChart({ data }: { data: ChartPoint[] }) {
  const chartData = data.map((d) => ({
    month: d.month,
    expiring: d.count ?? 0,
  }));

  return (
    <Card className="glass-card border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-base">Expiry Trend Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="expiring" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
