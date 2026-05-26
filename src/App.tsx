/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  PiggyBank, HandCoins, Users, Sparkles, MessageSquare, 
  Settings, RefreshCw, FolderLock, FileText, LayoutDashboard, Award, Globe, UserCheck, ShieldCheck
} from 'lucide-react';
import { ChamaState, MemberRole, Member } from './types.js';
import { localizationData, LanguageMode } from './localization.js';

import Dashboard from './components/Dashboard.js';
import MembersList from './components/MembersList.js';
import ContributionTracker from './components/ContributionTracker.js';
import LoanLedger from './components/LoanLedger.js';
import ChamaAgent from './components/ChamaAgent.js';
import BylawsSettings from './components/BylawsSettings.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [lang, setLang] = useState<LanguageMode>(() => {
    const cached = localStorage.getItem('weka_language_mode');
    return (cached as LanguageMode) || 'panAfrican';
  });

  const handleLangChange = (newLang: LanguageMode) => {
    setLang(newLang);
    localStorage.setItem('weka_language_mode', newLang);
  };

  const [state, setState] = useState<ChamaState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorHeader, setErrorHeader] = useState('');

  // Simulated active user session (Maker-Checker & RBAC demo)
  const [simulatedUserId, setSimulatedUserId] = useState<string>(() => localStorage.getItem('sim_user_id') || 'mem-1'); // Default to Esther (Treasurer)
  const [simulatedRole, setSimulatedRole] = useState<MemberRole>(() => (localStorage.getItem('sim_user_role') as MemberRole) || 'treasurer');

  const handleSwitchSessionUser = (memberId: string) => {
    if (!state) return;
    const m = state.members.find(u => u.id === memberId);
    if (m) {
      setSimulatedUserId(m.id);
      setSimulatedRole(m.role);
      localStorage.setItem('sim_user_id', m.id);
      localStorage.setItem('sim_user_role', m.role);
    }
  };

  const t = localizationData[lang];


  // Hydrate state from express server database on load
  const loadState = async () => {
    setIsLoading(true);
    setErrorHeader('');
    try {
      const res = await fetch('/api/state');
      if (!res.ok) throw new Error('Could not synchronize state from the server database.');
      const data = await res.json();
      setState(data);
    } catch (err: any) {
      setErrorHeader(err.message || 'Connecting to backend...');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadState();
  }, []);

  // System Core state-updating API actions

  const handleAddMember = async (name: string, phone: string, role: MemberRole) => {
    const res = await fetch('/api/members/add', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-role': simulatedRole,
        'x-user-id': simulatedUserId
      },
      body: JSON.stringify({ name, phone, role })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to enroll member.');
    }

    const data = await res.json();
    setState(data.state);
  };

  const handleRecordContribution = async (
    memberId: string, 
    cycleId: string, 
    amount: number, 
    paymentMethod: 'M-Pesa' | 'Cash',
    rawVerificationText?: string
  ) => {
    const res = await fetch('/api/contributions/pay', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-role': simulatedRole,
        'x-user-id': simulatedUserId
      },
      body: JSON.stringify({ memberId, cycleId, amount, paymentMethod, rawVerificationText })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Err logging contribution.');
    }

    const data = await res.json();
    setState(data.state);
  };

  const handleDisburseLoan = async (memberId: string, principal: number, durationMonths: number, interestRate: number) => {
    const res = await fetch('/api/loans/disburse', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-role': simulatedRole,
        'x-user-id': simulatedUserId
      },
      body: JSON.stringify({ memberId, principal, durationMonths, interestRate })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed loan allocation.');
    }

    const data = await res.json();
    setState(data.state);
  };

  const handleApproveLoan = async (loanId: string) => {
    const res = await fetch('/api/loans/approve', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-role': simulatedRole,
        'x-user-id': simulatedUserId
      },
      body: JSON.stringify({ loanId })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Loan approval contract failed.');
    }

    const data = await res.json();
    setState(data.state);
  };

  const handleRejectLoan = async (loanId: string, remarks?: string) => {
    const res = await fetch('/api/loans/reject', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-role': simulatedRole,
        'x-user-id': simulatedUserId
      },
      body: JSON.stringify({ loanId, remarks })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Loan rejection contract failed.');
    }

    const data = await res.json();
    setState(data.state);
  };

  const handleRepayLoan = async (loanId: string, amount: number, rawVerificationText?: string) => {
    const res = await fetch('/api/loans/repay', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-role': simulatedRole,
        'x-user-id': simulatedUserId
      },
      body: JSON.stringify({ loanId, amount, rawVerificationText })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Repayment logging fault.');
    }

    const data = await res.json();
    setState(data.state);
  };

  const handleSimulateMpesa = async (phone: string, name: string, amount: number, actionType: 'contribution' | 'loan-repayment') => {
    const res = await fetch('/api/mpesa/c2b-simulate', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-role': simulatedRole,
        'x-user-id': simulatedUserId
      },
      body: JSON.stringify({ senderPhone: phone, senderName: name, amount, actionType })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'M-Pesa simulation backend query fault.');
    }

    const data = await res.json();
    setState(data.state);
  };

  const handleManualReconcile = async (transactionId: string, memberId: string, actionType: 'contribution' | 'loan-repayment') => {
    const res = await fetch('/api/mpesa/reconcile-manual', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-role': simulatedRole,
        'x-user-id': simulatedUserId
      },
      body: JSON.stringify({ transactionId, memberId, actionType })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Reconciliation update error.');
    }

    const data = await res.json();
    setState(data.state);
  };

  const handleSendReminder = async (memberId: string, message: string, channel: 'SMS' | 'WhatsApp') => {
    const res = await fetch('/api/reminders/send', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-role': simulatedRole,
        'x-user-id': simulatedUserId
      },
      body: JSON.stringify({ memberId, message, channel })
    });
    
    if (res.ok) {
      const data = await res.json();
      setState(data.state);
      alert(`Weka Reminder Outbox: Target recipient cell nudged securely via ${channel}!`);
    } else {
      const err = await res.json();
      alert(`Forbidden: ${err.error || 'Failed sending nudge.'}`);
    }
  };

  const handleUpdateBylaw = async (id: string, text: string, category?: string, clause?: string) => {
    const res = await fetch('/api/bylaws/update', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-role': simulatedRole,
        'x-user-id': simulatedUserId
      },
      body: JSON.stringify({ id, text, category, clause })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error updating clause.');
    }
    const data = await res.json();
    setState(data.state);
  };

  const resetState = async () => {
    if (!window.confirm("Je, unataka kurudisha mifumo yote ya chama mwanzoni? All added data will be seeded to demo mode.")) return;
    
    try {
      const res = await fetch('/api/state/reset', { 
        method: 'POST',
        headers: {
          'x-user-role': simulatedRole,
          'x-user-id': simulatedUserId
        }
      });
      const data = await res.json();
      setState(data.state);
      setActiveTab('dashboard');
    } catch (err) {
      alert("Error resetting database.");
    }
  };

  // Safe Loading safeguards
  if (isLoading && !state) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50 text-stone-700">
        <RefreshCw className="w-10 h-10 animate-spin text-emerald-600 mb-4" />
        <h3 className="font-semibold text-stone-900 m-0">Synchronizing Ledger with Weka State Engine...</h3>
        <p className="text-xs text-stone-400 mt-2">Checking Safaricom webhook ports & database file registries.</p>
      </div>
    );
  }

  // Database Connection Down Screen with Retry
  if (errorHeader && !state) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50 text-stone-700 p-6 text-center max-w-md mx-auto space-y-4">
        <FolderLock className="w-12 h-12 text-stone-400" />
        <h3 className="font-semibold text-stone-900 m-0">Connecting to server dev daemon...</h3>
        <p className="text-xs text-stone-500 leading-relaxed">
          Weka is booting up a high-performance Express server behind Cloud Run proxy. This might take 10 seconds.
        </p>
        <button 
          onClick={loadState} 
          className="bg-stone-900 hover:bg-stone-800 text-white rounded-xl px-5 py-2.5 text-xs font-semibold cursor-pointer"
        >
          Check Server Port 3000
        </button>
      </div>
    );
  }

  const activeContent = state ? (
    <>
      {activeTab === 'dashboard' && (
        <Dashboard 
          state={state} 
          onNavigate={setActiveTab} 
          onSendReminder={handleSendReminder}
          t={t}
        />
      )}
      {activeTab === 'members' && (
        <MembersList 
          state={state} 
          onAddMember={handleAddMember}
          t={t}
          currentRole={simulatedRole}
        />
      )}
      {activeTab === 'contributions' && (
        <ContributionTracker 
          state={state} 
          onRecordContribution={handleRecordContribution} 
          onSimulateMpesa={handleSimulateMpesa}
          onManualReconcile={handleManualReconcile}
          t={t}
          currentRole={simulatedRole}
        />
      )}
      {activeTab === 'loans' && (
        <LoanLedger 
          state={state} 
          onDisburseLoan={handleDisburseLoan}
          onRepayLoan={handleRepayLoan}
          onApproveLoan={handleApproveLoan}
          onRejectLoan={handleRejectLoan}
          t={t}
          currentRole={simulatedRole}
        />
      )}
      {activeTab === 'agent' && (
        <ChamaAgent 
          state={state} 
          onRefreshState={loadState}
          t={t}
        />
      )}
      {activeTab === 'bylaws' && (
        <BylawsSettings 
          state={state} 
          onUpdateBylaw={handleUpdateBylaw}
          t={t}
          currentRole={simulatedRole}
        />
      )}
    </>
  ) : null;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-16">
      {/* Header Panel */}
      <header className="sticky top-0 z-50 bg-white border-b border-stone-200 shadow-sm backdrop-blur-md">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 h-18 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-slate-900 text-white font-black text-lg w-9 h-9 flex items-center justify-center rounded-xl shadow font-mono">
              W
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-lg tracking-tight font-sans block leading-none m-0">{t.appName}</span>
              <span className="text-[10px] text-emerald-600 block mt-1 font-mono uppercase tracking-wider">{t.appSubtitle}</span>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
            <button
              id="tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === 'dashboard' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{t.tabDashboard}</span>
            </button>
            <button
              id="tab-members"
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === 'members' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{t.tabMembers}</span>
            </button>
            <button
              id="tab-contributions"
              onClick={() => setActiveTab('contributions')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === 'contributions' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <PiggyBank className="w-4 h-4" />
              <span>{t.tabSavings}</span>
            </button>
            <button
              id="tab-loans"
              onClick={() => setActiveTab('loans')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === 'loans' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <HandCoins className="w-4 h-4" />
              <span>{t.tabLoans}</span>
            </button>
            <button
              id="tab-agent"
              onClick={() => setActiveTab('agent')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 text-emerald-800 ${
                activeTab === 'agent' ? 'bg-emerald-50 text-emerald-950 shadow-sm border border-emerald-100' : 'text-emerald-700 hover:text-emerald-900'
              }`}
            >
              <Award className="w-4 h-4 text-emerald-600" />
              <span>{t.tabChamaAi}</span>
            </button>
            <button
              id="tab-bylaws"
              onClick={() => setActiveTab('bylaws')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === 'bylaws' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{t.tabBylaws}</span>
            </button>
          </nav>

          {/* Action Header controls + Multilingual Voice Switcher */}
          <div className="flex items-center gap-2">
            {/* Simulated Session Selector (RBAC Simulation) */}
            {state && (
              <div className="flex items-center gap-1.5 bg-indigo-50/50 border border-indigo-100 rounded-xl px-2.5 py-1.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-650" />
                <select
                  value={simulatedUserId}
                  onChange={(e) => handleSwitchSessionUser(e.target.value)}
                  className="bg-transparent border-none text-[11px] font-extrabold text-indigo-900 focus:outline-none cursor-pointer pr-1 font-sans"
                  title="Simulated User Session"
                >
                  {state.members.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role === 'chairperson' ? 'Chairperson' : u.role.charAt(0).toUpperCase() + u.role.slice(1)})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-500 animate-spin-slow" />
              <select
                value={lang}
                onChange={(e) => handleLangChange(e.target.value as LanguageMode)}
                className="bg-transparent border-none text-[11px] font-bold text-slate-700 focus:outline-none cursor-pointer pr-1"
                title="Linguistic Personality"
              >
                <option value="panAfrican">🌍 Pan-African Mashup</option>
                <option value="sheng">🇰🇪 Nairobi Sheng</option>
                <option value="swahili">🇹🇿 Swahili Vibe</option>
                <option value="yoruba">🇳🇬 Naija Yoruba</option>
                <option value="amharic">🇪🇹 Amharic (አማርኛ)</option>
                <option value="english">🇬🇧 English Plain</option>
              </select>
            </div>

            <button
              onClick={resetState}
              className="px-3 py-1.5. text-[11px] bg-clear hover:bg-stone-100 text-stone-500 hover:text-stone-900 border border-stone-200 transition-all rounded-xl font-bold cursor-pointer flex items-center gap-1"
              title="Reset Database to original seeds"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">{t.resetBtn}</span>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE TAB NAVIGATOR */}
      <div className="lg:hidden sticky top-18 z-40 bg-white border-b border-stone-150 py-2.5 overflow-x-auto">
        <div className="flex px-4 gap-2 min-w-max">
          {[
            { id: 'dashboard', label: t.tabDashboard, icon: LayoutDashboard },
            { id: 'members', label: t.tabMembers, icon: Users },
            { id: 'contributions', label: t.tabSavings, icon: PiggyBank },
            { id: 'loans', label: t.tabLoans, icon: HandCoins },
            { id: 'agent', label: t.tabChamaAi, icon: Award, className: 'text-emerald-800 bg-emerald-50' },
            { id: 'bylaws', label: t.tabBylaws, icon: FileText }
          ].map((tabItem) => {
            const Icon = tabItem.icon;
            const active = activeTab === tabItem.id;
            return (
              <button
                key={tabItem.id}
                onClick={() => setActiveTab(tabItem.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-all ${
                  active 
                    ? 'bg-stone-900 text-white shadow-sm' 
                    : tabItem.className ? `${tabItem.className} border border-emerald-100` : 'bg-stone-100 text-stone-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tabItem.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Body Core Content Area */}
      <main className="w-full max-w-7xl mx-auto px-4 md:px-8 mt-8">
        {activeContent}
      </main>
    </div>
  );
}
