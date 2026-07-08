# Figma Console MCP 服务器

[![MCP](https://img.shields.io/badge/MCP-Compatible-blue)](https://modelcontextprotocol.io/)
[![npm](https://img.shields.io/npm/v/figma-console-mcp)](https://www.npmjs.com/package/figma-console-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Documentation](https://img.shields.io/badge/docs-docs.figma--console--mcp.southleft.com-0D9488)](https://docs.figma-console-mcp.southleft.com)
[![Sponsor](https://img.shields.io/badge/Sponsor-southleft-ea4aaa?logo=github-sponsors&logoColor=white)](https://github.com/sponsors/southleft)

> **把你的设计系统变成 API。** 这是一个连接设计与开发的 Model Context Protocol 服务器，让 AI 助手能够完整访问 Figma，支持**提取**、**创建**、**调试**以及**双向 Token 同步**。

> **🆕 双向 Token 同步 v2 + DTCG 2025.10（v1.34.0）：** `figma_import_tokens` 现在会执行*完整* diff 计划，包括创建、重命名、别名重新指向以及受 replace 策略保护的删除，实现真正的代码到 Figma 往返同步；导出可按需输出 DTCG 2025.10（可选启用，默认 legacy 输出保持字节级一致）；支持 scopes/codeSyntax 往返；`figma_setup_design_tokens` 支持别名值；新的 `figma_create_component_set` 可通过一次调用，根据轴矩阵创建完整变体集。**需要重新导入插件**（`code.js` + `ui.html` 有变化）。[查看更新内容 →](CHANGELOG.md#1340---2026-07-03)

## 这是什么？

Figma Console MCP 将 AI 助手（例如 Claude）连接到 Figma，可以实现：

- **🎨 设计系统提取** - 拉取变量、组件和样式
- **🔁 双向 Token 同步** - 将 Figma 变量导出为 DTCG JSON（legacy 或 2025.10 方言）以及另外 9 种格式；把代码侧修改完整写回 Figma，包括创建、重命名、别名重新指向和受 replace 策略保护的删除。可替代 Style Dictionary 和 Tokens Studio 的导出流水线。
- **📸 可视化调试** - 截图以获取上下文
- **✏️ 设计创建** - 直接在 Figma 中创建 UI 组件、Frame 和布局，包括通过一次调用从变体轴矩阵创建组件集
- **🔧 变量管理** - 创建、更新、重命名和删除设计 Token
- **🕰 版本历史与时间序列感知** - 列出版本、比较快照、生成 Markdown 更新日志，通过二分 blame 追踪属性/变体引入时间
- **⚡ 实时监控** - 通过 Desktop Bridge 插件监听控制台日志
- **📌 FigJam 白板** - 在协作白板上创建便签、流程图、表格和代码块
- **🎞️ Slides 演示文稿** - 以编程方式构建和管理 Figma Slides
- **♿ 无障碍扫描** - 14 项 WCAG 设计检查，包含符合级别标记、组件评分卡、axe-core 代码扫描、设计到代码一致性检查
- **🛡 跨 MCP 身份标识** - 每个工具响应都带有 `_mcp: "figma-console-mcp"`，错误会加上 `[figma-console-mcp]` 前缀，方便在同时运行多个 Figma MCP 的 agent 中明确归因
- **☁️ Cloud Write Relay** - Web AI 客户端（Claude.ai、v0、Replit）可通过云端配对在 Figma 中创建设计
- **🔄 四种连接方式** - Remote SSE、Cloud Mode、NPX 或 Local Git

---

## ⚡ 快速开始

### 选择你的安装方式

**先决定你想做什么：**

| 我想要... | 安装方式 | 时间 |
|-----------|----------|------|
| **用 AI 创建和修改设计** | [NPX 安装](#-npx-安装推荐)（推荐） | 约 10 分钟 |
| **从网页端设计**（Claude.ai、v0、Replit、Lovable） | [Cloud Mode](#-cloud-modeweb-ai-客户端) | 约 5 分钟 |
| **为项目贡献代码** | [Local Git 安装](#贡献者local-git-模式) | 约 15 分钟 |
| **只探索我的设计数据**（只读） | [Remote SSE](#-remote-sse只读探索) | 约 2 分钟 |

### ⚠️ 重要：能力差异

| 能力 | NPX / Local Git | Cloud Mode | Remote SSE |
|------|-----------------|------------|------------|
| 读取设计数据 | ✅ | ✅ | ✅ |
| **创建组件和 Frame** | ✅ | ✅ | ❌ |
| **编辑现有设计** | ✅ | ✅ | ❌ |
| **管理设计 Token/变量** | ✅ | ✅ | ❌ |
| **FigJam 白板（便签、流程图）** | ✅ | ✅ | ❌ |
| 实时监控（控制台、选区） | ✅ | ❌ | ❌ |
| Desktop Bridge 插件 | ✅ | ✅ | ❌ |
| 需要 Node.js | 是 | **否** | 否 |
| **可用工具总数** | **107** | **96** | **9** |

> **一句话总结：** Remote SSE 是只有 9 个工具的**只读**模式。**Cloud Mode** 让网页 AI 客户端无需 Node.js 即可获得写入能力（96 个工具）。NPX/Local Git 提供完整 107 个工具和实时监控。

---

### 🚀 NPX 安装（推荐）

**适合：** 希望获得完整 AI 辅助设计能力的设计师。

**你将获得：** 全部 107 个工具，包括设计创建、变量管理和组件实例化。

#### 前置条件

- [ ] **Node.js 18+** — 用 `node --version` 检查（[下载](https://nodejs.org)）
- [ ] 已安装 **Figma Desktop**（不能只使用网页版）
- [ ] **一个 MCP 客户端**（Claude Code、Cursor、Windsurf、Claude Desktop 等）

#### 第 1 步：获取 Figma Token

1. 在 Figma 帮助中心打开 [Manage personal access tokens](https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens)
2. 按步骤**创建新的个人访问 Token**
3. 描述填写：`Figma Console MCP`
4. 设置权限范围：**File content**（Read）、**File versions**（Read）、**Variables**（Read）、**Comments**（Read and write）
5. **复制 Token**，之后不会再次显示！（以 `figd_` 开头）

#### 第 2 步：配置 MCP 客户端

**Claude Code（CLI）：**
```bash
claude mcp add figma-console -s user -e FIGMA_ACCESS_TOKEN=figd_YOUR_TOKEN_HERE -e ENABLE_MCP_APPS=true -- npx -y figma-console-mcp@latest
```

**Cursor / Windsurf / Claude Desktop：**

添加到你的 MCP 配置文件中（配置文件位置见下方[配置文件在哪里](#-配置文件在哪里)）：

```json
{
  "mcpServers": {
    "figma-console": {
      "command": "npx",
      "args": ["-y", "figma-console-mcp@latest"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "figd_YOUR_TOKEN_HERE",
        "ENABLE_MCP_APPS": "true"
      }
    }
  }
}
```

#### 📂 配置文件在哪里

如果你不确定上面的 JSON 配置应该放在哪里，下面是各应用保存 MCP 配置的位置：

| 应用 | macOS | Windows |
|------|-------|---------|
| **Claude Desktop** | `~/Library/Application Support/Claude/claude_desktop_config.json` | `%APPDATA%\Claude\claude_desktop_config.json` |
| **Claude Code（CLI）** | `~/.claude.json` | `%USERPROFILE%\.claude.json` |
| **Cursor** | `~/.cursor/mcp.json` | `%USERPROFILE%\.cursor\mcp.json` |
| **Windsurf** | `~/.codeium/windsurf/mcp_config.json` | `%USERPROFILE%\.codeium\windsurf\mcp_config.json` |

> **给设计师的小提示：** `~` 表示你的**用户主目录**。在 macOS 上是 `/Users/YourName/`，在 Windows 上是 `C:\Users\YourName\`。你可以用任何文本编辑器打开这些文件，例如 TextEdit 或 Notepad。
>
> **找不到文件？** 如果文件还不存在，就创建一个。应用会在下次重启时读取它。请确保整个文件是合法 JSON（注意逗号和括号）。
>
> **Claude Code 用户：** 可以完全跳过手动编辑。直接运行上面的 `claude mcp add` 命令即可，它会帮你处理配置。

#### 第 3 步：连接到 Figma Desktop

**Desktop Bridge 插件：**
1. 正常打开 Figma Desktop（不需要特殊启动参数），并打开一个文件
2. 进入 **Plugins → Development → Import plugin from manifest...**
3. 选择 `~/.figma-console-mcp/plugin/manifest.json`（稳定路径，由 MCP 服务器自动创建）
4. 在你的 Figma 文件中运行插件。它会扫描 9223-9232 端口，并自动连接到正在运行的 MCP 服务器

> **关于插件更新的提醒。** Figma 会在应用级别缓存插件文件（`code.js` 和 `ui.html`）。MCP 服务器每次启动都会刷新 `~/.figma-console-mcp/plugin/` 下的文件，但 Figma 会继续使用缓存副本，直到你重新导入 manifest。
>
> **只有当 release notes 明确说明时才必须重新导入**，通常是插件新增了服务器需要的方法（例如 v1.22.4、v1.10.0）。大多数升级中，新服务器仍与旧插件保持协议兼容，重新导入是**可选**的：你仍会获得所有功能变化，只是没有插件侧的外观文案更新（状态标签文案、`pluginVersion` 上报）。
>
> 重新导入时：Plugins → Manage plugins → 重新导入 `~/.figma-console-mcp/plugin/manifest.json`。稳定路径不会变化，所以通常只需点击一次。

#### 第 4 步：重启 MCP 客户端

重启你的 MCP 客户端，让新配置生效。

#### 第 5 步：测试一下！

```
Check Figma status
```
→ 应显示连接状态，并带有 active WebSocket transport

```
Create a simple frame with a blue background
```
→ 应在 Figma 中创建一个 Frame（确认写入权限可用）

**📖 [完整安装指南](docs/setup.md)**

---

### 贡献者：Local Git 模式

**适合：** 想修改源码或为项目贡献代码的开发者。

**你将获得：** 与 NPX 相同的 107 个工具，并拥有完整源码访问权限。

#### 快速安装

```bash
# 克隆并构建
git clone https://github.com/southleft/figma-console-mcp.git
cd figma-console-mcp
npm install
npm run build:local
```

#### 配置 MCP 客户端

添加到你的配置文件中（见[配置文件在哪里](#-配置文件在哪里)）：

```json
{
  "mcpServers": {
    "figma-console": {
      "command": "node",
      "args": ["/absolute/path/to/figma-console-mcp/dist/local.js"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "figd_YOUR_TOKEN_HERE",
        "ENABLE_MCP_APPS": "true"
      }
    }
  }
}
```

然后继续执行上方 [NPX 第 3-5 步](#第-3-步连接到-figma-desktop)。

**📖 [完整安装指南](docs/setup.md)**

---

### 📡 Remote SSE（只读探索）

**适合：** 快速评估工具，或进行只读设计数据提取。

**你将获得：** 9 个只读工具，用于查看数据、截图、读取日志、设计-代码一致性检查。**不能创建或修改设计。**

#### Claude Desktop（UI 方式）

1. 打开 Claude Desktop → **Settings** → **Connectors**
2. 点击 **"Add Custom Connector"**
3. 输入：
   - **Name:** `Figma Console (Read-Only)`
   - **URL:** `https://figma-console-mcp.southleft.com/sse`
4. 点击 **"Add"**，完成！✅

首次使用设计系统工具时会自动进行 OAuth 认证。

#### Claude Code

> **⚠️ 已知问题：** Claude Code 原生的 `--transport sse` 存在一个 [bug](https://github.com/anthropics/claude-code/issues/2466)。请改用 `mcp-remote`：

```bash
claude mcp add figma-console -s user -- npx -y mcp-remote@latest https://figma-console-mcp.southleft.com/sse
```

**💡 提示：** 如果需要完整能力，请使用 [NPX 安装](#-npx-安装推荐)，而不是 Remote SSE。

#### 其他客户端（Cursor、Windsurf 等）

```json
{
  "mcpServers": {
    "figma-console": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://figma-console-mcp.southleft.com/sse"]
    }
  }
}
```

#### 升级到完整能力

准备创建设计了吗？请按照上方 [NPX 安装](#-npx-安装推荐)指南操作；如果不想安装 Node.js，也可以尝试 [Cloud Mode](#-cloud-modeweb-ai-客户端)。

**📖 [完整安装指南](docs/setup.md)**

---

### ☁️ Cloud Mode（Web AI 客户端）

**适合：** 使用 Claude.ai、v0、Replit 或 Lovable 创建和修改 Figma 设计，并且不想安装 Node.js。

**你将获得：** 96 个工具，包括完整写入能力：设计创建、变量管理、组件实例化以及所有 REST API 工具。只有实时监控（控制台日志、选区追踪、文档变化）需要 Local Mode。

#### 前置条件

- [ ] **Figma 个人访问 Token** — [在这里创建](https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens)（以 `figd_` 开头）
- [ ] 已安装 Desktop Bridge 插件的 **Figma Desktop**（见 [Desktop Bridge 安装](#第-3-步连接到-figma-desktop)）
- [ ] **支持 MCP 的 Web AI 客户端**（Claude.ai、Lovable、v0、Replit 等）

#### 第 1 步：添加 MCP Connector

将此 endpoint 添加到你的 AI 平台 MCP 设置中：

**URL:** `https://figma-console-mcp.southleft.com/mcp`
**Auth:** 你的 Figma PAT，作为 Bearer token

在 **Claude.ai** 中：Settings → Connectors → Add Custom Connector → 粘贴上面的 URL。
在 **Lovable/v0/Replit** 中：在设置里寻找 "Add MCP Server" 或 "Integrations" → 粘贴 URL 并添加 Token。

#### 第 2 步：配对插件

1. 在 Figma Desktop 中**打开 Desktop Bridge 插件**（Plugins → Development → Figma Desktop Bridge）
2. **告诉你的 AI 助手：**
   ```
   Connect to my Figma plugin
   ```
3. **AI 会给你一个 6 位配对码**（5 分钟后过期）
4. **在插件中：** 打开 "Cloud Mode" → 输入配对码 → 点击 Connect
5. **配对完成！** 现在可以使用完整写入能力

#### 你可以做什么

配对后，可以用自然语言进行设计：
```
Create a card component with a header image, title, description, and action button
Set up a color token collection with Light and Dark modes
Add a "High Contrast" mode to my existing token collection
```

#### 工作原理

你的 AI 客户端通过云端 MCP 服务器发送写入命令，服务器再通过 WebSocket 转发给正在 Figma Desktop 中运行的 Desktop Bridge 插件。插件使用 Figma Plugin API 执行命令，并通过同一路径返回结果。

```
AI Client → Cloud MCP Server → Durable Object Relay → Desktop Bridge Plugin → Figma
```

> **任何套餐都能用变量：** Cloud Mode 使用 Plugin API（不是 Enterprise REST API），因此变量管理可在 Free、Pro 和 Organization 套餐中使用。

**📖 [完整安装指南](docs/setup.md)**

---

## 📊 安装方式对比

| 功能 | NPX（推荐） | Cloud Mode | Local Git | Remote SSE |
|------|-------------|------------|-----------|------------|
| **安装时间** | 约 10 分钟 | 约 5 分钟 | 约 15 分钟 | 约 2 分钟 |
| **工具总数** | **107** | **96** | **107** | **9**（只读） |
| **设计创建** | ✅ | ✅ | ✅ | ❌ |
| **变量管理** | ✅ | ✅ | ✅ | ❌ |
| **组件实例化** | ✅ | ✅ | ✅ | ❌ |
| **FigJam 白板** | ✅ | ✅ | ✅ | ❌ |
| **实时监控** | ✅ | ❌ | ✅ | ❌ |
| **Desktop Bridge 插件** | ✅ | ✅ | ✅ | ❌ |
| **变量（无需 Enterprise）** | ✅ | ✅ | ✅ | ❌ |
| **控制台日志** | ✅（零延迟） | ❌ | ✅（零延迟） | ✅ |
| **读取设计数据** | ✅ | ✅ | ✅ | ✅ |
| **需要 Node.js** | 是 | **否** | 是 | 否 |
| **认证方式** | PAT（手动） | OAuth（自动） | PAT（手动） | OAuth（自动） |
| **自动更新** | ✅（`@latest`） | ✅ | 手动（`git pull`） | ✅ |
| **源码访问** | ❌ | ❌ | ✅ | ❌ |

> **关键点：** Remote SSE 是只读模式。Cloud Mode 让 Web AI 客户端无需 Node.js 即可获得写入能力。NPX/Local Git 提供完整的 107 个工具。

**📖 [完整功能对比](docs/mode-comparison.md)**

---

## 🎯 测试连接

安装完成后，试试这些 prompt：

**基础测试（所有模式）：**
```
Navigate to https://www.figma.com and check status
```

**设计系统测试（需要认证）：**
```
Get design variables from [your Figma file URL]
```

**Cloud Mode 测试：**
```
Connect to my Figma plugin
```
→ 按配对流程操作，然后试试："Create a simple blue rectangle"

**插件测试（仅 Local Mode）：**
```
Show me the primary font for [your theme name]
```

---

## 🔐 认证

### Remote Mode - OAuth（自动）

首次使用设计系统工具时：
1. 浏览器会自动打开 Figma 授权页面
2. 点击 "Allow" 授权（一次性）
3. Token 会被安全存储并自动刷新
4. 适用于 Free、Pro 和 Enterprise Figma 套餐

### Local Mode - 个人访问 Token（手动）

1. 访问 https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens
2. 生成具有以下 scopes 的 Token：**File content**（Read）、**File versions**（Read）、**Variables**（Read）、**Comments**（Read and write）
3. 将其作为 `FIGMA_ACCESS_TOKEN` 环境变量添加到 MCP 配置中

---

## 🛠️ 可用工具

### 状态与诊断
- `figma_get_status` - 检查 WebSocket Bridge 连接和文件上下文
- `figma_diagnose` - 面向设计师可读的健康检查与安装指导
- `figma_reconnect` - 强制重连 Desktop Bridge 插件
- `figma_navigate` - 在已连接插件之间切换当前文件目标（Local），或导航云端 headless 浏览器（Remote/Cloud）

### 控制台调试
- `figma_get_console_logs` - 获取控制台日志
- `figma_watch_console` - 实时日志流
- `figma_clear_console` - 清空日志缓冲区
- `figma_reload_plugin` - 重新加载当前页面

### 可视化调试
- `figma_take_screenshot` - 捕获 UI 截图

### 设计系统提取
- `figma_get_design_system_kit` - **一次调用获取完整设计系统**：Token、组件、样式、视觉规格
- `figma_get_variables` - 提取设计 Token/变量
- `figma_get_component` - 获取组件数据（元数据或重建规格）
- `figma_get_component_for_development` - 组件 + 图片
- `figma_get_component_image` - 仅图片
- `figma_get_styles` - 颜色、文本、效果样式
- `figma_get_file_data` - 完整文件结构
- `figma_get_file_for_plugin` - 优化后的文件数据

### 📚 共享库检查
- `figma_get_library_component_by_key` - **将任意组件 key 解析为完整属性 + 变体 + 视觉规格**，无需源库文件 URL。支持 COMPONENT_SET 和独立 COMPONENT key。超过 500KB 时自适应压缩。
- `figma_get_library_components` - 发现库文件中的所有组件（需要库文件 URL/key）
- `figma_get_library_variables` - 列出当前文件已订阅团队库中的所有变量。**适用于所有 Figma 套餐**，使用 Plugin API 路径，而不是仅 Enterprise 可用的 REST endpoint。可按 `libraryName`、`collectionName` 或 `resolvedType` 过滤。
- `figma_import_library_variable` - 将库变量导入当前文件。返回可直接传给 `figma_set_fills` / `figma_update_variable` / 任意变量绑定工具的本地 `id`。

### ☁️ Cloud Relay
- `figma_pair_plugin` - 生成配对码，用于通过云中继连接 Desktop Bridge 插件

### ✏️ 设计创建（Local Mode + Cloud Mode）
- `figma_execute` - **强力工具**：运行任意 Figma Plugin API 代码来创建设计
  - 创建 Frame、形状、文本、组件
  - 应用 auto-layout、样式、效果
  - 以编程方式构建完整 UI mockup
- `figma_create_component_set` - **通过一次声明式调用创建带变体的组件集**
  - 从轴矩阵生成所有变体组合（例如 `{ State: ["default", "hover", "disabled"], Size: ["sm", "lg"] }` → 6 个变体），可基于一个基础组件，也可合并现有组件
  - 底层使用 `Prop=Value` 变体命名和 `combineAsVariants`，可选自动排列的带标签网格
  - 返回每个变体的 key，可直接用于 `figma_instantiate_component`
- `figma_arrange_component_set` - **将变体整理为专业组件集**
  - 将多个组件变体转换为规范的 Figma 组件集
  - 自动应用原生紫色虚线边框视觉效果
  - 创建带标题、行标签和列标题的白色容器 Frame
  - 行标签与每一行网格垂直居中
  - 列标题与每一列水平居中
  - 可使用自然语言，例如 "arrange these variants" 或 "organize as component set"
- `figma_set_description` - **用富文本描述来文档化组件**
  - 为组件、组件集和样式添加描述
  - 支持 Markdown 格式
  - 描述会在 Dev Mode 中展示给开发者

### 🔍 设计-代码一致性（所有模式）
- `figma_check_design_parity` - 对比 Figma 组件规格与代码实现，生成带评分的 diff 报告和可操作修复项
- `figma_generate_component_doc` - 合并 Figma 设计数据与代码侧信息，生成平台无关的 Markdown 文档

### 🔁 Token 同步（Local Mode + Cloud Mode）
- `figma_export_tokens` - **将 Figma 变量导出为代码库中的设计 Token 文件。** 标准 DTCG JSON（默认 legacy hex 方言，或通过 `dtcgDialect: "2025"` 输出 DTCG 2025.10 对象颜色/尺寸）以及 CSS、Tailwind v4/v3、SCSS、TS、JSON、Style Dictionary、Tokens Studio 格式。可与现有源文件进行 diff 感知合并（只写入发生变化的内容）。`tokens.config.json` 自动发现意味着首次设置后可零参数调用。Scopes 和 codeSyntax 元数据通过 `$extensions` 往返。可替代 Style Dictionary 和 Tokens Studio 针对常见样式方案的导出流水线。
- `figma_import_tokens` - **把代码侧 Token 修改完整写回 Figma。** 与当前 Figma 状态做 diff，然后应用值更新、**创建**缺失的集合/变量、执行**重命名**、写入真实 **alias**（`VARIABLE_ALIAS`）引用，并且仅在 `strategy: "replace"` 时删除 Figma-only 变量。往返安全：Figma 变量 ID 会保存在 DTCG `$extensions["figma-console-mcp"]` 中，因此任一侧重命名都不会创建重复项。支持两种 DTCG 方言。Dry-run 策略可安全预览。Cloud Mode 中可通过 `payload` 或 `files` 内联传入 Token（无本地文件系统访问）。

### 🔧 变量管理（Local Mode + Cloud Mode）
- `figma_create_variable_collection` - 创建带模式的新变量集合
- `figma_create_variable` - 创建 COLOR、FLOAT、STRING 或 BOOLEAN 变量
- `figma_update_variable` - 更新特定模式中的变量值
- `figma_rename_variable` - 在保留值的情况下重命名变量
- `figma_delete_variable` - 删除变量
- `figma_delete_variable_collection` - 删除集合及其所有变量
- `figma_add_mode` - 向集合添加模式（例如 "Dark"、"Mobile"）
- `figma_rename_mode` - 重命名现有模式
- `figma_batch_create_variables` - 一次创建最多 100 个变量（快 10-50 倍）
- `figma_batch_update_variables` - 一次更新最多 100 个变量值
- `figma_setup_design_tokens` - 原子化创建完整 Token 系统（集合 + 模式 + 变量），值支持 DTCG 大括号引用（`"{color.blue.600}"`），并解析为真实变量别名

### 📌 FigJam 白板工具（Local Mode + Cloud Mode）
- `figjam_create_sticky` - 创建带颜色选项的便签
- `figjam_create_stickies` - 批量创建最多 200 个便签
- `figjam_create_connector` - 用带标签的连接线连接节点
- `figjam_create_shape_with_text` - 创建流程图形状（菱形、椭圆等）
- `figjam_create_table` - 根据单元格数据创建表格
- `figjam_create_code_block` - 添加带语法高亮的代码片段
- `figjam_auto_arrange` - 以网格、水平或垂直布局排列节点
- `figjam_get_board_contents` - 读取 FigJam 白板中的所有内容
- `figjam_get_connections` - 读取连接图（流程图、关系图）

### 🎞️ Slides 演示文稿工具（Local Mode + Cloud Mode）
- `figma_list_slides` - 列出所有 slide 及其 ID、位置和跳过状态
- `figma_get_slide_content` - 获取 slide 的完整内容树
- `figma_get_slide_grid` - 获取演示文稿的二维网格布局
- `figma_get_slide_transition` - 读取 slide 的转场设置
- `figma_get_focused_slide` - 获取当前聚焦的 slide
- `figma_create_slide` - 创建新的空白 slide
- `figma_delete_slide` - 从演示文稿中删除 slide
- `figma_duplicate_slide` - 克隆现有 slide
- `figma_reorder_slides` - 通过新的二维网格布局重排 slide
- `figma_set_slide_transition` - 设置转场效果（22 种样式、8 种曲线）
- `figma_skip_slide` - 切换 slide 是否在演示模式中跳过
- `figma_add_text_to_slide` - 向 slide 添加文本，支持自定义字体、颜色、对齐和换行
- `figma_add_shape_to_slide` - 添加矩形或椭圆形状并设置颜色
- `figma_set_slide_background` - 设置 slide 背景色（创建或更新）
- `figma_get_text_styles` - 获取所有本地文本样式及其 ID、字体和字号
- `figma_set_slides_view_mode` - 切换网格视图和单 slide 视图
- `figma_focus_slide` - 导航到指定 slide

**📖 [详细工具文档](docs/TOOLS.md)**

---

## 📖 示例 Prompt

### Cloud Mode（Web AI 客户端）
```
Connect to my Figma plugin so we can start designing
Pair with my Figma file and create a login form with email, password, and submit button
Set up a brand color token collection with Light and Dark modes
```

### 插件调试
```
Navigate to my Figma plugin and show me any console errors
Watch the console for 30 seconds while I test my plugin
Get the last 20 console logs
```

### 设计系统提取
```
Get all design variables from https://figma.com/design/abc123
Extract color styles and show me the CSS exports
Get the Button component with a visual reference image
Get the Badge component in reconstruction format for programmatic creation
```

### 设计创建（Local Mode + Cloud Mode）
```
Create a success notification card with a checkmark icon and message
Design a button component with hover and disabled states
Build a navigation bar with logo, menu items, and user avatar
Create a modal dialog with header, content area, and action buttons
Arrange these button variants into a component set
Organize my icon variants as a proper component set with the purple border
```

### 变量管理（Local Mode + Cloud Mode）
```
Create a new color collection called "Brand Colors" with Light and Dark modes
Add a primary color variable with value #3B82F6 for Light and #60A5FA for Dark
Rename the "Default" mode to "Light Theme"
Add a "High Contrast" mode to the existing collection
```

### 设计-代码一致性
```
Compare the Button component in Figma against our React implementation
Check design parity for the Card component before sign-off
Generate component documentation for the Dialog from our design system
```

### FigJam 白板
```
Create a retrospective board with "Went Well", "To Improve", and "Action Items" columns
Build a user flow diagram for the checkout process with decision points
Read this brainstorming board and summarize the key themes
Generate an affinity map from these meeting notes
Create a comparison table of our three platform options
```

### Slides 演示文稿
```
List all slides and tell me which ones are skipped
Add a new slide with the title "Thank You" in 72px text
Set a DISSOLVE transition on the first slide with 0.5 second duration
Duplicate slide 5 for an A/B comparison
Skip slides 8 and 9 — they're not ready for the client presentation
Reorder my slides so the conclusion comes before Q&A
```

### 可视化调试
```
Take a screenshot of the current Figma canvas
Navigate to this file and capture what's on screen
```

**📖 [更多用例与示例](docs/USE_CASES.md)**

---

## 🎨 AI 辅助设计创建

> **需要 Desktop Bridge：** 该功能适用于 Local Mode（NPX 或 Local Git）和 [Cloud Mode](#-cloud-modeweb-ai-客户端)。未进行 Cloud Mode 配对的 Remote SSE 是只读模式，无法创建或修改设计。

这个 MCP 服务器最强大的能力之一，是让你可以通过与 Claude Desktop、Claude Code 等任意 MCP 兼容 AI 助手进行自然语言对话，**直接在 Figma 中设计完整 UI 组件和页面**。

### 可以做什么

**从零创建原创设计：**
```
Design a login card with email and password fields, a "Forgot password?" link,
and a primary Sign In button. Use 32px padding, 16px border radius, and subtle shadow.
```

**利用现有组件库：**
```
Build a dashboard header using the Avatar component for the user profile,
Button components for actions, and Badge components for notifications.
```

**生成完整页面布局：**
```
Create a settings page with a sidebar navigation, a main content area with form fields,
and a sticky footer with Save and Cancel buttons.
```

### 工作原理

1. **你用自然语言描述想要的内容**
2. **AI 使用 `figma_search_components` 搜索组件库**，找到相关构建块
3. **通过 `figma_instantiate_component` 实例化组件**，并正确设置变体和属性
4. **使用 `figma_execute` 调用完整 Figma Plugin API** 创建自定义元素
5. **自动进行视觉验证**，截图并迭代，直到设计看起来正确

### 受益人群

| 角色 | 使用场景 |
|------|----------|
| **设计师** | 无需逐个 Frame 手动搭建，即可快速原型化想法。通过描述变化快速探索不同方案。 |
| **开发者** | 在规划讨论中生成 UI mockup。不切换设计工具也能创建视觉规格。 |
| **产品经理** | 在构思阶段勾勒功能概念。直接向干系人传达视觉需求。 |
| **设计系统团队** | 通过生成组合测试组件灵活性。发现组件覆盖缺口。 |
| **代理机构** | 加速初始概念交付。在客户会议中实时迭代反馈。 |

### 示例工作流

**全新设计：**
> "Create a notification toast with an icon on the left, title and description text, and a dismiss button. Use our brand colors."

AI 会创建自定义 Frame，应用你的设计 Token，并从零构建组件。

**组件组合：**
> "Build a user profile card using the Avatar component (large size), two Button components (Edit Profile and Settings), and a Badge for the user's status."

AI 会搜索你的库，找到准确组件，并以正确间距和对齐方式组装它们。

**设计迭代：**
> "The spacing feels too tight. Increase the gap between sections to 24px and make the heading larger."

AI 会修改现有设计，截图验证，并持续迭代直到你满意。

### 视觉验证

创建设计后，AI 会自动遵循验证流程：

1. **Create** → 执行设计代码
2. **Screenshot** → 捕获结果
3. **Analyze** → 检查对齐、间距和视觉平衡
4. **Iterate** → 修复发现的问题
5. **Verify** → 最终截图确认

这保证设计不只是技术上正确，也真正*看起来*正确。

---

## 🎨 Desktop Bridge 插件（推荐连接方式）

**Figma Desktop Bridge** 插件是将 Figma 连接到 MCP 服务器的推荐方式。它通过 WebSocket 通信，不需要特殊 Figma 启动参数，并且可在 Figma 重启后继续使用。

### 安装

1. 打开 Figma Desktop（正常启动，无需 debug flags）
2. 进入 **Plugins → Development → Import plugin from manifest...**
3. 从 figma-console-mcp 目录选择 `figma-desktop-bridge/manifest.json`
4. 在你的 Figma 文件中运行插件，它会通过 WebSocket 自动连接（扫描 9223-9232 端口）
5. 向你的 AI 提问："Check Figma status" 来验证连接

> **一次性导入。** 导入后，插件会保留在 Development plugins 列表中。需要使用 MCP 时运行它即可。

**📖 [Desktop Bridge 文档](figma-desktop-bridge/README.md)**

### 能力

**读取操作：**
- 无需 Enterprise API 即可读取变量
- 可靠读取组件描述（绕过 API bug）
- 支持多模式（Light/Dark/Brand 变体）
- 实时选区追踪和文档变更监控

**写入操作：**
- **设计创建** - 通过 `figma_execute` 创建 Frame、形状、文本、组件
- **变量管理** - 对变量和集合进行完整 CRUD 操作
- **模式管理** - 为多主题支持添加和重命名模式

### 传输机制

- MCP 服务器通过 Desktop Bridge 插件使用 **WebSocket** 通信
- 服务器会先尝试端口 9223，如有需要会自动回退到 9224-9232
- 插件扫描范围内所有端口，并连接到找到的每个活跃服务器
- 所有 107 个工具都可通过 WebSocket transport 使用

**多个文件：** WebSocket 服务器支持多个插件同时连接，即每个打开的 Figma 文件一个连接。每个连接按 file key 跟踪，并拥有独立状态（选区、文档变化、控制台日志）。

**环境变量：**
- `FIGMA_WS_PORT` — 覆盖首选 WebSocket 端口（默认：9223）。如果首选端口被占用，服务器会从该端口开始在 10 个端口范围内回退。
- `FIGMA_WS_HOST` — 覆盖 WebSocket 服务器绑定地址（默认：`localhost`）。在 Docker 中运行时可设置为 `0.0.0.0`，以便宿主机访问 MCP 服务器。

**Cloud Mode：** 插件也支持 **Cloud Mode** 开关，用于与 Web AI 客户端（Claude.ai、v0、Replit、Lovable）配对。在插件 UI 中打开 "Cloud Mode"，输入 AI 助手给出的 6 位配对码，然后点击 Connect。详见 [Cloud Mode](#-cloud-modeweb-ai-客户端)。

**插件限制：** 在 Local Mode 下适用于 NPX 或 Local Git。在 Cloud Mode 下与远程 MCP endpoint 配对。未进行 Cloud Mode 配对的 Remote SSE 是只读模式。

---

## 🔀 多实例支持（v1.10.0）

Figma Console MCP 现在支持**多个实例同时运行**，非常适合同时跨多个项目工作、或同时使用 Claude Desktop Chat 和 Code 标签页的设计师与开发者。

### 问题（v1.10.0 之前）

当两个进程都尝试启动 MCP 服务器时（例如 Claude Desktop 的 Chat 标签页和 Code 标签页），第二个会因为两个进程竞争 9223 端口而以 `EADDRINUSE` 崩溃。

### 现在的工作方式

- 服务器先尝试端口 **9223**（默认）
- 如果该端口已被占用，会自动尝试 **9224**，然后 **9225**，以此类推直到 **9232**
- Figma 中的 Desktop Bridge 插件会同时连接到**所有**活跃服务器
- 每个服务器实例都会收到实时事件（选区变化、文档变化、控制台日志）
- `figma_get_status` 会显示当前端口，并列出其他活跃实例

### 对你意味着什么

| 场景 | v1.10.0 之前 | 现在 |
|------|--------------|------|
| 两个 Claude Desktop 标签页（Chat + Code） | 第二个标签页崩溃 | 两者独立工作 |
| 不同项目的多个 CLI 终端 | 只有一个能运行 | 全部可同时运行 |
| Claude Desktop + Claude Code CLI | 端口冲突 | 两者共存 |

### 需要做什么吗？

**不需要。** 多实例支持完全自动：
- 每个 MCP 服务器会占用范围内下一个可用端口
- Desktop Bridge 插件扫描所有端口并连接到每个活跃服务器
- 关闭标签页后遗留的进程会在启动时自动清理
- 无需手动管理端口，插件已经会扫描整个范围

（只有插件代码本身变化时才需要重新导入 manifest，例如包更新后。端口范围扫描已经包含在已发布插件中。）

---

## 🧩 MCP Apps（实验性）

Figma Console MCP 支持 **MCP Apps**：可直接在任何支持 [MCP Apps protocol extension](https://github.com/anthropics/anthropic-cookbook/tree/main/misc/model_context_protocol/ext-apps) 的 MCP 客户端中渲染的富交互 UI 体验。它基于官方 [`@modelcontextprotocol/ext-apps`](https://www.npmjs.com/package/@modelcontextprotocol/ext-apps) SDK 构建。

> **什么是 MCP Apps？** 传统 MCP 工具会向 AI 返回文本或图片。MCP Apps 更进一步，会在聊天中内联渲染交互式 HTML 界面，让用户能够直接浏览、过滤和交互数据，而不消耗 AI 上下文。

### Token Browser

一个交互式设计 Token 浏览器。

**用法：** 连接到 Figma 文件后，让 Claude "browse the design tokens" 或 "show me the design tokens"。

**功能：**
- 按集合组织浏览所有 Token，支持可展开分区
- 按类型（Colors、Numbers、Strings）过滤，并按名称/描述搜索
- 每个集合的模式列（Light、Dark、Custom）与 Figma Variables 面板匹配
- 颜色色块、别名解析，任意值可点击复制
- 通过 Desktop Bridge 在无需 Enterprise 套餐的情况下工作（local mode）

### Design System Dashboard

一个 Lighthouse 风格的健康评分卡，从六个维度审计你的设计系统。

**用法：** 连接到 Figma 文件后，让 Claude "audit the design system" 或 "show me design system health"。

**功能：**
- 总体加权分数（0-100）以及六个分类仪表：命名、Token、组件、无障碍、一致性、覆盖率
- 可展开分类区块，包含单项发现、严重程度标识和可操作详情
- 诊断位置可链接到具体变量、组件或集合
- Tooltip 解释每项检查的目的和评分标准
- Refresh 按钮可重新运行审计且不消耗 AI 上下文
- 纯评分引擎，无外部依赖，所有分析均本地运行

**启用 MCP Apps：**

上方安装配置已默认启用 MCP Apps（通过 `"ENABLE_MCP_APPS": "true"`）。如果你在 v1.10.0 之前配置过，且配置中没有它，请添加到 `env` 部分：

```json
"env": {
  "FIGMA_ACCESS_TOKEN": "figd_YOUR_TOKEN_HERE",
  "ENABLE_MCP_APPS": "true"
}
```

> **注意：** MCP Apps 需要支持 [ext-apps protocol](https://github.com/anthropics/anthropic-cookbook/tree/main/misc/model_context_protocol/ext-apps) 的 MCP 客户端（例如 Claude Desktop）。该功能仍处于实验阶段，协议可能继续演进。

### 未来 MCP Apps 路线图

计划中的 MCP Apps：

- **Component Gallery** — 可视化组件浏览器，用于搜索、预览组件并探索变体
- **Style Inspector** — 交互式面板，用于探索颜色、文本和效果样式并提供实时预览
- **Variable Diff Viewer** — 对比不同模式和分支中的 Token 值

该架构支持以很少样板代码添加新 app：每个 app 都是自包含模块，拥有自己的服务端工具注册和客户端 UI。

---

## 🚀 进阶主题

- **[安装指南](docs/SETUP.md)** - 所有 MCP 客户端的完整安装指南
- **[自托管](docs/SELF_HOSTING.md)** - 在 Cloudflare 上部署自己的实例
- **[架构](docs/ARCHITECTURE.md)** - 底层工作原理
- **[OAuth 设置](docs/OAUTH_SETUP.md)** - 为自托管部署配置 OAuth
- **[故障排查](docs/TROUBLESHOOTING.md)** - 常见问题与解决方案

---

## 🤝 与 Figma 官方 MCP 对比

**Figma Console MCP（本项目）** - 调试、数据提取和设计创建
- ✅ 来自 Figma 插件的实时控制台日志
- ✅ 截图捕获和可视化调试
- ✅ 错误堆栈和运行时监控
- ✅ 原始设计数据提取（JSON）
- ✅ FigJam 白板创建与读取（便签、流程图、表格）
- ✅ 可远程或本地运行

**Figma Official Dev Mode MCP** - 代码生成
- ✅ 从设计生成 React/HTML 代码
- ✅ Tailwind/CSS class 生成
- ✅ 组件样板脚手架

**可以同时使用两者**，获得完整工作流：用 Official MCP 生成代码，再用 Console MCP 调试和提取数据。

---

## 🛤️ 路线图

**当前状态：** v1.34.0（稳定版）- 生产可用。最新能力：双向 Token 同步 v2 + DTCG 2025.10。`figma_import_tokens` 现在会执行完整 diff 计划（创建缺失集合/变量、执行重命名、写入真实 `VARIABLE_ALIAS` 引用，并且仅在显式 `replace` 下删除），`figma_export_tokens` 可按需输出 DTCG 2025.10 方言（legacy 默认输出保持字节级一致），变量 scopes/codeSyntax 通过 `$extensions` 往返，`figma_setup_design_tokens` 支持通过 DTCG 大括号引用传入别名值，新的 `figma_create_component_set` 可一次调用从轴矩阵创建完整变体集。在 v1.33.x 基础上还包括：版本握手修复（仅当插件文件实际变化时显示重新导入提示）、安全依赖清理、v1.33.0 连接体验重构（基于真实连接状态的诚实状态标签、`/health` 自动发现和自愈重连）以及一次 33 项修复的全代码库审计（无损 DTCG 多模式往返、跨集合别名解析、所有 REST 工具中的 branch URL 正确性、缓存污染和 CSWSH 修复、bridge-first 截图）。此外还建立在 WCAG 准确无障碍审计、自愈 Desktop Bridge 连接、fill/stroke 原生变量绑定和写入工具中的排版控制、共享库检查、10 格式 Token 导出流水线、双向 Figma↔code Token 同步、版本历史与时间序列感知、FigJam + Slides 支持、Cloud Write Relay、Design System Kit、WebSocket-only 连接、智能多文件追踪、**107 个工具**（Local）/ **96 个工具**（Cloud）/ **9 个工具**（Remote 只读）、Comments API、跨 MCP 身份消歧以及 MCP Apps 之上。

**近期发布：**
- [x] **v1.34.0** - 双向 Token 同步 v2 + DTCG 2025.10。`figma_import_tokens` 现在会执行*完整* diff 计划：创建缺失集合和变量（带模式、推断/记录类型，并按依赖顺序设置值，别名第二遍处理），通过往返变量 ID 将 token-path 重命名归入更新阶段（避免在 `replace` 下 create+delete 永久破坏原变量），通过四级解析器把引用值写为真实 `{ type: "VARIABLE_ALIAS", id }` payload，并且删除严格受 `strategy: "replace"` 保护。`figma_export_tokens` 新增 `dtcgDialect: "2025"`（全精度 float 的对象形式颜色、对象尺寸），legacy 默认保持字节级一致；导入无条件支持两种方言，并进行方言无关的 diff 归一化。变量 `scopes` + `codeSyntax` 通过 `$extensions["figma-console-mcp"]` 往返。`figma_setup_design_tokens` 支持 DTCG 大括号引用（`"{color.blue.600}"`），并解析为真实别名，包括前向引用。新工具 `figma_create_component_set` 可从轴矩阵创建变体集（或合并现有组件），使用 `Prop=Value` 命名，可选自动排列网格，并在响应中返回 variant key，带随数量缩放的超时和失败回滚。**需要重新导入插件**（`code.js` + `ui.html` 改动，即 component-set handler 和 relay）。Token/write-tools 套件共 183 个测试。
- [x] **v1.33.2** - 版本握手误报修复。v1.33.0 握手会将插件上报版本与服务器*包*版本比较，因此服务器-only 发布（例如 v1.33.1 依赖清理）会把所有已更新插件误标为过期，并提示重新导入未变化的文件。现在服务器会与它随包提供的 `figma-desktop-bridge/code.js` 内嵌 `PLUGIN_VERSION` 比较，也就是重新导入真正会安装的版本；`PLUGIN_VERSION` 本身现在表示“插件文件最近一次变化的版本”（release 工具仅在 `figma-desktop-bridge/` 自上个 tag 后变化时提升它）。`figma_get_status` 新增 `transport.websocket.bundledPluginVersion`；`figma_diagnose` 会归因到正确版本。无新工具，**无需重新导入插件**（一次性例外：如果你在 v1.33.1 重新导入过，banner 会再出现一次，最后再导入一次即可清除）。1245 个测试通过（新增 9 个）。
- [x] **v1.33.1** - 安全依赖清理。通过范围内升级解决所有 runtime 和 critical npm audit 警报（`ws` 8.21.0、`hono` 4.12.27、`undici` 7.28.0、`handlebars` 4.7.9，后者是唯一 critical 且仅 dev 使用，另有 `lodash`、`path-to-regexp`、`basic-ftp`、`fast-uri`、`vite`）。`wrangler` 有意保持在 4.72.0，因为更新版本需要 Node >=22；唯一剩余 audit 发现位于 wrangler/miniflare 的开发期工具链，不会进入 npm 包或 Worker bundle。取代 dependabot PR #81/#82/#84。无代码变化、无 API 变化、无需重新导入插件。1236 个测试不变通过。
- [x] **v1.33.0** - 连接体验重构 + 全代码库审计。插件状态标签现在基于真实连接状态，而不是 Figma 变量加载状态（过去可能在零 MCP 服务器连接时也显示绿色）；HTTP `/health` 自动发现会自动重连重启后的服务器（包括一个死连接夹在活连接中间、过去会永久卡死的情况）；版本握手会在需要重新导入插件时在 UI 中展示 banner，并在 `figma_get_status`/`figma_diagnose` 中暴露不匹配；cloud pairing 配置会在插件重开后保留，状态行派生且有标签（不再出现绿色状态下却显示 "Disconnected"）；所有插件文案使用设计师可读语言。审计修复 33 个已验证问题：无损 DTCG 多模式往返、set-qualified 跨集合别名、TIMING/EASING 映射到 DTCG `duration`/`cubicBezier`、两个缓存污染 bug（“search returns 0 components” 报告）、CSWSH origin 绕过（`startsWith` → 精确匹配）、睡眠后 reaper kill-safety（另有 shell-free `/health` probe，使用 `os.devNull` 避免 Windows curl 误判健康 sibling）、REST 工具 branch URL 正确性，以及 bridge-first `figma_take_screenshot`。`figma_arrange_component_set` 现在会就地重排变体，因此已放置实例可保留。无新工具；**需要重新导入插件**（`code.js` + `ui.html` 变化，新握手也让这是最后一次需要你自己发现的重新导入）。1236 个测试通过（新增 33 个）。
- [x] **v1.32.1** - 修复 Robin Di Capua 报告的文档生成器问题：`figma_generate_component_doc` 即使 fill/stroke 绑定变量，也会把**颜色**记录为原始 hex（Figma Variable 列显示 `—`），而 spacing token 正常。两个根因分别是 id→name lookup 读取了错误键（`.id`/`.name` 而不是 `variableId`/`variableName`），以及变量名只从 Enterprise-only REST `/variables/local` endpoint 获取（其他套餐 403）。现在生成器通过 Desktop Bridge Plugin API 解析名称（所有套餐可用），并将其贯穿 States、Color Tokens、Spacing 表，因此会显示 `color/content/default` 和 `spacing/1` 等真实 token 名。无新工具、无参数形状变化、无需重新导入插件。1203 个测试通过。
- [x] **v1.32.0** - Isabella（a11y collaborator）报告的无障碍审计准确性修复：`figma_lint_design` 曾将低于 1.5 倍的行高标记为数百个组件的无障碍失败。这误读了 **WCAG 1.4.12 Text Spacing**，它要求内容支持用户覆盖间距且不丢失内容，而不是要求设计出厂即为 1.5 倍，因此低于 1.5 的行高不是符合性失败。行/段间距检查现在只针对多行文本（单行标签和按钮豁免）；可读性提示（`text-size`、`line-height`、`letter-spacing`、`paragraph-spacing`）从 `wcag` 组解耦为可选 `best-practice` 组，因此默认审计（`['wcag','design-system','layout']`）和 `rules: ['wcag']` 只返回真正的符合性问题；新的代码侧 `text-spacing-support` 建议会在 `figma_scan_code_accessibility` 中标记固定 px 排版，这才是 1.4.12/1.4.4 可验证之处。无新工具、无参数形状变化；**需要重新导入插件**以获得新的审计行为（bridge 协议未变，未更新插件仍兼容）。1196 个测试通过。
- [x] **v1.31.0** - 修复最常被报告的可靠性问题：Desktop Bridge 连接断开后，直到关闭插件、重启 MCP 客户端或手动杀端口之前都无法恢复。根因是**僵尸 MCP 服务器进程**在异常关闭后占住 WebSocket 端口范围（9223-9232）。reaper 现在会从 `SIGTERM` 升级到 `SIGKILL`（忽略优雅关闭的挂起服务器无法存活），每 5 分钟通过 `unref` 周期 reaper 清扫范围，并用 shutdown backstop 防止服务器从一开始就变僵尸。重新设计的 Desktop Bridge 插件新增自动重连 watchdog（断开时约每 12 秒重新探测）、上下文感知的 **Pause / Resume / Reconnect** 按钮，以及实时 server-count badge。无新工具；**需要重新导入插件**（bridge `ui.html` + `code.js` 变化）。1190 个测试通过，包括一个会生成真实忽略 `SIGTERM` 进程并断言 reaper 将其杀掉的集成测试。
- [x] **v1.30.0** - 结构化写入工具新增原生变量绑定和排版能力，补齐过去必须使用 raw `figma_execute` 的 Plugin API 缺口。`figma_set_fills` / `figma_set_strokes` 接受 `variableId`，可通过 `setBoundVariableForPaint` 将 fill/stroke 绑定到颜色变量（任意套餐，通过 bridge）。`figma_set_text` 新增 `fontFamily` / `fontStyle`，支持空格不敏感归一化（`SemiBold` → `Semi Bold`）和优雅 `Regular` fallback。`figma_instantiate_component` 会在应用 override 前预加载 instance 文本字体（修复非 Regular 权重文本 override 静默跳过），并返回 `warnings` 数组说明失败 override。同时修复 `figma_set_text` 的混合字体崩溃，以及 `ui.html` relay 丢失新 message 字段的问题。无新工具；**需要重新导入插件**（bridge `ui.html` + `code.js` 变化）。已 live 验证；1185 个测试通过。
- [x] **v1.29.2** - Bug 修复：`figma_generate_component_doc` 现在会可靠地渲染 Figma 组件描述，并标注 atomic-design 层级。描述中的单个 `#` 标题会渲染为真实章节（Usage Guidelines、Implementation Considerations、Accessibility Requirements、Content Configuration），而不是泄漏成 `- # Heading` 列表项；frontmatter `description` 取第一句，而不是在 "Accessibility" 一词处截断；生成的 Figma URL 不再重复 `?node-id=`；组件 atomic level（atom/molecule/organism/template）会通过一次 `ids=<node>` 文件请求 + divider walk-back 自动检测，无需依赖库发布。无新工具；无需重新导入插件。
- [x] **v1.29.1** - Bug 修复：`figma_get_design_system_kit` 现在 bridge-first 解析变量（Desktop Bridge / cloud relay → REST fallback），不再直接调用 Enterprise-only Variables REST API。非 Enterprise 用户在 bridge 已连接时不再在 kit 的 token 部分遇到 403，REST 403 现在会提示调用方回到 bridge，而不是卡死。新增 7 个测试，总计 1185 个通过。无新工具；无需重新导入插件。
- [x] **v1.29.0** - 共享库检查：三个新工具补上“我有组件 key”到“我真的能使用它”的空白。`figma_get_library_component_by_key` 可将任意 40 字符 component key 解析为完整 `componentPropertyDefinitions` + 变体（含 published key）+ 每个变体的视觉规格，无需源库文件 URL。`figma_get_library_variables` 通过 Plugin API 列出库 Token（任意 Figma 套餐可用；REST 版本仅 Enterprise）。`figma_import_library_variable` 将库 Token 导入当前文件，以便绑定到节点。新增 27 个测试，总计 1178 个通过。重新导入插件可选。
- [x] **v1.28.1** - v1.28.0 formatter 在多层 semantic-token 设计系统中的实战测试修补。修复：Tailwind v3 对 alias-only set 输出空 `module.exports`（现在会解析别名链到字面值）；TypeScript module + JSON flat + JSON nested formatter 把 `"{alias.path}"` 字符串当字面值输出（现在会解析）；Tailwind v4 namespace-prefix 重复（`--color-theme-color-X` 现在为 `--color-theme-X`）。新增公开 helper `resolveAliasChain`。1151 个测试继续通过。
- [x] **v1.28.0** - `figma_export_tokens` formatter 全覆盖。新增 7 种输出格式：Tailwind v4 `@theme inline`、Tailwind v3 config、SCSS variables、TypeScript module、JSON flat/nested、Style Dictionary v3、Tokens Studio multi-file。加上 DTCG + CSS variables，共提供 **10 种完整实现的输出格式**，无需第三方构建工具依赖。工具描述更新，docs/tools.md 表格全绿。新增 22 个 Jest 测试，总计 1151 个通过。
- [x] **v1.27.1** - 文档补丁。无代码行为变化。在 CSS variables formatter 和 apply phase 于 v1.27.0 开发周期发布后，清理工具描述、错误信息和内部注释中陈旧的“Phase 1 仅发布 DTCG”说法。刷新 README banner + 能力 bullet + roadmap。在 release runbook 中新增 `Phase 3.5: Stale-Content Audit`，确保未来发布会严格 grep banner、工具描述、错误信息、源码注释和工具数量一致性。
- [x] **v1.27.0** - 双向 token 同步：`figma_export_tokens` + `figma_import_tokens` 替代 Style Dictionary 和 Tokens Studio 的导出流水线。标准 DTCG JSON + CSS custom properties。与现有文件 diff-aware merge，并通过 `$extensions["figma-console-mcp"]` 保留往返 ID。Apply phase 通过 plugin bridge 将 hex-value 修改写回 Figma。已用 713-token + 280-token 设计系统端到端验证。
- [x] **v1.26.0** - 内部清理 + 跨 MCP 身份标识：Local-mode CDP/Puppeteer transport 完全移除（WebSocket-only）。新增 `figma_diagnose` 工具，提供设计师可读的健康检查。每个响应都标记 `_mcp: "figma-console-mcp"`；错误前缀为 `[figma-console-mcp]`，便于运行多个 Figma MCP 时明确归因。插件状态标签现在显示 `Local · ready` / `Cloud · ready` / `Local + Cloud · ready`。净差异：-7,299 行，重新导入插件可选。
- [x] **v1.25.0** - `figma_diff_versions` 通过插件 session buffer 跟踪描述和 Dev Mode annotation。会话中编辑的描述和 annotation 现在会出现在 diff 输出中（REST API 不返回这些内容，由插件的 `documentchange` listener 桥接）。
- [x] **v1.24.0** - 版本 diff 范围覆盖更诚实。`scope_coverage` 对象会呈现 `figma_diff_versions` 会追踪什么、不追踪什么；常驻覆盖警告避免 token-value 变化和组件 instance 放置的静默不可见。
- [x] **v1.23.0** - 版本历史与时间序列感知：6 个新工具（列出版本、获取任意历史版本快照、比较两个版本的组件/绑定差异、生成 Markdown 更新日志、通过二分 blame walker 追踪属性/变体引入）。作者归因来自 autosave，而不仅是带标签发布。
- [x] **v1.17.0** - Figma Slides 支持：15 个演示文稿管理工具。
- [x] **v1.16.0** - FigJam 支持：9 个创建和读取 FigJam 白板的工具。
- [x] **v1.12.0** - Cloud Write Relay：Web AI 客户端无需 Node.js 即可创建和修改 Figma 设计。
- [x] **v1.11.0** - 完全移除 CDP，改进带焦点检测的多文件 active tracking。
- [x] **v1.10.0** - 多实例支持（动态端口回退 9223-9232、多连接插件、实例发现）。
- [x] **v1.9.0** - Figma Comments 工具，改进端口冲突检测。
- [x] **v1.8.0** - WebSocket Bridge transport（无 CDP 连接），实时选区/文档追踪。
- [x] **v1.7.0** - MCP Apps（Token Browser、Design System Dashboard）、批量变量操作、设计-代码一致性工具。

**接下来：**
- [ ] **Token sync - 非 DTCG 输入解析器** - 为非 DTCG 输入（Tokens Studio、CSS vars、Tailwind v4、Tailwind v3 config、SCSS、Style Dictionary v3、JSON flat/nested）添加解析器，使 `figma_import_tokens` 能摄入与导出相同的格式。（导入侧 apply 扩展，包括创建、replace-gated 删除、alias-target 更新，已在 v1.34.0 发布。）
- [ ] **跨库变量解析** - 通过 `getVariableByIdAsync` 解析跨库别名，让它们在导出中渲染为真实 `var(--target)` 引用，而不是注释。
- [ ] **组件模板库** - 常见 UI pattern 生成
- [ ] **视觉回归测试** - 截图 diff 能力

**📖 [完整路线图](docs/ROADMAP.md)**

---

## 💻 开发

```bash
git clone https://github.com/southleft/figma-console-mcp.git
cd figma-console-mcp
npm install

# Local mode development
npm run dev:local

# Cloud mode development
npm run dev

# Build
npm run build
```

**📖 [开发指南](docs/ARCHITECTURE.md)**

---

## 📄 License

MIT - 详见 [LICENSE](LICENSE) 文件。

---

## 🔗 链接

- 📚 **[文档站点](https://docs.figma-console-mcp.southleft.com)** — 完整指南、教程和 API 参考
- 📖 [本地文档](docs/) — 文档源文件
- 🐛 [报告问题](https://github.com/southleft/figma-console-mcp/issues)
- 💬 [讨论](https://github.com/southleft/figma-console-mcp/discussions)
- 🌐 [Model Context Protocol](https://modelcontextprotocol.io/)
- 🎨 [Figma API](https://www.figma.com/developers/api)
