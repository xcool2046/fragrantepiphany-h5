# Pending Tasks 待开发任务

## 项目背景
香水推荐页面 (Perfume View) 的前端 UI 框架已完成，后续需要完成以下三个主要任务以实现完整功能。

---

## Task 1: 创建 PerfumeAdmin 后台管理页

### 目标
构建后台管理界面，支持香水数据的 CRUD 操作和图片管理。

### 需求
- **数据表格展示**
  - 列表显示所有香水数据
  - 支持分页、搜索、排序
  - 展示字段：ID、品牌名、产品名、标签、状态

- **新增/编辑功能**
  - 表单输入：品牌名、产品名、标签、描述、引语、图片
  - 香调编辑：前调、中调、后调 (Top/Heart/Base Notes)
  - 表单验证和错误提示

- **图片上传**
  - 支持单图片上传
  - 图片预览
  - 优化存储 (建议上传前压缩或调整大小)

- **删除功能**
  - 删除确认对话框
  - 批量删除支持 (可选)

### 技术栈
- React + TypeScript
- React Hook Form (表单管理)
- Tailwind CSS (样式)
- axios (API 调用)

### 路由
```
/admin/perfume - 管理首页 (列表)
/admin/perfume/create - 新增页面
/admin/perfume/edit/:id - 编辑页面
```

### 模拟数据结构
```typescript
interface PerfumeAdminItem {
  id: number
  brandName: string
  productName: string
  tags: string[]
  description: string
  quote: string
  imageUrl: string
  notes: {
    top: string
    heart: string
    base: string
  }
  cardName: string
  sceneChoice: string
  createdAt: string
  updatedAt: string
}
```

### API 端点 (待后端实现)
- `GET /api/admin/perfume` - 获取列表
- `GET /api/admin/perfume/:id` - 获取详情
- `POST /api/admin/perfume` - 新增
- `PUT /api/admin/perfume/:id` - 更新
- `DELETE /api/admin/perfume/:id` - 删除
- `POST /api/admin/perfume/upload` - 图片上传

### UI 参考
- 参考现有的 Result/Journey 页面的设计风格
- 保持品牌色系一致 (#2B1F16, #D4A373, #E8DCC5)
- 支持响应式设计

### 预计工作量
- **前端**: 2-3 天 (组件、表单、上传)
- **后端**: 3-4 天 (API、数据库、文件存储)

---

## Task 2: 集成 Excel 数据到数据库

### 目标
将 `/perfume.xlsx` 中的香水数据导入到数据库，使后端能够提供实时数据。

### 现状
- Excel 文件位置: `/home/code/h5-web/perfume.xlsx`
- 包含列: 塔罗牌、气息选择、推荐香水、香调特点、感情方向推荐理由
- 需要映射到数据库表结构

### 需求

#### 1. 数据库设计
```sql
CREATE TABLE perfumes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  card_id INT NOT NULL,
  scene_choice VARCHAR(255),
  brand_name VARCHAR(255) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  tags JSON,
  description TEXT,
  quote TEXT,
  image_url VARCHAR(255),
  notes_top TEXT,
  notes_heart TEXT,
  notes_base TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 2. 数据导入流程
- 使用 Excel 解析库 (openpyxl / pandas)
- 提取每一行数据
- 清洗和验证数据
- 映射到数据库字段
- 处理重复数据 (避免重复导入)

#### 3. 图片处理
- 识别 Excel 中的图片路径或嵌入图片
- 下载/迁移到服务器存储
- 生成可访问的 URL

#### 4. 数据验证
- 必填字段检查 (品牌名、产品名、香调)
- 数据类型验证
- 标签格式统一

### 工具选择
- **Python**: openpyxl / pandas (数据处理)
- **Node.js**: ExcelJS / xlsx (数据处理)
- **数据库**: MySQL / PostgreSQL (存储)

### 脚本示例结构
```
scripts/
├── import_perfume_data.py (或 .js)
├── config.json (数据库连接)
└── perfume_mapping.json (字段映射规则)
```

### 预计工作量
- **脚本开发**: 1-2 天
- **数据处理/清洗**: 1 天
- **测试和验证**: 0.5 天

---

## Task 3: 实现中文翻译

### 目标
为香水推荐页面 (PerfumeView) 和相关组件添加完整的中文翻译。

### 现状
- 已有翻译框架: `i18next` + `/frontend/src/locales/{en,zh}.json`
- 香水页面相关的翻译已部分支持
- 需要补充和完善香水动态内容的翻译

### 需求

#### 1. 翻译内容清单

**香水页面动态文案** (来自数据库)
- 品牌名 (Brand Name) - 动态
- 产品名 (Product Name) - 动态
- 标签 (Tags) - 动态
- 描述 (Description) - 动态
- 引语 (Quote) - 动态
- 香调笔记 (Notes) - 动态

**页面 UI 文案**
```json
{
  "journey": {
    "perfume": {
      "title": "Chapter 1 · Perfume",
      "subtitle": "Timber, sunbeam, and calm",
      "notes": {
        "top": "Top Notes",
        "heart": "Heart Notes",
        "base": "Base Notes"
      }
    },
    "nav": {
      "next": "Next",
      "prev": "Previous",
      "back": "Back",
      "complete": "Finish"
    }
  }
}
```

#### 2. 翻译策略

**方案 A: 前端模板 + 动态翻译**
- 页面 UI 使用 i18next key 翻译
- 数据库中的动态内容保存英文原文
- 用户选择语言时动态翻译

**方案 B: 双语存储**
- 数据库为每个香水保存 English + Chinese 版本
- 字段: `product_name_en`, `product_name_zh` 等
- 查询时根据语言参数返回对应版本

**推荐**: 方案 A (更灵活，减少数据库冗余)

#### 3. 实现步骤

1. **编辑 `/frontend/src/locales/zh.json`**
   - 添加或更新香水相关的翻译 key
   - 参考现有风格和用语

2. **前端翻译 Hook**
   ```typescript
   // 动态内容翻译辅助函数
   const translateContent = (key: string, defaultValue: string) => {
     return i18n.exists(key) ? t(key) : defaultValue
   }
   ```

3. **测试多语言显示**
   - 访问 `/perfume` 页面
   - 切换语言 (Language Toggle)
   - 验证英文和中文显示正确

#### 4. 翻译资源

**现有翻译模式参考**
- `journey.perfume.title`: "第一章 香水" ✅
- `journey.perfume.subtitle`: "木质·光束·安静" ✅
- `journey.notesLabel.top`: "前调" ✅

**需要补充的**
- 动态香水描述的翻译策略
- 品牌名和产品名的中英文并存

### 翻译工具
- 手动翻译 (推荐，确保质量)
- 或配合 AI 工具 (ChatGPT / 阿里云翻译) 初稿，再人工审核

### 预计工作量
- **翻译内容**: 0.5-1 天 (根据动态内容量)
- **前端实现**: 0.5 天
- **测试验证**: 0.5 天

---

## 总体时间表

| Task | 前端 | 后端 | 总计 |
|------|------|------|------|
| Task 1: PerfumeAdmin | 2-3d | 3-4d | 5-7d |
| Task 2: 数据导入 | - | 2-3d | 2-3d |
| Task 3: 中文翻译 | 1d | - | 1d |
| **合计** | **3-4d** | **5-7d** | **8-10d** |

---

## 优先级建议

1. **Task 2 (数据导入)** - 优先级最高
   - 可独立完成
   - 为 Task 1 和其他功能提供数据支持

2. **Task 1 (PerfumeAdmin)** - 优先级次高
   - 依赖 Task 2 的数据库
   - 提供内容管理功能

3. **Task 3 (中文翻译)** - 优先级一般
   - 可并行进行
   - 在其他任务完成后进行

---

## 相关文档

- [PERFUME_API_DESIGN.md](./PERFUME_API_DESIGN.md) - API 设计规范
- [PERFUME_UI_GUIDE.md](./PERFUME_UI_GUIDE.md) - 前端 UI 指南
- [PERFUME_IMPLEMENTATION_SUMMARY.md](./PERFUME_IMPLEMENTATION_SUMMARY.md) - 项目总结

---

**最后更新**: 2025-11-26
**状态**: ⏳ 待开发
