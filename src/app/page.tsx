"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { NavBar } from "@/components/shared/nav-bar";
import { CreateForm, type CreateFormData } from "@/components/create/create-form";

export default function CreatePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(data: CreateFormData) {
    setIsSubmitting(true);
    setError(null);

    const sessionId = nanoid();

    // Upload files
    const formData = new FormData();
    formData.append("sessionId", sessionId);
    data.files.forEach((f) => formData.append("files", f));

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const result = await res.json();

      if (!res.ok) {
        const msg = result.filename
          ? `${result.error}: ${result.filename}`
          : (result.detail ?? result.error ?? "Upload failed");
        setError(msg);
        setIsSubmitting(false);
        return;
      }

      // Store session data in localStorage for the generate page to pick up
      const sessionData = {
        sessionId,
        brand: data.brand,
        description: data.description,
        brandColor: data.brandColor,
        filenames: result.filenames as string[],
      };
      localStorage.setItem("shotforge-pending", JSON.stringify(sessionData));

      router.push(`/generate/${sessionId}`);
    } catch {
      setError("Upload failed. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <NavBar currentStep="create" />

      <main
        style={{
          minHeight: "100vh", paddingTop: 48,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "80px 24px",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "5px 14px",
            background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.12))",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: "var(--r-pill)",
            fontSize: 12, fontWeight: 600, color: "var(--indigo)",
            marginBottom: 20,
            animation: "fade-up 0.5s var(--ease) both",
          }}
        >
          <span style={{ animation: "breathe 2s ease infinite" }}>✦</span> AI-Powered
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900,
            textAlign: "center", letterSpacing: -2, lineHeight: 1.05,
            marginBottom: 10,
            animation: "fade-up 0.5s var(--ease) 0.08s both",
          }}
        >
          App Store screenshots
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, var(--indigo), var(--purple), var(--pink))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}
          >
            in one click
          </span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "clamp(14px, 2vw, 17px)", color: "var(--text-2)",
            textAlign: "center", maxWidth: 480, lineHeight: 1.5, marginBottom: 40,
            animation: "fade-up 0.5s var(--ease) 0.16s both",
          }}
        >
          Describe your app, drop your screens, pick a color. AI generates 3 complete sets — you choose and refine.
        </p>

        {/* Form */}
        <div style={{ animation: "fade-up 0.5s var(--ease) 0.24s both" }}>
          <CreateForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>

        {/* Error */}
        {error && (
          <p style={{ color: "var(--red)", fontSize: 13, marginTop: 16 }}>{error}</p>
        )}
      </main>
    </>
  );
}
