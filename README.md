# Minimal-Web-Viewer

一个基于 Electron 构建的极简无边框 Web 页面悬浮置顶查看器。本项目移除了所有传统的浏览器交互 UI，专注于提供纯净、无干扰的单页面轻量级渲染窗口，并提供了基于系统全局快捷键的透明度动态微调功能。

> **Acknowledgments:** > 本项目的核心架构设计、Chromium 内核私有协议拦截逻辑、窗口状态持久化记忆以及全局快捷键动态响应，均由 **Gemini** 提供核心底层技术支持与代码重构。

---

## 🛠️ 功能特性

* **无边框纯净视窗 (Frameless & Bare)**：移除标题栏、地址栏及边框限制，实现全窗体 100% 内容呈现，最大程度减少视觉干扰。
* **协议级静默拦截 (Protocol Sandboxing)**：在内核层将特定私有协议请求（如部分站点唤起本地客户端的自定义 schema 请求）进行接管并返回 204 状态，彻底杜绝外部弹窗导致的焦点抢占与控制台闪烁。
* **智能焦点感知 (Focus-Based Opacity)**：
    * 窗口失去焦点时自动转换为完全透明状态，并激活鼠标事件穿透（Ignore Mouse Events），确保不妨碍下层桌面的常规操作。
    * 触发唤醒快捷键后，窗口瞬间聚焦并恢复原设定透明度。
* **双模态触控热区 (Hot-Zone Interaction)**：
    * 窗口顶部 10% 高度的左侧区域被定义为窗体拖拽感知区（`-webkit-app-region: drag`），方便快速调整窗口位置。
    * 右侧及下方区域对鼠标事件完全开放，确保与内嵌网页的交互无缝衔接。
* **全局快捷键微调 (Global Shortcut Regulators)**：支持在系统任意层级使用快捷键进行透明度梯级调整（5% 步长），方便适应不同的屏幕背景亮度。
* **状态持久化记忆 (State Persistence)**：在窗体尺寸调整、位置移动或遭遇紧急销毁信号时，系统会自动在本地安全路径保存当前的 `x, y, width, height` 几何参数，下次启动时自动恢复。

---

## 📦 本地开发与构建指南

### 1. 准备核心文件
确保你的项目根目录下包含以下 4 个文件：
* `package.json`（定义项目依赖与构建脚本）
* `main.js`（主进程业务逻辑）
* `index.html`（视图容器与热区划分）
* `preload.js`（沙盒预加载拦截脚本）

### 2. 构建命令
打开终端（CMD 或 PowerShell），切换至项目根目录，依次运行以下命令：

```bash
# 1. 切换至国内阿里镜像源（防止底层依赖下载超时）
npm config set electron_builder_binaries_mirror [https://npmmirror.com/mirrors/electron-builder-binaries/](https://npmmirror.com/mirrors/electron-builder-binaries/)
npm config set registry [https://registry.npmmirror.com](https://registry.npmmirror.com)

# 2. 安装基础依赖
npm install

# 3. 安装开发环境打包依赖
npm install electron-builder --save-dev

# 4. 执行编译构建
npm run build
