"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Search, Sparkles, Pill } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, ApiError } from "@/lib/api-client";
import type { DonationRequestRecord, InventoryMatch } from "@/types/api";
import { RequestSuccessCard } from "@/components/receiver/request-success-card";

export function MedicineSearchPanel({
  onRequestCreated,
  query,
  onQueryChange,
}: {
  onRequestCreated?: () => void;
  query: string;
  onQueryChange: (value: string) => void;
}) {
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<InventoryMatch[]>([]);
  const [selected, setSelected] = useState<InventoryMatch | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [submitting, setSubmitting] = useState(false);
  const [successRequest, setSuccessRequest] =
    useState<DonationRequestRecord | null>(null);

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSuggestions([]);
      return;
    }
    setSearching(true);
    try {
      const data = await api.suggestMedicines(q, 6);
      setSuggestions(data.suggestions);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Search failed"
      );
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    setSelected(null);
    setQuantity("1");

    const timer = setTimeout(() => {
      void runSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, runSearch]);

  const handleSubmit = async () => {
    if (!selected) {
      toast.error("Select a medicine from suggestions first");
      return;
    }
    const qty = parseInt(quantity, 10);
    if (!qty || qty < 1) {
      toast.error("Enter a valid quantity");
      return;
    }
    if (qty > selected.available_quantity) {
      toast.error(
        `Only ${selected.available_quantity} unit(s) available. You requested ${qty}.`
      );
      return;
    }

    setSubmitting(true);
    try {
      const request = await api.createRequest(
        selected.medicine_id,
        qty,
        query.trim() || undefined
      );
      setSuccessRequest(request);
      setSelected(null);
      setQuantity("1");
      setSuggestions([]);
      toast.success("Request submitted successfully");
      onRequestCreated?.();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (successRequest) {
    return (
      <RequestSuccessCard
        request={successRequest}
        onDismiss={() => setSuccessRequest(null)}
      />
    );
  }

  return (
    <Card className="glass-card border-0 shadow-xl mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Search className="h-5 w-5 text-blue-600" />
          Search & Request Medicine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search medicine e.g. Paracetamol, Crocin, Dolo..."
            className="pl-10"
          />
          {searching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-blue-600" />
          )}
        </div>

        <AnimatePresence mode="popLayout">
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-green-600" />
                Suggested Matches (verified inventory)
              </p>
              {suggestions.map((item) => (
                <button
                  key={item.medicine_id}
                  type="button"
                  onClick={() => {
                    setSelected(item);
                    setQuantity("1");
                  }}
                  className={`w-full text-left rounded-xl border p-3 transition-all hover:shadow-md ${
                    selected?.medicine_id === item.medicine_id
                      ? "border-blue-600 bg-blue-600/10"
                      : "border-border hover:border-blue-600/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Pill className="h-4 w-4 text-blue-600 shrink-0" />
                      <div>
                        <p className="font-medium">{item.medicine_name}</p>
                        {item.dosage && (
                          <p className="text-xs text-muted-foreground">
                            {item.dosage}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant="success">{item.match_score}% match</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>Available: {item.available_quantity}</span>
                    <span>Status: Verified</span>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {selected && (
          <div className="rounded-xl border border-blue-600/30 bg-blue-600/5 p-4 space-y-3">
            <p className="text-sm font-medium">
              Request: {selected.medicine_name}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
              <div className="flex-1 w-full">
                <label className="text-xs text-muted-foreground block mb-1">
                  Required Quantity (max {selected.available_quantity})
                </label>
                <Input
                  type="number"
                  min={1}
                  max={selected.available_quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full sm:w-auto"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Submit Request"
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
