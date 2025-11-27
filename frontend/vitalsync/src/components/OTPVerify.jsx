// import React, { useState } from 'react';
// import { 
//   Activity, ShieldCheck, ArrowRight, Lock, KeyRound, AlertCircle, Loader2, UserCheck 
// } from 'lucide-react';

// // This component handles the Doctor's login flow: Card ID -> OTP -> Dashboard
// export const OTPVerify = ({ onLoginSuccess }) => {
//   const [step, setStep] = useState(1); // 1: Card Input, 2: OTP Input
//   const [cardNumber, setCardNumber] = useState('');
//   const [otp, setOtp] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [phoneMask, setPhoneMask] = useState('');

//   // Step 1: Request OTP
//   const handleGetOTP = async () => {
//     if (!cardNumber.trim()) {
//       setError("Please enter a valid Patient Card Number.");
//       return;
//     }
    
//     setLoading(true);
//     setError('');

//     try {
//       // Call your backend endpoint
//       const res = await fetch("http://localhost:8000/send-otp/", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ card_number: cardNumber })
//       });

//       if (!res.ok) throw new Error("Invalid Card Number or Server Error");
      
//       const data = await res.json();
//       setPhoneMask(data.phone_mask || "******8899");
//       setStep(2);
      
//     } catch (err) {
//       console.error(err);
//       setError("Failed to send OTP. Please check the Card Number.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Step 2: Verify OTP
//   const handleVerifyOTP = async () => {
//     if (otp.length !== 6) {
//       setError("Please enter a valid 6-digit OTP.");
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       const res = await fetch("http://localhost:8000/verify-otp/", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ 
//           card_number: cardNumber,
//           otp: otp 
//         })
//       });

//       if (!res.ok) throw new Error("Invalid OTP");

//       const data = await res.json();
      
//       if (data.status === "success") {
//         if (onLoginSuccess) onLoginSuccess(data.token); 
//       } else {
//         throw new Error("Verification failed");
//       }

//     } catch (err) {
//       console.error(err);
//       setError("Invalid OTP. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center p-6 font-sans text-slate-900">
      
//       <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative">
        
//         {/* Header Background */}
//         <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-600 to-blue-600"></div>
        
//         {/* Icon Badge */}
//         <div className="absolute top-20 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center rotate-45 z-10 border-4 border-white">
//            <Activity className="w-10 h-10 text-indigo-600 -rotate-45" />
//         </div>

//         <div className="pt-32 pb-10 px-8 text-center relative z-0 mt-4">
          
//           <h2 className="text-2xl font-bold text-slate-800 mb-1">Doctor Access</h2>
//           <p className="text-sm text-slate-500 mb-8">Secure Patient Data Retrieval</p>

//           {/* --- Step 1: Card Input --- */}
//           {step === 1 && (
//             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
//               <div className="text-left">
//                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-2 block">
//                     Patient Card ID
//                 </label>
//                 <div className="relative group">
//                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                         <ShieldCheck className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
//                     </div>
//                     <input 
//                         type="text" 
//                         value={cardNumber}
//                         onChange={(e) => setCardNumber(e.target.value.toUpperCase())}
//                         placeholder="IND-887261"
//                         className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono font-medium text-lg tracking-wide text-slate-700 placeholder:text-slate-300 uppercase"
//                     />
//                 </div>
//               </div>

//               <button 
//                 onClick={handleGetOTP}
//                 disabled={loading}
//                 className="w-full bg-slate-900 hover:bg-black text-white py-3.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
//               >
//                 {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Request Access Code'}
//                 {!loading && <ArrowRight className="w-4 h-4" />}
//               </button>
//             </div>
//           )}

//           {/* --- Step 2: OTP Input --- */}
//           {step === 2 && (
//             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               
//                {/* Info Box */}
//                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 text-left flex items-start gap-3">
//                   <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
//                       <Lock className="w-4 h-4" />
//                   </div>
//                   <div>
//                       <p className="text-xs font-bold text-indigo-900 uppercase">Verification Sent</p>
//                       <p className="text-[11px] text-indigo-700 mt-0.5 leading-tight">
//                           Enter the 6-digit code sent to the registered number ending in <span className="font-mono font-bold">{phoneMask}</span>
//                       </p>
//                   </div>
//                </div>

//               <div className="text-left">
//                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-2 block">
//                     One-Time Password
//                 </label>
//                 <div className="relative group">
//                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                         <KeyRound className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
//                     </div>
//                     <input 
//                         type="text" 
//                         maxLength={6}
//                         value={otp}
//                         onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
//                         placeholder="000 000"
//                         className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono font-bold text-xl tracking-[0.3em] text-center text-slate-800 placeholder:text-slate-200"
//                     />
//                 </div>
//               </div>

//               <button 
//                 onClick={handleVerifyOTP}
//                 disabled={loading}
//                 className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
//               >
//                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Unlock Records'}
//                  {!loading && <UserCheck className="w-4 h-4" />}
//               </button>

//               <button 
//                 onClick={() => setStep(1)}
//                 className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors underline underline-offset-2"
//               >
//                   Wrong Card ID? Go Back
//               </button>
//             </div>
//           )}

//           {/* Error Message */}
//           {error && (
//             <div className="mt-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-xs animate-in slide-in-from-bottom-2">
//                 <AlertCircle className="w-4 h-4 flex-shrink-0" />
//                 <p className="font-medium">{error}</p>
//             </div>
//           )}

//         </div>

//         {/* Footer */}
//         <div className="bg-slate-50 py-3 px-8 border-t border-slate-100 text-center">
//             <p className="text-[10px] text-slate-400 font-medium tracking-wide">
//                 SECURED BY VitalSync • HIPAA COMPLIANT
//             </p>
//         </div>

//       </div>
//     </div>
//   );
// };

import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, AlertCircle, Loader2, CheckCircle, ArrowLeft
} from 'lucide-react';

export const OTPVerify = ({ onLoginSuccess }) => {
  const [step, setStep] = useState(1);
  const [cardNumber, setCardNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneMask, setPhoneMask] = useState('');
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef([]);

  const handleGetOTP = async () => {
    if (!cardNumber.trim()) return setError("Please enter a valid Patient Card Number.");
    setLoading(true); 
    setError('');
    try {
      const res = await fetch("http://localhost:8000/send-otp/", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card_number: cardNumber })
      });
      if (!res.ok) throw new Error("Invalid Card Number");
      const data = await res.json();
      setPhoneMask(data.phone_mask || "******8899"); 
      setStep(2);
    } catch (err) { 
      setError(err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) return setError("Please enter complete OTP.");
    setLoading(true); 
    setError('');
    try {
      const res = await fetch("http://localhost:8000/verify-otp/", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card_number: cardNumber, otp: otpString })
      });
      if (!res.ok) throw new Error("Invalid OTP");
      
      const data = await res.json();
      
      if (data.status === "success") {
        setSuccess(true);
        if (onLoginSuccess) onLoginSuccess(data.token);
      }
    } catch (err) { 
      setError(err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    
    const newOtp = pastedData.split('');
    while (newOtp.length < 6) newOtp.push('');
    setOtp(newOtp);
    setError('');
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  // Success View
  if (success) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-600" strokeWidth={2} />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Code verified
          </h2>
          <p className="text-gray-600 mb-8">
            Redirecting to dashboard...
          </p>
          
          <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-600 transition-all duration-[2000ms]" 
              style={{width: '100%'}} 
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-6 h-6 text-blue-600" strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Doctor Access
              </h2>
              <p className="text-gray-600 text-sm">
                Enter patient card number to request access
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Patient Card Number
                </label>
                <input 
                  type="text" 
                  value={cardNumber} 
                  onChange={(e) => setCardNumber(e.target.value.toUpperCase())} 
                 
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                />
              </div>

              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900">{error}</p>
                  </div>
                </div>
              )}

              <button 
                onClick={handleGetOTP} 
                disabled={loading || !cardNumber.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Requesting...</span>
                  </>
                ) : (
                  <span>Request OTP</span>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <button 
              onClick={() => { setStep(1); setOtp(['', '', '', '', '', '']); setError(''); }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </button>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Enter Verification Code
              </h2>
              <p className="text-gray-600 text-sm">
                Code sent to <span className="font-mono font-semibold text-gray-900">{phoneMask}</span>
              </p>
            </div>

            <div className="space-y-6">
              {/* OTP Input Boxes */}
              <div className="flex items-center justify-center gap-2">
                {otp.map((digit, index) => (
                  <React.Fragment key={index}>
                    <input
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="w-12 h-14 text-center text-xl font-bold bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    {index === 2 && (
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Code Verified Indicator */}
              {otp.every(d => d) && !error && !loading && (
                <div className="flex items-center justify-center gap-2 text-emerald-600">
                  <CheckCircle className="w-5 h-5" strokeWidth={2} />
                  <span className="text-sm font-medium">Code verified</span>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900">{error}</p>
                  </div>
                </div>
              )}

              {/* Verify Button */}
              <button 
                onClick={handleVerifyOTP} 
                disabled={loading || otp.some(d => !d)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify Code</span>
                )}
              </button>

              {/* Resend Link */}
              <div className="text-center">
                <button 
                  onClick={() => { setOtp(['', '', '', '', '', '']); setError(''); inputRefs.current[0]?.focus(); }}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Didn't receive code? <span className="text-blue-600">Resend</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Demo wrapper for the artifact
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLoginSuccess = (token) => {
    console.log('Login successful with token:', token);
    setTimeout(() => setLoggedIn(true), 2000);
  };

  if (loggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center space-y-6 bg-white rounded-2xl p-12 shadow-sm border border-gray-200 max-w-md">
          <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Access Granted
          </h1>
          <p className="text-gray-600">You are now logged in</p>
          <button 
            onClick={() => setLoggedIn(false)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return <OTPVerify onLoginSuccess={handleLoginSuccess} />;
}