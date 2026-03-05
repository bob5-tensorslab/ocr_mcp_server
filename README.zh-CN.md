# Quark Vision OCR MCP Server

**[English](./README.md) | 中文**

基于夸克视觉 API 的 [Model Context Protocol (MCP)](https://modelcontextprotocol.io) 服务端，让 LLM 具备图片文字识别（OCR）能力。

## 功能特性

| 工具 | 说明 |
|------|------|
| `ocr_handwritten` | 识别手写文字（笔记、信件、文档等） |
| `ocr_general` | 识别印刷体文字（文件、票据、截图等） |
| `ocr_table` | 识别表格结构（电子表格、财务报表等） |

## 前置要求

- Node.js 18+
- 夸克视觉 API 凭证（`Client ID` 和 `Client Key`）

## 快速开始

**1. 安装依赖**

```bash
cd ocr_mcp_server
npm install
npm run build
```

**2. 配置环境变量**

```bash
cp .env.example .env
# 编辑 .env，填入夸克 API 凭证
```

所需环境变量：

| 变量名 | 说明 |
|--------|------|
| `QUARK_CLIENT_ID` | 夸克 API 的 Client ID |
| `QUARK_CLIENT_KEY` | 夸克 API 的 Client Key |

> 凭证申请地址：https://scan-business.quark.cn

**3. 启动服务**

```bash
npm start
```

## 集成配置

将服务添加到 Claude Desktop（或其他支持 MCP 的客户端）配置文件中：

**Claude Desktop（macOS）：**

编辑 `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ocr": {
      "command": "node",
      "args": ["/absolute/path/to/ocr-mcp-server/dist/index.js"],
      "env": {
        "QUARK_CLIENT_ID": "your_client_id",
        "QUARK_CLIENT_KEY": "your_client_key"
      }
    }
  }
}
```

**Claude Desktop（Windows）：**

编辑 `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ocr": {
      "command": "node",
      "args": ["D:\\path\\to\\ocr-mcp-server\\dist\\index.js"],
      "env": {
        "QUARK_CLIENT_ID": "your_client_id",
        "QUARK_CLIENT_KEY": "your_client_key"
      }
    }
  }
}
```

## 工具参数

所有工具接受相同的输入参数：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `imagePath` | string | ✅ | 图片文件的**绝对路径**（支持 PNG、JPEG 等常见格式） |
| `returnImageInfo` | boolean | ❌ | 是否返回额外的图片元信息，默认 `false` |

**输入示例：**

```json
{
  "imagePath": "/path/to/image.png",
  "returnImageInfo": false
}
```

**成功响应：**

```json
{
  "content": [
    {
      "type": "text",
      "text": "识别出的文字内容..."
    }
  ]
}
```

**错误响应：**

```json
{
  "content": [
    {
      "type": "text",
      "text": "错误描述信息"
    }
  ],
  "isError": true
}
```

## 错误排查

服务在以下情况下返回 `isError: true`：

| 错误场景 | 原因 |
|----------|------|
| 缺少环境变量 | 未设置 `QUARK_CLIENT_ID` 或 `QUARK_CLIENT_KEY` |
| 图片路径无效 | 文件不存在或无读取权限 |
| API 认证失败 | 凭证错误或已过期 |
| 网络连接失败 | 无法访问 `scan-business.quark.cn` |

## API 说明

基于夸克视觉 OCR API：

- 接口地址：`https://scan-business.quark.cn/vision`
- 认证方式：SHA3-256 签名
- 支持格式：PNG、JPEG 等常见图片格式

## 开发

```bash
# 热重载开发模式
npm run dev

# 构建
npm run build

# 类型检查
npx tsc --noEmit

# 使用 MCP Inspector 调试
npm run inspector
```

## 许可证

[MIT](./LICENSE)
