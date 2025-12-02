import React from 'react'
import { useToastContext } from './ToastContext'
import Toast from './Toast'
import './toast.css'

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastContext()

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast 
          key={toast.id} 
          toast={toast} 
          onClose={() => removeToast(toast.id)} 
        />
      ))}
    </div>
  )
}

export default ToastContainer
