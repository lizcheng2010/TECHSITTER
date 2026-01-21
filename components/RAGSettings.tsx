
import React from 'react';
import { RAGSource } from '../types';
import { Database, Search, ShoppingCart, ToggleLeft, ToggleRight } from 'lucide-react';

interface Props {
  sources: RAGSource[];
  onToggle: (id: string) => void;
}

const RAGSettings: React.FC<Props> = ({ sources, onToggle }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Database size={16} /> Active RAG Sources
        </h3>
      </div>
      
      <div className="space-y-3">
        {sources.map(source => (
          <div 
            key={source.id} 
            className={`p-3 rounded-lg border transition-all flex items-start justify-between cursor-pointer gap-3 ${
              source.active ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 opacity-60'
            }`}
            onClick={() => onToggle(source.id)}
          >
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className={`p-2 rounded mt-0.5 shrink-0 ${source.active ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                {source.name.toLowerCase().includes('search') ? <Search size={18} /> : <ShoppingCart size={18} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold break-words leading-tight mb-1">{source.name}</p>
                <p className="text-xs text-slate-500 break-all leading-tight">{source.url}</p>
              </div>
            </div>
            <div className="shrink-0 mt-0.5">
              {source.active ? (
                <ToggleRight className="text-indigo-600" size={24} />
              ) : (
                <ToggleLeft className="text-slate-400" size={24} />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700 leading-relaxed italic">
        The agent will automatically prioritize enabled RAG sources during retrieval.
      </div>
    </div>
  );
};

export default RAGSettings;
