/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserPlus, Calendar, Phone, Award, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { Member, MemberRole, ChamaState } from '../types';
import { LocalizedTerms } from '../localization';

interface MembersListProps {
  state: ChamaState;
  onAddMember: (name: string, phone: string, role: MemberRole) => Promise<void>;
  t: LocalizedTerms;
  currentRole: MemberRole;
}

export default function MembersList({ state, onAddMember, t, currentRole }: MembersListProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<MemberRole>('member');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatKES = (val: number) => {
    return new Intl.NumberFormat('en-KE', { 
      style: 'currency', 
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim() || !phone.trim()) {
      setError('Please check: Name and phone digits cannot be blank.');
      return;
    }

    // Phone format check matching Kenyan Safaricom (+254...)
    let cleanPhone = phone.trim();
    if (cleanPhone.startsWith('0')) {
      cleanPhone = `+254${cleanPhone.slice(1)}`;
    } else if (cleanPhone.startsWith('254')) {
      cleanPhone = `+${cleanPhone}`;
    } else if (!cleanPhone.startsWith('+')) {
      cleanPhone = `+254${cleanPhone}`;
    }

    setIsSubmitting(true);
    try {
      await onAddMember(name, cleanPhone, role);
      setSuccess(`Success: ${name} ameregister kikamilifu!`);
      setName('');
      setPhone('');
      setRole('member');
    } catch (err: any) {
      setError(err.message || 'Phone collision or entry fault.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="members-management" className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn text-slate-800">
      {/* Left panel: Catalog grid list of active members */}
      <div className="lg:col-span-2 bento-card p-6 space-y-6 bg-white">
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight m-0">{t.memberTable}</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.totalMembersCount} & standing indexes
          </p>
        </div>

        <div className="space-y-4">
          {state.members.map((m) => {
            const memberLoans = state.loans.filter(l => l.memberId === m.id && l.status !== 'repaid');
            const hasArrearsFlags = memberLoans.some(l => l.status === 'overdue') || m.penaltyBalance > 0;
            return (
              <div 
                key={m.id} 
                className={`border rounded-2xl p-5 hover:-translate-y-0.5 transition-all duration-250 ${
                  hasArrearsFlags 
                    ? 'border-amber-200 bg-amber-50/10' 
                    : 'border-slate-100 bg-slate-50/30'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 bg-emerald-100 border border-emerald-200 rounded-xl text-emerald-800 font-extrabold flex items-center justify-center text-xs font-sans self-start uppercase tracking-wider">
                      {m.name.split(' ').map(n=>n[0]).join('')}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800 text-sm m-0">{m.name}</h3>
                        <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold border ${
                          m.role === 'treasurer' 
                            ? 'bg-rose-50 border-rose-100 text-rose-700' 
                            : m.role === 'chairperson' 
                            ? 'bg-indigo-50 border-indigo-100 text-indigo-700' 
                            : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                        }`}>
                          {m.role}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-mono">
                        <span className="flex items-center gap-1 font-medium">
                          <Phone className="w-3.5 h-3.5 text-slate-455" /> {m.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Checked {new Date(m.joinDate).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Account Summary Metrics */}
                  <div className="grid grid-cols-3 gap-4 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-6 w-full sm:w-auto text-right">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-mono uppercase tracking-wider font-bold">Contribution</span>
                      <span className="text-xs font-bold text-slate-800 font-sans">{formatKES(m.totalContributed)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-mono uppercase tracking-wider font-bold">Loans</span>
                      <span className={`text-xs font-bold font-sans ${m.loanBalance > 0 ? 'text-amber-600' : 'text-slate-800'}`}>{formatKES(m.loanBalance)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-mono uppercase tracking-wider font-bold">Fines</span>
                      <span className={`text-xs font-bold font-sans ${m.penaltyBalance > 0 ? 'text-rose-600' : 'text-slate-800'}`}>{formatKES(m.penaltyBalance)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right form panel: Add New Member with strict RBAC lock */}
      <div className="bento-card p-6 self-start space-y-6 bg-slate-50/20 relative overflow-hidden">
        {currentRole === 'member' && <div className="absolute inset-0 bg-stone-100/60 backdrop-blur-[1px] z-10 cursor-not-allowed" />}
        <div>
          <h2 className="text-lg font-bold text-slate-800 m-0 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            <span>{t.addMemberTitle}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {t.kycVerification}
          </p>
        </div>

        {currentRole === 'member' && (
          <div className="bg-rose-50 text-rose-800 border border-rose-100 p-3.5 rounded-xl text-[11px] leading-relaxed">
            <b>Read-Only Locked:</b> Only Chama administrators (Treasurer/Chairman) are approved to enroll new members or set custom system roles.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset disabled={currentRole === 'member'} className="space-y-4 border-0 p-0 m-0">
          {error && (
            <div className="bg-rose-50 text-rose-800 text-xs p-3 rounded-xl border border-rose-100">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-xl border border-emerald-150">
              {success}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">Full Legal Name</label>
            <input 
              type="text" 
              placeholder={t.memberNamePlaceholder} 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 font-sans"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">Phone digits</label>
            <input 
              type="tel" 
              placeholder={t.memberPhonePlaceholder} 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 font-sans"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">{t.selectRole}</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as MemberRole)}
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="member">Standard Member</option>
              <option value="treasurer">Treasurer</option>
              <option value="chairperson">Chairperson</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-slate-900 hover:bg-slate-850 active:scale-95 text-white p-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md mt-2"
          >
            {isSubmitting ? '...' : t.enrollBtn}
          </button>
          </fieldset>
        </form>
      </div>
    </div>
  );
}
