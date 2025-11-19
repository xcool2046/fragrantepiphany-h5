import { useTranslation } from 'react-i18next'

export default function LanguageToggle() {
  const { i18n } = useTranslation()
  const current = i18n.language?.startsWith('zh') ? 'zh' : 'en'
  const toggle = () => i18n.changeLanguage(current === 'en' ? 'zh' : 'en')
  
  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F7F0E5] hover:bg-[#E5D0B1] transition-colors text-[#2B1F16] text-xs font-medium tracking-wide"
      aria-label="Switch Language"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
      <span>{current === 'en' ? 'EN' : '中'}</span>
    </button>
  )
}
