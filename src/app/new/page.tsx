"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { useShotforgeStore } from "@/lib/store";
import { buildInitialSlides } from "@/lib/build-initial-slides";
import { BrandStep } from "@/components/wizard/BrandStep";
import { UploadStep } from "@/components/wizard/UploadStep";

type Step = "brand" | "upload";

export default function NewProjectPage() {
  const router = useRouter();
  const { setProject } = useShotforgeStore();

  const [step, setStep] = useState<Step>("brand");
  const [sessionId] = useState(() => nanoid());
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [brandColor, setBrandColor] = useState("#6366F1");

  function handleUploadComplete(filenames: string[]) {
    const slides = buildInitialSlides(filenames, brand); // pass brand — sets appName correctly
    setProject({
      id: sessionId,
      brand,
      description,
      brandColor,
      style: "dark",
      slides,
      uploadedFiles: filenames,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    router.push(`/builder/${sessionId}`);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#f5f5f7" }}>Shotforge</span>
        <div style={{ display: "flex", gap: 0 }}>
          {["Brand", "Upload", "Builder", "Export"].map((s, i) => {
            const isActive = (step === "brand" && i === 0) || (step === "upload" && i === 1);
            const isDone = (step === "upload" && i === 0);
            return (
              <span key={s} style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", color: isDone ? "#30D158" : isActive ? "#f5f5f7" : "#48484a", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : undefined }}>
                {isDone ? "✓ " : ""}{s}
              </span>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        {step === "brand" ? (
          <BrandStep
            brand={brand}
            description={description}
            brandColor={brandColor}
            onBrandChange={setBrand}
            onDescriptionChange={setDescription}
            onColorChange={setBrandColor}
            onNext={() => setStep("upload")}
          />
        ) : (
          <UploadStep
            sessionId={sessionId}
            onComplete={handleUploadComplete}
            onBack={() => setStep("brand")}
          />
        )}
      </div>
    </div>
  );
}
