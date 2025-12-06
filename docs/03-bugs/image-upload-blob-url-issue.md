# Bug Report: 图片上传后保存失败 - blob URL 污染数据库

**日期:** 2025-12-05
**状态:** 已识别，待修复
**严重级别:** 高（数据完整性问题）

---

## 问题描述

### 用户报告
1. 上传图片后，预览显示成功
2. 点击"保存"按钮，数据保存到数据库
3. 刷新页面后，图片无法显示
4. 控制台显示 `GET blob:https://... net::ERR_FILE_NOT_FOUND` 错误

### 复现步骤
1. 进入后台卡牌管理页面（`/admin/cards`）
2. 点击"编辑"按钮，打开编辑弹窗
3. 选择一张图片上传
4. 立即点击"保存"按钮（不等待上传完成）
5. 刷新页面，图片显示失败

---

## 根本原因分析

### 1. 代码执行流程（客观事实）

#### 前端上传逻辑
**文件:** `frontend/src/pages/admin/Cards.tsx:168-203`

```typescript
const uploadImage = async (inputFile: File) => {
  // ❌ 第 170-171 行：立即创建并设置 blob URL（同步）
  const previewUrl = URL.createObjectURL(inputFile)
  setForm((prev) => ({ ...prev, image_url: previewUrl }))

  // ⏳ 第 180 行：开始异步上传（需要几秒钟）
  setUploading(true)
  try {
    // 第 183-186 行：压缩图片...
    const compressedBlob = await compressImage(inputFile)
    const compressedFile = new File([compressedBlob], inputFile.name, {
      type: 'image/jpeg',
    })

    // 第 188-192 行：上传到服务器...
    const fd = new FormData()
    fd.append('file', compressedFile)
    const res = await api.post(API_ENDPOINTS.ADMIN.CARDS_UPLOAD, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    // ✅ 第 193 行：上传成功后替换为真实 URL
    setForm((prev) => ({ ...prev, image_url: res.data.url }))
  } catch (e: any) {
    console.error(e)
    alert(e?.response?.data?.message || '上传失败')
    setForm((prev) => ({ ...prev, image_url: '' }))
  } finally {
    setUploading(false)  // 第 201 行
  }
}
```

#### 后端返回
**文件:** `backend/src/admin/admin.controller.ts:474-475`

```typescript
const url = `/uploads/${filename}`;
return { url };  // 返回相对路径 "/uploads/xxx.webp"
```

#### 保存逻辑
**文件:** `frontend/src/pages/admin/Cards.tsx:103-115`

```typescript
const payload = {
  code: form.code.trim(),
  name_en: form.name_en.trim(),
  name_zh: form.name_zh.trim(),
  image_url: form.image_url.trim() || null,  // ⚠️ 保存当前 form 中的 URL
}

if (editing) {
  await api.patch(`${API_ENDPOINTS.ADMIN.CARDS}/${editing.id}`, payload)
} else {
  await api.post(API_ENDPOINTS.ADMIN.CARDS, payload)
}
```

---

### 2. 问题根源（设计缺陷）

#### 时序问题
```
时间轴：
0ms    - 用户选择文件
1ms    - 立即创建 blob URL: "blob:https://backend.fragrantepiphany.com/xxx"
2ms    - 设置到 form.image_url（用户看到预览图）
3ms    - 开始异步上传（setUploading(true)）
...
500ms  - 用户点击"保存"按钮 ❌ （上传还在进行中！）
...
2000ms - 图片压缩完成
3000ms - 上传到服务器完成，返回 "/uploads/xxx.webp"
3001ms - 替换 form.image_url 为真实 URL ✅ （但已经太晚了）
```

#### 三个设计缺陷

**缺陷 1: 立即设置 blob URL**
- 第 171 行立即设置 `form.image_url = previewUrl`
- 用户看到预览图，误以为上传已完成
- 实际上传才刚刚开始（第 180 行）

**缺陷 2: 保存按钮未禁用**
- 文件上传按钮有禁用：`disabled={uploading}` (第 368 行)
- ❌ **保存按钮没有禁用** - 用户可以在上传过程中点击保存
- 代码位置：`frontend/src/pages/admin/Cards.tsx:390`

**缺陷 3: 缺少上传状态反馈**
- 原本有"正在上传中..."提示，但在 commit `e53b033` 中被移除
- 用户无法知道后台还在上传

---

### 3. 证据

#### 控制台错误
```
GET blob:https://backend.fragrantepiphany.com/79ef1bdc-9a17-4d2d-bfd7-7d98583e3ddf net::ERR_FILE_NOT_FOUND
GET blob:https://backend.fragrantepiphany.com/a0f1102e-8ba1-4eac-97c2-92b30fd46562 net::ERR_FILE_NOT_FOUND
GET blob:https://backend.fragrantepiphany.com/0c56f1cc-69dc-1a76-12b5-03b1fd77a7c9 net::ERR_FILE_NOT_FOUND
```

这些错误证明：
1. 数据库中存储的是 blob URL
2. 刷新页面后，blob URL 失效
3. 图片无法加载

#### 数据库污染
由于用户在上传完成前点击保存，数据库中存储的 `image_url` 字段为：
```
blob:https://backend.fragrantepiphany.com/79ef1bdc-9a17-4d2d-bfd7-7d98583e3ddf
```

而不是预期的：
```
/uploads/1764940879623-327785100.webp
```

---

## 解决方案

### 方案 1: 禁用保存按钮（推荐）
在上传过程中禁用"保存"按钮，防止用户在上传完成前保存。

**修改位置:** `frontend/src/pages/admin/Cards.tsx:390`

**修改前:**
```typescript
<button disabled={saving} onClick={submit}>
  {saving ? '保存中...' : '保存'}
</button>
```

**修改后:**
```typescript
<button disabled={saving || uploading} onClick={submit}>
  {saving ? '保存中...' : uploading ? '上传中...' : '保存'}
</button>
```

### 方案 2: 延迟设置预览 URL
等上传成功后再显示预览图。

**优点:** 数据一致性最高
**缺点:** 用户体验较差（需要等待）

### 方案 3: 双 URL 管理
分离预览 URL 和保存 URL。

**修改:**
```typescript
const [previewUrl, setPreviewUrl] = useState<string>('')

// 上传时
setPreviewUrl(URL.createObjectURL(inputFile))  // 仅用于预览
setForm((prev) => ({ ...prev, image_url: '' }))  // 清空保存 URL

// 上传成功后
setForm((prev) => ({ ...prev, image_url: res.data.url }))  // 设置真实 URL
```

---

## 推荐修复方案

**综合方案（方案 1 + 优化）:**

1. **禁用保存按钮**（必须）
   - 在 `uploading` 状态时禁用保存按钮

2. **添加状态提示**（建议）
   - 在按钮文字上显示"上传中..."或在图片预览旁显示进度

3. **错误处理**（必须）
   - 上传失败时清除预览图
   - 显示明确的错误信息

4. **数据清理**（建议）
   - 运行脚本清理数据库中的 blob URL

---

## 影响范围

### 受影响的功能
- ✅ 卡牌管理 - 图片上传
- ❓ 其他模块的图片上传（需检查）

### 受影响的数据
- 所有在上传完成前保存的卡牌记录
- 数据库中包含 `blob:https://...` 的 `image_url` 字段

---

## 相关文件

### 前端
- `frontend/src/pages/admin/Cards.tsx` - 卡牌管理页面
  - 第 168-203 行：`uploadImage` 函数
  - 第 103-123 行：`submit` 函数（保存逻辑）
  - 第 365-373 行：文件上传 UI
  - 第 390 行：保存按钮

### 后端
- `backend/src/admin/admin.controller.ts`
  - 第 433-476 行：`uploadCardImage` 接口
- `backend/src/admin/admin.module.ts`
  - 第 24-32 行：Multer 文件名配置（已修复 ENAMETOOLONG）

---

## 修复优先级

| 优先级 | 修复项 | 工作量 | 风险 |
|--------|--------|--------|------|
| P0 | 禁用上传时的保存按钮 | 5分钟 | 低 |
| P1 | 添加上传状态提示 | 10分钟 | 低 |
| P2 | 清理数据库中的 blob URL | 30分钟 | 中 |
| P3 | 改进预览 URL 管理（方案3） | 1小时 | 中 |

---

## 测试计划

### 功能测试
1. ✅ 上传图片后，等待完成再点保存
2. ✅ 上传过程中，"保存"按钮应该被禁用
3. ✅ 上传失败时，预览图应该消失
4. ✅ 刷新页面后，图片应该正常显示

### 回归测试
1. CSV 导入功能（使用相同的上传逻辑）
2. 其他需要上传文件的功能

---

## 历史记录

- **2025-12-05:** 问题识别并记录
- **2025-12-05 (commit 7da08b3):** 修改上传大小限制为 20MB
- **2025-12-05 (commit e53b033):** 移除"正在上传中..."提示（加剧了问题）
- **2025-12-05 (commit 2d70244):** 修复文件名过长问题（ENAMETOOLONG）

---

## 参考

- [Related Issue] 图片上传大小限制 (已修复)
- [Related Issue] 文件名过长导致上传失败 (已修复)
- [MDN] URL.createObjectURL() - https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
