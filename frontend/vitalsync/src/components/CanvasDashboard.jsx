

// import React, { useState, useEffect, useRef } from 'react';
// import { 
//   Upload, FileText, Activity, Maximize2, Plus, Loader2, ScanLine, User, Phone, CreditCard 
// } from 'lucide-react';
// // FIX: Corrected import path to single dot dot
// import { uploadMedicalRecord, getPatientDocuments } from '../../utils/index2';

// // --- Custom Draggable Implementation (No external lib) ---
// const DraggableCard = ({ children, initialPos }) => {
//   const [position, setPosition] = useState(initialPos);
//   const [dragging, setDragging] = useState(false);
//   const [rel, setRel] = useState(null); // Position relative to cursor

//   const onMouseDown = (e) => {
//     if (e.button !== 0) return; // Only left click
//     const rect = e.currentTarget.getBoundingClientRect();
//     setDragging(true);
//     setRel({
//       x: e.pageX - rect.left - window.scrollX, // Account for scroll
//       y: e.pageY - rect.top - window.scrollY
//     });
//     e.stopPropagation();
//     e.preventDefault();
//   };

//   const onMouseUp = () => {
//     setDragging(false);
//   };

//   const onMouseMove = (e) => {
//     if (!dragging) return;
//     setPosition({
//       x: e.pageX - rel.x,
//       y: e.pageY - rel.y
//     });
//     e.stopPropagation();
//     e.preventDefault();
//   };

//   useEffect(() => {
//     if (dragging) {
//       document.addEventListener('mousemove', onMouseMove);
//       document.addEventListener('mouseup', onMouseUp);
//     } else {
//       document.removeEventListener('mousemove', onMouseMove);
//       document.removeEventListener('mouseup', onMouseUp);
//     }
//     return () => {
//       document.removeEventListener('mousemove', onMouseMove);
//       document.removeEventListener('mouseup', onMouseUp);
//     };
//   }, [dragging]);

//   return (
//     <div
//       onMouseDown={onMouseDown}
//       style={{
//         position: 'absolute',
//         left: position.x,
//         top: position.y,
//         cursor: dragging ? 'grabbing' : 'grab',
//         zIndex: dragging ? 1000 : 10
//       }}
//       className="absolute"
//     >
//       {children}
//     </div>
//   );
// };


// export const CanvasDashboard = () => {
//   const [documents, setDocuments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [uploading, setUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, filename: '' });
//   const [showCard, setShowCard] = useState(false);
//   const fileInputRef = useRef(null);

//   useEffect(() => {
//     loadDocuments();
//   }, []);

//   const loadDocuments = async () => {
//     const docs = await getPatientDocuments();
    
//     const COLUMNS = 3;
//     const CARD_WIDTH = 320; 
//     const CARD_HEIGHT = 240; 
//     const START_X = 60;
//     const START_Y = 120;

//     const positionedDocs = docs.map((doc, index) => {
//         const col = index % COLUMNS;
//         const row = Math.floor(index / COLUMNS);
        
//         return {
//             ...doc,
//             defaultPosition: {
//                 x: START_X + (col * CARD_WIDTH), 
//                 y: START_Y + (row * CARD_HEIGHT)
//             }
//         };
//     });

//     setDocuments(positionedDocs);
//     setLoading(false);
//   };

//   const handleFileSelect = (e) => {
//     if (e.target.files && e.target.files.length > 0) {
//         processUploadQueue(Array.from(e.target.files));
//     }
//   };

//   const processUploadQueue = async (files) => {
//     setUploading(true);
//     setUploadProgress({ current: 0, total: files.length, filename: '' });

//     for (let i = 0; i < files.length; i++) {
//         const file = files[i];
//         setUploadProgress({ current: i + 1, total: files.length, filename: file.name });
//         try {
//             const formData = new FormData();
//             formData.append("file", file);
            
//             // Using the updated /process/ endpoint
//             const apiRes = await fetch("http://localhost:8000/process/", {
//                 method: "POST",
//                 body: formData,
//             });
            
//             if (!apiRes.ok) throw new Error("Processing Failed");
//             const analysis = await apiRes.json();
//             await uploadMedicalRecord(file, analysis);
//         } catch (error) {
//             console.error(`Failed to upload ${file.name}:`, error);
//         }
//     }
    
//     await loadDocuments(); 
//     setUploading(false);
//   };

//   const handleGenerateCard = () => {
//     setShowCard(!showCard);
//   };

//   const formatDate = (isoString) => {
//     if (!isoString) return "Unknown Date";
//     const date = new Date(isoString);
//     return date.toLocaleDateString('en-US', {
//         year: 'numeric', month: 'short', day: 'numeric', 
//         hour: '2-digit', minute: '2-digit'
//     });
//   };

//   const FileNode = ({ doc }) => {
//     let keyEntities = {};
//     try { keyEntities = JSON.parse(doc.meta_data); } catch (e) {}

//     const getTags = () => {
//         const tags = [];
//         Object.keys(keyEntities).forEach(category => {
//              if (category === 'critical_flags') return;
//              const items = keyEntities[category];
//              if (Array.isArray(items)) {
//                  items.slice(0, 3).forEach(item => {
//                      tags.push({ text: item, type: 'standard' });
//                  });
//              }
//         });
//         if (keyEntities.critical_flags && Array.isArray(keyEntities.critical_flags)) {
//             keyEntities.critical_flags.forEach(flag => {
//                 tags.unshift({ text: flag, type: 'critical' });
//             });
//         }
//         return tags.slice(0, 4);
//     };

//     const displayTags = getTags();

//     return (
//       <DraggableCard initialPos={doc.defaultPosition}>
//         <div 
//           className="flex flex-col w-[300px] bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-200 transition-shadow duration-200 overflow-hidden"
//           onClick={(e) => e.stopPropagation()}
//         >
//             <div className={`h-1.5 w-full ${
//                 doc.title?.includes('Report') ? 'bg-blue-500' : 
//                 doc.title?.includes('Prescription') ? 'bg-green-500' : 'bg-purple-500'
//             }`} />
            
//             <div className="p-4">
//                 <div className="flex items-center justify-between mb-3">
//                     <div className="flex items-center gap-2">
//                          <div className="p-1.5 bg-gray-50 rounded-md">
//                             <FileText className="w-4 h-4 text-gray-600" />
//                         </div>
//                         <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
//                             {doc.title?.includes('Report') ? 'LAB' : 'DOC'}
//                         </span>
//                     </div>
//                     <span className="text-[10px] text-gray-400 font-mono whitespace-nowrap">
//                         {formatDate(doc.timestamp)}
//                     </span>
//                 </div>

//                 <h4 className="font-bold text-gray-800 text-sm leading-tight mb-2 truncate" title={doc.title}>
//                     {doc.title || "Untitled"}
//                 </h4>
//                 <p className="text-[11px] text-gray-500 line-clamp-3 mb-3 leading-relaxed h-[4.5em]">
//                     {doc.extracted_text}
//                 </p>

//                 <div className="flex flex-wrap gap-1.5 mb-4 h-6 overflow-hidden">
//                     {displayTags.map((tag, i) => (
//                         <span 
//                             key={i} 
//                             className={`px-2 py-0.5 text-[10px] rounded-md font-medium border ${
//                                 tag.type === 'critical' 
//                                 ? 'bg-red-50 text-red-600 border-red-100' 
//                                 : 'bg-purple-50 text-purple-700 border-purple-100'
//                             }`}
//                         >
//                             {tag.text}
//                         </span>
//                     ))}
//                 </div>

//                 <button 
//                     onPointerDown={(e) => e.stopPropagation()}
//                     onClick={() => window.open(doc.file_url, '_blank')}
//                     className="w-full py-2 text-[11px] font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-center gap-1 transition-colors border border-gray-200"
//                 >
//                     <Maximize2 className="w-3 h-3" /> Open File
//                 </button>
//             </div>
//         </div>
//       </DraggableCard>
//     );
//   };

//   return (
//     <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden font-sans text-slate-900">
      
//       {/* CANVAS */}
//       <div className="flex-1 relative overflow-hidden">
//         <div className="absolute inset-0 opacity-[0.6]" 
//              style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
//         </div>

//         <div className="absolute top-6 left-6 z-10">
//             <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2 tracking-tight">
//                 <Activity className="text-blue-600" /> 
//                 VitalSync Dashboard
//             </h1>
//             <p className="text-sm text-slate-500 ml-8">Patient Context Overview</p>
//         </div>

//         <div className="w-full h-full relative">
//             {documents.map((doc) => <FileNode key={doc.$id} doc={doc} />)}

//             {!loading && documents.length === 0 && (
//                 <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none">
//                     <Upload className="w-16 h-16 mb-4 opacity-10" />
//                     <p>No documents found. Upload to begin.</p>
//                 </div>
//             )}
//         </div>

//         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
//             <input
//                 type="file"
//                 ref={fileInputRef}
//                 className="hidden"
//                 multiple 
//                 accept=".pdf,.jpg,.png"
//                 onChange={handleFileSelect}
//             />
//             <button 
//                 onClick={() => fileInputRef.current?.click()}
//                 disabled={uploading}
//                 className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all font-medium"
//             >
//                 <Plus className="w-5 h-5" />
//                 Add Documents
//             </button>
//         </div>

//         {uploading && (
//             <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 bg-white rounded-xl shadow-2xl border border-gray-100 p-4 w-80 animate-in slide-in-from-bottom-5">
//                 <div className="flex items-center justify-between mb-2">
//                     <span className="text-sm font-bold text-slate-700">Uploading Files...</span>
//                     <span className="text-xs font-mono text-slate-400">{uploadProgress.current}/{uploadProgress.total}</span>
//                 </div>
//                 <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mb-2">
//                     <div 
//                         className="bg-blue-600 h-full transition-all duration-300" 
//                         style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
//                     />
//                 </div>
//                 <p className="text-xs text-slate-500 truncate">Processing: {uploadProgress.filename}</p>
//             </div>
//         )}
//       </div>

//       {/* SIDEBAR */}
//       <div className="w-80 bg-white border-l border-slate-100 h-full flex flex-col shadow-2xl shadow-slate-200/50 z-30">
//         <div className="p-6 border-b border-slate-50">
//             <h3 className="font-bold text-slate-800">Actions</h3>
//         </div>

//         <div className="p-6 flex-1 flex flex-col gap-6">
//             <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
//                 <div className="flex items-center gap-2 mb-3">
//                     <CreditCard className="w-5 h-5 text-indigo-600" />
//                     <h4 className="font-bold text-indigo-900">Patient Card</h4>
//                 </div>
//                 <p className="text-xs text-indigo-700 mb-4 leading-relaxed opacity-80">
//                     View your secure digital health card ID for doctor access.
//                 </p>
                
//                 <button 
//                     onClick={handleGenerateCard}
//                     className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg shadow-indigo-200"
//                 >
//                     {showCard ? 'Hide Card' : 'View Access Card'}
//                 </button>
//             </div>

//             {showCard && (
//                 <div className="relative w-full aspect-[1.58/1] bg-white rounded-2xl p-5 border-2 border-indigo-200 flex flex-col justify-between group overflow-hidden">
                    
//                     <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-indigo-50 via-white to-blue-50 opacity-80 z-0"></div>
//                     <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-200 rounded-full blur-3xl opacity-40"></div>
//                     <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-40"></div>

//                     <div className="flex items-center justify-between relative z-10">
//                         <div className="flex items-center gap-2">
//                             <Activity className="w-5 h-5 text-indigo-600" />
//                             <span className="text-lg font-bold tracking-tight text-slate-800">VitalSync</span>
//                         </div>
//                         <div className="bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded text-[10px] font-bold text-indigo-700 tracking-wider uppercase shadow-sm">
//                             Official
//                         </div>
//                     </div>

//                     <div className="flex items-center gap-3 relative z-10 mt-2">
//                         <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center text-white shadow-lg ring-2 ring-white">
//                             <User className="w-5 h-5" />
//                         </div>
//                         <div>
//                             <h3 className="font-bold text-base text-slate-900 leading-tight">Mr. Harshit</h3>
//                             <div className="flex items-center gap-1 text-slate-500 text-[10px] mt-0.5 font-medium">
//                                 <Phone className="w-3 h-3" />
//                                 <span>+91 98765 43210</span>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="relative z-10 mt-4">
//                         <p className="text-[9px] text-indigo-400 uppercase tracking-widest font-bold mb-0.5">Card Number</p>
//                         <div className="text-2xl font-mono font-bold text-slate-800 tracking-widest drop-shadow-sm">
//                             IND887261
//                         </div>
//                     </div>
//                 </div>
//             )}

//             <div className="mt-auto">
//                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium uppercase tracking-wider mb-3">
//                     <span>Library Stats</span>
//                     <Activity className="w-3 h-3" />
//                  </div>
//                 <div className="grid grid-cols-2 gap-3">
//                     <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
//                         <p className="text-2xl font-bold text-slate-800">{documents.length}</p>
//                         <p className="text-[10px] text-slate-400 font-bold mt-1">TOTAL FILES</p>
//                     </div>
//                     <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
//                         <p className="text-2xl font-bold text-slate-800">
//                            {documents.filter(d => d.title?.toLowerCase().includes('report')).length}
//                         </p>
//                         <p className="text-[10px] text-slate-400 font-bold mt-1">REPORTS</p>
//                     </div>
//                 </div>
//             </div>
//         </div>
//       </div>
//     </div>
//   );
// };


import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, FileText, Activity, Maximize2, Plus, Loader2, ScanLine, User, Phone, CreditCard 
} from 'lucide-react';
import { uploadMedicalRecord, getPatientDocuments } from '../../utils/index2';

// --- Custom Draggable Implementation (No external lib) ---
const DraggableCard = ({ children, initialPos }) => {
  const [position, setPosition] = useState(initialPos);
  const [dragging, setDragging] = useState(false);
  const [rel, setRel] = useState(null); 

  const onMouseDown = (e) => {
    if (e.button !== 0) return; 
    const rect = e.currentTarget.getBoundingClientRect();
    setDragging(true);
    setRel({
      x: e.pageX - rect.left - window.scrollX, 
      y: e.pageY - rect.top - window.scrollY
    });
    e.stopPropagation();
    e.preventDefault();
  };

  const onMouseUp = () => {
    setDragging(false);
  };

  const onMouseMove = (e) => {
    if (!dragging) return;
    setPosition({
      x: e.pageX - rel.x,
      y: e.pageY - rel.y
    });
    e.stopPropagation();
    e.preventDefault();
  };

  useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    } else {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging]);

  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        cursor: dragging ? 'grabbing' : 'grab',
        zIndex: dragging ? 1000 : 10
      }}
      className="absolute"
    >
      {children}
    </div>
  );
};


export const CanvasDashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, filename: '' });
  const [showCard, setShowCard] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
        const docs = await getPatientDocuments();
        
        const COLUMNS = 3;
        const CARD_WIDTH = 320; 
        const CARD_HEIGHT = 240; 
        const START_X = 60;
        const START_Y = 120;

        const positionedDocs = docs.map((doc, index) => {
            const col = index % COLUMNS;
            const row = Math.floor(index / COLUMNS);
            
            return {
                ...doc,
                defaultPosition: {
                    x: START_X + (col * CARD_WIDTH), 
                    y: START_Y + (row * CARD_HEIGHT)
                }
            };
        });

        setDocuments(positionedDocs);
    } catch (error) {
        console.error("Error loading documents:", error);
    } finally {
        setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
        processUploadQueue(Array.from(e.target.files));
    }
  };

  const processUploadQueue = async (files) => {
    setUploading(true);
    setUploadProgress({ current: 0, total: files.length, filename: '' });

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress({ current: i + 1, total: files.length, filename: file.name });
        try {
            const formData = new FormData();
            formData.append("file", file);
            
            const apiRes = await fetch("http://localhost:8000/process/", {
                method: "POST",
                body: formData,
            });
            
            if (!apiRes.ok) throw new Error("Processing Failed");
            const analysis = await apiRes.json();
            await uploadMedicalRecord(file,file.name, analysis);
        } catch (error) {
            console.error(`Failed to upload ${file.name}:`, error);
        }
    }
    
    await loadDocuments(); 
    setUploading(false);
  };

  const handleGenerateCard = () => {
    setShowCard(!showCard);
  };

  const formatDate = (isoString) => {
    if (!isoString) return "Unknown Date";
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', 
        hour: '2-digit', minute: '2-digit'
    });
  };

  const FileNode = ({ doc }) => {
    let keyEntities = {};
    try { keyEntities = JSON.parse(doc.meta_data); } catch (e) {}

    const getTags = () => {
        const tags = [];
        Object.keys(keyEntities).forEach(category => {
             if (category === 'critical_flags') return;
             const items = keyEntities[category];
             if (Array.isArray(items)) {
                 items.slice(0, 3).forEach(item => {
                     tags.push({ text: item, type: 'standard' });
                 });
             }
        });
        if (keyEntities.critical_flags && Array.isArray(keyEntities.critical_flags)) {
            keyEntities.critical_flags.forEach(flag => {
                tags.unshift({ text: flag, type: 'critical' });
            });
        }
        return tags.slice(0, 4);
    };

    const displayTags = getTags();

    return (
      <DraggableCard initialPos={doc.defaultPosition}>
        <div 
          className="flex flex-col w-[300px] bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-200 transition-shadow duration-200 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
            <div className={`h-1.5 w-full ${
                doc.title?.includes('Report') ? 'bg-blue-500' : 
                doc.title?.includes('Prescription') ? 'bg-green-500' : 'bg-purple-500'
            }`} />
            
            <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                         <div className="p-1.5 bg-gray-50 rounded-md">
                            <FileText className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                            {doc.title?.includes('Report') ? 'LAB' : 'DOC'}
                        </span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono whitespace-nowrap">
                        {formatDate(doc.timestamp)}
                    </span>
                </div>

                <h4 className="font-bold text-gray-800 text-sm leading-tight mb-2 truncate" title={doc.title}>
                    {doc.title || "Untitled"}
                </h4>
                <p className="text-[11px] text-gray-500 line-clamp-3 mb-3 leading-relaxed h-[4.5em]">
                    {doc.extracted_text}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4 h-6 overflow-hidden">
                    {displayTags.map((tag, i) => (
                        <span 
                            key={i} 
                            className={`px-2 py-0.5 text-[10px] rounded-md font-medium border ${
                                tag.type === 'critical' 
                                ? 'bg-red-50 text-red-600 border-red-100' 
                                : 'bg-purple-50 text-purple-700 border-purple-100'
                            }`}
                        >
                            {tag.text}
                        </span>
                    ))}
                </div>

                <button 
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => window.open(doc.file_url, '_blank')}
                    className="w-full py-2 text-[11px] font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-center gap-1 transition-colors border border-gray-200"
                >
                    <Maximize2 className="w-3 h-3" /> Open File
                </button>
            </div>
        </div>
      </DraggableCard>
    );
  };

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden font-sans text-slate-900">
      
      {/* CANVAS */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.6]" 
             style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        <div className="absolute top-6 left-6 z-10">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2 tracking-tight">
                <Activity className="text-blue-600" /> 
                VitalSync Dashboard
            </h1>
            <p className="text-sm text-slate-500 ml-8">Patient Context Overview</p>
        </div>

        <div className="w-full h-full relative">
            {/* --- LOADER IMPLEMENTATION --- */}
            {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-slate-50/50 backdrop-blur-sm transition-all">
                    <div className="flex flex-col items-center p-6 rounded-2xl">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
                        <p className="text-slate-600 font-semibold text-sm animate-pulse">Fetching Records...</p>
                    </div>
                </div>
            ) : (
                <>
                    {documents.map((doc) => <FileNode key={doc.$id} doc={doc} />)}

                    {documents.length === 0 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none">
                            <Upload className="w-16 h-16 mb-4 opacity-10" />
                            <p>No documents found. Upload to begin.</p>
                        </div>
                    )}
                </>
            )}
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple 
                accept=".pdf,.jpg,.png"
                onChange={handleFileSelect}
            />
            <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all font-medium"
            >
                <Plus className="w-5 h-5" />
                Add Documents
            </button>
        </div>

        {uploading && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 bg-white rounded-xl shadow-2xl border border-gray-100 p-4 w-80 animate-in slide-in-from-bottom-5">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-700">Uploading Files...</span>
                    <span className="text-xs font-mono text-slate-400">{uploadProgress.current}/{uploadProgress.total}</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mb-2">
                    <div 
                        className="bg-blue-600 h-full transition-all duration-300" 
                        style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                    />
                </div>
                <p className="text-xs text-slate-500 truncate">Processing: {uploadProgress.filename}</p>
            </div>
        )}
      </div>

      {/* SIDEBAR */}
      <div className="w-80 bg-white border-l border-slate-100 h-full flex flex-col shadow-2xl shadow-slate-200/50 z-30">
        <div className="p-6 border-b border-slate-50">
            <h3 className="font-bold text-slate-800">Actions</h3>
        </div>

        <div className="p-6 flex-1 flex flex-col gap-6">
            <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
                <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-bold text-indigo-900">Patient Card</h4>
                </div>
                <p className="text-xs text-indigo-700 mb-4 leading-relaxed opacity-80">
                    View your secure digital health card ID for doctor access.
                </p>
                
                <button 
                    onClick={handleGenerateCard}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg shadow-indigo-200"
                >
                    {showCard ? 'Hide Card' : 'View Access Card'}
                </button>
            </div>

            {showCard && (
                <div className="relative w-full aspect-[1.58/1] bg-white rounded-2xl p-5 border-2 border-indigo-200 flex flex-col justify-between group overflow-hidden">
                    
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-indigo-50 via-white to-blue-50 opacity-80 z-0"></div>
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-200 rounded-full blur-3xl opacity-40"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-40"></div>

                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-indigo-600" />
                            <span className="text-lg font-bold tracking-tight text-slate-800">VitalSync</span>
                        </div>
                        <div className="bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded text-[10px] font-bold text-indigo-700 tracking-wider uppercase shadow-sm">
                            Official
                        </div>
                    </div>

                    <div className="flex items-center gap-3 relative z-10 mt-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center text-white shadow-lg ring-2 ring-white">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-base text-slate-900 leading-tight">Mr. Harshit</h3>
                            <div className="flex items-center gap-1 text-slate-500 text-[10px] mt-0.5 font-medium">
                                <Phone className="w-3 h-3" />
                                <span>+91 98765 43210</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 mt-4">
                        <p className="text-[9px] text-indigo-400 uppercase tracking-widest font-bold mb-0.5">Card Number</p>
                        <div className="text-2xl font-mono font-bold text-slate-800 tracking-widest drop-shadow-sm">
                            IND887261
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-auto">
                 <div className="flex items-center justify-between text-xs text-slate-400 font-medium uppercase tracking-wider mb-3">
                    <span>Library Stats</span>
                    <Activity className="w-3 h-3" />
                 </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-2xl font-bold text-slate-800">{documents.length}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1">TOTAL FILES</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-2xl font-bold text-slate-800">
                           {documents.filter(d => d.title?.toLowerCase().includes('report')).length}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1">REPORTS</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};