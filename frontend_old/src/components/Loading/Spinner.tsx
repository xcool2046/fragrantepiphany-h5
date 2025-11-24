import React from 'react'
import './loading.css'

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large'
  color?: string
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'medium', color = '#9333ea' }) => {
  return (
    <div className={`spinner spinner-${size}`}>
      <div className="spinner-circle" style={{ borderTopColor: color }}></div>
    </div>
  )
}

export default Spinner
