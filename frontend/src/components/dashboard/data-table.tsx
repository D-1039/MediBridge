"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/utils/format";

interface DonationRow {
  id: string;
  name: string;
  donor: string;
  quantity: number;
  status: string;
  date: string;
}

interface RequestRow {
  id: string;
  medicine: string;
  requester: string;
  urgency: string;
  status: string;
  date: string;
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, "success" | "warning" | "default" | "urgent"> = {
    verified: "success",
    approved: "success",
    distributed: "success",
    pending: "warning",
    urgent: "urgent",
  };
  return (
    <Badge variant={variants[status] || "default"} className="capitalize">
      {status}
    </Badge>
  );
}

export function DonationsTable({ data }: { data: DonationRow[] }) {
  return (
    <Card className="glass-card border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">Recent Medicine Donations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left py-3 px-2 font-medium">Medicine</th>
                <th className="text-left py-3 px-2 font-medium hidden sm:table-cell">Donor</th>
                <th className="text-left py-3 px-2 font-medium">Qty</th>
                <th className="text-left py-3 px-2 font-medium">Status</th>
                <th className="text-left py-3 px-2 font-medium hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-2 font-medium">{row.name}</td>
                  <td className="py-3 px-2 text-muted-foreground hidden sm:table-cell">{row.donor}</td>
                  <td className="py-3 px-2">{row.quantity}</td>
                  <td className="py-3 px-2"><StatusBadge status={row.status} /></td>
                  <td className="py-3 px-2 text-muted-foreground hidden md:table-cell">{formatDate(row.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function RequestsTable({ data }: { data: RequestRow[] }) {
  return (
    <Card className="glass-card border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">Pending Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left py-3 px-2 font-medium">Medicine</th>
                <th className="text-left py-3 px-2 font-medium hidden sm:table-cell">Requester</th>
                <th className="text-left py-3 px-2 font-medium">Urgency</th>
                <th className="text-left py-3 px-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-2 font-medium">{row.medicine}</td>
                  <td className="py-3 px-2 text-muted-foreground hidden sm:table-cell">{row.requester}</td>
                  <td className="py-3 px-2">
                    <Badge variant={row.urgency === "urgent" ? "urgent" : "secondary"}>
                      {row.urgency}
                    </Badge>
                  </td>
                  <td className="py-3 px-2"><StatusBadge status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
