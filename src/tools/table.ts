import { QuarkVisionClient } from "../client/quark-client.js";
import { OCRInputSchema, OCRInput } from "./types.js";

/**
 * Create the table OCR tool
 */
export function createTableTool(client: QuarkVisionClient) {
  return {
    name: "ocr_table",
    description: "Recognize and extract table structures from images using Quark Vision OCR API. Ideal for spreadsheets, financial tables, and structured data.",
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
 * Execute table OCR
 */
export async function executeTable(
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
