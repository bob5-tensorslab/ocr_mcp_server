import { QuarkVisionClient } from "../client/quark-client.js";
import { OCRInputSchema, OCRInput } from "./types.js";

/**
 * Create the general OCR tool
 */
export function createGeneralTool(client: QuarkVisionClient) {
  return {
    name: "ocr_general",
    description: "Extract text from images using Quark Vision OCR API. Handles printed text, documents, receipts, and general text content.",
    inputSchema: {
      type: "object",
      properties: {
        imagePath: {
          type: "string",
          description: "Absolute path to the image file (e.g. C:\\Users\\user\\photo.jpg). Must be absolute.",
        },
        returnImageInfo: {
          type: "boolean",
          description: "Return additional image metadata",
        },
      },
      required: ["imagePath"],
    },
  };
}

/**
 * Execute general OCR
 */
export async function executeGeneral(
  client: QuarkVisionClient,
  input: OCRInput
): Promise<{ success: boolean; text?: string; error?: string }> {
  const result = await client.recognize(
    input.imagePath,
    "RecognizeGeneralDocument",
    input.returnImageInfo
  );
  return result;
}
