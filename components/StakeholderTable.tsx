
import React from 'react';
import { Stakeholder } from '../types';
import { Trash2, Plus, Users, Download, Info, RefreshCw, Loader2 } from 'lucide-react';

interface Props {
  stakeholders: Stakeholder[];
  isGenerating: boolean;
  onGenerate: () => void;
  onAdd: (s: Stakeholder) => void;
  onUpdate: (id: string, updates: Partial<Stakeholder>) => void;
  onRemove: (id: string) => void;
}

const StakeholderTable: React.FC<Props> = ({ 
  stakeholders, 
  isGenerating, 
  onGenerate, 
  onAdd, 
  onUpdate, 
  onRemove 
}) => {
  const handleAddNew = () => {
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Stakeholder',
      region: 'Global',
      department: 'General / 一般',
      role: 'Consultant / 顧問',
      detail: 'Manual entry. / 手動輸入紀錄',
      source: 'Manual Entry',
      dateLogged: new Date().toLocaleDateString()
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-slate-600" />
          <h2 className="text-lg font-bold text-slate-800">Stakeholder List</h2>
          <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
            {stakeholders.length} Records
          </span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onGenerate}
            disabled={isGenerating}
            className="flex items-center gap-1 text-xs font-semibold bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Generate from KB
          </button>
          <button 
            onClick={handleAddNew}
            className="flex items-center gap-1 text-xs font-semibold bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={14} /> Add Row
          </button>
          <button className="flex items-center gap-1 text-xs font-semibold bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-auto flex-1">
        <table className="w-full text-left text-sm border-collapse min-w-[800px]">
          <thead className="sticky top-0 bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-semibold w-[15%]">Name</th>
              <th className="px-6 py-3 font-semibold w-[10%]">Region</th>
              <th className="px-6 py-3 font-semibold w-[20%]">Department</th>
              <th className="px-6 py-3 font-semibold w-[20%]">Role</th>
              <th className="px-6 py-3 font-semibold w-[25%]">Detail</th>
              <th className="px-6 py-3 font-semibold w-[10%] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stakeholders.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors group align-top">
                <td className="px-6 py-4">
                  <textarea
                    className="bg-transparent border-none focus:ring-1 focus:ring-blue-400 rounded px-1 w-full font-medium text-slate-800 resize-none h-auto overflow-hidden"
                    rows={1}
                    value={s.name}
                    onChange={(e) => onUpdate(s.id, { name: e.target.value })}
                  />
                </td>
                <td className="px-6 py-4">
                  <textarea
                    className="bg-transparent border-none focus:ring-1 focus:ring-blue-400 rounded px-1 w-full text-slate-600 resize-none h-auto overflow-hidden"
                    rows={1}
                    value={s.region}
                    onChange={(e) => onUpdate(s.id, { region: e.target.value })}
                  />
                </td>
                <td className="px-6 py-4">
                  <textarea
                    className="bg-transparent border-none focus:ring-1 focus:ring-blue-400 rounded px-1 w-full text-slate-600 resize-none h-auto whitespace-pre-wrap"
                    rows={3}
                    value={s.department}
                    onChange={(e) => onUpdate(s.id, { department: e.target.value })}
                  />
                </td>
                <td className="px-6 py-4">
                   <textarea
                    className="bg-transparent border-none focus:ring-1 focus:ring-blue-400 rounded px-1 w-full text-slate-600 resize-none h-auto whitespace-pre-wrap"
                    rows={3}
                    value={s.role}
                    onChange={(e) => onUpdate(s.id, { role: e.target.value })}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-start gap-2">
                    <Info size={14} className="mt-1 text-slate-300 shrink-0" />
                    <textarea
                      className="bg-transparent border-none focus:ring-1 focus:ring-blue-400 rounded px-1 w-full text-xs text-slate-500 resize-none h-20 scrollbar-hide whitespace-pre-wrap"
                      value={s.detail}
                      onChange={(e) => onUpdate(s.id, { detail: e.target.value })}
                    />
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => onRemove(s.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {stakeholders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-400 italic">
                  No stakeholders. Click "Generate from KB" to analyze documents.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StakeholderTable;
