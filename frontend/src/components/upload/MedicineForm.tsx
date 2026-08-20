"use client";

import { AlertTriangle, Loader2, Pencil, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/form-select";
import { medicineCategories } from "@/services/mock-data";
import type { MedicineFormValues } from "@/types/ocr";

interface MedicineFormProps {
  values: MedicineFormValues;
  onChange: (values: MedicineFormValues) => void;
  suggestionFilled?: Partial<Record<keyof MedicineFormValues, boolean>>;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitted: boolean;
  disabled?: boolean;
}

export function MedicineForm({
  values,
  onChange,
  suggestionFilled = {},
  onSubmit,
  isSubmitting,
  submitted,
  disabled,
}: MedicineFormProps) {
  const set = (key: keyof MedicineFormValues, val: string) =>
    onChange({ ...values, [key]: val });

  return (
    <Card className="glass-card border-0 shadow-xl overflow-visible">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pencil className="h-5 w-5 text-green-600" />
          Medicine Details
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter details from the physical strip. OCR suggestions are optional.
        </p>
      </CardHeader>
      <CardContent className="space-y-5 overflow-visible">
        {disabled && (
          <p className="text-sm text-amber-700 dark:text-amber-300 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 flex gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            Upload an image first, then fill in the medicine details.
          </p>
        )}

        <FormField label="Medicine Name" required id="name" fromSuggestion={suggestionFilled.name}>
          <Input
            id="name"
            placeholder="e.g. Crocin Advance"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            disabled={disabled}
          />
        </FormField>

        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Quantity" required id="quantity" fromSuggestion={suggestionFilled.quantity}>
            <Input
              id="quantity"
              type="number"
              min={1}
              placeholder="30"
              value={values.quantity}
              onChange={(e) => set("quantity", e.target.value)}
              disabled={disabled}
            />
          </FormField>
          <FormField
            label="Manufacturing Date"
            id="mfg"
            fromSuggestion={suggestionFilled.manufacturingDate}
          >
            <Input
              id="mfg"
              type="date"
              value={values.manufacturingDate}
              onChange={(e) => set("manufacturingDate", e.target.value)}
              disabled={disabled}
            />
          </FormField>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Expiry Date" required id="expiry" fromSuggestion={suggestionFilled.expiryDate}>
            <Input
              id="expiry"
              type="date"
              value={values.expiryDate}
              onChange={(e) => set("expiryDate", e.target.value)}
              disabled={disabled}
            />
          </FormField>
          <FormField label="Batch Number" id="batch" fromSuggestion={suggestionFilled.batchNumber}>
            <Input
              id="batch"
              placeholder="e.g. EA25107"
              value={values.batchNumber}
              onChange={(e) => set("batchNumber", e.target.value)}
              disabled={disabled}
            />
          </FormField>
        </div>

        <div className="relative z-20">
          <FormField label="Category" fromSuggestion={suggestionFilled.category}>
            <Select
              value={values.category || undefined}
              onValueChange={(v) => set("category", v)}
              disabled={disabled}
            >
              <SelectTrigger className="bg-card text-foreground">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-card">
                {medicineCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <FormField label="Notes" fromSuggestion={suggestionFilled.description}>
          <Textarea
            placeholder="Packaging, storage, or other notes"
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            disabled={disabled}
            rows={2}
          />
        </FormField>

        <Button
          className="w-full"
          size="lg"
          onClick={onSubmit}
          disabled={isSubmitting || submitted || disabled}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {submitted ? "Donation Submitted" : "Submit for Pharmacist Verification"}
        </Button>
      </CardContent>
    </Card>
  );
}

function FormField({
  id,
  label,
  required,
  fromSuggestion,
  children,
}: {
  id?: string;
  label: string;
  required?: boolean;
  fromSuggestion?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </Label>
        {fromSuggestion && (
          <span className="text-[10px] font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400 bg-blue-600/10 px-2 py-0.5 rounded-full">
            From suggestion
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
