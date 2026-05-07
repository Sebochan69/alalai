"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createComplaint } from "@/lib/api";

const AI_STEPS = [
  {
    label: "Submitting your concern…",
    detail: "Securely sending your report",
  },
  {
    label: "Reading & understanding your concern…",
    detail: "Our system is reviewing what you shared",
  },
  {
    label: "Identifying the issue type & urgency…",
    detail: "Classifying your concern for faster action",
  },
  {
    label: "Finding the right person to help…",
    detail: "Routing your concern to the right barangay staff",
  },
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function extensionForType(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
) {
  return new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, quality),
  );
}

async function normalizeUploadImage(file: File) {
  if (file.type !== "image/webp") return file;

  const image = new Image();
  image.src = URL.createObjectURL(file);
  await image.decode();

  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) {
    URL.revokeObjectURL(image.src);
    return file;
  }

  context.drawImage(image, 0, 0);
  URL.revokeObjectURL(image.src);

  const blob = await canvasToBlob(canvas, "image/jpeg", 0.88);
  if (!blob) return file;

  const basename = file.name.replace(/\.[^.]+$/, "") || "complaint-photo";
  return new File([blob], `${basename}.jpg`, { type: "image/jpeg" });
}

export function FileConcernForm() {
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [aiStep, setAiStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [canRetryWithoutPhoto, setCanRetryWithoutPhoto] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!processing) return;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < AI_STEPS.length) {
        setAiStep(step);
      } else {
        clearInterval(interval);
      }
    }, 600);
    return () => clearInterval(interval);
  }, [processing]);

  // ── GPS ──────────────────────────────────────────────────────────────────────
  function pinGPS() {
    if (!navigator.geolocation) {
      setLocError("Geolocation not supported by your browser.");
      return;
    }
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        setLatitude(lat);
        setLongitude(lng);
        // Reverse-geocode to fill the address field
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { "Accept-Language": "en" } },
          );
          const data = await res.json();
          if (data?.display_name) {
            setAddress(data.display_name);
          } else {
            setAddress(`${lat}, ${lng}`);
          }
        } catch {
          setAddress(`${lat}, ${lng}`);
        }
        setLocating(false);
      },
      () => {
        setLocError(
          "Could not get location. Allow location access in your browser.",
        );
        setLocating(false);
      },
    );
  }

  // ── Image pick ───────────────────────────────────────────────────────────────
  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError("Please upload a JPG, PNG, or WEBP image.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError("Image must be under 5 MB.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    try {
      const normalized = await normalizeUploadImage(file);
      if (normalized.size > MAX_IMAGE_SIZE) {
        setError("Converted image must be under 5 MB. Try a smaller photo.");
        if (fileRef.current) fileRef.current.value = "";
        return;
      }
      setImageFile(normalized);
      setImagePreview(URL.createObjectURL(normalized));
      setError(null);
      setCanRetryWithoutPhoto(false);
    } catch {
      setError("Could not prepare this image. Try a JPG or PNG photo.");
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  // ── Submit ───────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submitConcern(imageFile);
  }

  async function submitConcern(photo: File | null) {
    if (!address.trim() && !latitude) {
      setError("Please enter an address or pin your GPS location.");
      return;
    }
    if (!description.trim()) {
      setError("Please add a description.");
      return;
    }
    setError(null);
    setCanRetryWithoutPhoto(false);
    setLoading(true);
    setProcessing(true);
    setAiStep(0);
    try {
      const complaint = await createComplaint({
        title: description.slice(0, 80),
        location: address,
        description,
        lat: latitude ? parseFloat(latitude) : undefined,
        long: longitude ? parseFloat(longitude) : undefined,
        media: photo ?? undefined,
      });
      // Let AI animation finish before showing success
      await new Promise((r) => setTimeout(r, 2600));
      setProcessing(false);
      setSubmitted(complaint.id);
    } catch (err) {
      setProcessing(false);
      const detail =
        err instanceof Error ? err.message : "Failed to submit. Please try again.";
      setError(
        photo
          ? `${detail} This may be related to photo upload. You can retry without the photo.`
          : detail,
      );
      setCanRetryWithoutPhoto(Boolean(photo));
    } finally {
      setLoading(false);
    }
  }

  // ── AI Processing ─────────────────────────────────────────────────────────────
  if (processing) {
    return (
      <div className="min-h-full flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* AI icon + title */}
          <div className="text-center mb-7">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 rounded-2xl bg-accent mx-auto mb-4 flex items-center justify-center shadow-xl shadow-accent/30"
            >
              <motion.svg
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </motion.svg>
            </motion.div>
            <h2 className="text-xl font-black tracking-tight mb-1">
              Hang tight, we&apos;re on it!
            </h2>
            <p className="text-sm text-muted-foreground">
              Your concern is being reviewed and assigned automatically
            </p>
          </div>
          {/* Steps */}
          <div className="space-y-2.5">
            {AI_STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: aiStep >= i ? 1 : 0.3, x: 0 }}
                transition={{ delay: i * 0.12 }}
                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                  aiStep > i
                    ? "bg-emerald-500/8 border-emerald-500/25"
                    : aiStep === i
                      ? "bg-accent/8 border-accent/25"
                      : "bg-muted/20 border-border/40"
                }`}
              >
                {/* Step icon circle */}
                <div
                  className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${
                    aiStep > i
                      ? "bg-emerald-500"
                      : aiStep === i
                        ? "bg-accent"
                        : "bg-muted/60"
                  }`}
                >
                  {aiStep > i ? (
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : aiStep === i ? (
                    <motion.svg
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: "linear",
                      }}
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </motion.svg>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-bold leading-snug ${aiStep >= i ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {step.detail}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          {/* Progress bar */}
          <div className="mt-5 bg-muted/40 rounded-full h-1.5 overflow-hidden">
            <motion.div
              className="h-1.5 rounded-full bg-accent"
              initial={{ width: "0%" }}
              animate={{ width: `${((aiStep + 1) / AI_STEPS.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Step {Math.min(aiStep + 1, AI_STEPS.length)} of {AI_STEPS.length}
          </p>
        </div>
      </div>
    );
  }

  // ── Success ──────────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-full flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-card border border-emerald-500/30 rounded-3xl shadow-xl shadow-emerald-500/10 p-8 flex flex-col items-center text-center gap-5">
            <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/40">
              <svg
                className="text-white"
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-1">
                Submitted!
              </p>
              <h2 className="text-2xl font-black tracking-tight mb-2">
                Concern Received
              </h2>
              <p className="text-sm text-muted-foreground">
                Our AI has categorised and routed your report to the right
                barangay admin.
              </p>
            </div>
            <div className="w-full bg-muted/50 border border-border rounded-2xl p-4 text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Report ID</span>
                <span className="font-mono font-black text-base text-accent">
                  #{submitted}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Category</span>
                <span className="text-xs font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                  AI Auto-assigned
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Status</span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  Pending
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Email updates will be sent as your report progresses.
            </p>
            <div className="flex gap-3 w-full">
              <Link href="/citizen/dashboard" className="flex-1">
                <button className="w-full h-11 rounded-xl border border-border text-sm font-semibold hover:bg-muted/50 transition-colors cursor-pointer">
                  Dashboard
                </button>
              </Link>
              <Link href={`/citizen/reports/${submitted}`} className="flex-1">
                <button className="w-full h-11 rounded-xl bg-accent text-white text-sm font-bold hover:bg-accent/90 transition-colors shadow-sm cursor-pointer">
                  View Report
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-8 max-w-xl mx-auto w-full">
      {/* Header */}
      <div className="mb-7">
        <Link
          href="/citizen/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Dashboard
        </Link>
        <h1 className="text-2xl font-black tracking-tight">File a Concern</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Tell us what happened — AI handles the rest.
        </p>
      </div>

      {/* AI badge */}
      <div className="flex items-center gap-2.5 rounded-2xl bg-accent/8 border border-accent/20 px-4 py-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
          <svg
            className="text-white"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-black text-accent">
            AI Auto-Classification
          </p>
          <p className="text-[11px] text-muted-foreground leading-snug">
            Category &amp; priority level will be automatically detected and
            assigned.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error */}
        {error && (
          <div className="space-y-3 text-xs text-destructive bg-destructive/8 border border-destructive/20 rounded-xl px-4 py-3">
            <div className="flex items-start gap-2">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-0.5 shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
            {canRetryWithoutPhoto && (
              <button
                type="button"
                onClick={() => submitConcern(null)}
                disabled={loading}
                className="h-9 px-3 rounded-xl border border-destructive/30 text-destructive font-bold hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Retry without photo
              </button>
            )}
          </div>
        )}

        {/* Address */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
          <label
            htmlFor="address"
            className="text-xs font-bold uppercase tracking-widest text-accent block"
          >
            Address{" "}
            <span className="text-muted-foreground normal-case font-normal tracking-normal text-[11px]">
              (or pin GPS below)
            </span>{" "}
            <span className="text-destructive">*</span>
          </label>
          <input
            id="address"
            type="text"
            placeholder="e.g. Purok 3, near the basketball court, Brgy. San Isidro"
            className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            Include purok/zone for accurate routing.
          </p>

          {/* GPS */}
          <div className="pt-1">
            <button
              type="button"
              onClick={pinGPS}
              disabled={locating}
              className={`inline-flex items-center gap-2 text-sm font-semibold rounded-xl px-4 py-2 transition-all border disabled:opacity-50 ${
                latitude
                  ? "text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30"
                  : "text-accent border-accent/30 hover:bg-accent/8"
              }`}
            >
              {locating ? (
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="animate-spin"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : latitude ? (
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              ) : (
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              )}
              {locating
                ? "Detecting…"
                : latitude
                  ? "GPS Pinned ✓"
                  : "Pin GPS Location (optional)"}
            </button>
            {locError && (
              <p className="text-xs text-destructive mt-1.5">{locError}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
          <label
            htmlFor="description"
            className="text-xs font-bold uppercase tracking-widest text-accent block"
          >
            Description <span className="text-destructive">*</span>
          </label>
          <textarea
            id="description"
            placeholder="Describe the issue — what happened, when it started, how it affects residents..."
            rows={5}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <p className="text-[10px] text-right text-muted-foreground">
            {description.length} characters
          </p>
        </div>

        {/* Media */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Photo / Evidence{" "}
            <span className="normal-case font-normal">(optional)</span>
          </p>
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            className="hidden"
            onChange={handleImageChange}
          />
          {imagePreview ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-40 object-cover rounded-xl border border-border"
              />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <p className="text-xs text-muted-foreground mt-1.5 truncate">
                {imageFile?.name}
                {imageFile?.type && (
                  <span className="text-muted-foreground/60">
                    {" "}
                    ({extensionForType(imageFile.type).toUpperCase()})
                  </span>
                )}
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full h-24 rounded-xl border-2 border-dashed border-border hover:border-accent/50 bg-muted/20 hover:bg-accent/5 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all group"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground group-hover:text-accent transition-colors"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p className="text-xs text-muted-foreground group-hover:text-accent/80 font-medium transition-colors">
                Click to upload a photo
              </p>
              <p className="text-[10px] text-muted-foreground/60">
                Max 5 MB · JPG, PNG, WEBP
              </p>
            </button>
          )}
        </div>

        {/* Email notice */}
        <div className="flex items-start gap-2.5 rounded-xl bg-muted/40 border border-border/60 px-4 py-3">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground mt-0.5 shrink-0"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Email updates</strong> will be
            sent when your report moves from <em>Pending</em> →{" "}
            <em>In Progress</em> → <em>For Review</em>.
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={
            loading || (!address.trim() && !latitude) || !description.trim()
          }
          className="w-full h-12 rounded-xl bg-accent text-white font-black text-sm hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-accent/20 hover:shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="animate-spin"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Submitting…
            </>
          ) : (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              Submit Report
            </>
          )}
        </button>
      </form>
    </div>
  );
}
