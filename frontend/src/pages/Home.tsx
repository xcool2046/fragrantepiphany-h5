import { useTranslation } from 'react-i18next'
import Section from '../components/Section'

export default function Home() {
  const { t } = useTranslation()
  const highlights = t('home.highlights', { returnObjects: true }) as string[]
  return (
    <div className="space-y-4">
      <div className="bg-card rounded-card shadow-card p-6 border border-black/5">
        <p className="text-sm text-subtext uppercase tracking-wide mb-2">{t('common.appName')}</p>
        <h1 className="text-2xl font-semibold mb-2 text-text">{t('home.title')}</h1>
        <p className="text-subtext mb-4">{t('home.subtitle')}</p>
        <p className="text-text mb-4">{t('home.value')}</p>
        <div className="flex gap-3">
          <a className="px-4 py-2 bg-primary text-white rounded-full" href="/quiz">{t('common.start')}</a>
          <a className="px-4 py-2 border border-primary text-primary rounded-full" href="/about">{t('common.learnMore')}</a>
        </div>
      </div>
      <Section title="Highlights">
        <ul className="list-disc pl-5 space-y-1 text-text">
          {highlights.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </Section>
    </div>
  )
}
