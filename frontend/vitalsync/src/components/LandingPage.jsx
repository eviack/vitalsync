import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, Shield, FileText, ArrowRight, 
  Menu, X, Sparkles, Brain, 
  Activity, QrCode
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

// --- Scroll Section Data ---
const scrollFeatures = [
  {
    id: 'chaos',
    title: "From Chaos to Clarity",
    desc: "Stop carrying folders. Drag and drop your reports, and watch them transform into a structured timeline instantly.",
    color: "blue",
    Visual: () => (
      <div className="w-full h-full bg-white rounded-2xl border border-gray-200 shadow-xl p-8 relative overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 to-indigo-500" />
        <div className="relative w-64 h-64">
          <div className="absolute top-10 left-0 w-40 h-48 bg-white border border-gray-200 rounded-lg shadow-md transform -rotate-12 flex flex-col p-4 transition-all duration-1000 z-10">
            <div className="w-8 h-8 rounded-full bg-red-100 mb-2" />
            <div className="h-2 bg-gray-100 rounded w-full mb-2" />
            <div className="h-2 bg-gray-100 rounded w-2/3" />
          </div>
          <div className="absolute top-4 right-4 w-40 h-48 bg-white border border-gray-200 rounded-lg shadow-md transform rotate-6 flex flex-col p-4 transition-all duration-1000 z-20">
             <div className="w-8 h-8 rounded-full bg-blue-100 mb-2" />
             <div className="h-2 bg-gray-100 rounded w-full mb-2" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center z-30">
            <div className="w-16 h-16 bg-white rounded-full shadow-xl border border-blue-100 flex items-center justify-center animate-pulse">
               <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
        <p className="mt-8 text-gray-500 font-medium">Auto-Sorting...</p>
      </div>
    )
  },
  {
    id: 'ai',
    title: "AI That Understands Medical Jargon",
    desc: "Our AI reads your reports like a doctor would. It extracts vital ranges, dates, and diagnoses automatically.",
    color: "purple",
    Visual: () => (
      <div className="w-full h-full bg-linear-to-br from-purple-50 to-white rounded-2xl border border-purple-100 shadow-xl p-8 relative overflow-hidden flex flex-col justify-center">
        <div className="space-y-4 max-w-sm mx-auto">
          <div className="bg-white p-4 rounded-br-xl rounded-tl-xl rounded-tr-xl shadow-sm border border-gray-100 relative">
             <p className="text-sm text-gray-600">"Hemoglobin A1c is 5.7%"</p>
             <div className="absolute -left-2 top-4 w-2 h-2 bg-white border-l border-b border-gray-100 transform rotate-45" />
          </div>
          <div className="flex justify-end">
             <div className="bg-purple-600 text-white p-4 rounded-bl-xl rounded-tl-xl rounded-tr-xl shadow-md max-w-xs">
                <div className="flex items-center gap-2 mb-2 border-b border-purple-500 pb-2">
                  <Sparkles className="w-3 h-3" /> 
                  <span className="text-xs font-bold uppercase">AI Analysis</span>
                </div>
                <p className="text-sm font-medium">Pre-diabetic range detected.</p>
             </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'doctor',
    title: "The 3-Second Doctor Handshake",
    desc: "No app required for your doctor. Just show your QR code, they scan, verify via OTP, and see your timeline instantly.",
    color: "emerald",
    Visual: () => (
      <div className="w-full h-full bg-white rounded-2xl border border-gray-200 shadow-xl p-8 relative flex flex-col items-center justify-center overflow-hidden">
         <div className="w-48 h-48 bg-white p-2 rounded-xl border-2 border-gray-900 relative mb-6">
            <div className="w-full h-full bg-gray-900 rounded-lg opacity-10" style={{ backgroundImage: 'radial-linear(#4b5563 2px, transparent 2px)', backgroundSize: '12px 12px' }} />
            <div className="absolute inset-0 flex items-center justify-center">
               <QrCode className="w-24 h-24 text-gray-900" />
            </div>
            {/* Overlay Scan Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
         </div>
         <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100 text-emerald-700 font-bold text-sm">
            <Shield className="w-4 h-4" />
            <span>Secure Access Granted</span>
         </div>
      </div>
    )
  }
];

// IMPORTANT: Added 'export' keyword here
export const LandingPage = ({ onGetStarted }) => {
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const featuresRef = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      featuresRef.current.forEach((ref, index) => {
        if (ref) {
          const rect = ref.getBoundingClientRect();
          if (rect.top < window.innerHeight / 2 && rect.bottom > window.innerHeight / 2) {
            setActiveFeatureIndex(index);
          }
        }
      });
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100">
      
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrollY > 20 ? 'bg-white/90 backdrop-blur-md border-b border-gray-100 py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-linear-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
              <Heart className="w-5 h-5" fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">VitalSync</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {['Features', 'Security', 'For Doctors'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                {item}
              </a>
            ))}
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all text-sm font-semibold shadow-lg hover:shadow-xl"
            >
              Get Started
            </button>
          </div>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden">
          <div className="flex flex-col space-y-6 text-xl font-medium">
            <a href="#" className="text-gray-900">Features</a>
            <a href="#" className="text-gray-900">Security</a>
            <button onClick={() => navigate('/dashboard')} className="w-full py-4 bg-blue-600 text-white rounded-xl">Get Started</button>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative pt-32 lg:pt-48 pb-20 lg:pb-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-blue-50/50 to-white -z-10" />
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            
            {/* Left Text */}
            <div className="space-y-8 text-center lg:text-left z-10">
              <div className="inline-flex items-center space-x-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 shadow-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-gray-600 tracking-wide uppercase">Secured</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-gray-900">
                Your Health History, <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600">
                  Crystal Clear.
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                VitalSync unifies your scattered medical reports into a single, intelligent timeline. Give doctors the context they need in seconds.
              </p>

              

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="px-8 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-900/20"
                >
                  Get your card <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => navigate('/doctor')} className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-sm">
                  For doctor
                </button>
              </div>
            </div>

            {/* Right Image - Screenshot */}
            <div className="relative z-0 lg:scale-105 origin-center perspective-1000 group">
               <div className="absolute inset-0 bg-linear-to-tr from-blue-400 via-indigo-400 to-purple-400 blur-3xl opacity-20 rounded-full transform scale-90 translate-y-10" />
               
               {/* Make sure this image path is correct in your public folder */}
               <img 
                 src="dash.png" 
                 alt="App Dashboard Screenshot" 
                 className="relative rounded-2xl shadow-2xl border border-gray-200 transform rotate-y-[-5deg] rotate-x-[5deg] transition-transform duration-700 group-hover:rotate-0 group-hover:scale-105"
               />
            </div>
          </div>
        </div>
      </section>

      {/* STICKY SCROLL FEATURE SECTION */}
      <section className="relative bg-gray-50 py-24 lg:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6 text-gray-900">Healthcare made simple.</h2>
            <p className="text-lg text-gray-600">We've reimagined how you store, organize, and share your medical data.</p>
          </div>

          <div className="relative flex flex-col lg:flex-row gap-8 lg:gap-24">
            {/* Sticky Visual Side */}
            <div className="lg:w-1/2 lg:h-[600px] lg:sticky lg:top-32 order-1 lg:order-2 mb-12 lg:mb-0">
              <div className="relative w-full h-[400px] lg:h-full rounded-3xl overflow-hidden bg-white shadow-2xl border border-gray-200">
                <div className="absolute inset-0 w-full h-full">
                  {scrollFeatures.map((feature, index) => (
                    <div 
                      key={feature.id}
                      className={`absolute inset-0 w-full h-full transition-all duration-700 transform ${
                        index === activeFeatureIndex 
                          ? 'opacity-100 translate-y-0 scale-100' 
                          : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
                      }`}
                    >
                      <feature.Visual />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Scrolling Text Side */}
            <div className="lg:w-1/2 order-2 lg:order-1 space-y-32 lg:py-16">
              {scrollFeatures.map((feature, index) => (
                <div 
                  key={feature.id}
                  ref={el => featuresRef.current[index] = el}
                  className={`transition-all duration-500 flex flex-col justify-center ${
                    index === activeFeatureIndex ? 'opacity-100' : 'opacity-40'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl mb-6 flex items-center justify-center bg-${feature.color}-100 text-${feature.color}-600`}>
                    {index === 0 ? <FileText /> : index === 1 ? <Brain /> : <Shield />}
                  </div>
                  <h3 className="text-3xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-gray-50 to-white -z-10" />
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-8 text-gray-900">
            Ready to organize your health?
          </h2>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
          >
            Get Started Free
          </button>
        </div>
      </section>

      {/* Style for custom animations */}
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .perspective-1000 { perspective: 1000px; }
      `}</style>
    </div>
  );
};