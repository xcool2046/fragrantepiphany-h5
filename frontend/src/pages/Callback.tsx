import { useTranslation } from 'react-i18next'
import { useSearchParams, Link, useLocation } from 'react-router-dom'
import Section from '../components/Section'

export default function Callback() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const status = params.get('status') || 'unknown'
  const success = status === 'success'
  const location = useLocation()
  const payload = location.state || {}

  return (
    <Section title={t('pay.title')}>
      <p className="text-text">{success ? t('pay.success') : t('pay.fail')}</p>
      <div className="flex gap-3 mt-3">
        {success ? (
          <Link className="px-4 py-2 bg-primary text-white rounded-full" to="/result" state={payload}>
            {t('pay.viewResult')}
          </Link>
        ) : (
          <Link className="px-4 py-2 bg-primary text-white rounded-full" to="/pay" state={payload}>
            {t('pay.retry')}
          </Link>
        )}
        <Link className="px-4 py-2 border border-primary text-primary rounded-full" to="/">
          {t('pay.backHome')}
        </Link>
      </div>
    </Section>
  )
}
