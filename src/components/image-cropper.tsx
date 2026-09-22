"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button, ErrorBanner } from "@/components/plate";

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

type Draft = { url: string; w: number; h: number };

const PRESETS: Record<Aspect, { ratio: number; outW: number; outH: number }> = {
  square: { ratio: 1, outW: 512, outH: 512 },
  photo: { ratio: 4 / 3, outW: 1600, outH: 1200 },
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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const viewport = window.visualViewport;
    function sync() {
      const height = viewport?.height ?? window.innerHeight;
      root.style.setProperty("--vv-height", `${Math.round(height)}px`);
    }
    sync();
    viewport?.addEventListener("resize", sync);
    viewport?.addEventListener("scroll", sync);
    window.addEventListener("orientationchange", sync);
    return () => {
      viewport?.removeEventListener("resize", sync);
      viewport?.removeEventListener("scroll", sync);
      window.removeEventListener("orientationchange", sync);
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (draft && !dialog.open) dialog.showModal();
    if (!draft && dialog.open) dialog.close();
  }, [draft]);

  useEffect(() => {
    return () => {
      if (draft) URL.revokeObjectURL(draft.url);
    };
  }, [draft]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function loadFile(file: File) {
    setError(null);
    try {
      const next = await decodeFile(file);
      if (draft) URL.revokeObjectURL(draft.url);
      setDraft(next);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not read that image.");
    }
  }

  function closeDraft() {
    if (draft) URL.revokeObjectURL(draft.url);
    setDraft(null);
  }

  const title = aspect === "photo" ? "Frame the plate" : "Frame the face";

  return (
    <div className="space-y-3">
      {error ? <ErrorBanner message={error} /> : null}
      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
        <div
          className="relative mx-auto shrink-0 overflow-hidden border border-steel/40 bg-graphite sm:mx-0"
          style={{
            width: aspect === "square" ? 160 : 200,
            height: 160,
            borderRadius: 8,
          }}
        >
          {preview || existingUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview ?? existingUrl ?? ""} alt="" className="size-full object-cover" />
          ) : (
            <span className="stamp flex size-full items-center justify-center px-3 text-center text-[11px] text-steel">
              {emptyLabel}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/*"
            form="unbound-crop-file"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void loadFile(file);
            }}
          />
          <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={() => inputRef.current?.click()}>
            Choose photo
          </Button>
          <p className="text-sm leading-6 text-steel">
            {hint ?? "Pick a photo, then frame it on the plate."}
          </p>
        </div>
      </div>
      <dialog
        ref={dialogRef}
        className="crop-dialog"
        onCancel={(event) => {
          event.preventDefault();
          closeDraft();
        }}
      >
        {draft ? (
          <CropWorkspace
            title={title}
            draft={draft}
            ratio={preset.ratio}
            outW={preset.outW}
            outH={preset.outH}
            fileName={fileName}
            onCancel={closeDraft}
            onRetake={() => inputRef.current?.click()}
            onConfirm={(file, previewUrl) => {
              setPreview((current) => {
                if (current) URL.revokeObjectURL(current);
                return previewUrl;
              });
              onFile(file);
              closeDraft();
            }}
          />
        ) : null}
      </dialog>
    </div>
  );
}

export function AvatarCropper(props: Omit<Props, "aspect" | "fileName">) {
  return <ImageCropper {...props} aspect="square" fileName="avatar.webp" />;
}

function CropWorkspace({
  title,
  draft,
  ratio,
  outW,
  outH,
  fileName,
  onCancel,
  onRetake,
  onConfirm,
}: {
  title: string;
  draft: Draft;
  ratio: number;
  outW: number;
  outH: number;
  fileName: string;
  onCancel: () => void;
  onRetake: () => void;
  onConfirm: (file: File, previewUrl: string) => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1.15);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; zoom: number } | null>(null);
  const last = useRef({ x: 0, y: 0 });
  const [frame, setFrame] = useState({ w: 280, h: Math.round(280 / ratio) });
  const [zoom, setZoom] = useState(1.15);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => {
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      let nextW = width;
      let nextH = nextW / ratio;
      if (nextH > height) {
        nextH = height;
        nextW = nextH * ratio;
      }
      setFrame({ w: Math.max(1, Math.floor(nextW)), h: Math.max(1, Math.floor(nextH)) });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [ratio]);

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    const block = (event: TouchEvent) => {
      if (event.touches.length > 0) event.preventDefault();
    };
    node.addEventListener("touchmove", block, { passive: false });
    return () => node.removeEventListener("touchmove", block);
  }, []);

  function applyOffset(next: { x: number; y: number }, nextZoom = zoomRef.current) {
    const clamped = clampOffset(next, nextZoom, draft.w, draft.h, frame.w, frame.h);
    offsetRef.current = clamped;
    setOffset(clamped);
  }

  function applyZoom(nextZoom: number) {
    const zoomed = clampZoom(nextZoom);
    zoomRef.current = zoomed;
    setZoom(zoomed);
    applyOffset(offsetRef.current, zoomed);
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    last.current = { x: event.clientX, y: event.clientY };
    if (pointers.current.size === 2) {
      pinch.current = { dist: pointerDistance(pointers.current), zoom: zoomRef.current };
    }
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2 && pinch.current) {
      const dist = pointerDistance(pointers.current);
      applyZoom(pinch.current.zoom * (dist / pinch.current.dist));
      return;
    }
    const dx = event.clientX - last.current.x;
    const dy = event.clientY - last.current.y;
    last.current = { x: event.clientX, y: event.clientY };
    applyOffset({ x: offsetRef.current.x + dx, y: offsetRef.current.y + dy });
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    const remaining = pointers.current.values().next().value as { x: number; y: number } | undefined;
    if (remaining) last.current = remaining;
  }

  const cover = coverScale(draft.w, draft.h, frame.w, frame.h);

  async function confirm() {
    if (busy) return;
    setBusy(true);
    try {
      const file = await cropToFile(draft, zoomRef.current, offsetRef.current, frame, outW, outH, fileName);
      if (!file) return;
      onConfirm(file, URL.createObjectURL(file));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="crop-dialog-body">
      <h2 className="text-[32px] leading-none">{title}</h2>
      <div ref={stageRef} className="flex min-h-0 flex-1 items-center justify-center">
        <div
          ref={frameRef}
          className="relative overflow-hidden border border-brass bg-graphite touch-none"
          style={{ width: frame.w, height: frame.h, borderRadius: 8, touchAction: "none" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={draft.url}
            alt=""
            draggable={false}
            className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
            style={{
              width: draft.w * cover * zoom,
              height: draft.h * cover * zoom,
              transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
            }}
          />
        </div>
      </div>
      <div className="space-y-3">
        <p className="stamp text-[11px] text-steel">Zoom</p>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" className="min-h-12 w-12 px-0" onClick={() => applyZoom(zoom - 0.15)}>
            -
          </Button>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            aria-label="Zoom"
            className="crop-zoom"
            onChange={(event) => applyZoom(Number(event.target.value))}
          />
          <Button type="button" variant="ghost" className="min-h-12 w-12 px-0" onClick={() => applyZoom(zoom + 0.15)}>
            +
          </Button>
        </div>
        <p className="text-sm leading-6 text-steel">Drag or pinch to frame it. Zoom with the slider if pinch is awkward.</p>
        <Button type="button" className="w-full" pending={busy} onClick={() => void confirm()}>
          Use this photo
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" className="min-w-0 flex-1" onClick={onRetake}>
            Choose another
          </Button>
          <Button type="button" variant="ghost" className="min-w-0 flex-1" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

function coverScale(w: number, h: number, frameW: number, frameH: number) {
  return Math.max(frameW / w, frameH / h);
}

function clampZoom(value: number) {
  return Math.min(3, Math.max(1, value));
}

function clampOffset(
  offset: { x: number; y: number },
  zoom: number,
  w: number,
  h: number,
  frameW: number,
  frameH: number,
) {
  const cover = coverScale(w, h, frameW, frameH);
  const drawnW = w * cover * zoom;
  const drawnH = h * cover * zoom;
  const maxX = Math.max(0, (drawnW - frameW) / 2);
  const maxY = Math.max(0, (drawnH - frameH) / 2);
  return {
    x: Math.min(maxX, Math.max(-maxX, offset.x)),
    y: Math.min(maxY, Math.max(-maxY, offset.y)),
  };
}

function pointerDistance(points: Map<number, { x: number; y: number }>) {
  const [a, b] = [...points.values()];
  if (!a || !b) return 1;
  return Math.hypot(a.x - b.x, a.y - b.y);
}

async function decodeFile(file: File): Promise<Draft> {
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Use a photo under 10 MB.");
  }
  if ("createImageBitmap" in window) {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not read that image.");
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();
      const blob = await canvasToBlob(canvas, "image/jpeg", 0.92);
      return { url: URL.createObjectURL(blob), w: canvas.width, h: canvas.height };
    } catch {
      // Safari still reads most camera stills through the Image path.
    }
  }
  const url = URL.createObjectURL(file);
  const image = await loadImage(url);
  return { url, w: image.naturalWidth, h: image.naturalHeight };
}

async function cropToFile(
  draft: Draft,
  zoom: number,
  offset: { x: number; y: number },
  frame: { w: number; h: number },
  outW: number,
  outH: number,
  fileName: string,
) {
  const image = await loadImage(draft.url);
  const cover = coverScale(draft.w, draft.h, frame.w, frame.h);
  const drawnW = draft.w * cover * zoom;
  const drawnH = draft.h * cover * zoom;
  const sx = (drawnW / 2 - frame.w / 2 - offset.x) * (draft.w / drawnW);
  const sy = (drawnH / 2 - frame.h / 2 - offset.y) * (draft.h / drawnH);
  const sw = frame.w * (draft.w / drawnW);
  const sh = frame.h * (draft.h / drawnH);
  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, outW, outH);
  const blob = await canvasToBlob(canvas, "image/webp", 0.9);
  return new File([blob], fileName, { type: "image/webp" });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not encode that image."));
    }, type, quality);
  });
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not read that image."));
    image.src = url;
  });
}
