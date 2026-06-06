"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ScanLine, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OcrSuggestionsCard } from "@/components/upload/OcrSuggestionsCard";
import { MedicineForm } from "@/components/upload/MedicineForm";
import { cn } from "@/lib/utils";
import { api, ApiError } from "@/lib/api-client";
import type { OcrSuggestResponse } from "@/types/api";
import type { MedicineFormValues, OcrSuggestions } from "@/types/ocr";
import { emptyMedicineForm } from "@/types/ocr";
import { hasAnySuggestion, mapSuggestionsToForm } from "@/lib/ocr-utils";
import { VisionSetupBanner } from "@/components/upload/VisionSetupBanner";

export function MedicineUploadForm() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [suggestions, setSuggestions] = useState<OcrSuggestions | null>(null);
  const [suggestMeta, setSuggestMeta] = useState<OcrSuggestResponse | null>(null);
  const [form, setForm] = useState<MedicineFormValues>(emptyMedicineForm);
  const [suggestionFilled, setSuggestionFilled] = useState<
    Partial<Record<keyof MedicineFormValues, boolean>>
  >({});

  const resetSuggestions = useCallback(() => {
    setSuggestions(null);
    setSuggestMeta(null);
    setSuggestionFilled({});
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      setImageFile(file);
      resetSuggestions();
      setSubmitted(false);
      setForm(emptyMedicineForm);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    },
    [resetSuggestions]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const buildApiFields = () => ({
    medicine_name: form.name,
    quantity: form.quantity || "1",
    expiry_date: form.expiryDate || "",
    manufacturing_date: form.manufacturingDate || "",
    batch_number: form.batchNumber || "",
    dosage: form.category || form.description.slice(0, 100),
  });

  const handleGetSuggestions = async () => {
    if (!imageFile) {
      toast.error("Please upload a medicine image first");
      return;
    }
    setIsSuggesting(true);
    resetSuggestions();
    try {
      const result = await api.getOcrSuggestions(imageFile);
      setSuggestMeta(result);
      if (result.suggestions && hasAnySuggestion(result)) {
        setSuggestions(result.suggestions);
        toast.info("OCR suggestions ready", {
          description: "Optional — verify on the strip before accepting.",
        });
      } else {
        toast.message("No OCR suggestions", {
          description: result.error || "Enter all details manually.",
        });
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Could not read label";
      toast.error("OCR suggestions unavailable", { description: msg });
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleAcceptSuggestions = () => {
    if (!suggestions) return;
    const mapped = mapSuggestionsToForm(suggestions);
    const filled: Partial<Record<keyof MedicineFormValues, boolean>> = {};
    (Object.keys(mapped) as (keyof MedicineFormValues)[]).forEach((key) => {
      if (mapped[key]) filled[key] = true;
    });
    setForm((prev) => ({ ...prev, ...mapped }));
    setSuggestionFilled(filled);
    setSuggestions(null);
    toast.success("Suggestions applied — please review and edit if needed");
  };

  const handleSubmit = async () => {
    if (!imageFile) {
      toast.error("Please upload a medicine image first");
      return;
    }
    if (!form.name.trim() || !form.quantity.trim()) {
      toast.error("Medicine name and quantity are required");
      return;
    }
    if (!form.expiryDate) {
      toast.error("Expiry date is required");
      return;
    }
    if (submitted) {
      toast.info("Donation already submitted");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.uploadMedicine(imageFile, buildApiFields());
      setSubmitted(true);
      toast.success("Donation submitted!", {
        description: "Awaiting pharmacist verification",
      });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Submit failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasImage = Boolean(imageFile);

  return (
    <div className="space-y-8">
      <VisionSetupBanner />

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <Card className="glass-card border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-sky-500" />
              Upload Medicine Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              className={cn(
                "relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer",
                isDragging
                  ? "border-sky-500 bg-sky-500/5"
                  : "border-muted-foreground/25 hover:border-sky-500/50 hover:bg-muted/50"
              )}
            >
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
              <AnimatePresence mode="wait">
                {preview ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt="Medicine preview"
                      className="max-h-72 mx-auto rounded-xl object-contain shadow-lg"
                    />
                  </motion.div>
                ) : (
                  <motion.div key="placeholder" className="py-10">
                    <div className="h-16 w-16 rounded-2xl bg-sky-500/10 flex items-center justify-center mx-auto mb-4">
                      <ImageIcon className="h-8 w-8 text-sky-500" />
                    </div>
                    <p className="font-medium mb-1">Drag & drop medicine strip photo</p>
                    <p className="text-sm text-muted-foreground">
                      Then enter details manually below
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Button
              className="w-full mt-6"
              size="lg"
              variant="outline"
              onClick={handleGetSuggestions}
              disabled={isSuggesting || !hasImage || submitted}
            >
              {isSuggesting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ScanLine className="h-4 w-4" />
              )}
              {isSuggesting ? "Reading label…" : "Get OCR Suggestions (Optional)"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {suggestions && (
            <OcrSuggestionsCard
              suggestions={suggestions}
              disclaimer={suggestMeta?.disclaimer}
              onAccept={handleAcceptSuggestions}
              onDismiss={resetSuggestions}
            />
          )}
          {!suggestions && hasImage && !isSuggesting && (
            <Card className="glass-card border-0 border-dashed">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Enter medicine details on the right, or tap{" "}
                <strong>Get OCR Suggestions</strong> for optional hints.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <MedicineForm
        values={form}
        onChange={setForm}
        suggestionFilled={suggestionFilled}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitted={submitted}
        disabled={!hasImage}
      />
    </div>
  );
}
