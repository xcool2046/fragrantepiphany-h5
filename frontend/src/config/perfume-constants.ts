import bgOptionA from '../assets/perfume/bg_option_a.jpg'
import bgOptionB from '../assets/perfume/bg_option_b.jpg'
import bgOptionC from '../assets/perfume/bg_option_c.jpg'
import bgOptionD from '../assets/perfume/bg_option_d.jpg'

// 映射关系：根据 Q4 (气息问题) 的选项选择背景图
// 选项文本需与数据库(或 mock 数据)完全一致
// Keys should match the scene_choice_en or scene_choice_zh from the database/API
export const BACKGROUND_IMAGES: Record<string, string> = {
  // Option A: Rose Garden
  '初夏清晨的玫瑰园': bgOptionA,
  'Rose garden in early summer morning': bgOptionA,
  'A. 玫瑰园': bgOptionA, // Legacy/Fallback

  // Option B: Wooden Furniture
  '午后被阳光烘暖的木质家具': bgOptionB,
  'Sun-warmed wooden furniture in the afternoon': bgOptionB,

  // Option C: Cafe
  '夜晚咖啡馆飘出的烘焙香气': bgOptionC,
  'Baking scent from a night cafe': bgOptionC,

  // Option D: White Soap
  '海边度假时的白色香皂': bgOptionD,
  'White soap during a seaside vacation': bgOptionD,

  default: bgOptionA
}
