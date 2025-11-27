
// import React, { useState, useEffect } from 'react';
// import { 
//   FileText, Calendar, AlertTriangle, CheckCircle, 
//   Activity, Clock, ChevronRight, Maximize2 
// } from 'lucide-react';
// import { getPatientDocuments } from '../../utils/index2';

// export const TimelineView = () => {
//   const [timelineData, setTimelineData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     processTimeline();
//   }, []);

//   const processTimeline = async () => {
//     const docs = await getPatientDocuments();
    
//     // 1. Separate Dated vs Undated
//     const undated = [];
//     const dated = [];

//     docs.forEach(doc => {
//         if (!doc.date || doc.date === 'Unknown' || isNaN(new Date(doc.date).getTime())) {
//             undated.push(doc);
//         } else {
//             dated.push(doc);
//         }
//     });

//     // 2. Sort Dated (Oldest -> Newest)
//     dated.sort((a, b) => new Date(a.date) - new Date(b.date));

//     // 3. Merge (Undated first)
//     setTimelineData([...undated, ...dated]);
//     setLoading(false);
//   };

//   // Helper: Parse Metadata safely
//   const parseMeta = (jsonString) => {
//       try { return JSON.parse(jsonString); } catch { return {}; }
//   };

//   // Helper: Format Date
//   const formatDate = (dateStr) => {
//       if (!dateStr || dateStr === 'Unknown') return 'Unknown Date';
//       return new Date(dateStr).toLocaleDateString('en-US', { 
//           year: 'numeric', month: 'long', day: 'numeric' 
//       });
//   };

//   return (
//     <div className="w-full h-full bg-gray-50 flex flex-col relative overflow-hidden">
        
//       {/* Header */}
//       <div className="p-6 pb-2 z-10 bg-gray-50/90 backdrop-blur-sm shadow-sm">
//         <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
//             <Clock className="text-blue-600" /> Medical Timeline
//         </h2>
//         <p className="text-sm text-gray-500 ml-8">Chronological history of patient records</p>
//       </div>

//       {/* Scrollable Container */}
//       <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
        
//         {/* Inner Wrapper for Full Height Line */}
//         <div className="relative min-h-full">
            
//             {/* Central Spine Line (Spans entire scroll height) */}
//             <div className="absolute left-1/2 top-4 bottom-0 w-0.5 bg-gray-300 -translate-x-1/2 z-0 rounded-full" />

//             <div className="space-y-12 pb-20 pt-4">
//                 {timelineData.map((doc, index) => {
//                     const isLeft = index % 2 === 0;
//                     const meta = parseMeta(doc.meta_data);
//                     const isUnknown = !doc.date || doc.date === 'Unknown';
//                     const hasCritical = meta.critical_flags && meta.critical_flags.length > 0;

//                     return (
//                         <div key={doc.$id} className={`flex items-center w-full ${isLeft ? 'flex-row-reverse' : 'flex-row'} justify-center relative`}>
                            
//                             {/* 1. Content Card (45% width) */}
//                             <div className={`w-[45%] ${isLeft ? 'pl-8 text-left' : 'pr-8 text-right'}`}>
                                
//                                 {/* Date Bubble */}
//                                 <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 shadow-sm ${
//                                     isUnknown ? 'bg-gray-200 text-gray-500' : 'bg-white text-blue-600 border border-blue-100'
//                                 }`}>
//                                     {isUnknown ? 'Undated Record' : formatDate(doc.date)}
//                                 </div>

//                                 {/* Card Body */}
//                                 <div 
//                                     onClick={() => window.open(doc.file_url, '_blank')}
//                                     className={`bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group relative z-10 ${
//                                         hasCritical ? 'border-red-100' : 'border-gray-100'
//                                     }`}
//                                 >
//                                     {/* Card Header */}
//                                     <div className={`flex flex-col ${isLeft ? 'items-start' : 'items-end'}`}>
//                                         <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors">
//                                             {doc.title || "Untitled Document"}
//                                         </h3>
//                                         <span className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
//                                             {doc.title?.includes('Report') ? 'Lab Report' : 'Document'}
//                                         </span>
//                                     </div>

//                                     {/* Summary */}
//                                     <p className={`text-sm text-gray-600 leading-relaxed mb-4 ${isLeft ? 'text-left' : 'text-right'}`}>
//                                         {doc.extracted_text}
//                                     </p>

//                                     {/* Metadata Tags */}
//                                     <div className={`flex flex-wrap gap-2 mt-3 ${isLeft ? 'justify-start' : 'justify-end'}`}>
//                                         {meta.critical_flags?.map((flag, i) => (
//                                             <span key={`crit-${i}`} className="px-2.5 py-1 bg-red-50 text-red-600 text-xs rounded-md font-medium border border-red-100 flex items-center gap-1">
//                                                 <AlertTriangle className="w-3 h-3" /> {flag}
//                                             </span>
//                                         ))}
//                                         {meta.conditions?.map((cond, i) => (
//                                             <span key={`cond-${i}`} className="px-2.5 py-1 bg-purple-50 text-purple-600 text-xs rounded-md font-medium border border-purple-100">
//                                                 {cond}
//                                             </span>
//                                         ))}
//                                         {meta.tests?.map((test, i) => (
//                                             <span key={`test-${i}`} className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs rounded-md font-medium border border-blue-100">
//                                                 {test}
//                                             </span>
//                                         ))}
//                                     </div>

//                                     {/* Lab Results */}
//                                     {meta.lab_results && meta.lab_results.length > 0 && (
//                                         <div className={`mt-4 pt-4 border-t border-gray-50 ${isLeft ? 'text-left' : 'text-right'}`}>
//                                             <p className="text-xs font-bold text-gray-400 mb-2 uppercase">Key Findings</p>
//                                             <ul className="space-y-1">
//                                                 {meta.lab_results.slice(0, 3).map((res, i) => (
//                                                     <li key={i} className="text-xs text-gray-700 font-mono bg-gray-50 px-2 py-1 rounded inline-block mx-1">
//                                                         {res}
//                                                     </li>
//                                                 ))}
//                                             </ul>
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>

//                             {/* 2. Horizontal Connector Line */}
//                             <div className="w-[5%] h-0.5 bg-gray-300 relative top-[0px]" />

//                             {/* 3. Center Node Icon */}
//                             <div className={`w-10 h-10 rounded-full border-4 border-gray-50 flex items-center justify-center shadow-md z-20 flex-shrink-0 ${
//                                 isUnknown ? 'bg-gray-400' : 
//                                 hasCritical ? 'bg-red-500' : 'bg-blue-600'
//                             }`}>
//                                 {hasCritical ? <AlertTriangle className="w-5 h-5 text-white" /> : 
//                                  isUnknown ? <FileText className="w-5 h-5 text-white" /> :
//                                  <Activity className="w-5 h-5 text-white" />}
//                             </div>

//                             {/* 4. Spacer for opposite side to keep center alignment */}
//                             <div className="w-[5%]" />
//                             <div className="w-[45%]" /> 

//                         </div>
//                     );
//                 })}

//                 {!loading && timelineData.length === 0 && (
//                     <div className="text-center py-20 opacity-50">
//                         <p>No records found for timeline.</p>
//                     </div>
//                 )}
//             </div>
//         </div>
//       </div>

//       {/* CSS to hide scrollbar but allow scrolling */}
//       <style>{`
//         .scrollbar-hide::-webkit-scrollbar {
//             display: none;
//         }
//         .scrollbar-hide {
//             -ms-overflow-style: none;
//             scrollbar-width: none;
//         }
//       `}</style>
//     </div>
//   );
// };



import React, { useState, useEffect } from 'react';
import { 
  FileText, Calendar, AlertTriangle, CheckCircle, 
  Activity, Clock, ChevronRight, Maximize2, Loader2 
} from 'lucide-react';
import { getPatientDocuments } from '../../utils/index2';

export const TimelineView = () => {
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    processTimeline();
  }, []);

  const processTimeline = async () => {
    try {
        const docs = await getPatientDocuments();
        
        // 1. Separate Dated vs Undated
        const undated = [];
        const dated = [];

        docs.forEach(doc => {
            if (!doc.date || doc.date === 'Unknown' || isNaN(new Date(doc.date).getTime())) {
                undated.push(doc);
            } else {
                dated.push(doc);
            }
        });

        // 2. Sort Dated (Oldest -> Newest)
        dated.sort((a, b) => new Date(a.date) - new Date(b.date));

        // 3. Merge (Undated first)
        setTimelineData([...undated, ...dated]);
    } catch (error) {
        console.error("Error processing timeline:", error);
    } finally {
        setLoading(false);
    }
  };

  // Helper: Parse Metadata safely
  const parseMeta = (jsonString) => {
      try { return JSON.parse(jsonString); } catch { return {}; }
  };

  // Helper: Format Date
  const formatDate = (dateStr) => {
      if (!dateStr || dateStr === 'Unknown') return 'Unknown Date';
      return new Date(dateStr).toLocaleDateString('en-US', { 
          year: 'numeric', month: 'long', day: 'numeric' 
      });
  };

  return (
    <div className="w-full h-full bg-gray-50 flex flex-col relative overflow-hidden">
        
      {/* Header */}
      <div className="p-6 pb-2 z-10 bg-gray-50/90 backdrop-blur-sm shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Clock className="text-blue-600" /> Medical Timeline
        </h2>
        <p className="text-sm text-gray-500 ml-8">Chronological history of patient records</p>
      </div>

      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto p-8 scrollbar-hide relative">
        
        {/* --- LOADER STATE --- */}
        {loading ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-gray-50">
                <div className="flex flex-col items-center p-6">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
                    <p className="text-gray-500 font-semibold text-sm animate-pulse">Building Timeline...</p>
                </div>
            </div>
        ) : (
            /* --- TIMELINE CONTENT --- */
            <div className="relative min-h-full">
                
                {/* Central Spine Line (Spans entire scroll height) */}
                <div className="absolute left-1/2 top-4 bottom-0 w-0.5 bg-gray-300 -translate-x-1/2 z-0 rounded-full" />

                <div className="space-y-12 pb-20 pt-4">
                    {timelineData.map((doc, index) => {
                        const isLeft = index % 2 === 0;
                        const meta = parseMeta(doc.meta_data);
                        const isUnknown = !doc.date || doc.date === 'Unknown';
                        const hasCritical = meta.critical_flags && meta.critical_flags.length > 0;

                        return (
                            <div key={doc.$id} className={`flex items-center w-full ${isLeft ? 'flex-row-reverse' : 'flex-row'} justify-center relative`}>
                                
                                {/* 1. Content Card (45% width) */}
                                <div className={`w-[45%] ${isLeft ? 'pl-8 text-left' : 'pr-8 text-right'}`}>
                                    
                                    {/* Date Bubble */}
                                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 shadow-sm ${
                                        isUnknown ? 'bg-gray-200 text-gray-500' : 'bg-white text-blue-600 border border-blue-100'
                                    }`}>
                                        {isUnknown ? 'Undated Record' : formatDate(doc.date)}
                                    </div>

                                    {/* Card Body */}
                                    <div 
                                        onClick={() => window.open(doc.file_url, '_blank')}
                                        className={`bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group relative z-10 ${
                                            hasCritical ? 'border-red-100' : 'border-gray-100'
                                        }`}
                                    >
                                        {/* Card Header */}
                                        <div className={`flex flex-col ${isLeft ? 'items-start' : 'items-end'}`}>
                                            <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors">
                                                {doc.title || "Untitled Document"}
                                            </h3>
                                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                                                {doc.title?.includes('Report') ? 'Lab Report' : 'Document'}
                                            </span>
                                        </div>

                                        {/* Summary */}
                                        <p className={`text-sm text-gray-600 leading-relaxed mb-4 ${isLeft ? 'text-left' : 'text-right'}`}>
                                            {doc.extracted_text}
                                        </p>

                                        {/* Metadata Tags */}
                                        <div className={`flex flex-wrap gap-2 mt-3 ${isLeft ? 'justify-start' : 'justify-end'}`}>
                                            {meta.critical_flags?.map((flag, i) => (
                                                <span key={`crit-${i}`} className="px-2.5 py-1 bg-red-50 text-red-600 text-xs rounded-md font-medium border border-red-100 flex items-center gap-1">
                                                    <AlertTriangle className="w-3 h-3" /> {flag}
                                                </span>
                                            ))}
                                            {meta.conditions?.map((cond, i) => (
                                                <span key={`cond-${i}`} className="px-2.5 py-1 bg-purple-50 text-purple-600 text-xs rounded-md font-medium border border-purple-100">
                                                    {cond}
                                                </span>
                                            ))}
                                            {meta.tests?.map((test, i) => (
                                                <span key={`test-${i}`} className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs rounded-md font-medium border border-blue-100">
                                                    {test}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Lab Results */}
                                        {meta.lab_results && meta.lab_results.length > 0 && (
                                            <div className={`mt-4 pt-4 border-t border-gray-50 ${isLeft ? 'text-left' : 'text-right'}`}>
                                                <p className="text-xs font-bold text-gray-400 mb-2 uppercase">Key Findings</p>
                                                <ul className="space-y-1">
                                                    {meta.lab_results.slice(0, 3).map((res, i) => (
                                                        <li key={i} className="text-xs text-gray-700 font-mono bg-gray-50 px-2 py-1 rounded inline-block mx-1">
                                                            {res}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 2. Horizontal Connector Line */}
                                <div className="w-[5%] h-0.5 bg-gray-300 relative top-[0px]" />

                                {/* 3. Center Node Icon */}
                                <div className={`w-10 h-10 rounded-full border-4 border-gray-50 flex items-center justify-center shadow-md z-20 flex-shrink-0 ${
                                    isUnknown ? 'bg-gray-400' : 
                                    hasCritical ? 'bg-red-500' : 'bg-blue-600'
                                }`}>
                                    {hasCritical ? <AlertTriangle className="w-5 h-5 text-white" /> : 
                                     isUnknown ? <FileText className="w-5 h-5 text-white" /> :
                                     <Activity className="w-5 h-5 text-white" />}
                                </div>

                                {/* 4. Spacer for opposite side to keep center alignment */}
                                <div className="w-[5%]" />
                                <div className="w-[45%]" /> 

                            </div>
                        );
                    })}

                    {timelineData.length === 0 && (
                        <div className="text-center py-20 opacity-50">
                            <p>No records found for timeline.</p>
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>

      {/* CSS to hide scrollbar but allow scrolling */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};