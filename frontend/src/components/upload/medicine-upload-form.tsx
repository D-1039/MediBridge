"use client";

import { useState, useCallback } from "react";
import { ScanLine, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OcrSuggestionsCard } from "@/components/upload/OcrSuggestionsCard";
import { MedicineForm } from "@/components/upload/MedicineForm";
import {
  ImageGalleryUpload,
  type GalleryImage,
} from "@/components/upload/image-gallery-upload";
import { api, ApiError } from "@/lib/api-client";
import type { OcrSuggestResponse } from "@/types/api";
import type { MedicineFormValues, OcrSuggestions } from "@/types/ocr";
import { emptyMedicineForm } from "@/types/ocr";
import { hasAnySuggestion, mapSuggestionsToForm } from "@/lib/ocr-utils";
import { VisionSetupBanner } from "@/components/upload/VisionSetupBanner";

export function MedicineUploadForm() {
  const [images, setImages] = useState<GalleryImage[]>([]);
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

  const buildApiFields = () => ({
    medicine_name: form.name,
    quantity: form.quantity || "1",
    expiry_date: form.expiryDate || "",
    manufacturing_date: form.manufacturingDate || "",
    batch_number: form.batchNumber || "",
    dosage: form.category || form.description.slice(0, 100),
  });

  const handleGetSuggestions = async () => {
    if (!images.length) {
      toast.error("Please upload at least one medicine image first");
      return;
    }
    setIsSuggesting(true);
    resetSuggestions();
    try {
      const files = images.map((img) => img.file);
      const result =
        files.length > 1
          ? await api.getOcrSuggestionsMulti(files)
          : await api.getOcrSuggestions(files[0]);
      setSuggestMeta(result);
      if (result.suggestions && hasAnySuggestion(result)) {
        setSuggestions(result.suggestions);
        toast.info("OCR suggestions ready", {
          description:
            files.length > 1
              ? `Merged from ${files.length} images — verify manually.`
              : "Optional — verify on the strip before accepting.",
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
    if (suggestMeta?.batchNumberNeedsReview) delete mapped.batchNumber;
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
    if (!images.length) {
      toast.error("Please upload at least one medicine image");
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
      await api.uploadMedicine(
        images.map((img) => img.file),
        buildApiFields()
      );
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

  const hasImage = images.length > 0;

  return (
    <div className="space-y-8">
      <VisionSetupBanner />

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <Card className="glass-card border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              Upload Medicine Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ImageGalleryUpload
              images={images}
              onChange={setImages}
              maxImages={5}
              disabled={submitted}
            />

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
              {isSuggesting
                ? "Reading labels…"
                : images.length > 1
                  ? "Get OCR Suggestions (All Images)"
                  : "Get OCR Suggestions (Optional)"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {suggestions && (
            <OcrSuggestionsCard
              suggestions={suggestions}
              disclaimer={suggestMeta?.disclaimer}
              batchNumberConfidence={suggestMeta?.batchNumberConfidence}
              batchNumberNeedsReview={suggestMeta?.batchNumberNeedsReview}
              onRetake={() => document.getElementById("medicine-image-picker")?.click()}
              onAccept={handleAcceptSuggestions}
              onDismiss={resetSuggestions}
            />
          )}
          {!suggestions && hasImage && !isSuggesting && (
            <Card className="glass-card border-0 border-dashed">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Enter medicine details on the right, or tap{" "}
                <strong>Get OCR Suggestions</strong> for optional hints from{" "}
                {images.length > 1 ? "all uploaded images" : "your image"}.
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
