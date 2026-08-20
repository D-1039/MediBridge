"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  ImageIcon,
  Trash2,
  Replace,
  Crop,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImageCropDialog } from "@/components/upload/image-crop-dialog";

const IMAGE_LABELS = ["Front Side", "Back Side", "Expiry Close-Up", "Medicine Box", "Extra"];

export interface GalleryImage {
  id: string;
  file: File;
  preview: string;
  label: string;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ImageGalleryUpload({
  images,
  onChange,
  maxImages = 5,
  disabled = false,
}: {
  images: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
  maxImages?: number;
  disabled?: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [cropTarget, setCropTarget] = useState<GalleryImage | null>(null);
  const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (!list.length) {
        toast.error("Please upload image files only");
        return;
      }
      const remaining = maxImages - images.length;
      if (remaining <= 0) {
        toast.error(`Maximum ${maxImages} images allowed`);
        return;
      }
      const toAdd = list.slice(0, remaining);
      const newImages: GalleryImage[] = toAdd.map((file, i) => ({
        id: makeId(),
        file,
        preview: URL.createObjectURL(file),
        label: IMAGE_LABELS[images.length + i] || `Image ${images.length + i + 1}`,
      }));
      onChange([...images, ...newImages]);
    },
    [images, maxImages, onChange]
  );

  const removeImage = (id: string) => {
    if (!window.confirm("Remove this image?")) return;
    const target = images.find((img) => img.id === id);
    if (target) URL.revokeObjectURL(target.preview);
    onChange(images.filter((img) => img.id !== id));
  };

  const replaceImage = (id: string, file: File) => {
    const idx = images.findIndex((img) => img.id === id);
    if (idx < 0) return;
    URL.revokeObjectURL(images[idx].preview);
    const updated = [...images];
    updated[idx] = {
      ...updated[idx],
      file,
      preview: URL.createObjectURL(file),
    };
    onChange(updated);
    setReplaceTargetId(null);
  };

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const updated = [...images];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (!disabled) addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-6 text-center transition-all",
          disabled ? "opacity-60 pointer-events-none" : "cursor-pointer",
          isDragging
            ? "border-blue-600 bg-blue-600/5"
            : "border-muted-foreground/25 hover:border-blue-600/50 hover:bg-muted/50"
        )}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          className="absolute inset-0 opacity-0 cursor-pointer"
          disabled={disabled || images.length >= maxImages}
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="py-4">
          <div className="h-14 w-14 rounded-2xl bg-blue-600/10 flex items-center justify-center mx-auto mb-3">
            <ImageIcon className="h-7 w-7 text-blue-600" />
          </div>
          <p className="font-medium">Drag & drop medicine photos</p>
          <p className="text-sm text-muted-foreground mt-1">
            {images.length}/{maxImages} images · min 1 required
          </p>
        </div>
      </div>

      {cropTarget && (
        <ImageCropDialog
          imageSrc={cropTarget.preview}
          label={cropTarget.label}
          onCancel={() => setCropTarget(null)}
          onConfirm={(file) => {
            replaceImage(cropTarget.id, file);
            setCropTarget(null);
            toast.success("Image cropped");
          }}
        />
      )}

      <AnimatePresence mode="popLayout">
        <div className="grid sm:grid-cols-2 gap-4">
          {images.map((img, index) => (
            <motion.div
              key={img.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              draggable={!disabled}
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null) reorder(dragIndex, index);
                setDragIndex(null);
              }}
              className={cn(
                "rounded-xl border bg-card overflow-hidden shadow-sm",
                dragIndex === index && "opacity-50"
              )}
            >
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.preview}
                  alt={img.label}
                  className="w-full h-40 object-contain bg-muted/30"
                />
                <div className="absolute top-2 left-2">
                  <span className="text-xs bg-black/60 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                    <GripVertical className="h-3 w-3" />
                    {img.label}
                  </span>
                </div>
              </div>
              <div className="p-2 flex flex-wrap gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="flex-1 min-w-[80px]"
                  disabled={disabled}
                  onClick={() => setCropTarget(img)}
                >
                  <Crop className="h-3.5 w-3.5" />
                  Crop
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="flex-1 min-w-[80px]"
                  disabled={disabled}
                  onClick={() => setReplaceTargetId(img.id)}
                >
                  <Replace className="h-3.5 w-3.5" />
                  Replace
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="flex-1 min-w-[80px]"
                  disabled={disabled}
                  onClick={() => removeImage(img.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </Button>
              </div>
              {replaceTargetId === img.id && (
                <div className="px-2 pb-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="text-xs w-full"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) replaceImage(img.id, file);
                    }}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {images.length === 0 && (
        <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
          <Upload className="h-3.5 w-3.5" />
          Upload front, back, expiry, and box images for better verification
        </p>
      )}
    </div>
  );
}
