import { useNavigate } from 'react-router-dom'

export default function Privacy() {
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
        <h1 className="text-3xl font-serif text-text mb-8 text-center">Privacy Policy</h1>
        
        <div className="prose prose-stone max-w-none font-light">
          <p>Last updated: November 20, 2025</p>
          
          <h3>1. Introduction</h3>
          <p>
            Welcome to Fragrant Epiphany. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you as to how we look after your personal data when you visit our website 
            and tell you about your privacy rights and how the law protects you.
          </p>

          <h3>2. Data We Collect</h3>
          <p>
            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
            <ul>
              <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data:</strong> includes email address and telephone number.</li>
              <li><strong>Transaction Data:</strong> includes details about payments to and from you and other details of products and services you have purchased from us.</li>
            </ul>
          </p>

          <h3>3. How We Use Your Data</h3>
          <p>
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
            <ul>
              <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
              <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
            </ul>
          </p>
          
          <p className="text-sm text-subtext mt-8 pt-8 border-t border-black/5">
            For any questions regarding this privacy policy, please contact us at support@fragrantepiphany.com.
          </p>
        </div>
      </div>
    </div>
  )
}
