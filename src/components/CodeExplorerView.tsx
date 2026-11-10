import React, { useState } from 'react';
import { 
  Code2, 
  FileCode, 
  Database, 
  Server, 
  Layout, 
  Settings, 
  Copy, 
  Check, 
  Lightbulb, 
  HelpCircle,
  FolderTree,
  ExternalLink
} from 'lucide-react';
import { SOURCE_CODE_FILES, ProjectFile } from '../data/projectExplanation';

export const CodeExplorerView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(SOURCE_CODE_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-800/40 border border-slate-700/60 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              StockFlow 18-File Codebase & "Thinking Clear" Explorer
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Annotated Architecture
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Explore every backend, database, and frontend file one-by-one with simple English line-by-line mental models.
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="px-3.5 py-2 text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center gap-2 transition-colors self-start md:self-auto"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
          <span>{copied ? 'Copied to Clipboard!' : `Copy ${selectedFile.name}`}</span>
        </button>
      </div>

      {/* Main Two-Column Layout: File Tree & Code Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: File Tree Selector (4 cols) */}
        <div className="lg:col-span-4 bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-700/60">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5 text-indigo-400" />
              Project Files
            </span>
            <span className="text-[10px] text-slate-400">
              {SOURCE_CODE_FILES.length} Files
            </span>
          </div>

          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {SOURCE_CODE_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-indigo-600/20 border border-indigo-500/40 text-white'
                      : 'hover:bg-slate-700/30 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {file.category === 'database' ? (
                      <Database className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />
                    ) : file.category === 'backend' ? (
                      <Server className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                    ) : (
                      <Layout className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                    )}
                  </div>

                  <div className="truncate">
                    <div className="text-xs font-semibold truncate flex items-center gap-1.5">
                      <span>{file.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block truncate">
                      {file.path}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Code Viewer & "Thinking Clear" Breakdown (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* File Card Header & "Thinking Clear" Explanation */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-400 font-bold">
                  {selectedFile.path}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {selectedFile.name}
                </h3>
              </div>
              <span className="self-start sm:self-auto px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-700/60 text-slate-300 border border-slate-600/40">
                {selectedFile.purpose}
              </span>
            </div>

            {/* "Thinking Clear" explanation box */}
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-700/30 space-y-2">
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                Thinking Clear: Why This Code Exists & What It Does
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {selectedFile.thinkingClearExplanation}
              </p>
            </div>

            {/* Technical Interview Insight */}
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-700/30 flex items-start gap-2.5 text-xs">
              <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-emerald-200">Interview Spotlight: </span>
                <span className="text-slate-300">{selectedFile.interviewInsight}</span>
              </div>
            </div>
          </div>

          {/* Syntax-Highlighted Code Viewer */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[11px] text-slate-300">{selectedFile.path}</span>
              <button
                onClick={handleCopy}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy Code'}
              </button>
            </div>

            <div className="p-4 overflow-x-auto max-h-[500px]">
              <pre className="text-xs font-mono text-slate-200 leading-relaxed">
                {selectedFile.code.split('\n').map((line, idx) => (
                  <div key={idx} className="table-row">
                    <span className="table-cell pr-4 text-slate-600 select-none text-right font-mono text-[11px] w-8">
                      {idx + 1}
                    </span>
                    <span className="table-cell whitespace-pre">
                      {line}
                    </span>
                  </div>
                ))}
              </pre>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
