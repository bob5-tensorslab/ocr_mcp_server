# Quark Vision OCR MCP Server

A Model Context Protocol (MCP) server that enables LLMs to perform optical character recognition (OCR) using the Quark Vision API.

## Features

- **Handwritten Text Recognition** - Recognize handwritten notes, letters, and documents
- **General OCR** - Extract printed text from documents, receipts, and images
- **Table Recognition** - Extract structured data from tables and spreadsheets

## Installation

```bash
cd mcp
npm install
npm run build
```

## Configuration

Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your Quark API credentials
```

Required environment variables:
- `QUARK_CLIENT_ID` - Your Quark API client ID
- `QUARK_CLIENT_KEY` - Your Quark API client secret

## Usage

### Start the server

```bash
npm start
```

### Test with MCP Inspector

```bash
npm run inspector
```

### Available Tools

1. **ocr_handwritten** - Recognize handwritten text
2. **ocr_general** - Extract printed text
3. **ocr_table** - Extract table structures

### Tool Input

All tools accept the same input parameters:

```json
{
  "imagePath": "/path/to/image.png",
  "returnImageInfo": false
}
```

### Tool Output

On success:
```json
{
  "content": [
    {
      "type": "text",
      "text": "Recognized text here..."
    }
  ]
}
```

On error:
```json
{
  "content": [
    {
      "type": "text",
      "text": "Error message here..."
    }
  ],
  "isError": true
}
```

## Error Handling

The server will return `isError: true` when:
- Environment variables `QUARK_CLIENT_ID` or `QUARK_CLIENT_KEY` are not set
- Image file path is invalid or file cannot be read
- Quark API returns an error (invalid credentials, rate limits, etc.)
- Network connection fails

Error messages are descriptive and help identify the issue.

## MCP Integration

To use this server with Claude Desktop or other MCP clients, add the server to your MCP configuration:

**Claude Desktop (macOS):**
```json
{
  "mcpServers": {
    "ocr": {
      "command": "node",
      "args": ["/path/to/mcp/dist/index.js"],
      "env": {
        "QUARK_CLIENT_ID": "your_client_id",
        "QUARK_CLIENT_KEY": "your_client_key"
      }
    }
  }
}
```

**Claude Desktop (Windows):**
```json
{
  "mcpServers": {
    "ocr": {
      "command": "node",
      "args": ["D:/skills/ocr-mcp-server/dist/index.js"],
      "env": {
        "QUARK_CLIENT_ID": "BACK_P498ZRX7DGCSP9UIM4WG",
        "QUARK_CLIENT_KEY": "u1DuU6cxnSQond5CYSa4V3rfC9MvPQlFZojnwySD"
      }
    }
  }
}
```

## API Reference

Based on Quark Vision OCR API:
- Endpoint: `https://scan-business.quark.cn/vision`
- Authentication: SHA3-256 signature
- Supported formats: PNG, JPEG, and other common image formats

## Development

```bash
# Development mode with hot reload
npm run dev

# Build
npm run build

# Type check
npx tsc --noEmit
```

## License

MIT
