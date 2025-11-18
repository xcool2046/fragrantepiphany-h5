import Section from '../components/Section'
import { useTranslation } from 'react-i18next'

export default function How() {
  const { t } = useTranslation()
  const steps = t('how.steps', { returnObjects: true }) as string[]
  return (
    <Section title={t('how.title')}>
      <ol className="list-decimal pl-5 space-y-1 text-text">
        {steps.map((s, idx) => (
          <li key={idx}>{s}</li>
        ))}
      </ol>
      <p className="text-text mt-2">{t('how.note')}</p>
    </Section>
  )
}
