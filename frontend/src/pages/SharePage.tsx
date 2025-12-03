import React, { useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import html2canvas from 'html2canvas'
import shareBg from '../assets/share_bg.png'

interface LocationState {
  perfumeName: string
  sentence: string;
  brandName?: string
  isLocked?: boolean
  savedName?: string
}

const SharePage: React.FC = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state as LocationState) || {}
  
  const { perfumeName, brandName, savedName } = state
  
  const [userName, setUserName] = useState(savedName || '')
  const [generating, setGenerating] = useState(false)
  const [isLocked, setIsLocked] = useState(state.isLocked || false)
  const cardRef = useRef<HTMLDivElement>(null)



  const handleGenerate = async () => {
    if (!cardRef.current) return

    if (!isLocked) {
      const confirmed = window.confirm(t('share.confirmLock', 'After saving, the name cannot be modified. Confirm to save?'))
      if (!confirmed) return
      setIsLocked(true)
      // Persist lock state and name to history so it survives navigation
      navigate('.', { 
        state: { ...state, isLocked: true, savedName: userName }, 
        replace: true 
      })
    }

    setGenerating(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        scale: 2, // Higher resolution
        backgroundColor: null,
      })
      
      const link = document.createElement('a')
      link.download = `fragrant-epiphany-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Failed to generate image', err)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#E8DCC5] flex flex-col items-center justify-center p-4 overflow-y-auto">
      
      {/* Card Preview Area */}
      <div className="relative mb-8 shadow-2xl rounded-sm overflow-hidden" style={{ width: '320px', height: '568px' }}> {/* 9:16 aspect ratio approx */}
        <div ref={cardRef} className="relative w-full h-full flex flex-col items-center text-[#2B1F16]">
          {/* Background Image */}
          <img 
            src={shareBg} 
            alt="Background" 
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
          
          {/* Content Overlay */}
          <div className="relative z-10 w-full h-full flex flex-col px-8 py-12 justify-between">
            
            {/* Top Section: Perfume Info */}
            <div className="flex flex-col items-center text-center space-y-4 mt-8">
               {brandName && (
                 <p className="text-xs uppercase tracking-[0.2em] text-[#A87B51] font-medium">{brandName}</p>
               )}
               <h2 className="text-3xl font-serif leading-tight">{perfumeName}</h2>
               <div className="w-12 h-[1px] bg-[#2B1F16]/20 my-2" />
            </div>

              {state.sentence && (
              <div className="mt-6 text-center px-4">
                <p className="font-serif italic text-[#4A3B32]/90 text-sm leading-relaxed">
                  "{state.sentence}"
                </p>
              </div>
            )} {/* Bottom Section: User Name */}
            <div className="flex flex-col items-center text-center mb-16">
                <p className="text-[10px] uppercase tracking-widest text-[#A87B51] mb-2">{t('share.for', 'For')}</p>
                <div className="flex flex-col items-center min-w-[100px]">
                  <p className="text-2xl font-serif leading-none">
                    {userName || '_______'}
                  </p>
                  {/* Explicit spacer for html2canvas */}
                  <div className="w-full h-2" />
                  <div className="w-full h-[1px] bg-[#2B1F16]/30" />
                </div>
                <p className="text-[9px] text-[#A87B51]/60 mt-2 font-sans tracking-wide">
                  {t('share.sub', 'Today you are learning to love yourself in a new way')}
                </p>
            </div>

            {/* Footer Text - Absolute Bottom */}
            <div className="absolute bottom-6 left-0 w-full text-center">
                <p className="text-[8px] text-[#A87B51]/40 font-sans tracking-wider">
                  @Fragrant Epiphany . Scent Message for this chapter
                </p>
            </div>
            
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-4 w-full max-w-xs z-20">
        <input
          type="text"
          placeholder={t('share.enterName', 'Enter your name')}
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          disabled={isLocked}
          className={`w-full px-4 py-3 rounded-lg bg-[#F7F2ED] border border-[#D4A373]/30 text-[#2B1F16] placeholder:text-[#2B1F16]/30 focus:outline-none focus:border-[#D4A373] text-center font-serif ${
            isLocked ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          maxLength={20}
        />

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full px-6 py-3 rounded-full bg-[#2B1F16] text-[#F7F2ED] text-xs uppercase tracking-[0.2em] shadow-lg hover:-translate-y-0.5 transition disabled:opacity-50"
        >
          {generating ? t('share.generating', 'Generating...') : t('share.download', 'Save Card')}
        </button>

        <button
          onClick={() => navigate('/journey/complete')}
          className="text-xs uppercase tracking-widest text-[#A87B51] hover:text-[#2B1F16] transition mt-2"
        >
          {t('share.finish', 'Finish Journey')}
        </button>
      </div>

    </div>
  )
}

export default SharePage
