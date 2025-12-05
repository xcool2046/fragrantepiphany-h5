# Bug Report: 香水页背景图无法切换 + 页面加载失败

## 问题描述

### 原始问题
用户在问卷中选择了特定的"气息"选项（如：木质、咖啡、香皂），但在最终的香水结果页 (`PerfumeView`)，背景图片始终显示默认的"玫瑰园"图片。

### 当前问题
修复背景图切换逻辑后，页面显示"未找到香氛旅程"错误，无法加载。

---

## 数据流分析

```
Question.tsx ─(state.answers)→ Breath.tsx ─(state)→ Draw.tsx ─(state.cardIds + answers)→ Result.tsx ─(state.cardIds + answers)→ PerfumeView.tsx
```

### localStorage 保存/恢复情况

| 页面 | 保存到 localStorage | 从 localStorage 恢复 |
|------|---------------------|---------------------|
| Question.tsx:63 | `last_answers` ✓ | ✗ |
| Breath.tsx | ✗ | ✗ |
| Draw.tsx:461 | `last_card_ids` ✓ | ✗ |
| Result.tsx:26,47 | `last_card_ids` + `last_answers` ✓ | ✓ |
| PerfumeView.tsx:27,44 | ✗ | ✓ |

---

## 问题分析

### 1. 页面显示"未找到香氛旅程"的原因

截图显示的是 `t('perfume.notFound')` 而非 `t('perfume.noCards')`，说明：

- `cardIds` **不为空**（从 localStorage 恢复成功）
- API `/api/perfume/chapters` **被调用了**
- 但 `chapters.length === 0` 或 `matchSceneChoice()` 返回 `undefined`

### 2. 调试日志显示 answers 为空

```
[PerfumePage] answers: {}
[PerfumePage] scentAnswer: undefined
[PerfumePage] rightImage: /src/assets/perfume/bg_option_a.jpg
```

这说明 `answers` 没有正确传递到 `PerfumeView`。

### 3. 可能的根本原因

1. **中间页面刷新导致 state 丢失**：Breath.tsx 和 Draw.tsx 没有从 localStorage 恢复 answers 的逻辑
2. **API 返回空数据**：后端 `/api/perfume/chapters` 可能根据参数没有匹配到香水
3. **localStorage 数据不一致**：旧的 cardIds 与后端数据不匹配

---

## 相关代码文件

- `frontend/src/pages/Question.tsx` - 问卷页，保存 answers
- `frontend/src/pages/Breath.tsx` - 过渡页，传递 state（无 localStorage 恢复）
- `frontend/src/pages/Draw.tsx` - 抽卡页，保存 cardIds
- `frontend/src/pages/Result.tsx` - 结果页，保存并恢复 cardIds + answers
- `frontend/src/pages/PerfumeView.tsx` - 香水页，获取数据并渲染
- `frontend/src/components/PerfumePage.tsx` - 香水页 UI，选择背景图
- `frontend/src/utils/perfume-matcher.ts` - 匹配逻辑
- `frontend/src/config/perfume-constants.ts` - 背景图映射配置

---

## 已尝试的修复

1. **Question.tsx** - 提交时立即保存 answers 到 localStorage
2. **Draw.tsx** - 跳转前保存 cardIds 到 localStorage
3. **Result.tsx** - 跳转到 /perfume 前额外保存 answers
4. **PerfumeView.tsx** - 添加 cardIds 从 localStorage 恢复的 fallback
5. **perfume-matcher.ts** - 增加关键词匹配作为 fallback
6. **PerfumePage.tsx** - 添加调试日志

---

## 待排查

1. **确认 API 响应**：检查 `/api/perfume/chapters` 的实际返回数据
   - 打开浏览器 Network 面板
   - 从 `/question` 重新走完整流程
   - 查看 API 请求参数和响应

2. **检查后端逻辑**：确认 `cardIds` 参数能否匹配到香水数据

3. **PerfumeView.tsx bug**：第 58-61 行，当 `cardIds.length === 0` 时没有调用 `setLoading(false)`
   ```typescript
   if (cardIds.length === 0) {
     setError(t('perfume.noCards', 'No cards provided'))
     return  // ← 应该加 setLoading(false)
   }
   ```

---

## 复现步骤

1. 访问 `/question`
2. 完成所有问卷（选择香皂选项）
3. 继续到抽卡页，选择 3 张卡
4. 完成结果页流程
5. 点击"发现你的香氛"进入香水页
6. 观察是否显示正确的背景图或错误页面

---

## 更新时间

2025-12-04
