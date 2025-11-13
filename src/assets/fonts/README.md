# 苹果字体文件说明

## 当前状态

✅ **已配置完成！** 当前使用 `SF-Pro.ttf` 文件，所有设备都能显示苹果字体。

字体配置已自动应用到项目中，包括：
- SF Pro（基础字体）
- SF Pro Display（大标题）
- SF Pro Text（正文）
- 系统字体回退链

## 字体文件格式

当前使用 **TTF 格式**，现代浏览器都支持。如果需要优化加载速度，可以转换为 WOFF2 格式（体积更小）。

## 可选：添加更多字重

如果你有更多字重的字体文件（Medium、Semibold、Bold 等），可以放置在此目录中，并更新 `fonts.scss` 配置。

### 需要的字体文件（可选）

### SF Pro Display（用于大标题，20px+）
- `SF-Pro-Display-Regular.woff2` 和 `SF-Pro-Display-Regular.woff`
- `SF-Pro-Display-Medium.woff2` 和 `SF-Pro-Display-Medium.woff`
- `SF-Pro-Display-Semibold.woff2` 和 `SF-Pro-Display-Semibold.woff`
- `SF-Pro-Display-Bold.woff2` 和 `SF-Pro-Display-Bold.woff`

### SF Pro Text（用于正文，12-19px）
- `SF-Pro-Text-Regular.woff2` 和 `SF-Pro-Text-Regular.woff`
- `SF-Pro-Text-Medium.woff2` 和 `SF-Pro-Text-Medium.woff`
- `SF-Pro-Text-Semibold.woff2` 和 `SF-Pro-Text-Semibold.woff`
- `SF-Pro-Text-Bold.woff2` 和 `SF-Pro-Text-Bold.woff`

### SF Mono（用于代码）
- `SF-Mono-Regular.woff2` 和 `SF-Mono-Regular.woff`
- `SF-Mono-Medium.woff2` 和 `SF-Mono-Medium.woff`
- `SF-Mono-Semibold.woff2` 和 `SF-Mono-Semibold.woff`
- `SF-Mono-Bold.woff2` 和 `SF-Mono-Bold.woff`

## 如何获取字体文件

### 方法 1：从 Apple Developer 下载（推荐）

1. 访问 [Apple Developer Downloads](https://developer.apple.com/download/all/)
2. 登录你的 Apple Developer 账户（免费注册）
3. 搜索 "SF Pro" 或 "SF Mono"
4. 下载字体包（通常是 .dmg 或 .zip 文件）
5. 解压后找到字体文件（通常是 .otf 或 .ttf 格式）

### 方法 2：从 macOS 系统提取

如果你使用的是 macOS，字体文件位于：
- `/System/Library/Fonts/Supplemental/SF-Pro-Display-*.otf`
- `/System/Library/Fonts/Supplemental/SF-Pro-Text-*.otf`
- `/System/Library/Fonts/SF-Mono-*.otf`

### 方法 3：使用在线转换工具

1. 获取 .otf 或 .ttf 格式的字体文件
2. 使用在线工具转换为 .woff2 和 .woff 格式：
   - [CloudConvert](https://cloudconvert.com/)
   - [Font Squirrel Webfont Generator](https://www.fontsquirrel.com/tools/webfont-generator)

## 字体格式说明

- **woff2**：现代浏览器优先使用，压缩率更高
- **woff**：作为回退格式，兼容旧浏览器

## 注意事项

1. 确保字体文件命名与 `fonts.scss` 中的路径完全一致
2. 如果缺少某些字重，浏览器会使用最接近的可用字重
3. 字体文件较大，建议使用 CDN 或启用压缩以提高加载速度

