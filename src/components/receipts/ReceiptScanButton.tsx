"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Loader2 } from "lucide-react";
import { ImageProcessingStatus, ReceiptScanState } from "@/types";

interface ReceiptScanButtonProps {
  onScanComplete: (result: ReceiptScanState) => void;
  disabled?: boolean;
  variant?: "default" | "secondary" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
}

export default function ReceiptScanButton({
  onScanComplete,
  disabled = false,
  variant = "default",
  size = "default",
}: ReceiptScanButtonProps) {
  const [status, setStatus] = useState<ImageProcessingStatus>(
    ImageProcessingStatus.IDLE
  );

  // Setup react-dropzone
  const { getRootProps, getInputProps, open } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".heic", ".heif"],
    },
    noClick: true,
    noKeyboard: true,
    maxFiles: 1,
    disabled:
      disabled ||
      status === ImageProcessingStatus.PROCESSING ||
      status === ImageProcessingStatus.UPLOADING,
    onDropAccepted: async (files) => {
      if (files.length === 0) return;

      try {
        setStatus(ImageProcessingStatus.UPLOADING);

        // Read the file as base64
        const file = files[0];
        const reader = new FileReader();

        reader.onload = async (event) => {
          if (!event.target?.result) {
            throw new Error("Failed to read file");
          }

          const imageBase64 = event.target.result as string;

          // Notify initial state
          onScanComplete({
            status: ImageProcessingStatus.UPLOADING,
            originalImage: imageBase64,
            extractedData: null,
            error: null,
            isReviewing: false,
            progress: 10,
            confidence: null,
          });

          // Process with Gemini API
          setStatus(ImageProcessingStatus.PROCESSING);
          onScanComplete({
            status: ImageProcessingStatus.PROCESSING,
            originalImage: imageBase64,
            extractedData: null,
            error: null,
            isReviewing: false,
            progress: 30,
            confidence: null,
          });

          try {
            const response = await fetch("/api/gemini/extract", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                imageBase64,
                options: {
                  detectionMode: "DETAILED",
                  preferredLanguage: "vi",
                },
                config: {
                  storeOriginalImage: true,
                  autoConfirmThreshold: 0.9,
                  preferredLanguage: "vi",
                  detectionMode: "DETAILED",
                  storeCategorySuggestions: true,
                  maximumImageSize: 5 * 1024 * 1024, // 5MB
                },
              }),
            });

            const result = await response.json();

            if (!result.success) {
              throw new Error(
                result.error?.message || "Failed to process receipt"
              );
            }

            // Success - update state
            setStatus(ImageProcessingStatus.SUCCESS);
            onScanComplete({
              status: ImageProcessingStatus.SUCCESS,
              originalImage: imageBase64,
              extractedData: result.data,
              error: null,
              isReviewing: true,
              progress: 100,
              confidence: result.confidence,
            });
          } catch (error) {
            // API call failed
            setStatus(ImageProcessingStatus.ERROR);
            onScanComplete({
              status: ImageProcessingStatus.ERROR,
              originalImage: imageBase64,
              extractedData: null,
              error: error instanceof Error ? error.message : "Unknown error",
              isReviewing: false,
              progress: 0,
              confidence: null,
            });
          }
        };

        reader.onerror = () => {
          setStatus(ImageProcessingStatus.ERROR);
          onScanComplete({
            status: ImageProcessingStatus.ERROR,
            originalImage: null,
            extractedData: null,
            error: "Failed to read image",
            isReviewing: false,
            progress: 0,
            confidence: null,
          });
        };

        reader.readAsDataURL(file);
      } catch (error) {
        setStatus(ImageProcessingStatus.ERROR);
        onScanComplete({
          status: ImageProcessingStatus.ERROR,
          originalImage: null,
          extractedData: null,
          error: error instanceof Error ? error.message : "Unknown error",
          isReviewing: false,
          progress: 0,
          confidence: null,
        });
      }
    },
  });

  // For camera capture functionality
  const captureImage = async () => {
    // Implementation for mobile camera capture
    // Typically this would open the camera API
    // For simplicity, we're using the file upload for now
    open();
  };

  // Button state and styling
  const isProcessing =
    status === ImageProcessingStatus.PROCESSING ||
    status === ImageProcessingStatus.UPLOADING;

  return (
    <div>
      <div {...getRootProps()} className="hidden">
        <input {...getInputProps()} />
      </div>

      <div className="flex space-x-2">
        <Button
          type="button"
          variant={variant}
          size={size}
          disabled={disabled || isProcessing}
          onClick={open}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Tải ảnh hóa đơn
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          size={size}
          disabled={disabled || isProcessing}
          onClick={captureImage}
        >
          <Camera className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
