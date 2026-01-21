
import React, { useState, useCallback, useEffect } from 'react';
import { Stakeholder, KBPath, RAGSource, AgentResult } from './types';
import { querySitterAgent, extractStakeholdersFromKB } from './services/geminiService';
import KnowledgeBaseSettings from './components/KnowledgeBaseSettings';
import RAGSettings from './components/RAGSettings';
import StakeholderTable from './components/StakeholderTable';
import { 
  Send, 
  MessageSquare, 
  Settings, 
  Search, 
  Baby, 
  Menu, 
  X, 
  Loader2,
  ExternalLink,
  ChevronRight,
  Globe
} from 'lucide-react';

const App: React.FC = () => {
  // State for Settings
  const [kbPaths, setKbPaths] = useState<KBPath[]>([]);
  const [ragSources, setRagSources] = useState<RAGSource[]>([
    { id: '2', name: 'Adobe Commerce (Magento)', url: 'https://experienceleague.adobe.com/en/docs/commerce', active: true }
  ]);

  // State for Agent Activity
  const [country, setCountry] = useState('');
  const [question, setQuestion] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [isGeneratingStakeholders, setIsGeneratingStakeholders] = useState(false);
  const [lastResult, setLastResult] = useState<AgentResult | null>(null);

  // State for Stakeholder List (Empty init as requested)
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);

  // Sidebar visibility on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleQuery = async () => {
    if (!country || !question) return;
    setIsQuerying(true);
    try {
      const result = await querySitterAgent(country, question, kbPaths, ragSources);
      setLastResult(result);
    } catch (err) {
      alert("Failed to reach agent. Check API Key in environment.");
    } finally {
      setIsQuerying(false);
    }
  };

  const handleGenerateStakeholders = async () => {
    setIsGeneratingStakeholders(true);
    try {
      const results = await extractStakeholdersFromKB(kbPaths);
      const newEntries: Stakeholder[] = results.map(s => ({
        id: Math.random().toString(36).substr(2, 9),
        name: s.name || 'Unknown',
        region: s.region || 'Global',
        department: s.department || 'Unknown',
        role: s.role || 'Stakeholder',
        detail: s.detail || 'Contextually identified from KB.',
        source: s.source || 'KB Analysis',
        dateLogged: new Date().toLocaleDateString()
      }));
      setStakeholders(prev => [...prev, ...newEntries]);
    } catch (err) {
      console.error(err);
      alert("Failed to generate stakeholders.");
    } finally {
      setIsGeneratingStakeholders(false);
    }
  };

  const addKBPath = (path: KBPath) => setKbPaths([...kbPaths, path]);
  const removeKBPath = (id: string) => setKbPaths(kbPaths.filter(p => p.id !== id));
  
  const toggleRAGSource = (id: string) => {
    setRagSources(ragSources.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const updateStakeholder = (id: string, updates: Partial<Stakeholder>) => {
    setStakeholders(stakeholders.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const removeStakeholder = (id: string) => {
    setStakeholders(stakeholders.filter(s => s.id !== id));
  };

  const addStakeholder = (s: Stakeholder) => setStakeholders([...stakeholders, s]);

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar Controls */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg text-white">
                <Baby size={24} />
              </div>
              <h1 className="text-xl font-black tracking-tight text-slate-800">SITTER</h1>
            </div>
            <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Knowledge Base</h2>
                <Settings size={14} className="text-slate-400" />
              </div>
              <KnowledgeBaseSettings 
                paths={kbPaths} 
                onAdd={addKBPath} 
                onRemove={removeKBPath} 
              />
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">RAG Setup</h2>
                <Settings size={14} className="text-slate-400" />
              </div>
              <RAGSettings 
                sources={ragSources} 
                onToggle={toggleRAGSource} 
              />
            </section>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <p className="text-[10px] text-slate-400 font-medium text-center">
              AGENT V1.3.1 • BUILT WITH GEMINI 3 FLASH
            </p>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 hover:bg-slate-100 rounded" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600">
              <span>Technical Support Dashboard</span>
              <ChevronRight size={14} />
              <span className="text-blue-600 font-bold">Query Console</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="h-8 w-8 rounded-full bg-slate-200 border border-slate-300"></div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Agent Input Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-blue-100 text-blue-600 rounded">
                    <MessageSquare size={18} />
                  </div>
                  <h3 className="font-bold text-slate-800">Support Inquiry</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                   <div className="sm:col-span-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Client Country</label>
                    <div className="relative">
                      <Globe size={16} className="absolute left-3 top-2.5 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="USA"
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Client Question</label>
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Describe the technical issue here..."
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                      />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleQuery}
                  disabled={isQuerying || !country || !question}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
                >
                  {isQuerying ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <Send size={18} />
                      Generate Response
                    </>
                  )}
                </button>
              </div>

              {/* Agent Output - 2 Columns */}
              {lastResult && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white rounded-2xl border border-blue-100 shadow-md shadow-blue-500/5 overflow-hidden">
                    <div className="bg-blue-600 px-6 py-3 flex items-center justify-between">
                      <span className="text-white text-xs font-black uppercase tracking-widest">Sitter Response</span>
                      <div className="flex gap-2">
                        <button className="text-white/80 hover:text-white transition-colors"><ExternalLink size={16} /></button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                      {/* English Column */}
                      <div className="p-6">
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">English</h4>
                        <div className="prose prose-sm prose-slate max-w-none">
                          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{lastResult.answerEnglish}</p>
                        </div>
                      </div>

                      {/* Traditional Chinese Column */}
                      <div className="p-6 bg-slate-50/50">
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Traditional Chinese (CHT)</h4>
                        <div className="prose prose-sm prose-slate max-w-none">
                          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{lastResult.answerChinese}</p>
                        </div>
                      </div>
                    </div>

                    {lastResult.groundingUrls.length > 0 && (
                      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Verification Sources</h4>
                        <div className="flex flex-wrap gap-2">
                          {lastResult.groundingUrls.map((url, idx) => (
                            <a 
                              key={idx}
                              href={url.uri}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 text-[10px] bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 px-2 py-1 rounded-full border border-slate-200 hover:border-blue-200 transition-all shadow-sm"
                            >
                              <Globe size={10} />
                              {url.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Side Analytics / Snapshot */}
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
                <h3 className="font-bold text-lg mb-4">Live Insights</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="text-xs text-white/60">Active KB Paths</div>
                    <div className="font-bold text-lg">{kbPaths.length}</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="text-xs text-white/60">RAG Sources</div>
                    <div className="font-bold text-lg">{ragSources.filter(s => s.active).length}</div>
                  </div>
                   <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="text-xs text-white/60">Stakeholders Logged</div>
                    <div className="font-bold text-lg">{stakeholders.length}</div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-blue-600/20 border border-blue-500/30 rounded-xl">
                  <p className="text-[11px] text-blue-200 italic leading-snug">
                    "The agent now provides bilingual responses and separate stakeholder discovery from knowledge base sources."
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stakeholder Table (Main Section) */}
          <div className="min-h-[400px]">
            <StakeholderTable 
              stakeholders={stakeholders}
              isGenerating={isGeneratingStakeholders}
              onGenerate={handleGenerateStakeholders}
              onUpdate={updateStakeholder}
              onRemove={removeStakeholder}
              onAdd={addStakeholder}
            />
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
};

export default App;
