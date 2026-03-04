import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { OCRFunctionOptionValue, QuarkAPIRequest, QuarkAPIResponse, OCRResult } from "../tools/types.js";

/**
 * Signature generation parameters
 */
interface SignatureParams {
  clientId: string;
  clientSecret: string;
  business: string;
  signMethod: string;
  signNonce: string;
  timestamp: number;
}

/**
 * Client for Quark Vision OCR API
 * Handles authentication, signature generation, and API communication
 */
export class QuarkVisionClient {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly apiUrl = "https://scan-business.quark.cn/vision";
  private readonly SUCCESS_CODE = "00000";
  private readonly REQUEST_TIMEOUT = 30000; // 30 seconds

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  /**
   * Generate SHA3-256 signature for API authentication
   * Signature format: client_id_business_sign_method_sign_nonce_timestamp_client_secret
   */
  private generateSignature(params: SignatureParams): string {
    const raw = `${params.clientId}_${params.business}_${params.signMethod}_${params.signNonce}_${params.timestamp}_${params.clientSecret}`;
    const utf8Bytes = Buffer.from(raw, "utf-8");
    const hash = crypto.createHash("sha3-256");
    hash.update(utf8Bytes);
    return hash.digest("hex").toLowerCase();
  }

  /**
   * Encode an image file to base64 string
   */
  private async encodeImage(imagePath: string): Promise<string> {
    const resolvedPath = path.resolve(imagePath);
    const buffer = await fs.readFile(resolvedPath);
    return buffer.toString("base64");
  }

  /**
   * Perform OCR recognition using Quark Vision API
   */
  async recognize(
    imagePath: string,
    functionOption: OCRFunctionOptionValue,
    returnImageInfo = false
  ): Promise<OCRResult> {
    // Validate input
    if (!imagePath || imagePath.trim() === "") {
      return {
        success: false,
        error: "Image path is required and cannot be empty",
      };
    }

    // Validate credentials
    if (!this.clientId || !this.clientSecret) {
      return {
        success: false,
        error: "Quark API credentials not configured. Set QUARK_CLIENT_ID and QUARK_CLIENT_KEY environment variables.",
      };
    }

    // Prepare request parameters
    const business = "vision";
    const signMethod = "SHA3-256";
    const signNonce = crypto.randomUUID().replace(/-/g, "");
    const timestamp = Date.now();
    const reqId = crypto.randomUUID().replace(/-/g, "");

    // Generate signature
    const signature = this.generateSignature({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      business,
      signMethod,
      signNonce,
      timestamp,
    });

    // Encode image
    let base64Image: string;
    try {
      base64Image = await this.encodeImage(imagePath);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }

    // Build request payload
    const payload: QuarkAPIRequest = {
      dataBase64: base64Image,
      dataType: "image",
      serviceOption: "ocr",
      inputConfigs: JSON.stringify({ function_option: functionOption }),
      outputConfigs: JSON.stringify({ need_return_image: returnImageInfo ? "True" : "False" }),
      reqId,
      clientId: this.clientId,
      signMethod,
      signNonce,
      timestamp,
      signature,
    };

    // Make API request
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP error ${response.status}: ${response.statusText}`,
        };
      }

      const body: QuarkAPIResponse = await response.json();

      // Check business logic status
      if (body.code !== this.SUCCESS_CODE) {
        return {
          success: false,
          error: `Quark API error: ${body.message || "Unknown error"} (code: ${body.code})`,
        };
      }

      // Extract OCR text
      const ocrInfo = body.data?.OcrInfo;
      if (!ocrInfo || ocrInfo.length === 0) {
        return {
          success: true,
          text: "",
        };
      }

      return {
        success: true,
        text: ocrInfo[0].Text,
      };
    } catch (error) {
      return {
        success: false,
        error: `Network error connecting to Quark API: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}
