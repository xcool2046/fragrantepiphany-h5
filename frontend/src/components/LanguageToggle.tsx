import { useTranslation } from 'react-i18next'

export default function LanguageToggle() {
  const { i18n } = useTranslation()
  const current = i18n.language?.startsWith('zh') ? 'zh' : 'en'
  const toggle = () => i18n.changeLanguage(current === 'en' ? 'zh' : 'en')
  return (
    <button
      onClick={toggle}
      className="border border-primary/50 text-primary px-3 py-1 rounded-full bg-white/70 hover:bg-primary hover:text-white transition"
    >
      {current === 'en' ? 'EN / 中文' : '中文 / EN'}
    </button>
  )
}
