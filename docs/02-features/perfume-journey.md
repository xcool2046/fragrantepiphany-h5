# Perfume Feature Documentation (香水推荐模块)

## 1. 功能概述 (Overview)
本模块负责根据用户的塔罗抽牌结果（Past/Now/Future）和问卷选择（气味偏好），为用户推荐专属香水。
核心逻辑：
- **输入**：3 张塔罗牌 ID + 1 个气味偏好（问卷 Q4）。
- **处理**：后端根据塔罗牌映射到对应的香水数据，并结合气味偏好选择背景图。
- **输出**：3 个“香水章节”页面，包含品牌、产品名、香调、描述、引语和图片。

## 2. UI 指南 (UI Guide)

### 布局结构
采用**全屏沉浸式书籍翻页体验**，左右分割布局。

```
┌─────────────────────────────────────────────────────┐
│                                                       │
│  左侧面板 (绿色 #E8DCC5)  │   右侧面板 (粉色 #F5D5C8)   │
│  ─────────────            │   ────────────             │
│  • 品牌名 (小金色)        │   • 产品图片 (高清)         │
│  • 产品名 (大衬线体)      │   • 香调金字塔 (交互组件)   │
│  • 标签 (3个)             │                            │
│  • 描述文案               │                            │
│  • 励志语录               │                            │
│                           │                            │
│           [←]                 [→]  (导航按钮)          │
│                                                       │
└─────────────────────────────────────────────────────┘
```

### 交互细节
- **翻页**：支持点击左右按钮或键盘 `← / →` 切换章节。
- **动画**：使用 Framer Motion 实现平滑的进出场动画（内容淡入，图片缩放）。
- **进度**：底部显示 "Chapter X / 3" 及进度条。
- **响应式**：移动端保持左右分割逻辑，自动调整字号和间距。

## 3. 数据与 API (Data & API)

### 数据库 Schema (`perfumes` 表)
数据来源：`/perfume.xlsx` (已通过 Migration 导入)。

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `id` | INT | 主键 |
| `card_id` | INT | 关联的塔罗牌 ID |
| `scene_choice` | VARCHAR | 气味偏好 (A/B/C/D) |
| `brand_name` | VARCHAR | 品牌名 |
| `product_name` | VARCHAR | 产品名 |
| `tags` | JSON | 标签数组 (e.g. ["Fresh", "Floral"]) |
| `description` | TEXT | 推荐理由/描述 |
| `quote` | TEXT | 励志引语 |
| `image_url` | VARCHAR | 图片路径 |
| `notes_top/heart/base` | TEXT | 香调信息 |

### API 接口

#### GET `/api/perfume/chapters`
获取用户的三个香水推荐章节。

**请求参数**:
- `cardIds`: string (逗号分隔的卡牌 ID，例如 "0,24,56")

**响应示例**:
```json
{
  "chapters": [
    {
      "id": 1,
      "order": 1,
      "cardName": "The Lovers",
      "brandName": "Jo Malone",
      "productName": "Red Roses Cologne",
      "tags": ["Fresh", "Floral"],
      "notes": {
        "top": "Fresh red rose",
        "heart": "Rose petals",
        "base": "White musk"
      },
      "description": "...",
      "quote": "...",
      "imageUrl": "/assets/perfume/..."
    }
  ]
}
```

## 4. 开发状态 (Status)
- **Frontend**: ✅ 已完成 (UI + API 集成)。
- **Backend**: ✅ 已完成 (API + 数据库迁移)。
- **Data**: ✅ 已导入 (168 条记录)。
- **Admin**: ⏳ 待开发 (Task 1)。
