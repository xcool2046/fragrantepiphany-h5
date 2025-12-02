import React from 'react'
import Spinner from './Spinner'
import './loading.css'

interface LoadingOverlayProps {
  message?: string
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = '加载中...' }) => {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <Spinner size="large" />
        <p className="loading-message">{message}</p>
      </div>
    </div>
  )
}

export default LoadingOverlay
