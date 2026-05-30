"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  ScanLine,
  Loader2,
  CheckCircle2,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/form-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { medicineCategories } from "@/services/mock-data";
import { cn } from "@/lib/utils";

export function MedicineUploadForm() {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ocrComplete, setOcrComplete] = useState(false);
  const [form, setForm] = useState({
    name: "",
    quantity: "",
    expiryDate: "",
    category: "",
    description: "",
  });

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleVerify = async () => {
    if (!preview) {
      toast.error("Please upload a medicine image first");
      return;
    }
    setIsVerifying(true);
    setOcrComplete(false);
    await new Promise((r) => setTimeout(r, 2500));
    setIsVerifying(false);
    setOcrComplete(true);
    setForm((f) => ({ ...f, expiryDate: "2027-06-15", name: f.name || "Paracetamol 500mg" }));
    toast.success("OCR verification complete!", {
      description: "Expiry date extracted with 96% confidence",
    });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.quantity) {
      toast.error("Please fill in required fields");
      return;
    }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsSubmitting(false);
    toast.success("Donation submitted successfully!", {
      description: "Your medicine will be reviewed by a pharmacist",
    });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
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
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Medicine preview"
                    className="max-h-64 mx-auto rounded-xl object-contain"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-8"
                >
                  <div className="h-16 w-16 rounded-2xl bg-sky-500/10 flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="h-8 w-8 text-sky-500" />
                  </div>
                  <p className="font-medium mb-1">Drag & drop medicine image</p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse (PNG, JPG)
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {isVerifying && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 p-4 rounded-xl bg-sky-500/10 border border-sky-500/20"
              >
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 text-sky-500 animate-spin" />
                  <div>
                    <p className="font-medium text-sm">OCR Processing...</p>
                    <p className="text-xs text-muted-foreground">
                      Scanning expiry date and medicine details
                    </p>
                  </div>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-sky-500 to-teal-500"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.5 }}
                  />
                </div>
              </motion.div>
            )}
            {ocrComplete && !isVerifying && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3"
              >
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="font-medium text-sm">OCR Complete</p>
                  <p className="text-xs text-muted-foreground">
                    Expiry: 2027-06-15 • Confidence: 96%
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleVerify}
              disabled={isVerifying || !preview}
            >
              {isVerifying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ScanLine className="h-4 w-4" />
              )}
              Verify Medicine
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-0 shadow-xl">
        <CardHeader>
          <CardTitle>Medicine Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Medicine Name *</Label>
            <Input
              id="name"
              placeholder="e.g. Paracetamol 500mg"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="50"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm({ ...form, category: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {medicineCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Additional details about the medicine..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <Button
            className="w-full"
            size="lg"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Submit Donation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
