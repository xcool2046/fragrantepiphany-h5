import React from 'react'
import { useTranslation } from 'react-i18next'
import './notFound.css'

const NotFound: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className="not-found">
      <div className="not-found-content">
        <div className="not-found-icon">🔮</div>
        <h1 className="not-found-title">404</h1>
        <p className="not-found-message">
          {t('common.language') === 'zh' 
            ? '这张牌似乎迷失在了宇宙中...' 
            : 'This card seems lost in the universe...'}
        </p>
        <div className="not-found-actions">
          <a href="/" className="not-found-button">
            {t('common.home') || '返回首页'}
          </a>
          <a href="/draw" className="not-found-button not-found-button-secondary">
            {t('common.draw') || '开始抽牌'}
          </a>
        </div>
      </div>
    </div>
  )
}

export default NotFound
