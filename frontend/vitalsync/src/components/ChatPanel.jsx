// import React, { useState, useRef, useEffect } from 'react';
// import { Send, Bot, User, Sparkles, FileText, AlertCircle } from 'lucide-react';

// export const ChatPanel = () => {
//   const [query, setQuery] = useState('');
//   const [messages, setMessages] = useState([
//     { 
//       role: 'ai', 
//       text: "Hello, Doctor. I've analyzed the patient's timeline. Ask me anything about their medications, reports, or history.",
//       sources: []
//     }
//   ]);
//   const [loading, setLoading] = useState(false);
//   const scrollRef = useRef(null);

//   // Auto-scroll to bottom
//   useEffect(() => {
//     if (scrollRef.current) {
//       scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
//     }
//   }, [messages]);

//   const handleSend = async () => {
//     if (!query.trim()) return;
    
//     const userMsg = { role: 'user', text: query };
//     setMessages(prev => [...prev, userMsg]);
//     setQuery('');
//     setLoading(true);

//     try {
//       // Call your FastAPI RAG Endpoint
//       const res = await fetch("http://localhost:8000/chat/", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ 
//             query: userMsg.text,
//             collection_name: "medical_documents" 
//         })
//       });

//       if (!res.ok) throw new Error("Failed to fetch answer");
      
//       const data = await res.json();
      
//       const aiMsg = { 
//         role: 'ai', 
//         text: data.answer, 
//         sources: data.sources || [] 
//       };
      
//       setMessages(prev => [...prev, aiMsg]);

//     } catch (error) {
//       console.error(error);
//       setMessages(prev => [...prev, { 
//         role: 'ai', 
//         text: "I'm having trouble connecting to the knowledge base right now. Please try again.",
//         isError: true
//       }]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col h-full bg-white border-l border-gray-200 shadow-xl">
      
//       {/* Header */}
//       <div className="p-4 border-b border-gray-100 bg-blue-50/50">
//         <div className="flex items-center gap-2 text-blue-800 font-bold">
//             <Sparkles className="w-5 h-5 text-blue-600" />
//             <h3>VitalSync AI Assistant</h3>
//         </div>
//         <p className="text-xs text-blue-600 mt-1">RAG-Powered Context Retrieval</p>
//       </div>

//       {/* Messages Area */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30" ref={scrollRef}>
//         {messages.map((msg, idx) => (
//           <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            
//             {/* Avatar */}
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
//                 msg.role === 'user' ? 'bg-gray-800 text-white' : 'bg-blue-100 text-blue-600'
//             }`}>
//                 {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
//             </div>

//             {/* Bubble */}
//             <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
//                 msg.role === 'user' 
//                 ? 'bg-gray-800 text-white rounded-tr-none' 
//                 : msg.isError 
//                     ? 'bg-red-50 text-red-700 border border-red-100 rounded-tl-none'
//                     : 'bg-white text-gray-700 border border-gray-200 rounded-tl-none'
//             }`}>
//                 <p>{msg.text}</p>
                
//                 {/* Sources Citation */}
//                 {msg.sources && msg.sources.length > 0 && (
//                     <div className="mt-3 pt-2 border-t border-dashed border-gray-200">
//                         <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1">
//                             <FileText className="w-3 h-3" /> Sources
//                         </p>
//                         <div className="flex flex-wrap gap-1">
//                             {msg.sources.map((src, i) => (
//                                 <span key={i} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 truncate max-w-[150px]">
//                                     {src}
//                                 </span>
//                             ))}
//                         </div>
//                     </div>
//                 )}
//             </div>
//           </div>
//         ))}

//         {loading && (
//             <div className="flex gap-3">
//                 <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
//                     <Bot className="w-4 h-4" />
//                 </div>
//                 <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
//                     <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
//                     <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
//                     <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
//                 </div>
//             </div>
//         )}
//       </div>

//       {/* Input Area */}
//       <div className="p-4 border-t border-gray-100 bg-white">
//         <div className="relative">
//             <input
//                 type="text"
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 onKeyDown={(e) => e.key === 'Enter' && handleSend()}
//                 placeholder="Ask about allergies, medications, recent surgeries..."
//                 className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
//             />
//             <button 
//                 onClick={handleSend}
//                 disabled={!query.trim() || loading}
//                 className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
//             >
//                 <Send className="w-4 h-4" />
//             </button>
//         </div>
//         <p className="text-[10px] text-center text-gray-400 mt-2">
//             AI responses based strictly on uploaded records. Always verify with original docs.
//         </p>
//       </div>
//     </div>
//   );
// };

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, FileText, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const ChatPanel = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { 
      role: 'ai', 
      text: "Hello, Doctor. I've analyzed the patient's timeline. Ask me anything about their medications, reports, or history.",
      sources: []
    }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!query.trim()) return;
    
    const userMsg = { role: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      // Call your FastAPI RAG Endpoint
      const res = await fetch("http://localhost:8000/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            query: userMsg.text,
            collection_name: "medical_documents" 
        })
      });

      if (!res.ok) throw new Error("Failed to fetch answer");
      
      const data = await res.json();
      
      const aiMsg = { 
        role: 'ai', 
        text: data.answer, 
        sources: data.sources || [] 
      };
      
      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: "I'm having trouble connecting to the knowledge base right now. Please try again.",
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200 shadow-xl">
      
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-blue-50/50">
        <div className="flex items-center gap-2 text-blue-800 font-bold">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h3>VitalSync AI Assistant</h3>
        </div>
        <p className="text-xs text-blue-600 mt-1">RAG-Powered Context Retrieval</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-gray-800 text-white' : 'bg-blue-100 text-blue-600'
            }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                ? 'bg-gray-800 text-white rounded-tr-none' 
                : msg.isError 
                    ? 'bg-red-50 text-red-700 border border-red-100 rounded-tl-none'
                    : 'bg-white text-gray-700 border border-gray-200 rounded-tl-none'
            }`}>
                {/* Markdown Rendering */}
                <div className="prose prose-sm max-w-none prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text}
                    </ReactMarkdown>
                </div>
                
                {/* Sources Citation */}
                {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-dashed border-gray-200">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1">
                            <FileText className="w-3 h-3" /> Sources
                        </p>
                        <div className="flex flex-wrap gap-1">
                            {msg.sources.map((src, i) => (
                                <span key={i} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 truncate max-w-[150px]">
                                    {src}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
          </div>
        ))}

        {loading && (
            <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
            </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <div className="relative">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about allergies, medications, recent surgeries..."
                className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            />
            <button 
                onClick={handleSend}
                disabled={!query.trim() || loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
            >
                <Send className="w-4 h-4" />
            </button>
        </div>
        <p className="text-[10px] text-center text-gray-400 mt-2">
            AI responses based strictly on uploaded records. Always verify with original docs.
        </p>
      </div>
    </div>
  );
};
