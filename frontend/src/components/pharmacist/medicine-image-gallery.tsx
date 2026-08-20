"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MedicineImageRecord } from "@/types/api";
import { cn } from "@/lib/utils";

export function MedicineImageGallery({
  images,
  className,
}: {
  images: MedicineImageRecord[];
  className?: string;
}) {
  const [active, setActive] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const list = images.length
    ? images
    : [{ image_url: "", label: "front", sort_order: 0 }];

  const current = list[active] || list[0];
  if (!current?.image_url) return null;

  return (
    <>
      <div className={cn("space-y-3", className)}>
        <div className="relative rounded-xl overflow-hidden bg-muted/30 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.image_url}
            alt={current.label || "Medicine"}
            className="w-full max-h-56 object-contain"
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setFullscreen(true)}
          >
            <ZoomIn className="h-4 w-4" />
            Zoom
          </Button>
          {current.label && (
            <span className="absolute bottom-2 left-2 text-xs bg-black/60 text-white px-2 py-0.5 rounded-full capitalize">
              {current.label.replace(/_/g, " ")}
            </span>
          )}
        </div>
        {list.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {list.map((img, i) => (
              <button
                key={`${img.image_url}-${i}`}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "shrink-0 rounded-lg border-2 overflow-hidden w-16 h-16",
                  active === i ? "border-blue-600" : "border-transparent"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.image_url}
                  alt={img.label || `Image ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
            onClick={() => setFullscreen(false)}
          >
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="absolute top-4 right-4 text-white hover:bg-white/10"
              onClick={() => setFullscreen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            {list.length > 1 && (
              <>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActive((active - 1 + list.length) % list.length);
                  }}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActive((active + 1) % list.length);
                  }}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.image_url}
              alt={current.label || "Medicine fullscreen"}
              className="max-h-[85vh] max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="text-white/80 text-sm mt-3 capitalize">
              {current.label?.replace(/_/g, " ") || "Medicine image"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
