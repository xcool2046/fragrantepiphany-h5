import { useTranslation } from 'react-i18next'


export default function Home() {
  const { t } = useTranslation()
  const highlights = t('home.highlights', { returnObjects: true }) as string[]

  return (
    <div className="space-y-6 pt-8">
      {/* Hero Card */}
      <div className="relative overflow-hidden bg-white/40 backdrop-blur-md rounded-[32px] p-8 border border-white/50 shadow-card">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold/20 rounded-full blur-3xl"></div>
        
        <p className="text-xs text-gold uppercase tracking-[0.2em] mb-4 font-medium">{t('common.appName')}</p>
        
        <h1 className="text-4xl font-serif text-text mb-3 leading-tight">
          {t('home.title')}
        </h1>
        
        <p className="text-subtext mb-8 font-light italic opacity-80">
          {t('home.subtitle')}
        </p>

        <p className="text-text mb-8 text-lg font-light leading-relaxed">
          {t('home.value')}
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <a 
            className="px-8 py-3 bg-gradient-gold text-white rounded-full shadow-glow hover:shadow-lg hover:scale-[1.02] transition-all duration-300 text-center font-medium tracking-wide" 
            href="/quiz"
          >
            {t('common.start')}
          </a>
          <a 
            className="px-8 py-3 border border-gold/30 text-gold rounded-full hover:bg-gold/5 transition-all duration-300 text-center tracking-wide" 
            href="/about"
          >
            {t('common.learnMore')}
          </a>
        </div>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 gap-3">
        {highlights.map((item, idx) => (
          <div key={idx} className="bg-white/30 backdrop-blur-sm p-4 rounded-2xl border border-white/40 flex items-center gap-3 text-subtext">
            <span className="w-1.5 h-1.5 rounded-full bg-gold/60"></span>
            <span className="font-light tracking-wide">{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
