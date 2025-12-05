# SEO 优化实施方案 (SEO Optimization Plan)

**文档状态**: 草稿
**创建日期**: 2025-12-05
**适用项目**: H5 Web (Vite + React SPA)

---

## 1. 现状分析与挑战

基于当前项目架构（Vite + React 单页应用），SEO 面临以下客观挑战：

1.  **CSR (客户端渲染) 限制**: 
    - 爬虫（尤其是百度）抓取初始 HTML 时只能看到 `<div id="root"></div>`，内容需 JS 执行后才显示，导致收录困难。
2.  **内容私有化**: 
    - 核心流程（抽牌 -> 结果）是动态且个性化的，搜索引擎不会去“抽牌”，因此无法抓取到结果页的丰富文本。
3.  **URL 结构单一**: 
    - 目前主要依赖 `/`, `/draw`, `/result` 等少数几个路由，缺乏长尾关键词入口（如“愚人牌解释”、“木质调香水推荐”）。
4.  **缺乏元数据**: 
    - 全站 Title/Description 静态且单一，未根据页面内容动态变更。

---

## 2. 核心策略

**“技术基建 + 内容引流”**

不强求重构为 SSR (服务端渲染)，而是通过优化现有 SPA 结构，并新增“公共内容库”来捕获搜索流量。

---

## 3. 实施阶段

### 阶段一：技术基建 (Technical SEO)
*目标：确保搜索引擎能正确识别站点基础信息。*

#### 1.1 动态元数据管理 (React Helmet)
引入 `react-helmet-async`，使每个页面的 `<head>` 标签（标题、描述、OpenGraph）可动态配置。

- **首页**: 覆盖核心词（Tarot Reading, Scent Matching）。
- **结果页**: 虽是动态，但仍需设置通用的吸引性标题。

#### 1.2 站点地图与爬虫协议
- **Robots.txt** (`public/robots.txt`):
  - 允许抓取首页及公共页。
  - 屏蔽 `/admin` 及部分纯动态参数页。
- **Sitemap.xml**:
  - 生成包含首页、以及未来“百科页”的 URL 列表。
  - 提交至 Google Search Console。

#### 1.3 规范化 URL (Canonical)
防止因 URL 参数（如 tracking code）导致的内容重复判定，在 Helmet 中统一指定 `canonical url`。

---

### 阶段二：内容架构扩展 (Content Strategy)
*目标：创建可被索引的静态化内容页面（Landing Pages）。*

利用现有的数据库资源（78张塔罗牌 + 300+香水），构建只读的“百科”栏目。

#### 2.1 塔罗牌义库 (Tarot Library)
- **新路由**: `/library/tarot/:cardId` (e.g., `/library/tarot/the-fool`)
- **内容**: 
  - 显示卡牌大图。
  - 展示通用的正位/逆位含义（从数据库 `interp` 表读取通用描述）。
  - **转化入口**: 底部悬浮按钮 “为自己抽一张? (Start Reading)”。
- **SEO 价值**: 捕获 "The Fool meaning", "Tarot card interpretation" 等高频搜索词。

#### 2.2 香水图鉴 (Perfume Directory)
- **新路由**: `/library/perfume/:perfumeId`
- **内容**:
  - 香水品牌、名称、香调表（前/中/后调）。
  - 对应的“氛围关键词”。
- **SEO 价值**: 捕获特定香水品牌或香调的搜索流量。

---

### 阶段三：结构化数据与社交优化
*目标：在搜索结果和社交分享中占据更多版面。*

#### 3.1 JSON-LD 结构化数据
在 `index.html` 或 Helmet 中注入 Schema.org 数据：
- **WebSite**: 声明站点搜索能力。
- **Article/ItemPage**: 用于百科页面，帮助 Google 提取摘要。

#### 3.2 Open Graph (OG) 标签
确保链接分享到 WhatsApp/Facebook/Twitter 时显示正确的：
- `og:image`: 抽牌结果页应尝试动态生成包含卡牌的预览图（进阶功能），或使用精美的高清通用图。
- `og:title`: 吸引点击的文案。

---

### 阶段四：性能优化 (Core Web Vitals)
*搜索排名因子之一。*

1.  **图片优化**:
    - 塔罗牌和香水图片全量 WebP 化（已部分实施）。
    - 实施 `loading="lazy"` 懒加载，除了首屏 LCP 元素（如首页主视觉）。
2.  **代码分割**:
    - 路由级懒加载 (React.lazy)，避免首屏加载庞大的百科数据代码。

---

## 4. 预渲染方案 (针对百度/旧爬虫) - *可选*

如果发现 Google 收录良好但百度无法收录，可采用 **预渲染 (Prerendering)** 技术。

- **工具**: `vite-plugin-prerender` 或 `prerender.io`。
- **原理**: 在构建时（Build time）启动一个无头浏览器，将 `/library/*` 等静态路由渲染成纯 HTML 文件。
- **效果**: 爬虫访问时直接获取静态 HTML，无需执行 JS，完美解决 SPA 的 SEO 痛点。

---

## 5. 执行清单 (Checklist)

- [ ] **依赖安装**: `npm install react-helmet-async`
- [ ] **组件封装**: 创建 `<SEO title="..." description="..." />` 通用组件
- [ ] **路由规划**: 设计 `/library` 页面 UI
- [ ] **配置生成**: 添加 `public/robots.txt`
- [ ] **数据核对**: 确认 `cards` 和 `perfumes` 表数据是否适合公开展示
