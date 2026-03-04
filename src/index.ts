import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { QuarkVisionClient } from "./client/quark-client.js";
import {
  createHandwrittenTool,
  executeHandwritten,
} from "./tools/handwritten.js";
import {
  createGeneralTool,
  executeGeneral,
} from "./tools/general.js";
import {
  createTableTool,
  executeTable,
} from "./tools/table.js";
import { OCRInputSchema } from "./tools/types.js";

/**
 * Initialize Quark Vision OCR MCP Server
 */
async function main() {
  // Get credentials from environment
  const clientId = process.env.QUARK_CLIENT_ID;
  const clientKey = process.env.QUARK_CLIENT_KEY;

  if (!clientId || !clientKey) {
    console.error("Error: QUARK_CLIENT_ID and QUARK_CLIENT_KEY environment variables are required");
    process.exit(1);
  }

  // Create Quark Vision client
  const client = new QuarkVisionClient(clientId, clientKey);

  // Create MCP server
  const server = new Server(
    {
      name: "ocr-mcp-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register tool list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        createHandwrittenTool(client),
        createGeneralTool(client),
        createTableTool(client),
      ],
    };
  });

  // Register tool call handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    // Validate input using Zod schema
    const parsedInput = OCRInputSchema.safeParse(args);
    if (!parsedInput.success) {
      return {
        content: [
          {
            type: "text",
            text: `Invalid input: ${parsedInput.error.message}`,
          },
        ],
        isError: true,
      };
    }

    const input = parsedInput.data;
    let result;

    // Route to appropriate tool
    switch (name) {
      case "ocr_handwritten":
        result = await executeHandwritten(client, input);
        break;
      case "ocr_general":
        result = await executeGeneral(client, input);
        break;
      case "ocr_table":
        result = await executeTable(client, input);
        break;
      default:
        return {
          content: [
            {
              type: "text",
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        };
    }

    // Return result
    if (result.success) {
      return {
        content: [
          {
            type: "text",
            text: result.text || "",
          },
        ],
      };
    } else {
      return {
        content: [
          {
            type: "text",
            text: result.error || "Unknown error",
          },
        ],
        isError: true,
      };
    }
  });

  // Start stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Server is running
  console.error("Quark Vision OCR MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
