"use client";

import { motion } from "framer-motion";
import { MapPin, Package, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface SmartMatch {
  medicine_id: string;
  medicine_name: string;
  available_quantity: number;
  distance_km: number;
  match_score: number;
}

export function SmartMatchCard({ match }: { match: SmartMatch }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 rounded-xl border border-teal-500/30 bg-gradient-to-br from-teal-500/10 to-sky-500/5 p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-teal-500" />
        <span className="text-sm font-semibold text-teal-700 dark:text-teal-300">
          Best Match Found
        </span>
        <Badge variant="success" className="ml-auto tabular-nums">
          {match.match_score}% match
        </Badge>
      </div>
      <div className="grid sm:grid-cols-2 gap-2 text-sm">
        <div className="flex items-start gap-2">
          <Package className="h-4 w-4 text-sky-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-muted-foreground text-xs">Medicine</p>
            <p className="font-medium">{match.medicine_name}</p>
          </div>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Available quantity</p>
          <p className="font-medium">{match.available_quantity} units</p>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-emerald-500" />
          <div>
            <p className="text-muted-foreground text-xs">Distance</p>
            <p className="font-medium">{match.distance_km} km</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
