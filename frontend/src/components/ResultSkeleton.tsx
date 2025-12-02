import React from 'react'

const ResultSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-[#E8DCC5] py-8 px-4">
      <div className="max-w-md mx-auto animate-pulse">
        {/* Cards Section Skeleton */}
        <div className="flex flex-row justify-center items-end gap-3 md:gap-6 mb-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              {/* Label */}
              <div className="flex flex-col items-center gap-1">
                <div className="h-3 w-12 bg-[#2B1F16]/10 rounded"></div>
                <div className="w-1 h-1 bg-[#D4A373]/20 rounded-full"></div>
              </div>
              {/* Card */}
              <div className="w-24 h-36 md:w-32 md:h-48 rounded-xl bg-[#2B1F16]/10 shadow-sm"></div>
            </div>
          ))}
        </div>

        {/* Content Section Skeleton */}
        <div className="w-full relative text-center">
          {/* Title */}
          <div className="flex justify-center mb-8">
            <div className="h-8 w-48 bg-[#2B1F16]/10 rounded"></div>
          </div>

          {/* Past Content */}
          <div className="mb-12">
            <div className="h-4 w-full bg-[#2B1F16]/10 rounded mb-2"></div>
            <div className="h-4 w-5/6 mx-auto bg-[#2B1F16]/10 rounded mb-8"></div>

            <div className="px-2">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-[1px] bg-[#4A3B32]/10" />
              </div>
              <div className="h-5 w-24 mx-auto bg-[#2B1F16]/10 rounded mb-4"></div>
              <div className="h-4 w-full bg-[#2B1F16]/10 rounded mb-2"></div>
              <div className="h-4 w-full bg-[#2B1F16]/10 rounded mb-2"></div>
              <div className="h-4 w-3/4 bg-[#2B1F16]/10 rounded"></div>
            </div>
          </div>

          {/* Premium Container Skeleton */}
          <div className="relative mt-6">
            <div className="rounded-2xl border border-[#D4A373]/10 bg-[#F7F2ED]/40 px-5 py-9 md:px-7 md:py-11">
              <div className="space-y-10">
                <div>
                  <div className="flex justify-center mb-2 mt-2">
                    <div className="w-16 h-[1px] bg-[#4A3B32]/10" />
                  </div>
                  <div className="h-5 w-24 mx-auto bg-[#2B1F16]/10 rounded mb-4"></div>
                  <div className="h-4 w-full bg-[#2B1F16]/10 rounded mb-2"></div>
                  <div className="h-4 w-4/5 mx-auto bg-[#2B1F16]/10 rounded"></div>
                </div>
              </div>
              
              <div className="mt-10 flex flex-col items-center gap-3">
                 <div className="h-12 w-48 rounded-full bg-[#2B1F16]/10"></div>
                 <div className="h-4 w-16 bg-[#2B1F16]/10 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultSkeleton
