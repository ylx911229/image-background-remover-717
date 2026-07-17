# Image Background Remover MVP 需求文档

| 项目 | 内容 |
|---|---|
| 产品名称 | Image Background Remover（暂定） |
| 文档类型 | MVP 产品需求文档（PRD） |
| 文档版本 | v1.0 |
| 文档日期 | 2026-07-17 |
| 产品形态 | Web 工具站 |
| 目标市场 | 英文用户优先，兼顾全球访问 |
| 部署平台 | Cloudflare Workers + Static Assets |
| 背景移除服务 | Remove.bg API |
| 图片存储 | 不持久化存储，仅在请求期间流转 |

## 1. 项目背景

用户在制作商品图、头像、Logo、演示材料和社交媒体素材时，经常需要快速移除图片背景。现有工具普遍存在注册门槛、操作复杂、广告干扰、下载限制不透明等问题。

本项目计划围绕关键词 **image background remover** 建设一个简单、快速、无需注册的在线工具。MVP 阶段以验证核心链路为目标：用户是否愿意上传图片、是否认可处理效果、是否完成结果下载。

## 2. 产品目标

### 2.1 MVP 目标

1. 用户无需注册即可完成一次完整的背景移除操作。
2. 从选择图片到展示结果，正常情况下在可接受时间内完成。
3. 用户可以清晰对比原图和处理结果，并下载透明背景 PNG。
4. 网站不持久化存储用户图片。
5. Remove.bg API Key 不暴露给浏览器或公开仓库。
6. 首页具备搜索引擎收录所需的基础内容和元数据。

### 2.2 核心验证指标

MVP 上线后重点关注以下漏斗：

```text
访问首页 → 选择图片 → 上传成功 → 处理成功 → 下载结果
```

建议指标：

| 指标 | 定义 | MVP 参考目标 |
|---|---|---:|
| 上传启动率 | 选择图片用户数 / 首页访问用户数 | ≥ 20% |
| 处理成功率 | 成功返回结果数 / 有效处理请求数 | ≥ 95% |
| 下载转化率 | 下载结果用户数 / 处理成功用户数 | ≥ 60% |
| 重试率 | 再次处理用户数 / 处理成功用户数 | 观察项 |
| P75 处理耗时 | 从提交到结果可见的耗时 | ≤ 12 秒 |
| API 异常率 | Remove.bg 或代理异常请求数 / 总请求数 | ≤ 3% |

以上数值为首版参考线，应根据真实流量和图片类型调整。

## 3. 目标用户与场景

### 3.1 目标用户

- 小型电商卖家：制作白底或透明背景商品图。
- 内容创作者：制作封面、缩略图和社交媒体素材。
- 普通办公用户：处理演示文稿、文档和头像图片。
- 设计非专业用户：希望通过一步操作获得透明 PNG。

### 3.2 典型使用场景

1. 用户上传一张商品照片，获取透明背景 PNG。
2. 用户上传人物照片，用于制作头像或海报。
3. 用户上传 Logo，去除纯色背景后用于网页或演示文稿。
4. 用户在手机中选择照片，完成处理并保存结果。

## 4. 产品原则

- **单一任务优先**：首页核心只服务“上传、处理、下载”。
- **无需注册**：MVP 不设置登录和账户体系。
- **结果先行**：减少表单、弹窗和与任务无关的干扰。
- **隐私透明**：明确说明图片会传输给第三方处理服务，但本站不持久化保存。
- **移动端优先可用**：上传、预览、下载在手机上均可完成。
- **成本可控**：所有公开处理接口必须具备防滥用能力。

## 5. MVP 范围

### 5.1 本期包含

- 英文首页及核心 SEO 内容。
- 点击、拖拽和移动端相册选择上传。
- JPG、PNG 图片校验。
- Remove.bg 自动移除背景。
- 上传及处理状态反馈。
- 原图与结果图对比。
- 棋盘格透明背景展示。
- 透明 PNG 下载。
- 重新上传及重新处理。
- 用户可理解的错误提示。
- Cloudflare Turnstile 人机验证。
- 接口限流、来源校验和 API Key 保护。
- 基础产品埋点和错误监控，不采集图片内容。
- 隐私政策、服务条款入口。

### 5.2 本期不包含

- 用户注册、登录和个人中心。
- 付费、订阅、积分或处理额度账户。
- 批量上传和 ZIP 下载。
- 图片历史记录和云端素材库。
- R2、KV、D1 等图片持久化存储。
- 手动涂抹、擦除或恢复边缘。
- AI 换背景、生成背景或模板编辑器。
- 自定义背景颜色和背景图片。
- 视频、GIF、PDF 或 HEIC 处理。
- 对外开放 API。
- 多语言页面。
- 原生 App 或浏览器插件。

## 6. 信息架构

### 6.1 MVP 页面

| 页面 | 路径建议 | 目的 |
|---|---|---|
| 首页/工具页 | `/` | 完成上传、处理和下载 |
| 隐私政策 | `/privacy` | 说明数据流转和第三方服务 |
| 服务条款 | `/terms` | 说明使用限制和责任边界 |
| 404 页面 | 任意无效路径 | 引导返回首页 |

### 6.2 首页模块顺序

1. 顶部导航与品牌标识。
2. H1、简短价值主张和上传区域。
3. 上传后的处理区或结果区。
4. 三步使用说明。
5. 适用场景。
6. 产品优势与隐私说明。
7. 常见问题 FAQ。
8. 页脚、隐私政策和服务条款。

移动端首屏必须直接看到标题、价值主张和上传按钮。

## 7. 核心用户流程

### 7.1 主流程

1. 用户进入首页。
2. 用户点击上传区域、拖入文件或在移动端选择照片。
3. 前端检查格式和文件大小。
4. 前端显示本地原图预览。
5. 用户发起背景移除，前端先获取有效的 Turnstile Token。
6. 前端将图片提交到 `/api/remove-background`。
7. Cloudflare Worker 校验请求并流式转发给 Remove.bg。
8. Remove.bg 返回透明 PNG。
9. Worker 将响应流转发给浏览器。
10. 页面展示原图与结果图对比。
11. 用户点击下载，浏览器保存 PNG。
12. 用户可以选择另一张图片重新开始。

### 7.2 异常流程

- 格式不支持：上传前拦截并提示仅支持 JPG、JPEG、PNG。
- 文件过大：上传前拦截并提示文件最大 22MB。
- 图片无有效前景：展示可操作建议，并允许换图。
- Turnstile 校验失败：提示刷新验证后重试。
- 达到限流：提示稍后重试，不暴露具体安全规则。
- Remove.bg 额度不足：展示“服务暂时不可用”，同时记录服务端告警。
- 网络中断：保留原图预览，提供重试按钮。
- 返回内容异常：不触发自动下载，显示通用错误并记录错误码。

## 8. 功能需求

### FR-01 图片选择

**描述：** 用户可以通过文件选择器、拖拽或移动端相册选择一张图片。

**要求：**

- 默认接受 `.jpg`、`.jpeg`、`.png`。
- 每次只接受一张图片。
- 选择新图片后替换旧图片和旧结果。
- 文件选择控件需支持键盘操作。
- 不将图片写入 localStorage、sessionStorage 或 IndexedDB。

### FR-02 客户端校验

**描述：** 图片提交前完成基础校验。

**要求：**

- 文件大小不得超过 22MB。
- 同时校验文件扩展名、浏览器提供的 MIME 类型。
- 前端错误提示应说明原因和解决方法。
- 客户端校验只用于改善体验，服务端必须重复执行安全校验。

### FR-03 原图预览

**描述：** 用户选择有效图片后立即看到预览。

**要求：**

- 使用 `URL.createObjectURL()` 生成本地预览。
- 不把图片转换成 Base64 写入页面状态或日志。
- 更换图片或组件销毁时调用 `URL.revokeObjectURL()`。
- 保持图片宽高比，不拉伸图片。

### FR-04 背景移除

**描述：** 通过站内接口调用 Remove.bg 完成处理。

**要求：**

- 前端只能请求本站 `/api/remove-background`。
- 浏览器不得获得 Remove.bg API Key。
- 默认输出透明背景 PNG。
- 单次请求仅处理一张图片。
- 页面需要提供处理中状态，避免重复提交。

### FR-05 处理状态

**描述：** 页面应清晰反馈处理进度。

**状态至少包括：**

- 等待选择图片。
- 图片已选择。
- 正在验证。
- 正在移除背景。
- 处理成功。
- 处理失败。

若无法获得 Remove.bg 的真实处理百分比，应使用不确定进度动画，不显示伪造百分比。

### FR-06 结果展示

**描述：** 用户可以直观看到背景已被移除。

**要求：**

- 透明区域使用棋盘格背景表示。
- 提供原图与结果图的前后对比组件。
- 结果图加载完成前不展示下载按钮的可用状态。
- 图片较大时按容器缩放显示，不改变下载文件分辨率。

### FR-07 PNG 下载

**描述：** 用户可以下载 Remove.bg 返回的结果。

**要求：**

- 下载格式为 PNG。
- 文件名建议为 `{原文件名}-no-background.png`。
- 下载直接使用浏览器内存中的响应 Blob。
- 下载不经过二次上传或服务器存储。
- 点击下载时记录不含图片信息的匿名事件。

### FR-08 重新处理

**描述：** 用户可以快速处理另一张图片。

**要求：**

- 提供“Upload another image”操作。
- 清理旧原图和结果图的 Object URL。
- 清空旧错误和处理状态。
- 不自动再次消耗 API 调用。

### FR-09 错误反馈

**描述：** 将技术错误转换成用户可理解的信息。

**要求：**

- 不向前端返回 Remove.bg API Key、内部堆栈或完整供应商响应。
- 区分格式错误、文件过大、限流、验证失败、网络失败和服务不可用。
- 可恢复错误提供重试或换图操作。
- 服务端日志记录请求 ID、状态码、耗时和错误类别，不记录图片或请求体。

### FR-10 基础内容与 FAQ

**描述：** 首页提供支持用户决策和 SEO 的静态内容。

**FAQ 至少回答：**

- How do I remove the background from an image?
- Is this background remover free?
- What image formats are supported?
- What is the maximum image size?
- Are uploaded images stored?
- Why did background removal fail?

内容必须准确说明图片会通过 Cloudflare Worker 传输给 Remove.bg，不能宣称“图片从不离开设备”。

## 9. 接口需求

### 9.1 接口定义

```text
POST /api/remove-background
Content-Type: multipart/form-data
```

请求字段建议：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| `image_file` | File | 是 | JPG 或 PNG，最大 22MB |
| `size` | String | 否 | MVP 固定或默认为 `auto` |

请求头：

| 字段 | 必填 | 说明 |
|---|---:|---|
| `X-Turnstile-Token` | 是 | Cloudflare Turnstile Token，Worker 在转发图片流前完成校验 |

### 9.2 成功响应

- HTTP 状态码：`200`
- `Content-Type: image/png`
- `Cache-Control: no-store`
- Body：透明 PNG 流

### 9.3 失败响应

错误响应统一为 JSON：

```json
{
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "Please upload an image smaller than 22 MB.",
    "requestId": "opaque-request-id"
  }
}
```

建议错误码：

| HTTP 状态 | 业务错误码 | 场景 |
|---:|---|---|
| 400 | `INVALID_REQUEST` | 请求结构不正确 |
| 400 | `INVALID_FILE_TYPE` | 文件格式不支持 |
| 400 | `INVALID_IMAGE` | 图片无法解析或无有效前景 |
| 413 | `FILE_TOO_LARGE` | 文件超过 22MB |
| 429 | `RATE_LIMITED` | 请求过于频繁 |
| 502 | `UPSTREAM_ERROR` | Remove.bg 返回异常 |
| 503 | `SERVICE_UNAVAILABLE` | 额度不足或服务暂不可用 |
| 504 | `UPSTREAM_TIMEOUT` | 上游处理超时 |

### 9.4 流式传输约束

- Worker 不应调用 `request.arrayBuffer()` 读取整张图片。
- 在可行的接口设计下，不应调用 `request.formData()` 后重新构造完整文件。
- 请求体尽可能直接以 `ReadableStream` 转发给 Remove.bg。
- Remove.bg 响应体直接作为流返回浏览器。
- 不对图片响应进行 Cloudflare Cache 缓存。
- 不在日志、错误追踪或分析平台中记录请求体。

> Turnstile Token 不放入 multipart 正文，避免 Worker 为提取 Token 而解析完整表单。Worker 从请求头读取并验证 Token，通过后再流式转发图片正文。

## 10. 技术架构

### 10.1 前端

- React + TypeScript + Vite。
- Tailwind CSS 或同类原子化样式方案。
- 静态页面通过 Cloudflare Static Assets 分发。
- 原图和结果图使用浏览器 Blob/Object URL 管理。
- SEO 核心内容需要出现在初始 HTML 中，不能完全依赖客户端异步渲染。

### 10.2 服务端

- Cloudflare Worker 提供 `/api/*`。
- Worker 仅负责验证、限流、注入密钥、代理请求和转换错误。
- Remove.bg API Key 使用 Cloudflare Secret：`REMOVE_BG_API_KEY`。
- Turnstile Secret 使用 Cloudflare Secret：`TURNSTILE_SECRET_KEY`。
- 不配置 R2、KV、D1 作为图片存储。

### 10.3 数据流

```text
用户设备内存
  → Cloudflare Worker 请求流
  → Remove.bg API
  → Cloudflare Worker 响应流
  → 用户设备内存
```

本站不主动将图片持久化，但图片会被发送至 Remove.bg；第三方如何处理数据应以其服务协议和隐私政策为准。

## 11. 安全与防滥用

### 11.1 必须实现

- Remove.bg API Key 仅存放于 Cloudflare Secret。
- `.dev.vars`、`.env` 和本地密钥文件加入 `.gitignore`。
- Turnstile 服务端验证。
- 对处理接口启用 IP/边缘限流。
- 校验请求 `Origin`，但不把它作为唯一安全措施。
- 限制请求方法、Content-Type、文件类型和文件大小。
- 设置合理的上游超时。
- 错误响应脱敏。
- API 响应使用 `Cache-Control: no-store`。
- 页面设置合理的 CSP、`X-Content-Type-Options: nosniff` 和 Referrer Policy。

### 11.2 推荐限流初始值

- 单 IP：每分钟最多 3 次处理请求。
- 短时间连续失败触发更严格限制。
- 达到供应商额度阈值时关闭新请求并告警。

具体阈值在灰度期间根据误伤率和 API 成本调整。

## 12. 隐私要求

### 12.1 数据处理说明

- 本站不将上传图片写入持久化存储。
- 图片仅在完成单次请求所需的时间内传输。
- 图片会被发送给 Remove.bg 进行背景移除。
- 前端不使用 localStorage、IndexedDB 保存图片。
- 日志、分析和错误监控不得包含图片、文件内容或完整请求体。
- 可记录匿名事件、请求 ID、文件大小区间、处理耗时、状态码和错误类别。

### 12.2 建议用户文案

> We do not persistently store your uploaded images. Images are transmitted to our background-removal provider only for processing and are not written to our storage systems.

隐私政策需单独列明 Remove.bg 为第三方数据处理服务，并链接其隐私政策。

## 13. SEO 需求

### 13.1 首页建议元数据

- Title：`Free Image Background Remover – Remove Background Online`
- Meta Description：控制在搜索结果适合的长度内，包含免费、在线、透明 PNG 等核心价值。
- H1：`Free Image Background Remover`
- Canonical：指向正式首页域名。
- Open Graph 和 Twitter Card：使用不含用户数据的固定分享图。

### 13.2 技术 SEO

- 生成 `sitemap.xml` 和 `robots.txt`。
- 首页、隐私政策和服务条款返回可索引静态 HTML。
- 添加 FAQPage 结构化数据；页面可见 FAQ 必须与结构化数据一致。
- 图片示例提供描述性 alt 文本。
- 避免大体积首屏 JavaScript 和布局偏移。
- 正确设置 404 状态，不将所有无效 URL 都返回可索引的首页。

### 13.3 MVP 后再考虑的页面

- `/product-background-remover`
- `/transparent-background-maker`
- `/remove-background-from-logo`
- `/white-background-maker`

这些页面不属于本期验收范围，后续应提供真实差异化功能或内容，避免生成近似的低价值页面。

## 14. 可访问性与兼容性

- 核心流程满足键盘操作。
- 上传区域具有按钮语义和清晰焦点状态。
- 状态变化通过 `aria-live` 向辅助技术播报。
- 文本和按钮颜色对比度满足 WCAG AA 基本要求。
- 不仅依赖颜色表达成功或失败。
- 支持最近两个主要版本的 Chrome、Safari、Firefox 和 Edge。
- 支持常见 iOS Safari 和 Android Chrome。
- 在 320px 宽度下不出现影响主流程的横向滚动。

## 15. 性能与可靠性

- 静态资源由 Cloudflare 边缘缓存。
- 用户图片和处理结果不得进入公共缓存。
- 首页尽量控制初始资源体积，非首屏内容延迟加载。
- 原图预览不等待上传完成。
- 避免将大图复制为 Base64。
- 同一页面同一时间最多存在一个有效处理请求。
- 用户主动换图时应中止旧请求。
- Remove.bg 超时后返回可恢复错误，不无限等待。

## 16. 埋点与监控

### 16.1 产品事件

| 事件名 | 触发时机 | 可记录属性 |
|---|---|---|
| `page_view` | 首页加载 | 来源、设备类型、国家/地区粗粒度 |
| `upload_select` | 用户选择图片 | 文件类型、大小区间、入口方式 |
| `validation_failed` | 前端校验失败 | 错误类别 |
| `processing_started` | 发起有效处理请求 | 请求 ID |
| `processing_succeeded` | 结果成功展示 | 耗时区间、输出尺寸区间 |
| `processing_failed` | 处理失败 | 错误类别、上游状态类别 |
| `result_downloaded` | 用户点击下载 | 请求 ID、处理到下载耗时 |
| `upload_another` | 用户重新选择图片 | 是否曾成功下载 |

不得记录文件名、图片 URL、图片二进制内容或用户输入的敏感信息。

### 16.2 运维监控

- Remove.bg API 成功率和错误码分布。
- Worker 5xx、429、CPU/内存异常。
- P50、P75、P95 处理耗时。
- Turnstile 失败率。
- API 用量和剩余额度预警。
- 部署版本与异常请求关联。

## 17. UI 状态与文案要求

### 17.1 上传区建议文案

- 标题：`Remove Image Background Automatically`
- 主按钮：`Upload Image`
- 辅助文案：`or drop a JPG or PNG file here`
- 限制提示：`Maximum file size: 22 MB`

### 17.2 处理状态建议文案

- 验证中：`Verifying your request…`
- 处理中：`Removing background…`
- 成功：`Your image is ready`
- 下载：`Download PNG`
- 换图：`Upload another image`

### 17.3 错误文案原则

- 说明发生了什么。
- 告诉用户下一步可以做什么。
- 不使用内部错误码替代人类可读信息。
- 不承诺无法保证的处理时间或数据行为。

## 18. 验收标准

### 18.1 核心流程

- [ ] 用户无需登录即可上传一张有效 JPG/PNG。
- [ ] 选择图片后立即显示本地预览。
- [ ] 有效图片可通过站内 API 成功调用 Remove.bg。
- [ ] 处理成功后显示透明棋盘格结果。
- [ ] 用户可以对比原图和处理结果。
- [ ] 用户可以下载透明 PNG。
- [ ] 下载文件名符合约定。
- [ ] 用户可以换图并完成第二次处理。

### 18.2 数据与隐私

- [ ] 项目未配置图片持久化存储。
- [ ] 浏览器未将图片写入 localStorage、sessionStorage 或 IndexedDB。
- [ ] Worker 日志中不存在图片正文和完整请求体。
- [ ] 图片响应包含 `Cache-Control: no-store`。
- [ ] 更换图片时旧 Object URL 被释放。
- [ ] 隐私政策准确披露 Remove.bg 第三方处理。

### 18.3 安全

- [ ] Remove.bg API Key 未出现在前端构建产物和 Git 历史中。
- [ ] API Key 通过 Cloudflare Secret 注入。
- [ ] Turnstile 在服务端完成校验。
- [ ] 处理接口已启用限流。
- [ ] 超大文件和不支持格式在前后端均被拒绝。
- [ ] 上游错误经过脱敏后再返回前端。
- [ ] 重复点击不会产生并发重复计费请求。

### 18.4 质量

- [ ] 桌面端与移动端均可完成主流程。
- [ ] 键盘可完成上传、处理和下载。
- [ ] 网络失败后可以重试。
- [ ] 无效 URL 返回正确的 404 状态。
- [ ] 首页具备 Title、Description、H1、Canonical、OG 和基础结构化数据。
- [ ] `robots.txt` 与 `sitemap.xml` 可访问。

## 19. 测试清单

### 19.1 文件测试

- 小尺寸 JPG。
- 带透明通道 PNG。
- 接近 22MB 的有效文件。
- 超过 22MB 的文件。
- 扩展名伪装成 JPG 的非图片文件。
- 损坏图片。
- 超高分辨率图片。
- 无明显前景图片。
- 文件名包含空格、中文和特殊字符的图片。

### 19.2 网络与接口测试

- 正常 Remove.bg 响应。
- Remove.bg 返回 400、402/额度相关错误、429、500。
- 上游请求超时。
- 用户上传期间断网。
- 用户处理中换图或关闭页面。
- 同一 IP 高频调用。
- Turnstile Token 缺失、无效和过期。
- 非本站 Origin 调用。

### 19.3 设备测试

- macOS Chrome、Safari、Firefox。
- Windows Chrome、Edge。
- iPhone Safari。
- Android Chrome。
- 慢速移动网络。

## 20. 发布计划

### 阶段一：开发与内部测试

- 完成静态首页和核心组件。
- 完成 Worker 流式代理。
- 配置 Secrets、Turnstile 和限流。
- 使用多类测试图片验证结果和错误映射。

### 阶段二：灰度发布

- 使用 Cloudflare 预览或灰度域名。
- 限制少量真实用户访问。
- 检查 API 消耗、错误率、处理耗时和移动端体验。
- 修复高频失败原因。

### 阶段三：正式上线

- 绑定正式域名。
- 提交 sitemap。
- 开启监控和额度告警。
- 按周复盘上传、成功和下载漏斗。

## 21. 风险与应对

| 风险 | 影响 | 应对方案 |
|---|---|---|
| Remove.bg 单次调用成本较高 | 免费流量被滥用造成费用 | Turnstile、限流、预算和额度告警 |
| API Key 泄露 | 额度被盗用 | Worker Secret、仓库扫描、密钥轮换 |
| 大图导致 Worker 内存压力 | 请求失败或运行异常 | 全链路流式传输，避免 Buffer/FormData 复制 |
| 供应商服务异常 | 用户无法处理图片 | 超时、错误映射、状态告警和友好重试 |
| 用户误解“不存储” | 隐私信任和合规风险 | 明确披露第三方处理，不做绝对化宣传 |
| 抠图效果不稳定 | 下载转化下降 | 展示拍摄建议，积累匿名错误类别，后续评测替代方案 |
| SEO 竞争激烈 | 自然流量增长缓慢 | 聚焦工具体验，后续扩展真实细分场景页 |

## 22. 上线决策门槛

正式公开前必须满足：

1. 主流程验收项全部通过。
2. API Key 和图片数据安全项全部通过。
3. Turnstile、限流和额度告警已经生效。
4. 隐私政策与实际数据流一致。
5. 至少完成桌面端和两种移动端浏览器测试。
6. 使用不少于 30 张覆盖人物、商品、动物、Logo 和复杂边缘的图片完成验证。

## 23. 后续迭代候选

当 MVP 的处理成功率和下载转化率达到目标后，按数据决定是否开发：

1. 白色或自定义纯色背景。
2. 商品图自动居中、留白和阴影。
3. 批量处理。
4. 高清额度、付费和账户体系。
5. 细分 SEO 工具页。
6. 自托管模型以降低规模化成本。

不建议在核心下载转化得到验证前扩展复杂编辑器。
