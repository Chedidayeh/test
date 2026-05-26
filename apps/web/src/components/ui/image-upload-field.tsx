"use client";

import { useState, useCallback } from "react";
import { UploadButton } from "@/src/lib/uploadthing";
import { Loader2, X, Upload } from "lucide-react";
import { Button } from "./button";
import { toast } from "sonner";

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  maxSize?: string;
}

export function ImageUploadField({
  value,
  onChange,
  label = "Image",
  placeholder = "Upload an image",
  disabled = false,
  maxSize = "4MB",
}: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadComplete = useCallback(
    (res: Array<{ url?: string; appUrl?: string }> | undefined) => {
      if (res && res.length > 0) {
        const uploadedFile = res[0];
        // UploadThing returns the file URL in the 'url' property
        const fileUrl = uploadedFile.url || uploadedFile.appUrl;
        if (fileUrl) {
          onChange(fileUrl);
          toast.success("Image uploaded successfully!", {
            description: "Your image has been uploaded and is ready to use.",
          });
        }
      }
      setIsUploading(false);
    },
    [onChange],
  );

  const handleUploadError = useCallback((error: Error) => {
    console.error("Upload error:", error);
    toast.error("Upload failed", {
      description: error.message || "Failed to upload image. Please try again.",
    });
    setIsUploading(false);
  }, []);

  return (
    <div className="space-y-3">
      {label && <label className="block text-sm font-medium">{label}</label>}

      {/* Upload Area */}
      <div className="relative">
        {!value ? (
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
            <UploadButton
            className={isUploading ? "hidden" : ""}
              endpoint="imageUploader"
              onClientUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              onUploadBegin={() => setIsUploading(true)}
              appearance={{
                button: "ut-ready:bg-blue-500 ut-uploading:cursor-not-allowed rounded-md bg-blue-500 px-3.5 py-2 text-sm font-medium text-white hover:bg-blue-600 ut-uploading:bg-blue-400",
                allowedContent: "hidden",
              }}
              content={{
                button({ ready }) {
                  if (ready)
                    return (
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Choose Image
                      </div>
                    );

                  return "Getting ready...";
                },
                allowedContent() {
                  return (
                    <div className="text-xs text-slate-500">
                      PNG, JPG, GIF up to {maxSize}
                    </div>
                  );
                },
              }}
              disabled={disabled || isUploading}
            />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-lg">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  <p className="text-sm text-slate-600">Uploading...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Image Preview */}
            <div className="relative inline-block w-full">
              <div className="border rounded-lg overflow-hidden bg-slate-50 p-2">
                <img
                  src={value}
                  alt="Uploaded preview"
                  className="w-full max-h-48 object-contain rounded"
                  onError={(e) => {
                    console.error("Image load error:", e);
                    toast.error("Image failed to load", {
                      description: "The uploaded image could not be displayed.",
                    });
                  }}
                />
              </div>

              {/* Remove Button */}
              <Button
                type="button"
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={() => {
                  onChange("");
                  toast.info("Image removed", {
                    description: "The image has been cleared.",
                  });
                }}
                disabled={disabled}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Replace Button */}
            <div className="flex gap-2">
              <UploadButton
                
                endpoint="imageUploader"
                onClientUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                onUploadBegin={() => setIsUploading(true)}
                appearance={{
                  button: "ut-ready:bg-slate-500 ut-uploading:cursor-not-allowed rounded-md bg-slate-500 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-600 ut-uploading:bg-slate-400 flex-1",
                  allowedContent: "hidden",
                }}
                content={{
                  button({ ready }) {
                    if (ready)
                      return (
                        <div className="flex items-center justify-center gap-2">
                          <Upload className="w-4 h-4" />
                          Replace Image
                        </div>
                      );
                    return "Getting ready...";
                  },
                }}
                disabled={disabled || isUploading}
              />
              {/* <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onChange("");
                  toast.info("Image removed", {
                    description: "The image has been cleared.",
                  });
                }}
                disabled={disabled}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button> */}
            </div>
          </div>
        )}
      </div>

      {/* URL Display (for reference) */}
      {value && (
        <div className="p-2 bg-slate-50 rounded border border-slate-200">
          <p className="text-xs text-slate-600 break-all font-mono">{value}</p>
        </div>
      )}
    </div>
  );
}
