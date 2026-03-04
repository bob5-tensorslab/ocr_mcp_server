import { z } from "zod";

/**
 * OCR function options supported by Quark Vision API
 */
export const OCRFunctionOption = {
  RecognizeWritten: "RecognizeWritten",
  RecognizeGeneral: "RecognizeGeneralDocument",
  RecognizeTable: "RecognizeGeneralDocument",
} as const;

export type OCRFunctionOptionValue = typeof OCRFunctionOption[keyof typeof OCRFunctionOption];

/**
 * Zod schema for common OCR tool input
 */
export const OCRInputSchema = z.object({
  imagePath: z.string().describe("Absolute path to the image file (e.g. C:\\Users\\user\\Pictures\\photo.jpg or /home/user/photo.jpg). Must be an absolute path."),
  returnImageInfo: z.boolean().optional().describe("Return additional image metadata"),
});

export type OCRInput = z.infer<typeof OCRInputSchema>;

/**
 * Quark API request parameters
 */
export interface QuarkAPIRequest {
  dataBase64: string;
  dataType: string;
  serviceOption: string;
  inputConfigs: string;
  outputConfigs: string;
  reqId: string;
  clientId: string;
  signMethod: string;
  signNonce: string;
  timestamp: number;
  signature: string;
}

/**
 * Quark API response structure
 */
export interface QuarkAPIResponse {
  code: string;
  message?: string;
  data?: {
    OcrInfo?: Array<{
      Text: string;
    }>;
  };
}

/**
 * OCR result returned to client
 */
export interface OCRResult {
  success: boolean;
  text?: string;
  error?: string;
}
