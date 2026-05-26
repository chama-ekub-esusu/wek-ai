/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  PlusCircle, RefreshCcw, Landmark, Clock, AlertCircle, 
  HelpCircle, Check, ArrowRightLeft, Smile, Smartphone, ShieldCheck
} from 'lucide-react';
import { ChamaState, Member, ContributionCycle } from '../types';
import { LocalizedTerms } from '../localization';
import { parsePaymentSms } from '../utils/parser';

interface ContributionTrackerProps {
  state: ChamaState;
  onRecordContribution: (memberId: string, cycleId: string, amount: number, paymentMethod: 'M-Pesa' | 'Cash', rawVerificationText?: string) => Promise<void>;
  onSimulateMpesa: (phone: string, name: string, amount: number, actionType: 'contribution' | 'loan-repayment') => Promise<void>;
  onManualReconcile: (transactionId: string, memberId: string, actionType: 'contribution' | 'loan-repayment') => Promise<void>;
  t: LocalizedTerms;
  currentRole: 'member' | 'treasurer' | 'chairperson';
}

export default function ContributionTracker({ 
  state, onRecordContribution, onSimulateMpesa, onManualReconcile, t, currentRole 
}: ContributionTrackerProps) {
  // Manual contribution recording state
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedCycle, setSelectedCycle] = useState('cycle-3'); // May 2026 default
  const [manualAmount, setManualAmount] = useState('2000');
  const [paymentMethod, setPaymentMethod] = useState<'M-Pesa' | 'Cash'>('M-Pesa');
  
  // Strict payment verification states (Deliverable 2)
  const [rawVerificationText, setRawVerificationText] = useState('');
  const [parsedProof, setParsedProof] = useState<any>(null);

  const handleSmsChange = (text: string) => {
    setRawVerificationText(text);
    if (!text.trim()) {
      setParsedProof(null);
      return;
    }
    const parsed = parsePaymentSms(text);
    setParsedProof(parsed);
    if (parsed && parsed.isSuccessful && parsed.amount > 0) {
      setManualAmount(parsed.amount.toString());
    }
  };
  
  // M-Pesa Simulator State
  const [simPhone, setSimPhone] = useState('0712345678'); // Mary's default
  const [simName, setSimName] = useState('MARY A. ATIENO'); // Fuzzy variant of MARY ATIENO
  const [simAmount, setSimAmount] = useState('2000');
  const [simAction, setSimAction] = useState<'contribution' | 'loan-repayment'>('contribution');

  // Manual reconciliation helper states
  const [activeReconcileTx, setActiveReconcileTx] = useState<string | null>(null);
  const [reconcileMemberId, setReconcileMemberId] = useState('');
  const [reconcileAction, setReconcileAction] = useState<'contribution' | 'loan-repayment'>('contribution');

  // Banner feedback states
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatKES = (val: number) => {
    return new Intl.NumberFormat('en-KE', { 
      style: 'currency', 
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(val);
  };

  const currentCycle = state.cycles.find(c => c.id === 'cycle-3');

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    if (!selectedMember || !selectedCycle || !manualAmount) {
      setErrorMessage('Please fill in all manual transaction attributes.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onRecordContribution(selectedMember, selectedCycle, Number(manualAmount), paymentMethod, rawVerificationText);
      const mName = state.members.find(m => m.id === selectedMember)?.name;
      setSuccessMessage(`Savings entry logged for ${mName}! Injected KES ${Number(manualAmount).toLocaleString()}`);
      setSelectedMember('');
      setRawVerificationText('');
      setParsedProof(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit contributions.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!simPhone.trim() || !simName.trim() || !simAmount) {
      setErrorMessage('Please load reasonable simulator values first.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSimulateMpesa(simPhone, simName, Number(simAmount), simAction);
      setSuccessMessage(`Simulated M-Pesa transaction processed! Review Daraja feed to observe matching results.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'M-Pesa simulator malfunction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeReconcile = async (txId: string) => {
    if (!reconcileMemberId) {
      setErrorMessage('Please pick which member this payment belongs to.');
      return;
    }
    setErrorMessage('');
    setSuccessMessage('');

    setIsSubmitting(true);
    try {
      await onManualReconcile(txId, reconcileMemberId, reconcileAction);
      setSuccessMessage('Unmatched cash reconciled and assigned successfully!');
      setActiveReconcileTx(null);
      setReconcileMemberId('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Reconciliation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const flaggedTransactions = state.mpesaTransactions.filter(tItem => tItem.reconciliationStatus === 'flagged-ambiguous');

  return (
    <div id="contribution-tracker" className="space-y-6 animate-fadeIn text-slate-800">
      {/* Banner Feedback */}
      {(errorMessage || successMessage) && (
        <div className="flex flex-col gap-2">
          {errorMessage && (
            <div className="bg-rose-50 text-rose-800 border border-rose-100 text-xs p-4 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span className="font-semibold">{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="bg-emerald-50 text-emerald-900 border border-emerald-150 text-xs p-4 rounded-xl flex items-center gap-3">
              <PlusCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* Overdue/Flagged Transactions Reconciler Section */}
      {flaggedTransactions.length > 0 && (
        <div className="bg-amber-50/40 border border-amber-200 p-6 rounded-3xl space-y-4">
          <div className="flex gap-3.5 items-start">
            <div className="p-2.5 bg-amber-100 text-amber-900 rounded-xl">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 m-0">{t.fuzzyReconcileTitle} ({flaggedTransactions.length})</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {t.fuzzyReconcileDesc}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {flaggedTransactions.map((tx) => (
              <div key={tx.id} className="bg-white border border-slate-100 p-5 rounded-2xl space-y-3 shadow-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-slate-850 font-bold block text-xs">{tx.id}</span>
                    <span className="text-xs text-slate-500 font-sans mt-1 block">
                      Received <b className="text-slate-700">{formatKES(tx.amount)}</b> from <b className="text-slate-700">{tx.senderName}</b> ({tx.senderPhone})
                    </span>
                  </div>
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-amber-200">Flagged</span>
                </div>
                
                <p className="text-[11px] text-slate-500 italic m-0 bg-slate-50 border-l border-slate-200 p-2.5 rounded-r-xl">"{tx.rawMessage}"</p>

                {activeReconcileTx === tx.id ? (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Assign to Member</label>
                      <select
                        value={reconcileMemberId}
                        onChange={(e) => setReconcileMemberId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-indigo-505"
                      >
                        <option value="">-- Choose Member --</option>
                        {state.members.map(m => (
                          <option key={m.id} value={m.id}>{m.name} ({m.phone})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Transaction Purpose</label>
                      <select
                        value={reconcileAction}
                        onChange={(e) => setReconcileAction(e.target.value as any)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-indigo-505"
                      >
                        <option value="contribution">Chama Savings Contribution</option>
                        <option value="loan-repayment">Active Loan Repayment</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 pt-1.5">
                      <button
                        onClick={() => executeReconcile(tx.id)}
                        disabled={isSubmitting}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] px-3.5 py-1.5 rounded-lg font-bold cursor-pointer transition-all active:scale-95"
                      >
                        Confirm Match
                      </button>
                      <button
                        onClick={() => setActiveReconcileTx(null)}
                        className="bg-transparent text-slate-500 hover:text-slate-800 text-[11px] px-3 py-1.5 font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                        setActiveReconcileTx(tx.id);
                        setReconcileMemberId(tx.matchedMemberId || '');
                    }}
                    className="bg-slate-900 hover:bg-slate-850 active:scale-95 text-white text-xs px-4 py-2 rounded-xl font-bold transition-all cursor-pointer"
                  >
                    {t.resolveMatchBtn}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left main: Contributions cycle history logs */}
        <div className="lg:col-span-2 bento-card p-6 bg-white space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight m-0">{t.ledgerHistory}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{t.ledgerDesc}</p>
            </div>
            {currentCycle && (
              <div className="text-right">
                <span className="text-[9px] text-slate-400 block font-mono font-bold tracking-wider">EXPECTED ROUND</span>
                <span className="text-xs font-bold bg-slate-100 text-slate-705 px-3 py-1 rounded-lg block mt-1">
                  {formatKES(currentCycle.expectedAmountPerMember)} per round
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {state.contributions.slice().reverse().map((c) => {
              const memberObj = state.members.find(m => m.id === c.memberId);
              const cycleObj = state.cycles.find(cy => cy.id === c.cycleId);
              return (
                <div key={c.id} className="border border-slate-100 bg-slate-50/40 p-4 rounded-2xl flex flex-col justify-between gap-2.5 hover:border-emerald-300 hover:bg-white transition-all duration-200">
                  <div className="flex items-center justify-between gap-4 w-full">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-200 text-slate-700 font-mono text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full">
                          {cycleObj?.name || 'Round'}
                        </span>
                        <h4 className="font-bold text-slate-850 text-xs m-0">{memberObj?.name || 'Unknown Member'}</h4>
                      </div>
                      <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono">
                        <span>Method: <b className="text-slate-650">{c.paymentMethod}</b></span>
                        {c.mpesaRef && (
                          <span>| Ref: <b className="font-bold text-slate-700 font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded uppercase">{c.mpesaRef}</b></span>
                        )}
                        <span>| {new Date(c.timestamp).toLocaleString('en-GB')}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-extrabold text-slate-850 block font-sans">
                        +{formatKES(c.actualAmountPaid)}
                      </span>
                      <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 justify-end mt-0.5 font-semibold">
                        <Check className="w-3.5 h-3.5" /> Ledger Added
                      </span>
                    </div>
                  </div>

                  {/* Immutable Proof of Payment Receipt Badge (Deliverable 3) */}
                  {c.verificationEvidence && (
                    <div className="bg-indigo-50/40 border border-indigo-100 p-2.5 rounded-xl text-[10px] font-mono leading-relaxed space-y-0.5 animate-fadeIn mt-1 text-indigo-950 flex flex-col">
                      <div className="flex items-center gap-1 font-bold text-indigo-700 text-[9px] uppercase tracking-wider">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-650" />
                        <span>Immutable Proof of Payment receipt</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-slate-500 text-[10px]">
                        <span>Verified Code: <b className="text-indigo-900 font-extrabold font-mono uppercase">{c.verificationEvidence.paymentId}</b></span>
                        <span>Extracted Amount: <b className="text-indigo-900 font-extrabold">{formatKES(c.verificationEvidence.amount)}</b></span>
                        <span>Approved Timestamp: <b className="text-slate-855 font-medium">{c.verificationEvidence.dateStr}</b></span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right forms panel container */}
        <div className="space-y-6">
          {/* Read-Only Member Alert Badge */}
          {currentRole === 'member' && (
            <div className="bg-rose-50 text-rose-800 border border-rose-150 p-4 rounded-2xl text-xs space-y-2 animate-fadeIn shadow-sm">
              <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[10px]">
                <AlertCircle className="w-4 h-4 text-rose-600 animate-pulse" />
                Read-Only Member View (RBAC Rules)
              </div>
              <p className="font-medium text-rose-700 leading-relaxed">
                Bwana/Bibi, you are logged in as a <b>Member</b>. You have strictly read-only access to transparency ledgers. Only a designated <b>Treasurer</b> can log manual entries.
              </p>
            </div>
          )}

          {/* Form 1: Manual Ledger Entry */}
          <div className="bento-card p-6 space-y-4 bg-white relative overflow-hidden">
            {currentRole === 'member' && <div className="absolute inset-0 bg-stone-100/50 backdrop-blur-[1px] z-10 cursor-not-allowed" />}
            <div>
              <h3 className="text-base font-bold text-slate-800 tracking-tight m-0">{t.manualEntryTitle}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{t.manualEntryDesc}</p>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <fieldset disabled={currentRole === 'member'} className="space-y-4 border-0 p-0 m-0">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Select Member</label>
                  <select
                    value={selectedMember}
                    onChange={(e) => setSelectedMember(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500"
                    required
                  >
                    <option value="">-- Choose Member --</option>
                    {state.members.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Cycle Period</label>
                  <select
                    value={selectedCycle}
                    onChange={(e) => setSelectedCycle(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-505"
                  >
                    {state.cycles.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 block">Amount (KES)</label>
                    <input
                      type="number"
                      value={manualAmount}
                      onChange={(e) => setManualAmount(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 block">Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Cash">Physical Cash</option>
                      <option value="M-Pesa">M-Pesa Ledger</option>
                    </select>
                  </div>
                </div>

                {/* IMUTABLE DDaraja SMS Parser Area for Verification Proofs (Requirement 2 / Deliverable 2) */}
                {paymentMethod === 'M-Pesa' && (
                  <div className="space-y-1 bg-indigo-50/40 p-3.5 border border-indigo-120 rounded-2xl animate-slideDown">
                    <label className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 leading-none">
                      <ShieldCheck className="w-4 h-4 text-indigo-650" />
                      Paste Raw Safaricom SMS Receipt
                    </label>
                    <p className="text-[9px] text-indigo-700 font-mono mt-1 mb-2 font-medium">
                      E.g., RCA192DJ81 Confirmed. received KES 2,000.00 from MARY ATIENO...
                    </p>
                    <textarea
                      rows={2}
                      value={rawVerificationText}
                      onChange={(e) => handleSmsChange(e.target.value)}
                      placeholder="e.g. RCA192DJ81 Confirmed. KES 2000.00 received from..."
                      className="w-full bg-white border border-indigo-200 rounded-xl p-2.5 text-[10px] leading-relaxed font-mono focus:outline-none focus:border-indigo-500 placeholder-indigo-300"
                    />
                    {parsedProof && (
                      <div className="mt-2.5 bg-white border border-indigo-100 p-2.5 rounded-xl text-[10px] font-mono space-y-1 animate-fadeIn text-slate-600">
                        <div className="flex items-center gap-1 text-emerald-800 font-extrabold text-[9px]">
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> 
                          {parsedProof.isSuccessful ? 'VERIFIED RECEIPT OK' : 'PARTIAL DETAILS FOUND'}
                        </div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] mt-1 text-slate-500">
                          <div>
                            <span className="block text-[8px] text-slate-400 font-semibold uppercase">CODE</span>
                            <span className="font-extrabold text-indigo-950 uppercase text-slate-700">{parsedProof.transactionId}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] text-slate-400 font-semibold uppercase">EXTRACT VALUE</span>
                            <span className="font-bold text-indigo-700">{formatKES(parsedProof.amount)}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] text-slate-400 font-semibold uppercase">PAYMENT DATE</span>
                            <span>{parsedProof.dateStr}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 hover:bg-slate-850 active:scale-95 disabled:bg-slate-200 text-white p-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer mt-2"
                >
                  {t.bookSavingsBtn}
                </button>
              </fieldset>
            </form>
          </div>

          {/* Form 2: M-Pesa Sandbox Simulator */}
          <div className="bento-card p-6 space-y-4 bg-slate-50/20">
            <div className="flex gap-2.5 items-center">
              <div className="bg-emerald-50 text-emerald-850 p-2 rounded-xl border border-emerald-100">
                <Smartphone className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 tracking-tight m-0">{t.mpesaSandboxTitle}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{t.mpesaSandboxDesc}</p>
              </div>
            </div>

            <form onSubmit={handleSimulationSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">Sender Name (Variant)</label>
                <input
                  type="text"
                  placeholder="e.g. MARY A ATIENO"
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-505 font-sans"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Phone Digits</label>
                  <input
                    type="text"
                    placeholder="e.g. 0712345678"
                    value={simPhone}
                    onChange={(e) => setSimPhone(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-505 font-sans"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Amount (KES)</label>
                  <input
                    type="number"
                    value={simAmount}
                    onChange={(e) => setSimAmount(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-505"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">Transaction Type</label>
                <select
                  value={simAction}
                  onChange={(e) => setSimAction(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-505"
                >
                  <option value="contribution">Chama Savings Round Contribution</option>
                  <option value="loan-repayment">Repay Loan Installment</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:bg-emerald-400 text-white p-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md mt-2 shadow-emerald-50"
              >
                {t.triggerMpesaBtn}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
