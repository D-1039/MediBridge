"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function getCroppedImage(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Crop failed"))),
      "image/jpeg",
      0.92
    );
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export function ImageCropDialog({
  imageSrc,
  label,
  onConfirm,
  onCancel,
}: {
  imageSrc: string;
  label?: string;
  onConfirm: (file: File) => void;
  onCancel: () => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const onCropComplete = useCallback((_: Area, area: Area) => {
    setCroppedArea(area);
  }, []);

  const handleConfirm = async () => {
    if (!croppedArea) return;
    setBusy(true);
    try {
      const blob = await getCroppedImage(imageSrc, croppedArea);
      const file = new File([blob], `cropped-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      onConfirm(file);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="glass-card border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="text-base">
          Crop Image{label ? `: ${label}` : ""} (Optional)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative h-64 sm:h-80 bg-muted rounded-xl overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={4 / 3}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full"
          aria-label="Zoom"
        />
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel} disabled={busy}>
            Skip Crop
          </Button>
          <Button onClick={handleConfirm} disabled={busy}>
            Confirm Crop
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
