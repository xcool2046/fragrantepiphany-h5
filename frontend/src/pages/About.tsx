import Section from '../components/Section'
import { useTranslation } from 'react-i18next'

export default function About() {
  const { t } = useTranslation()
  const what = t('about.what', { returnObjects: true }) as string[]
  const youGet = t('about.youGet', { returnObjects: true }) as string[]
  return (
    <div className="space-y-4">
      <Section title={t('about.title')}>
        <p className="text-text">{t('about.mission')}</p>
        <p className="text-text">{t('about.promise')}</p>
        <p className="text-text">{t('about.founder')}</p>
      </Section>
      <Section title="What we do">
        <ul className="list-disc pl-5 space-y-1 text-text">
          {what.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </Section>
      <Section title="You get">
        <ul className="list-disc pl-5 space-y-1 text-text">
          {youGet.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </Section>
      <div className="flex gap-3">
        <a className="px-4 py-2 bg-primary text-white rounded-full" href="/quiz">{t('common.start')}</a>
        <a className="px-4 py-2 border border-primary text-primary rounded-full" href="/">{t('common.back')}</a>
      </div>
    </div>
  )
}
