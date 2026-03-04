import { QuarkVisionClient } from "../client/quark-client.js";
import { OCRInputSchema, OCRInput } from "./types.js";

/**
 * Create the handwritten text recognition tool
 */
export function createHandwrittenTool(client: QuarkVisionClient) {
  return {
    name: "ocr_handwritten",
    description: "Recognize handwritten text in images using Quark Vision OCR API. Best for handwritten notes, letters, and documents.",
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
 * Execute handwritten text recognition
 */
export async function executeHandwritten(
  client: QuarkVisionClient,
  input: OCRInput
): Promise<{ success: boolean; text?: string; error?: string }> {
  const result = await client.recognize(
    input.imagePath,
    "RecognizeWritten",
    input.returnImageInfo
  );
  return result;
}
