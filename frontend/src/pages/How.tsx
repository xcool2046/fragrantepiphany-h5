import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import './how.css'

export default function How() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const steps = t('how.steps', { returnObjects: true }) as string[]
  
  const stepIcons = ['📝', '🎴', '👁️', '🔓']
  
  return (
    <div className="how-page">
      <div className="how-container">
        {/* Header */}
        <div className="how-header fade-in">
          <div className="how-icon">💡</div>
          <h1 className="how-title">{t('how.title')}</h1>
        </div>

        {/* Steps */}
        <div className="steps-container">
          {steps.map((step, idx) => (
            <div key={idx} className="step-wrapper">
              <div className="step-card slide-in" style={{ animationDelay: `${idx * 0.15}s` }}>
                <div className="step-number">{idx + 1}</div>
                <div className="step-icon">{stepIcons[idx]}</div>
                <p className="step-text">{step}</p>
              </div>
              {idx < steps.length - 1 && (
                <div className="step-connector" style={{ animationDelay: `${idx * 0.15 + 0.1}s` }}></div>
              )}
            </div>
          ))}
        </div>

        {/* Note */}
        <div className="how-note fade-in" style={{ animationDelay: '0.7s' }}>
          <div className="note-icon">💫</div>
          <p className="note-text">{t('how.note')}</p>
        </div>

        {/* CTA */}
        <div className="how-actions fade-in" style={{ animationDelay: '0.8s' }}>
          <button className="btn-primary" onClick={() => navigate('/quiz')}>
            {t('common.start')}
          </button>
          <button className="btn-secondary" onClick={() => navigate('/')}>
            {t('common.back')}
          </button>
        </div>
      </div>
    </div>
  )
}
