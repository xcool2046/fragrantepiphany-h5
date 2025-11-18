import { useTranslation } from 'react-i18next'
import { useSearchParams, Link, useLocation } from 'react-router-dom'
import Section from '../components/Section'
import { useEffect, useState } from 'react'
import { getOrder } from '../api'

export default function Callback() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const status = params.get('status') || 'unknown'
  const success = status === 'success'
  const location = useLocation()
  const payload = location.state || {}
  const orderId = params.get('order_id') || ''
  const [order, setOrder] = useState<any | null>(null)

  useEffect(() => {
    if (!orderId) return
    const timer = setInterval(() => {
      getOrder(orderId).then((o) => {
        setOrder(o)
        if (o?.status === 'succeeded' || o?.status === 'failed') {
          clearInterval(timer)
        }
      })
    }, 1500)
    return () => clearInterval(timer)
  }, [orderId])

  return (
    <Section title={t('pay.title')}>
      <p className="text-text">{success ? t('pay.success') : t('pay.fail')}</p>
      {order && (
        <p className="text-subtext text-sm">Order status: {order.status}</p>
      )}
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
