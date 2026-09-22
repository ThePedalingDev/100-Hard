"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/plate";

type Aspect = "square" | "photo";

type Props = {
  id: string;
  aspect?: Aspect;
  existingUrl?: string | null;
  fileName?: string;
  hint?: string;
  emptyLabel?: string;
  onFile: (file: File | null) => void;
};

const PRESETS: Record<Aspect, { frameW: number; frameH: number; outW: number; outH: number }> = {
  square: { frameW: 240, frameH: 240, outW: 512, outH: 512 },
  photo: { frameW: 320, frameH: 240, outW: 1600, outH: 1200 },
};

export function ImageCropper({
  id,
  aspect = "square",
  existingUrl,
  fileName = "plate.webp",
  hint,
  emptyLabel = "No plate photo yet",
  onFile,
}: Props) {
  const preset = PRESETS[aspect];
  const inputRef = useRef<HTMLInputElement>(null);
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const [source, setSource] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1.2);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ w: preset.frameW, h: preset.frameH });

  useEffect(() => {
    return () => {
      if (source) URL.revokeObjectURL(source);
    };
  }, [source]);

  function loadFile(file: File) {
    if (source) URL.revokeObjectURL(source);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImageSize({ w: img.naturalWidth, h: img.naturalHeight });
      setSource(url);
      setZoom(1.2);
      setOffset({ x: 0, y: 0 });
      void emitCrop(url, img.naturalWidth, img.naturalHeight, 1.2, { x: 0, y: 0 });
    };
    img.src = url;
  }

  async function emitCrop(
    url: string,
    w: number,
    h: number,
    nextZoom: number,
    nextOffset: { x: number; y: number },
  ) {
    const file = await cropToFile(url, w, h, nextZoom, nextOffset, preset, fileName);
    onFile(file);
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!source) return;
    dragging.current = true;
    last.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current || !source) return;
    const dx = event.clientX - last.current.x;
    const dy = event.clientY - last.current.y;
    last.current = { x: event.clientX, y: event.clientY };
    const next = { x: offset.x + dx, y: offset.y + dy };
    setOffset(next);
  }

  function onPointerUp() {
    if (!dragging.current || !source) return;
    dragging.current = false;
    void emitCrop(source, imageSize.w, imageSize.h, zoom, offset);
  }

  const cover = coverScale(imageSize.w, imageSize.h, preset.frameW, preset.frameH);
  const dragHint = aspect === "photo" ? "Drag the photo to frame the plate." : "Drag the photo to frame the face.";

  return (
    <div className="space-y-3">
      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-start">
        <div
          className="relative mx-auto shrink-0 overflow-hidden border border-brass bg-graphite touch-none sm:mx-0"
          style={{ width: preset.frameW, height: preset.frameH, borderRadius: 8 }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {source ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={source}
              alt=""
              draggable={false}
              className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
              style={{
                width: imageSize.w * cover * zoom,
                height: imageSize.h * cover * zoom,
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
              }}
            />
          ) : existingUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={existingUrl} alt="" className="size-full object-cover" />
          ) : (
            <span className="stamp flex size-full items-center justify-center px-4 text-center text-[11px] text-steel">
              {emptyLabel}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept="image/*"
            form="unbound-crop-file"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              if (file.size > 10 * 1024 * 1024) return;
              loadFile(file);
            }}
          />
          <Button type="button" variant="ghost" onClick={() => inputRef.current?.click()}>
            Choose photo
          </Button>
          {source ? (
            <label className="block space-y-2">
              <span className="stamp text-[11px] text-steel">Zoom</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                className="w-full"
                onChange={(event) => {
                  const nextZoom = Number(event.target.value);
                  setZoom(nextZoom);
                  if (source) void emitCrop(source, imageSize.w, imageSize.h, nextZoom, offset);
                }}
              />
              <p className="text-sm text-steel">{hint ?? dragHint}</p>
            </label>
          ) : (
            <p className="text-sm text-steel">{hint ?? "Pick a photo, then crop it to the plate."}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function AvatarCropper(props: Omit<Props, "aspect" | "fileName">) {
  return <ImageCropper {...props} aspect="square" fileName="avatar.webp" />;
}

function coverScale(w: number, h: number, frameW: number, frameH: number) {
  return Math.max(frameW / w, frameH / h);
}

async function cropToFile(
  url: string,
  w: number,
  h: number,
  zoom: number,
  offset: { x: number; y: number },
  preset: { frameW: number; frameH: number; outW: number; outH: number },
  fileName: string,
): Promise<File | null> {
  const img = await loadImage(url);
  const cover = coverScale(w, h, preset.frameW, preset.frameH);
  const drawnW = w * cover * zoom;
  const drawnH = h * cover * zoom;
  const sx = (drawnW / 2 - preset.frameW / 2 - offset.x) * (w / drawnW);
  const sy = (drawnH / 2 - preset.frameH / 2 - offset.y) * (h / drawnH);
  const sw = preset.frameW * (w / drawnW);
  const sh = preset.frameH * (h / drawnH);
  const canvas = document.createElement("canvas");
  canvas.width = preset.outW;
  canvas.height = preset.outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, preset.outW, preset.outH);
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/webp", 0.9);
  });
  if (!blob) return null;
  return new File([blob], fileName, { type: "image/webp" });
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read that image."));
    img.src = url;
  });
}
