/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  PiggyBank, ArrowUpRight, ShieldAlert, Award, HandCoins, 
  Settings, CheckCircle2, AlertTriangle, Send, BellRing, Coins
} from 'lucide-react';
import { ChamaState, Member, Loan } from '../types';
import { LocalizedTerms } from '../localization';

interface DashboardProps {
  state: ChamaState;
  onNavigate: (tab: string) => void;
  onSendReminder: (memberId: string, message: string, channel: 'SMS' | 'WhatsApp') => void;
  t: LocalizedTerms;
}

export default function Dashboard({ state, onNavigate, onSendReminder, t }: DashboardProps) {
  const formatKES = (val: number) => {
    return new Intl.NumberFormat('en-KE', { 
      style: 'currency', 
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(val);
  };

  // Calculations
  const totalSavings = state.members.reduce((acc, m) => acc + m.totalContributed, 0);
  const totalLoansOutstanding = state.loans.reduce((acc, l) => acc + (l.status !== 'repaid' ? l.outstandingBalance : 0), 0);
  const totalPenaltiesOutstanding = state.members.reduce((acc, m) => acc + m.penaltyBalance, 0);
  const activeFloat = totalSavings - totalLoansOutstanding;
  const loanUtilisation = totalSavings > 0 ? (totalLoansOutstanding / totalSavings) * 100 : 0;

  const activeLoans = state.loans.filter(l => l.status === 'active' || l.status === 'overdue');
  const overdueLoans = state.loans.filter(l => l.status === 'overdue');

  const handleQuickReminder = (memberId: string, name: string, balance: number, type: 'loan' | 'contribution') => {
    let msg = "";
    if (type === 'loan') {
      msg = `Kumbukumbu ya Weka: Mary, tafadhali lipa loan yako ya Outstanding Balance KES ${balance.toLocaleString()} iliyopitisha tarehe yake. Shukran.`;
    } else {
      msg = `Kumbukumbu ya Weka: ${name}, kumbuka mchango wetu wa mwezi huu wa KES 2,000 unakaribia tarehe ya kuanza faini. Karibu changa!`;
    }
    onSendReminder(memberId, msg, 'SMS');
  };

  return (
    <div id="weka-dashboard" className="space-y-6 animate-fadeIn text-slate-800">
      {/* Upper Hero Section - Bento-fied Ambient Green / Gradient Card */}
      <div className="bento-card bg-emerald-950 text-white p-8 md:p-10 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-none">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-700 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-teal-500 opacity-10 rounded-full blur-2xl"></div>
        
        <div className="space-y-3 z-10">
          <span className="text-xs tracking-[0.2em] uppercase font-mono text-emerald-400 font-bold block">
            {t.assistantHeader}
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white m-0">
            {t.appName}<span className="text-emerald-400">.ai</span> Capital
          </h1>
          <p className="text-emerald-100/80 text-sm max-w-xl leading-relaxed m-0">
            {t.tagline}
          </p>
        </div>
        <button
          id="btn-trigger-ai"
          onClick={() => onNavigate('agent')}
          className="z-10 bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all text-emerald-950 font-bold px-6 py-3.5 rounded-2xl flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/45 text-sm uppercase tracking-wider whitespace-nowrap"
        >
          <Award className="w-5 h-5 text-emerald-950" />
          {t.talkToAi}
        </button>
      </div>

      {/* Aggregate Stats bento collection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Pooled Savings */}
        <div className="bento-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">{t.savingsLabel}</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="text-2xl font-extrabold tracking-tight text-slate-800">{formatKES(totalSavings)}</div>
            <p className="text-[11px] text-emerald-600 font-semibold m-0">
              {t.savingsDesc}
            </p>
          </div>
        </div>

        {/* Total Credit Ledger (Loans Out) */}
        <div className="bento-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">{t.loansLabel}</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <HandCoins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="text-2xl font-extrabold tracking-tight text-slate-800">{formatKES(totalLoansOutstanding)}</div>
            <p className="text-[11px] text-slate-500 m-0">
              {t.loansDesc}
            </p>
          </div>
        </div>

        {/* Immediate Idle Cash Float */}
        <div className="bento-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">{t.floatLabel}</span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="text-2xl font-extrabold tracking-tight text-slate-800">{formatKES(activeFloat)}</div>
            <p className="text-[11px] text-slate-500 m-0">
              {t.floatDesc}
            </p>
          </div>
        </div>

        {/* Active Overdue Late Fines */}
        <div className="bento-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">{t.fainiLabel}</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="text-2xl font-extrabold tracking-tight text-slate-800">{formatKES(totalPenaltiesOutstanding)}</div>
            <p className="text-[11px] text-rose-600 flex items-center gap-1 m-0 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>{t.fainiDesc}</span>
            </p>
          </div>
        </div>

        {/* Loan Book Utilisation Rate */}
        <div className="bento-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">{t.utilLabel}</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="text-2xl font-extrabold tracking-tight text-slate-800">{loanUtilisation.toFixed(1)}%</div>
            {/* simple micro progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full ${loanUtilisation > 60 ? 'bg-indigo-600' : 'bg-emerald-500'}`} 
                style={{ width: `${Math.min(100, loanUtilisation)}%` }} 
              />
            </div>
            <p className="text-[10px] text-slate-450 mt-1 m-0">{t.utilDesc}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts & Reminders Center (left & mid) */}
        <div className="lg:col-span-2 bento-card p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight m-0">{t.quickActions}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{t.finesWarning}</p>
            </div>
            <span className="bg-amber-50 border border-amber-100 text-amber-800 text-[10px] px-3 py-1 rounded-full font-bold inline-flex items-center gap-1.5 uppercase tracking-wider shrink-0">
              <BellRing className="w-3.5 h-3.5 animate-pulse text-amber-600" />
              <span>{overdueLoans.length + (state.members.length - state.contributions.filter(c => c.cycleId === "cycle-3").length)} Outbox Alert Rings</span>
            </span>
          </div>

          <div className="space-y-4">
            {/* Loan Overdues */}
            {overdueLoans.map((l) => (
              <div key={l.id} className="bg-rose-50/40 border border-rose-100 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-rose-100 text-rose-800 text-[9px] px-2 py-0.5 rounded-full font-mono font-bold tracking-wider">OVERDUE DEBT</span>
                    <h3 className="font-bold text-slate-800 text-sm m-0">{l.memberName}</h3>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed m-0">
                    Constitutional fine triggered due on **{l.dueDate}**. <br />
                    Principal unpaid: <b className="text-slate-700">{formatKES(l.outstandingBalance)}</b> | Late Penalty Added: <b className="text-rose-600">{formatKES(l.penaltyBalance)}</b>.
                  </p>
                </div>
                <div className="flex items-center gap-2 self-end md:self-auto flex-shrink-0">
                  <button
                    onClick={() => handleQuickReminder(l.memberId, l.memberName, l.outstandingBalance, 'loan')}
                    className="bg-rose-600 hover:bg-rose-700 active:scale-95 transition-all text-white text-xs px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 font-bold"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {t.sendNudge}
                  </button>
                </div>
              </div>
            ))}

            {/* Missing Contributions for current cycle (May 2026) */}
            <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50 space-y-4">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 m-0">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Pending Unpaid Circular Round ({t.tabSavings})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {state.members
                  .filter(m => !state.contributions.some(c => c.memberId === m.id && c.cycleId === "cycle-3"))
                  .map(m => (
                    <div key={m.id} className="bg-white border border-slate-100 p-4 rounded-xl flex justify-between items-center text-xs shadow-xs hover:border-emerald-200 transition-colors">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 block">{m.name}</span>
                        <span className="text-slate-400 font-mono text-[10px]">{m.phone}</span>
                      </div>
                      <button
                        onClick={() => handleQuickReminder(m.id, m.name, 2000, 'contribution')}
                        className="bg-slate-900 hover:bg-slate-800 text-white transition-colors px-3 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer"
                      >
                        {t.sendNudge}
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane: M-Pesa Automatic Reconciliation logs summary - Bento Daraja Block */}
        <div className="bento-card p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-slate-800 tracking-tight m-0">{t.recentActivity}</h2>
                <p className="text-xs text-slate-400 mt-0.5">Safaricom webhook API feeds</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mt-2"></div>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {state.mpesaTransactions.slice().reverse().map((tItem) => (
                <div key={tItem.id} className="border border-slate-100 p-3.5 rounded-xl space-y-2 bg-slate-50 hover:bg-slate-100/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-slate-800 font-bold block text-xs">{tItem.id}</span>
                      <span className="text-[10px] text-slate-400 font-mono font-medium block mt-0.5">
                        {new Date(tItem.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} - {new Date(tItem.timestamp).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      tItem.reconciliationStatus === 'auto-matched' 
                        ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' 
                        : tItem.reconciliationStatus === 'flagged-ambiguous'
                        ? 'bg-amber-50 border border-amber-100 text-amber-700'
                        : 'bg-indigo-50 border border-indigo-100 text-indigo-700'
                    }`}>
                      {tItem.reconciliationStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 italic border-l-2 border-slate-200 pl-2 leading-relaxed m-0">
                    "{tItem.rawMessage}"
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium m-0">
                    {tItem.remarks}
                  </p>
                  {tItem.reconciliationStatus === 'flagged-ambiguous' && (
                    <button
                      onClick={() => onNavigate('contributions')}
                      className="w-full text-center bg-slate-900 hover:bg-slate-850 active:scale-95 text-white py-2 rounded-xl text-xs font-bold transition-all cursor-pointer mt-2"
                    >
                      Resolve Incoherence
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

