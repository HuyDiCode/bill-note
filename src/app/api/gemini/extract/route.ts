"use server";

import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  GeminiRequestData,
  GeminiReceiptData,
  CurrencyCode,
  ReceiptProcessingConfig,
} from "@/types";
import { createErrorResponse } from "@/utils/i18n";
import { AUTH_ERRORS, GEMINI_ERRORS, IMAGE_ERRORS } from "@/constants/errors";

/**
 * API endpoint để xử lý hình ảnh hóa đơn với Gemini API
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(createErrorResponse(AUTH_ERRORS.UNAUTHORIZED), {
        status: 401,
      });
    }

    // Parse request data
    const requestData: GeminiRequestData & {
      config?: ReceiptProcessingConfig;
    } = await request.json();

    if (!requestData.imageBase64) {
      return NextResponse.json(
        createErrorResponse(GEMINI_ERRORS.INVALID_REQUEST),
        { status: 400 }
      );
    }

    // Ensure image is properly formatted (data:image/jpeg;base64,...)
    let imageData = requestData.imageBase64;
    if (!imageData.startsWith("data:image")) {
      imageData = `data:image/jpeg;base64,${imageData}`;
    }

    // Call Gemini API
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        createErrorResponse(GEMINI_ERRORS.API_NOT_CONFIGURED),
        { status: 500 }
      );
    }

    // Make the request to Gemini API
    const startTime = Date.now();
    const extractedData = await processReceiptWithGemini();
    const processingTimeMs = Date.now() - startTime;

    // Store original receipt image in Supabase Storage if extraction successful
    // Using the storeOriginalImage property from ReceiptProcessingConfig
    if (extractedData && requestData.config?.storeOriginalImage !== false) {
      try {
        const { error } = await storeReceiptImage(supabase, user.id, imageData);
        if (error) {
          console.error("Error storing receipt image:", error);
        }
      } catch (storageError) {
        console.error("Failed to store receipt image:", storageError);
      }
    }

    // Return response
    return NextResponse.json({
      success: true,
      data: extractedData,
      processingTimeMs,
      confidence: 0.85, // This would come from actual Gemini response
    });
  } catch (error) {
    console.error("Error processing receipt image:", error);
    return NextResponse.json(
      createErrorResponse(GEMINI_ERRORS.EXTRACTION_FAILED, undefined, {
        reason: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
}

/**
 * Hàm gọi Gemini API để xử lý hình ảnh hóa đơn
 * Đây là placeholder, cần thay thế bằng triển khai thực tế với Gemini API
 *
 * Actual implementation would use the imageData, apiKey and options
 */
async function processReceiptWithGemini(): Promise<GeminiReceiptData> {
  // TODO: Implement actual Gemini API call
  // For now, returning dummy data for demonstration
  return {
    storeName: "Super Market ABC",
    storeAddress: "123 Main Street, City",
    date: "2023-10-25",
    time: "14:30",
    items: [
      {
        name: "Milk",
        description: null,
        quantity: 2,
        unitPrice: 25000,
        totalPrice: 50000,
        category: "Dairy",
        confidenceScore: 0.95,
      },
      {
        name: "Bread",
        description: null,
        quantity: 1,
        unitPrice: 15000,
        totalPrice: 15000,
        category: "Bakery",
        confidenceScore: 0.92,
      },
    ],
    subtotal: 65000,
    tax: 5000,
    tip: null,
    total: 70000,
    currency: "VND" as CurrencyCode,
    paymentMethod: "Cash",
    receiptNumber: "R123456",
    merchantId: null,
  };
}

/**
 * Lưu hình ảnh hóa đơn vào Supabase Storage
 */
async function storeReceiptImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  imageBase64: string
) {
  const bucket = "receipts";
  const timestamp = new Date().toISOString();
  const filePath = `${userId}/${timestamp}.jpg`;

  // Extract base64 data without header
  const base64Data = imageBase64.split(";base64,").pop();
  if (!base64Data) {
    return { error: new Error(IMAGE_ERRORS.INVALID_IMAGE) };
  }

  // Convert base64 to Blob
  const blob = Buffer.from(base64Data, "base64");

  // Upload to Supabase Storage
  return await supabase.storage.from(bucket).upload(filePath, blob, {
    contentType: "image/jpeg",
    upsert: false,
  });
}
