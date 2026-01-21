
import React, { useState, useRef, useMemo } from 'react';
import { KBPath } from '../types';
import { 
  Trash2, 
  FolderOpen, 
  CheckCircle2, 
  FileText, 
  Loader2,
  Search,
  File as FileIcon,
  Image as ImageIcon,
  Table,
  LayoutGrid,
  HardDrive,
  Upload
} from 'lucide-react';

interface Props {
  paths: KBPath[];
  onAdd: (path: KBPath) => void;
  onRemove: (id: string) => void;
}

const KnowledgeBaseSettings: React.FC<Props> = ({ paths, onAdd, onRemove }) => {
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derive all files from all paths for the explorer view
  const allFiles = useMemo(() => {
    return paths.flatMap(p => p.files.map(f => ({ ...f, sourceId: p.id })));
  }, [paths]);

  const filteredFiles = useMemo(() => {
    if (!searchQuery) return allFiles;
    return allFiles.filter(f => 
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      f.relativePath.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allFiles, searchQuery]);

  const getFileIcon = (mime: string) => {
    if (mime.includes('pdf')) return <FileText size={16} className="text-red-500" />;
    if (mime.includes('image')) return <ImageIcon size={16} className="text-purple-500" />;
    if (mime.includes('csv') || mime.includes('sheet')) return <Table size={16} className="text-green-500" />;
    if (mime.includes('markdown') || mime.includes('md') || mime.includes('text')) return <FileText size={16} className="text-slate-700" />;
    return <FileIcon size={16} className="text-blue-500" />;
  };

  const readFileContent = (file: File): Promise<{name: string, relativePath: string, data: string, mimeType: string}> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        // Handle cases where readAsDataURL includes the prefix
        const [header, base64] = result.includes(',') ? result.split(',') : ['', result];
        const mime = header.match(/:(.*?);/)?.[1] || file.type || 'application/octet-stream';
        resolve({
          name: file.name,
          relativePath: file.webkitRelativePath || file.name,
          data: base64,
          mimeType: mime
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleManualSync = () => {
     if (fileInputRef.current) {
        fileInputRef.current.click();
     }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setIsProcessingFiles(true);
    setProcessingStage('Reading files from system...');

    try {
      const filesArray = Array.from(fileList) as File[];
      
      // Filter for typical document types
      const validFiles = filesArray.filter(f => 
        f.type.includes('pdf') || 
        f.type.includes('text') || 
        f.name.endsWith('.md') ||
        f.name.endsWith('.json') ||
        f.name.endsWith('.csv') ||
        f.type.includes('word') ||
        f.type.includes('document') ||
        f.type.includes('presentation') ||
        f.size < 10 * 1024 * 1024 // Allow miscellaneous small files
      );

      if (validFiles.length === 0) {
        alert("No supported documents found. Please select PDFs, Text files, CSVs, or Office docs.");
        setIsProcessingFiles(false);
        setProcessingStage('');
        return;
      }

      setProcessingStage(`Processing ${validFiles.length} files...`);
      const processedFiles = await Promise.all(validFiles.map(readFileContent));
      
      // Determine folder name from Files
      let folderName = "Local Import";
      if (fileList[0].webkitRelativePath) {
         folderName = fileList[0].webkitRelativePath.split('/')[0];
      } else {
         folderName = "Selected Files";
      }

      const pathSource = `local://${folderName}`;

      onAdd({
        id: Math.random().toString(36).substr(2, 9),
        name: folderName,
        path: pathSource,
        type: 'local_folder',
        files: processedFiles
      });
      
    } catch (err) {
      console.error("Error reading folder", err);
      alert("Failed to process contents.");
    } finally {
      setIsProcessingFiles(false);
      setProcessingStage('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Main Interaction Area */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col gap-4 bg-slate-50/50">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
               <HardDrive size={18} className="text-blue-600" />
               <h3 className="font-bold text-slate-700 text-sm">Local Drive Explorer</h3>
             </div>
             {/* Search Filter - only show if there are files */}
             {paths.length > 0 && (
                <div className="relative w-48">
                  <Search size={14} className="absolute left-2.5 top-2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Filter loaded files..." 
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-blue-400 bg-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}
           </div>
           
           {/* Action Area */}
           <div className="space-y-2">
             <div className="flex items-center gap-2 w-full">
               <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  multiple
                  onChange={handleFileSelect}
                  {...{ webkitdirectory: "", directory: "" } as any}
                />

               <button 
                 onClick={handleManualSync}
                 disabled={isProcessingFiles}
                 className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
               >
                 {isProcessingFiles ? (
                   <Loader2 size={16} className="animate-spin" />
                 ) : (
                   <>
                     <Upload size={16} />
                     Select Local Folder / Files to Index
                   </>
                 )}
               </button>
             </div>
           </div>
           
           {isProcessingFiles && (
             <div className="text-[10px] text-blue-500 font-medium flex items-center gap-2 animate-pulse pl-1">
               <Loader2 size={10} className="animate-spin" />
               {processingStage}
             </div>
           )}
        </div>

        {/* Content Area */}
        <div className="min-h-[200px] max-h-[400px] overflow-y-auto bg-slate-50/30">
          {paths.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-slate-400 gap-3">
              <div className="p-4 bg-white rounded-full border border-dashed border-slate-300">
                <LayoutGrid size={32} className="text-slate-300" />
              </div>
              <p className="text-xs">No local files indexed yet.</p>
            </div>
          ) : (
            <div className="p-2">
              {/* Folder Headers */}
              {paths.map(path => (
                 <div key={path.id} className="mb-4 bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-start justify-between">
                       <div className="flex items-start gap-2 mr-4 flex-1">
                         <FolderOpen size={14} className="text-amber-500 shrink-0 mt-0.5" />
                         <div className="flex flex-col min-w-0">
                           <span className="text-xs font-bold text-slate-700 break-words leading-tight">{path.name}</span>
                           <span className="text-[10px] text-slate-400 break-all leading-tight mt-1">{path.path}</span>
                         </div>
                       </div>
                       <div className="flex items-center gap-3 shrink-0 mt-0.5">
                         <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                           <CheckCircle2 size={10} /> Active
                         </span>
                         <button onClick={() => onRemove(path.id)} className="text-slate-400 hover:text-red-500">
                           <Trash2 size={14} />
                         </button>
                       </div>
                    </div>
                    {/* Files List */}
                    <div className="divide-y divide-slate-50">
                      {filteredFiles.filter(f => f.sourceId === path.id).length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400 italic">No matching files found.</div>
                      ) : (
                        filteredFiles.filter(f => f.sourceId === path.id).map((file, idx) => (
                          <div key={idx} className="px-4 py-2 flex items-start hover:bg-slate-50 transition-colors group">
                             <div className="w-6 shrink-0 flex justify-center mt-0.5">
                               {getFileIcon(file.mimeType)}
                             </div>
                             <div className="flex-1 min-w-0 ml-3">
                               <p className="text-xs font-medium text-slate-700 break-words leading-tight mb-0.5">{file.name}</p>
                               <p className="text-[10px] text-slate-400 break-all leading-tight">{file.relativePath}</p>
                             </div>
                             <div className="shrink-0 text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                               {(file.data.length / 1024).toFixed(0)} KB
                             </div>
                          </div>
                        ))
                      )}
                    </div>
                 </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseSettings;
