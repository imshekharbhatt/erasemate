import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Image as ImageIcon } from "lucide-react";
import { useBackgroundRemoval } from "../hooks/useBackgroundRemoval";
import { useProcessingStore, useImageStore } from "../store";
import ProcessingBox from "./ProcessingBox";
import ResultSection from "./ResultSection";

const FORMATS = ["JPG", "PNG", "WebP", "BMP", "GIF", "TIFF"];

export default function UploadSection() {
  const { processFile } = useBackgroundRemoval();
  const { status } = useProcessingStore();
  const { originalFile, resultUrl } = useImageStore();
  const [model, setModel] = useState("auto");
  const [enhanceEdges, setEnhanceEdges] = useState(true);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles[0])
        processFile(acceptedFiles[0], { model, enhanceEdges });
    },
    [processFile, model, enhanceEdges],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".bmp",
        ".tiff",
        ".tif",
        ".gif",
      ],
    },
    maxFiles: 1,
    noClick: false,
  });

  // Paste handler
  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) processFile(file, { model, enhanceEdges });
          break;
        }
      }
    };
    document.addEventListener("paste", handler);
    return () => document.removeEventListener("paste", handler);
  }, [processFile, model, enhanceEdges]);

  const showDropZone = status === "idle" && !resultUrl;
  const showProcessing = status === "processing" || status === "uploading";
  const showResult = status === "done" && resultUrl;
  const showError = status === "error";

  return (
    <section className="bg-bg border-y border-line py-16 px-10">
      <div className="max-w-[760px] mx-auto">
        {/* Drop Zone */}
        {(showDropZone || showError) && (
          <div
            {...getRootProps()}
            className={`
              bg-white border-2 border-dashed rounded-[28px] p-[60px_40px] text-center cursor-pointer
              transition-all duration-200
              ${
                isDragActive
                  ? "border-purple bg-purple-pale shadow-[0_0_0_4px_rgba(91,63,248,0.10)]"
                  : "border-line2 hover:border-purple hover:bg-purple-pale hover:shadow-[0_0_0_4px_rgba(91,63,248,0.06)]"
              }
            `}
          >
            <input {...getInputProps()} />

            {/* Icon */}
            <div
              className={`
              w-16 h-16 rounded-2xl bg-purple-light flex items-center justify-center mx-auto mb-5
              transition-transform duration-200
              ${isDragActive ? "scale-110" : "hover:scale-105"}
            `}
            >
              {isDragActive ? (
                <ImageIcon className="w-7 h-7 text-purple" strokeWidth={1.75} />
              ) : (
                <Upload className="w-7 h-7 text-purple" strokeWidth={1.75} />
              )}
            </div>

            <h3 className="text-[17px] font-bold text-text mb-1.5">
              {isDragActive ? "Release to upload" : "Drop your image here"}
            </h3>
            <p className="text-[13.5px] text-muted leading-relaxed mb-6">
              Drag and drop any photo, or click to browse.
              <br />
              Supports people, products, vehicles, animals, and complex scenes.
            </p>

            {/* CTA button */}
            <button
              type="button"
              className="
                inline-flex items-center gap-2 bg-purple text-white border-none
                px-7 py-3 rounded-[10px] text-[14px] font-semibold cursor-pointer
                transition-all duration-150
                hover:bg-purple-hover hover:shadow-[0_6px_20px_rgba(91,63,248,0.28)] hover:-translate-y-px
              "
            >
              <Upload size={15} />
              Select Image
            </button>

            {/* Format tags */}
            <div className="flex justify-center gap-1.5 flex-wrap mt-5">
              {FORMATS.map((f) => (
                <span
                  key={f}
                  className="text-[11px] font-semibold tracking-[0.06em] text-muted2 bg-bg border border-line px-2.5 py-[3px] rounded-[5px] uppercase"
                >
                  {f}
                </span>
              ))}
            </div>

            {/* Paste hint */}
            <p className="text-[12px] text-muted2 mt-3.5">
              You can also paste with{" "}
              <kbd className="font-sans bg-bg2 border border-line2 px-1.5 py-px rounded text-[11px] font-semibold text-text2">
                Ctrl
              </kbd>{" "}
              +{" "}
              <kbd className="font-sans bg-bg2 border border-line2 px-1.5 py-px rounded text-[11px] font-semibold text-text2">
                V
              </kbd>
            </p>

            {/* Advanced options */}
            <div
              className="mt-6 flex flex-wrap items-center justify-center gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                <label className="text-[12px] font-semibold text-muted2 uppercase tracking-wider">
                  Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="text-[12px] font-medium text-text2 bg-bg border border-line rounded-lg px-2.5 py-1.5 outline-none focus:border-purple transition-colors cursor-pointer"
                >
                  <option value="auto">Auto-detect</option>
                  <option value="u2net">General (u2net)</option>
                  <option value="u2net_human_seg">Portrait / People</option>
                  <option value="isnet-general-use">ISNet (sharp edges)</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enhanceEdges}
                  onChange={(e) => setEnhanceEdges(e.target.checked)}
                  className="accent-purple w-3.5 h-3.5"
                />
                <span className="text-[12px] font-medium text-muted2">
                  Enhance edges
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Processing */}
        {showProcessing && <ProcessingBox />}

        {/* Error state */}
        {showError && <ErrorState />}
      </div>

      {/* Result section (full width inside bg strip) */}
      {showResult && (
        <ResultSection model={model} enhanceEdges={enhanceEdges} />
      )}

      {/* New image button */}
      {showResult && (
        <NewImageButton model={model} enhanceEdges={enhanceEdges} />
      )}
    </section>
  );
}

function ErrorState() {
  const { errorMessage, setStatus, resetSteps } = useProcessingStore();
  const { reset } = useImageStore();
  return (
    <div className="bg-white border border-red-200 rounded-[28px] p-14 text-center shadow-md mt-4">
      <div className="w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-5">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-7 h-7 stroke-red-500"
          strokeWidth={1.75}
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4m0 4h.01" />
        </svg>
      </div>
      <h3 className="text-[17px] font-bold text-text mb-2">
        Processing failed
      </h3>
      <p className="text-[13.5px] text-muted mb-6">
        {errorMessage || "Something went wrong. Please try again."}
      </p>
      <button
        onClick={() => {
          resetSteps();
          setStatus("idle");
          reset();
        }}
        className="inline-flex items-center gap-2 bg-purple text-white px-6 py-2.5 rounded-lg text-[13.5px] font-semibold hover:bg-purple-hover transition-colors"
      >
        Try again
      </button>
    </div>
  );
}

function NewImageButton({
  model,
  enhanceEdges,
}: {
  model: string;
  enhanceEdges: boolean;
}) {
  const { processFile } = useBackgroundRemoval();
  const { resetSteps, setStatus } = useProcessingStore();
  const { reset } = useImageStore();

  const handleNew = useCallback(() => {
    resetSteps();
    setStatus("idle");
    reset();
  }, [resetSteps, setStatus, reset]);

  return (
    <div className="text-center pt-7">
      <button
        onClick={handleNew}
        className="
          inline-flex items-center gap-2
          text-purple bg-purple-light border border-purple/20
          px-5 py-2.5 rounded-lg text-[13.5px] font-semibold cursor-pointer
          hover:bg-[#ddd6fe] hover:shadow-[0_3px_12px_rgba(91,63,248,0.15)] transition-all
        "
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3.5 h-3.5 stroke-purple"
        >
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 .49-4" />
        </svg>
        Remove background from another image
      </button>
    </div>
  );
}
