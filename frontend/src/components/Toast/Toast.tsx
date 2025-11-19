import React, { useEffect, useState } from 'react'
import type { Toast as ToastType } from './ToastContext'
import './toast.css'

interface ToastProps {
  toast: ToastType
  onClose: () => void
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // 触发进入动画
    setTimeout(() => setIsVisible(true), 10)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300) // 等待退出动画
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✓'
      case 'error':
        return '✕'
      case 'warning':
        return '⚠'
      case 'info':
        return 'ℹ'
    }
  }

  return (
    <div 
      className={`toast toast-${toast.type} ${isVisible ? 'toast-visible' : ''}`}
      onClick={handleClose}
    >
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-message">{toast.message}</div>
      <button className="toast-close" onClick={handleClose}>×</button>
    </div>
  )
}

export default Toast
