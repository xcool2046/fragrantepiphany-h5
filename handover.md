## 📊 当前进度快照 (Progress Snapshot)
- **阶段**：UI 细节打磨与内容更新（Post-Deployment Polish）。重点修复了 Onboarding 页面的视觉 Bug、统一了按钮样式、优化了页面转场动画，并完成了多语言文案更新。
- **已验证功能**：
  1. **Onboarding 页面修复**：移除了导致文字重叠的背景图引用；按钮样式已统一为胶囊型（Pill Style）；按钮 Hover 颜色已修正。
  2. **全局字体修复**：`Rouge Script` 字体已正确配置进 Tailwind，卡牌数字字体显示正常。
  3. **页面转场优化**：全局转场动画已从 "Wipe" 改为 "Fade + Slide"（仿 Onboarding 点击效果），体验更流畅。
  4. **Tailwind 配置恢复**：修复了意外丢失的 `colors` 配置，全站自定义颜色（`bg-text`, `bg-primary`）恢复正常。

## 💡 关键技术方案与技巧 (Key Solutions & Techniques)
- **全局页面转场 (Page Transition)**
  - **方案**：使用 `framer-motion` 在 `WipeTransition.tsx` 中实现。
  - **逻辑**：利用 `AnimatePresence` 包裹 `Routes`。当前效果为 `initial={{ opacity: 0, x: 20 }}` -> `animate={{ opacity: 1, x: 0 }}`，模拟“点击继续”的轻量滑动感。
  - **注意**：不要改回 `clipPath` 方案，用户明确不喜欢那个“黑屏/擦除”效果。

- **塔罗数据修复 (Tarot Data Fix)**
  - **场景**：Excel 源数据中 "Self" 类别的英文列位置与其他类别不同，导致导入错位。
  - **方案**：`backend/scripts/fix_tarot_data_v2.ts` 中硬编码了 `enOffset` 逻辑 (`const enOffset = file.category === 'Self' ? 2 : 0;`)。
  - **关键**：每次部署都会自动运行此脚本 (`deploy.sh`)，**严禁**在未确认数据源变更的情况下修改此 Offset 逻辑。

- **字体系统 (Typography)**
  - **方案**：Google Fonts 在 `index.html` 引入，Tailwind 在 `tailwind.config.cjs` 扩展。
  - **关键配置**：必须在 `theme.extend.fontFamily` 中保留 `script: ['"Rouge Script"', 'cursive']`，否则 `CardFace.tsx` 中的 `font-script` 类名失效。

- **多语言内容 (Localization)**
  - **方案**：`react-i18next`。
  - **约定**：所有文案必须提取到 `frontend/src/locales/{en,zh}.json`。禁止在组件内硬编码文本（除临时调试外）。

## 🚧 遗留难点与待办 (Pending Issues)
- **生产环境验证 (Production Verification)**
  - **状态**：代码已修复，待部署验证。
  - **关注点**：
    1. 检查 `Onboarding` 页背景是否干净（无文字重影）。
    2. 检查 `Question` 页底部按钮是否为胶囊型且居中（非全宽条）。
    3. 检查卡牌数字是否为手写体 (`Rouge Script`)。
  - **查阅**：直接访问 H5 页面或查看 `frontend/src/pages/Onboarding.tsx`。

- **"Self" 类别塔罗牌数据 (Self Category Data)**
  - **状态**：脚本已更新，理论上已修复。
  - **验证**：需在 Admin Panel 或数据库确认 "Self" 类别的英文解释 (`interpretation_en`) 是否不再是错位的中文或乱码。
  - **查阅**：`backend/scripts/inspect_tarot_db.ts` 可用于快速抽检。

## 📂 核心文件结构 (Core Directory Structure)
- `frontend/`
  - `src/AppRoutes.tsx`           # 路由定义，包含全局 AnimatePresence
  - `src/components/WipeTransition.tsx` # 全局页面转场组件 (Fade+Slide)
  - `src/pages/Onboarding.tsx`    # 引导页 (已修复背景与按钮)
  - `src/pages/Question.tsx`      # 问卷页 (已修复按钮样式)
  - `src/components/CardFace.tsx` # 卡牌组件 (字体应用点)
  - `tailwind.config.cjs`         # Tailwind 配置 (含 colors 和 fonts 关键定义)
  - `src/locales/`                # 多语言 JSON 文件
- `backend/`
  - `scripts/fix_tarot_data_v2.ts` # 核心数据修复脚本 (含 Offset 逻辑)
  - `src/interp/`                 # 解读模块 (Controller/Service)
- `deploy.sh`                     # 部署脚本 (含自动执行数据修复)

## ➡️ 下一步指令 (Next Action)
1. **优先检查**：`frontend/tailwind.config.cjs`，确保 `colors` 和 `fontFamily` (含 `script`) 配置块完整存在。这是最近一次回归的根源。
2. **部署验证**：运行 `deploy.sh` 部署最新代码到生产环境。
3. **视觉验收**：
   - 打开 H5，走一遍 Onboarding -> Question -> Breath -> Draw 流程。
   - 重点确认：Onboarding 无重影、Question 按钮样式正常、页面切换流畅。
4. **数据抽检**：如果时间允许，运行 `npx ts-node backend/scripts/inspect_tarot_db.ts` 确认 "Self" 类别数据正确性。
5. **禁止操作**：**不要**随意修改 `fix_tarot_data_v2.ts` 中的 `enOffset` 逻辑，除非你完全理解了 Excel 源文件的列结构变化。
