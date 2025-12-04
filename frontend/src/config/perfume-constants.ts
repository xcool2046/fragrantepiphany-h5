import bgOptionA from '../assets/perfume/bg_option_a.jpg'
import bgOptionB from '../assets/perfume/bg_option_b.jpg'
import bgOptionC from '../assets/perfume/bg_option_c.jpg'
import bgOptionD from '../assets/perfume/bg_option_d.jpg'

// 映射关系：根据 Q4 (气息问题) 的选项 Code 选择背景图
export const SCENE_IMAGES: Record<string, string> = {
  'A': bgOptionA,
  'B': bgOptionB,
  'C': bgOptionC,
  'D': bgOptionD,
  default: bgOptionA
}

export const SCENE_OPTIONS = [
  { code: 'A', label: 'A. 玫瑰园 / Rose Garden' },
  { code: 'B', label: 'B. 木质家具 / Wooden Furniture' },
  { code: 'C', label: 'C. 咖啡馆 / Cafe' },
  { code: 'D', label: 'D. 白皂 / White Soap' },
]
