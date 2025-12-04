卡牌解读（Result 页）

前端分类规则：frontend/src/pages/Result.tsx 中 mapQ4 把 Q4 选项首字母 A/B/C 映射到 Self/Career/Love，否则默认 Self，并在 Q4 缺失时用 Q1 文本做一次简单兜底（包含“关系/事业/自我”等关键词）。
卡位映射：Result 页把用户选的 3 张牌按顺序当作 Past/Present/Future 传给后端（使用 realCardIds，由 deck_mapping 还原真实卡牌 ID）。
后端解读：backend/src/interp/interp.controller.ts 在 /api/interp/reading 再次按 Q4 映射 Self/Career/Love，然后用传入卡牌顺序依次取 Past/Present/Future 解读（getInterpretationsForCards 在 backend/src/interp/interp.service.ts）。Past 永远解锁，Present/Future 未付费时锁定。
结论：卡牌解读按图示“Q4 决定领域，自我/事业/感情，具体文案取决于卡牌位置”运行，与图片描述一致；额外存在的 Q1 兜底仅在 Q4 缺失时启用。
香水解读（Perfume 页）

输入来源：frontend/src/pages/PerfumeView.tsx 取卡牌 ID 为“视觉 ID”（未经过 deck_mapping 还原真实卡），问卷答案用 findScentAnswer（frontend/src/utils/perfume-matcher.ts）遍历所有答案文本，找到与香氛场景文案匹配的那一项（未限定必须是 Q2，只按内容匹配）。Q4 同样映射成 Self/Career/Love 并传给后端。
后端取数：backend/src/perfume/perfume.controller.ts 将传入的 card_indices 直接按 (idx%78)+1 映射成卡牌 code→ID，未使用前端的 deck_mapping。category 优先由 q4Answer 推导。
数据筛选与句子生成：backend/src/perfume/perfume.service.ts 先查出所有匹配卡牌 ID 的香水（每张牌通常有 4 个场景），再用 scentAnswer 过滤场景选项。为每条香水记录调用 InterpretationService.findOne，使用传入的 category 和固定 position: 'Present' 取一句动态文案作为 sentence。
前端选用哪一条香水：取回的 chapters 里，matchSceneChoice（frontend/src/utils/perfume-matcher.ts）按场景文案再次匹配 scentAnswer，返回第一条匹配的记录，若匹配不到则用最后一条作为兜底。由于后端已按卡牌顺序排序，这个“第一条”通常是第一张牌（Past），而不是图片要求的“现在”那张牌。页面上展示的卡图却是 presentCardId = cardIndices[1]（Present 位置的视觉 ID），出现卡图与文案不一定同源的风险。
与图片要求的差异：
按图应“根据 Q2 + 现在牌”挑香水，当前实现基于 scentAnswer 选出全部卡的匹配记录后取第一条，未强制使用“现在”的那张牌。
取卡牌 ID 时未应用 deck_mapping，如果牌堆被洗牌（默认会），后端用的卡牌与 Result 页解读的真实卡可能不一致。
动态句子用的是香水记录对应卡的 Present 位置 + Q4 决定的领域；若选中的香水记录不是“现在”那张牌，则句子也会偏离“现在牌 + Q4”的预期。
其他：香水页面的“客观信息/映射文案/劝忘句子”三个层次目前呈现为品牌/产品/标签/描述 + 动态 sentence，没有额外拆出单独的“映射文案”段落。
如需我按“现在牌 + Q2 场景 + Q4 领域”严格落地，需确认是否要：a) 在 PerfumeView 用 deck_mapping 把卡牌还原成真实 ID；b) 仅使用 Present 位置的卡生成香水章节；c) 明确三个文案段落的内容来源。

