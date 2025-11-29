import React from 'react'

const GlobalLoading: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F7F2ED]">
      <div className="flex flex-col items-center gap-4">
        {/* Branded Spinner */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-2 border-[#D4A373]/20 rounded-full"></div>
          <div className="absolute inset-0 border-2 border-[#D4A373] rounded-full border-t-transparent animate-spin"></div>
        </div>
        
        {/* Optional: Branded Text */}
        <span className="text-[#2B1F16]/60 text-xs tracking-[0.2em] font-serif uppercase animate-pulse">
          Loading
        </span>
      </div>
    </div>
  )
}

export default GlobalLoading
