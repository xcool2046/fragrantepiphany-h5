import React from 'react'
import bgImage from '../assets/bg.png'

const PerfumeSkeleton: React.FC = () => {
  return (
    <div className="relative min-h-screen w-full bg-[#E8DCC5] overflow-hidden flex">
      {/* Left Content Area - 2/3 */}
      <div className="relative w-2/3 h-screen overflow-hidden">
        {/* Background Image (Blurred) */}
        <div className="absolute inset-0 z-0">
           <img 
             src={bgImage} 
             alt="Background" 
             className="w-full h-full object-cover filter blur-md scale-110" 
           />
           <div className="absolute inset-0 bg-[#E8DCC5]/60" />
        </div>

        {/* Content Skeleton */}
        <div className="relative z-10 h-full overflow-y-auto px-6 md:px-16 py-10 md:py-14">
          <div className="w-full max-w-[500px] flex flex-col gap-8 animate-pulse">
            <div className="space-y-6">
              {/* Brand Name */}
              <div>
                <div className="h-4 w-32 bg-[#2B1F16]/10 rounded"></div>
              </div>
              {/* Product Name */}
              <div>
                <div className="h-12 w-3/4 bg-[#2B1F16]/10 rounded"></div>
                <div className="h-12 w-1/2 bg-[#2B1F16]/10 rounded mt-2"></div>
              </div>
              {/* Tags */}
              <div className="flex flex-wrap gap-3">
                <div className="h-5 w-16 bg-[#2B1F16]/10 rounded"></div>
                <div className="h-5 w-20 bg-[#2B1F16]/10 rounded"></div>
                <div className="h-5 w-14 bg-[#2B1F16]/10 rounded"></div>
              </div>
              <div className="h-px bg-[#2B1F16]/10 w-full" />
              {/* Description */}
              <div className="space-y-4">
                <div className="h-4 w-full bg-[#2B1F16]/10 rounded"></div>
                <div className="h-4 w-full bg-[#2B1F16]/10 rounded"></div>
                <div className="h-4 w-5/6 bg-[#2B1F16]/10 rounded"></div>
                <div className="h-4 w-4/6 bg-[#2B1F16]/10 rounded"></div>
              </div>
              {/* Quote */}
              <div className="pt-2">
                 <div className="h-4 w-2/3 bg-[#2B1F16]/10 rounded italic"></div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col gap-3 pt-6">
              {/* Button */}
              <div className="h-10 w-32 rounded-full bg-[#2B1F16]/10"></div>
              {/* Footer Text */}
              <div className="h-3 w-40 bg-[#2B1F16]/10 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Image Area - 1/3 */}
      <div className="relative w-1/3 h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[#2B1F16]/5 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#E8DCC5]/20" />
        </div>
      </div>
    </div>
  )
}

export default PerfumeSkeleton
