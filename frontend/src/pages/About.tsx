import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import './about.css'

export default function About() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const what = t('about.what', { returnObjects: true }) as string[]
  const youGet = t('about.youGet', { returnObjects: true }) as string[]
  
  return (
    <div className="about-page">
      <div className="about-container">
        {/* Header Section */}
        <div className="about-header fade-in">
          <div className="about-icon">🔮</div>
          <h1 className="about-title">{t('about.title')}</h1>
          <p className="about-mission">{t('about.mission')}</p>
        </div>

        {/* What We Do Section */}
        <div className="about-section slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="section-title">What We Do</h2>
          <div className="card-grid">
            {what.map((item, idx) => (
              <div key={idx} className="feature-card" style={{ animationDelay: `${0.2 + idx * 0.1}s` }}>
                <div className="card-icon">{['✨', '🌸', '💫'][idx]}</div>
                <p className="card-text">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Promise Section */}
        <div className="about-section slide-up" style={{ animationDelay: '0.5s' }}>
          <div className="promise-card">
            <p className="promise-text">{t('about.promise')}</p>
          </div>
        </div>

        {/* You Get Section */}
        <div className="about-section slide-up" style={{ animationDelay: '0.6s' }}>
          <h2 className="section-title">You Get</h2>
          <div className="benefits-list">
            {youGet.map((item, idx) => (
              <div key={idx} className="benefit-item" style={{ animationDelay: `${0.7 + idx * 0.1}s` }}>
                <div className="benefit-icon">✓</div>
                <p className="benefit-text">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Founder Section */}
        <div className="about-section slide-up" style={{ animationDelay: '1s' }}>
          <div className="founder-card">
            <h3 className="founder-title">About the Founder</h3>
            <p className="founder-text">{t('about.founder')}</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="about-actions fade-in" style={{ animationDelay: '1.1s' }}>
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
