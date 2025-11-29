import React from 'react'

const QuestionSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-[#F7F2ED] px-4 py-12 pb-32">
      <div className="max-w-lg mx-auto animate-pulse">
        {/* Title Skeleton */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="h-8 w-64 bg-[#2B1F16]/10 rounded"></div>
          <div className="h-4 w-32 bg-[#2B1F16]/10 rounded"></div>
        </div>

        {/* Questions Skeleton */}
        <div className="space-y-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/40 p-8 rounded-2xl border border-white/60 shadow-sm">
              {/* Question Title */}
              <div className="flex items-center mb-6">
                <div className="w-6 h-6 bg-[#D4A373]/20 rounded mr-2"></div>
                <div className="h-6 w-3/4 bg-[#2B1F16]/10 rounded"></div>
              </div>
              
              {/* Options */}
              <div className="grid grid-cols-1 gap-3">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-12 w-full bg-white/60 rounded-xl border border-transparent"></div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Button Skeleton */}
        <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#F7F2ED] via-[#F7F2ED]/90 to-transparent z-50 flex justify-center">
          <div className="w-full max-w-md h-14 rounded-full bg-[#2B1F16]/10"></div>
        </div>
      </div>
    </div>
  )
}

export default QuestionSkeleton
