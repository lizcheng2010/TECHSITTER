
import React from 'react';
// Fix: Use Stakeholder interface from types.ts
import { Stakeholder } from '../types';
import { Trash2, Plus, Users, Download } from 'lucide-react';

interface Props {
  // Fix: Use Stakeholder type instead of non-existent Shareholder
  shareholders: Stakeholder[];
  onAdd: (s: Stakeholder) => void;
  onUpdate: (id: string, updates: Partial<Stakeholder>) => void;
  onRemove: (id: string) => void;
}

const ShareholderTable: React.FC<Props> = ({ shareholders, onAdd, onUpdate, onRemove }) => {
  const handleAddNew = () => {
    // Fix: Added missing 'detail' and 'department' properties and removed invalid 'equity' property to conform to Stakeholder interface
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Stakeholder',
      department: 'General',
      role: 'Consultant',
      detail: 'Manual entry.',
      source: 'Manual Entry',
      dateLogged: new Date().toLocaleDateString()
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-slate-600" />
          <h2 className="text-lg font-bold text-slate-800">Shareholder List</h2>
          <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
            {shareholders.length} Records
          </span>
        </div>
        <div className="flex gap-2">
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
        <table className="w-full text-left text-sm border-collapse">
          <thead className="sticky top-0 bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-semibold">Name</th>
              {/* Fix: Replaced invalid Equity header with Department */}
              <th className="px-6 py-3 font-semibold">Department</th>
              <th className="px-6 py-3 font-semibold">Role</th>
              <th className="px-6 py-3 font-semibold">Source Detected</th>
              <th className="px-6 py-3 font-semibold">Logged</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {shareholders.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <input
                    className="bg-transparent border-none focus:ring-1 focus:ring-blue-400 rounded px-1 w-full font-medium text-slate-800"
                    value={s.name}
                    onChange={(e) => onUpdate(s.id, { name: e.target.value })}
                  />
                </td>
                <td className="px-6 py-4">
                  {/* Fix: Replaced invalid 'equity' access and update with 'department' property */}
                  <input
                    className="bg-transparent border-none focus:ring-1 focus:ring-blue-400 rounded px-1 w-full text-slate-600"
                    value={s.department}
                    onChange={(e) => onUpdate(s.id, { department: e.target.value })}
                  />
                </td>
                <td className="px-6 py-4">
                   <input
                    className="bg-transparent border-none focus:ring-1 focus:ring-blue-400 rounded px-1 w-full text-slate-600"
                    value={s.role}
                    onChange={(e) => onUpdate(s.id, { role: e.target.value })}
                  />
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{s.source}</span>
                </td>
                <td className="px-6 py-4 text-xs text-slate-400">{s.dateLogged}</td>
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
            {shareholders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-400 italic">
                  No stakeholders identified yet. Use the agent to analyze documents.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShareholderTable;
