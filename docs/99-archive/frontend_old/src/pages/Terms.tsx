import { useNavigate } from 'react-router-dom'

export default function Terms() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#F9F5F1] text-text font-sans pt-20 px-6 pb-10">
      <button 
        onClick={() => navigate('/')} 
        className="fixed top-6 left-6 z-50 w-10 h-10 rounded-full bg-white/50 backdrop-blur-md border border-black/5 flex items-center justify-center shadow-sm hover:scale-105 transition"
      >
        <i className="fas fa-arrow-left text-text/60"></i>
      </button>

      <div className="max-w-3xl mx-auto bg-white/60 backdrop-blur-sm p-8 md:p-12 rounded-2xl border border-white/50 shadow-sm">
        <h1 className="text-3xl font-serif text-text mb-8 text-center">Terms of Service</h1>
        
        <div className="prose prose-stone max-w-none font-light">
          <p>Last updated: November 20, 2025</p>
          
          <h3>1. Agreement to Terms</h3>
          <p>
            These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Fragrant Epiphany ("we," "us" or "our"), concerning your access to and use of the website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the "Site").
          </p>

          <h3>2. Intellectual Property Rights</h3>
          <p>
            Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
          </p>

          <h3>3. User Representations</h3>
          <p>
            By using the Site, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary; (3) you have the legal capacity and you agree to comply with these Terms of Service.
          </p>
          
          <p className="text-sm text-subtext mt-8 pt-8 border-t border-black/5">
            For any questions regarding these terms, please contact us at support@fragrantepiphany.com.
          </p>
        </div>
      </div>
    </div>
  )
}
