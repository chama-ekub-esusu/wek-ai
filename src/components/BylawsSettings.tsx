/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, ShieldCheck, Edit3, Save, Calendar, RefreshCw 
} from 'lucide-react';
import { ChamaState, BylawRule, MemberRole } from '../types';
import { LocalizedTerms } from '../localization';

interface BylawsSettingsProps {
  state: ChamaState;
  onUpdateBylaw: (id: string, text: string, category?: string, clause?: string) => Promise<void>;
  t: LocalizedTerms;
  currentRole: MemberRole;
}

export default function BylawsSettings({ state, onUpdateBylaw, t, currentRole }: BylawsSettingsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editClause, setEditClause] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEditInit = (b: BylawRule) => {
    setEditingId(b.id);
    setEditText(b.text);
    setEditClause(b.clause);
    setSuccess('');
  };

  const handleSave = async (id: string) => {
    if (!editText.trim()) return;

    setIsSubmitting(true);
    try {
      await onUpdateBylaw(id, editText.trim(), undefined, editClause.trim());
      setSuccess(`Bylaw Clause ${editClause} updated successfully in the system database.`);
      setEditingId(null);
    } catch (err) {
      alert("Error saving constitutional clause.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="bylaws-management" className="space-y-6 animate-fadeIn text-slate-800">
      <div className="bento-card p-6 bg-white flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex gap-3.5 items-start">
          <div className="p-2.5 bg-slate-900 text-slate-100 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight m-0">{t.bylawsConstitutionTitle}</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {t.bylawsSubtitle}
            </p>
          </div>
        </div>
        <span className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] uppercase tracking-wider px-3 py-1 rounded-full font-bold inline-flex items-center gap-1 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Verified Constitution Ledger</span>
        </span>
      </div>

      {success && (
        <div className="bg-emerald-50 text-emerald-900 px-4 py-3 rounded-xl border border-emerald-150 text-xs font-semibold animate-fadeIn">
          {success}
        </div>
      )}

      {/* Grid of bylaws rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {state.bylaws.map((b) => {
          const isEditing = editingId === b.id;
          return (
            <div 
              key={b.id} 
              className={`bento-card p-5 hover:-translate-y-0.5 transition-all duration-250 bg-white flex flex-col justify-between gap-5 ${
                isEditing ? 'border-2 border-indigo-500 ring-2 ring-indigo-50/50' : 'border border-slate-100'
              }`}
            >
              <div className="space-y-3.5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-100 text-slate-700 font-mono font-bold text-xs px-2.5 py-1 rounded-lg border border-slate-200/40">
                      {t.clauseLabel} {isEditing ? '' : b.clause}
                      {isEditing && (
                        <input
                          type="text"
                          value={editClause}
                          onChange={(e) => setEditClause(e.target.value)}
                          className="w-16 bg-white border border-slate-250 rounded-md font-mono p-0.5 text-center focus:outline-none"
                        />
                      )}
                    </span>
                    <span className="text-[9px] text-slate-404 font-mono font-bold uppercase tracking-wider">
                      {b.category}
                    </span>
                  </div>
                  <div className="text-right text-[9px] text-slate-404 font-mono font-semibold tracking-wider bg-slate-100/50 px-2 py-0.5 rounded-full border border-slate-200/20">
                    <span>VERSION: {b.version}</span>
                  </div>
                </div>

                {isEditing ? (
                  <textarea
                    rows={4}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 font-sans leading-relaxed"
                  />
                ) : (
                  <p className="text-xs text-slate-650 leading-relaxed font-sans">{b.text}</p>
                )}
              </div>

              <div className="flex justify-between items-center border-t border-slate-50 pt-3.5">
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-300" />
                  Effective {new Date(b.effectiveDate).toLocaleDateString('en-GB')}
                </span>

                {isEditing ? (
                  <button
                    onClick={() => handleSave(b.id)}
                    disabled={isSubmitting}
                    className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs px-4 py-2 rounded-xl inline-flex items-center gap-1.5 font-bold cursor-pointer transition-all shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{t.saveClauseBtn}</span>
                  </button>
                ) : currentRole === 'chairperson' ? (
                  <button
                    onClick={() => handleEditInit(b)}
                    className="bg-transparent hover:bg-slate-50 active:scale-95 text-slate-750 text-xs px-4 py-2 rounded-xl inline-flex items-center gap-1.5 cursor-pointer font-bold border border-slate-200 transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t.amendBtn}</span>
                  </button>
                ) : (
                  <span className="text-[10px] font-mono font-bold text-slate-405 bg-slate-100/60 border border-slate-200/50 px-2 rounded-md">
                    🔒 Read-Only
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
