import { Question } from '../api'

// Fallback mock data (matching server data as of 2025-11-27)
export const MOCK_QUESTIONS: Question[] = [
  {
    id: 4,
    title_zh: "哪一阵气息，能将你带回到某个美好的瞬间?",
    title_en: "Which scent brings you back to a beautiful moment?",
    options_zh: ["初夏清晨的玫瑰园", "午后被阳光烘暖的木质家具", "夜晚咖啡馆飘出的烘焙香气", "海边度假时的白色香皂"],
    options_en: ["Rose garden in early summer morning", "Sun-warmed wooden furniture in the afternoon", "Baking scent from a night cafe", "White soap during a seaside vacation"],
    active: true,
    weight: 0
  },
  {
    id: 6,
    title_zh: "你内心深处的那个小孩，今天最想做什么?",
    title_en: "What does your inner child want to do most today?",
    options_zh: ["无忧无虑地奔跑玩耍", "被温柔地拥抱和倾听", "安静地涂鸦或做梦", "尝试一件新鲜有趣的事"],
    options_en: ["Run and play carefree", "Be gently embraced and listened to", "Quietly doodle or daydream", "Try something fresh and fun"],
    active: true,
    weight: 1
  },
  {
    id: 5,
    title_zh: "如果为你此刻的心情赋予一种天气，它最接近?",
    title_en: "If you could assign a weather to your current mood, what would it be?",
    options_zh: ["万里无云的晴空", "细雨绵绵的阴天", "暴雨将至的闷热", "云层中透出的光"],
    options_en: ["Cloudless sunny sky", "Drizzling cloudy day", "Sultry before a storm", "Light breaking through clouds"],
    active: true,
    weight: 2
  },
  {
    id: 1,
    title_zh: "当前，最困扰你或最让你思考的人/事是什么?",
    title_en: "What is currently troubling you or occupying your thoughts the most?",
    options_zh: ["关系与情感 (家庭、友情、爱情)", "事业与财富 (工作、学业、财务)", "自我与成长 (内心、情绪、人生方向)"],
    options_en: ["Relationships & Emotions", "Career & Wealth", "Self & Growth"],
    active: true,
    weight: 3
  },
  {
    id: 3,
    title_zh: "面对此事，你目前的状态更接近?",
    title_en: "Facing this, your current state is closer to?",
    options_zh: ["徘徊观望", "感到耗竭", "冷静分析"],
    options_en: ["Hesitating and watching", "Feeling exhausted", "Calmly analyzing"],
    active: true,
    weight: 4
  },
  {
    id: 2,
    title_zh: "你内心最渴望获得的是什么?",
    title_en: "What do you desire most deep down?",
    options_zh: ["清晰与答案", "勇气与力量", "释放与疗愈"],
    options_en: ["Clarity & Answers", "Courage & Strength", "Release & Healing"],
    active: true,
    weight: 5
  }
]
