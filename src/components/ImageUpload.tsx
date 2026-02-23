"use client";

import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import api from "@/lib/api";
import toast from "react-hot-toast";
import {
  FiUploadCloud,
  FiX,
  FiImage,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";

interface ImageUploadProps {
  /** Current image URL (Cloudinary or any URL) */
  value: string;
  /** Called with the new Cloudinary secure_url after a successful upload,
   *  or with "" when the image is removed */
  onChange: (url: string) => void;
  /** Optional label shown above the drop-zone */
  label?: string;
}

type UploadState = "idle" | "uploading" | "done" | "error";

export default function ImageUpload({ value, onChange, label }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>(value ? "done" : "idle");
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  // Local preview URL (object URL) while uploading
  const [previewUrl, setPreviewUrl] = useState<string>(value || "");

  const uploadFile = useCallback(
    async (file: File) => {
      // Front-end guard: type
      const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowed.includes(file.type)) {
        setErrorMsg("Only JPEG, PNG or WebP images are allowed.");
        setState("error");
        return;
      }
      // Front-end guard: size (5 MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("Image must be smaller than 5 MB.");
        setState("error");
        return;
      }

      // Show instant local preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setState("uploading");
      setProgress(0);
      setErrorMsg("");

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await api.post("/upload", formData, {
          headers: { "Content-Type": undefined }, // let axios set multipart/form-data + boundary automatically
          onUploadProgress: (e) => {
            if (e.total) {
              setProgress(Math.round((e.loaded * 100) / e.total));
            }
          },
        });

        const cloudUrl: string = res.data.data.url;
        // Replace object URL with the permanent Cloudinary URL
        setPreviewUrl(cloudUrl);
        onChange(cloudUrl);
        setState("done");
        toast.success("Image uploaded!");
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } } };
        const msg = e.response?.data?.message || "Upload failed. Please try again.";
        setErrorMsg(msg);
        setState("error");
        setPreviewUrl(value || "");
        toast.error(msg);
      }
    },
    [onChange, value]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // Reset input so the same file can be re-selected
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleRemove = () => {
    setPreviewUrl("");
    setState("idle");
    setProgress(0);
    setErrorMsg("");
    onChange("");
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}

      {/* ── Preview mode ── */}
      {previewUrl && state !== "error" && (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group">
          <div className="relative w-full h-52 sm:h-64">
            <Image
              src={previewUrl}
              alt="Product image"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
            />
            {/* Uploading overlay */}
            {state === "uploading" && (
              <div className="absolute inset-0 bg-gray-900/60 flex flex-col items-center justify-center gap-3">
                <FiLoader className="text-white text-3xl animate-spin" />
                <div className="w-48 h-1.5 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-white text-sm font-medium">
                  Uploading… {progress}%
                </span>
              </div>
            )}
            {/* Done badge */}
            {state === "done" && (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-green-500/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                <FiCheckCircle /> Uploaded to Cloudinary
              </div>
            )}
          </div>

          {/* Action bar below image */}
          {state === "done" && (
            <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white border-t border-gray-100">
              <p className="text-xs text-gray-500 truncate flex-1" title={previewUrl}>
                <span className="font-medium text-gray-700">URL: </span>
                {previewUrl.replace("https://res.cloudinary.com/", "cdn: ")}
              </p>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-xs text-primary-600 hover:underline whitespace-nowrap font-medium"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="text-xs text-red-500 hover:underline whitespace-nowrap font-medium flex items-center gap-1"
              >
                <FiX /> Remove
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Drop zone (shown when idle or error) ── */}
      {(state === "idle" || state === "error") && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-3 w-full h-52 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200
            ${
              dragging
                ? "border-primary-500 bg-primary-50 scale-[1.01]"
                : state === "error"
                ? "border-red-300 bg-red-50"
                : "border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50/50"
            }`}
        >
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl
            ${
              state === "error"
                ? "bg-red-100 text-red-500"
                : dragging
                ? "bg-primary-100 text-primary-600"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {state === "error" ? (
              <FiAlertCircle />
            ) : dragging ? (
              <FiUploadCloud />
            ) : (
              <FiImage />
            )}
          </div>

          {state === "error" ? (
            <div className="text-center px-6">
              <p className="text-sm font-semibold text-red-600">{errorMsg}</p>
              <p className="text-xs text-red-400 mt-1">Click to try again</p>
            </div>
          ) : (
            <div className="text-center px-6">
              <p className="text-sm font-semibold text-gray-700">
                {dragging ? "Drop image here" : "Click or drag & drop to upload"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPEG, PNG or WebP — max 5 MB
              </p>
            </div>
          )}

          {/* Cloudinary badge */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 text-[10px] text-gray-400 font-medium">
            <span className="text-blue-400">☁</span> via Cloudinary
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
