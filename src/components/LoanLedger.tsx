/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  PlusCircle, Award, Landmark, AlertTriangle, Calendar, CheckCircle, Info, Calculator, Sparkles, Check, Copy, RefreshCw, ShieldCheck
} from 'lucide-react';
import { ChamaState, Member, Loan } from '../types';
import { LocalizedTerms } from '../localization';
import { parsePaymentSms } from '../utils/parser';

interface LoanLedgerProps {
  state: ChamaState;
  onDisburseLoan: (memberId: string, principal: number, durationMonths: number, interestRate: number) => Promise<void>;
  onRepayLoan: (loanId: string, amount: number, rawVerificationText?: string) => Promise<void>;
  onApproveLoan: (loanId: string) => Promise<void>;
  onRejectLoan: (loanId: string, remarks?: string) => Promise<void>;
  t: LocalizedTerms;
  currentRole: 'member' | 'treasurer' | 'chairperson';
}

export default function LoanLedger({ 
  state, onDisburseLoan, onRepayLoan, onApproveLoan, onRejectLoan, t, currentRole 
}: LoanLedgerProps) {
  // Disburse Loan States
  const [memberId, setMemberId] = useState('');
  const [principal, setPrincipal] = useState('10000');
  const [durationMonths, setDurationMonths] = useState('1');
  const [interestRate, setInterestRate] = useState('10'); // in percentage, e.g. 10%

  // Installment repayment state
  const [activeRepayLoanId, setActiveRepayLoanId] = useState<string | null>(null);
  const [repayAmount, setRepayAmount] = useState('');
  
  // Strict SMS validation during repayment
  const [repaySmsText, setRepaySmsText] = useState('');
  const [repayParsedProof, setRepayParsedProof] = useState<any>(null);

  const handleRepaySmsChange = (text: string) => {
    setRepaySmsText(text);
    if (!text.trim()) {
      setRepayParsedProof(null);
      return;
    }
    const parsed = parsePaymentSms(text);
    setRepayParsedProof(parsed);
    if (parsed && parsed.isSuccessful && parsed.amount > 0) {
      setRepayAmount(parsed.amount.toString());
    }
  };

  // Feedbacks
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Theoretical Loan Calculator states
  const [calcPrincipal, setCalcPrincipal] = useState('25000');
  const [calcDuration, setCalcDuration] = useState('3');
  const [calcInterestRate, setCalcInterestRate] = useState('10');
  const [copiedFeedback, setCopiedFeedback] = useState(false);

  const handleCopyValues = () => {
    setPrincipal(calcPrincipal);
    setDurationMonths(calcDuration);
    setInterestRate(calcInterestRate);
    setCopiedFeedback(true);
    setTimeout(() => setCopiedFeedback(false), 3000);
  };

  const formatKES = (val: number) => {
    return new Intl.NumberFormat('en-KE', { 
      style: 'currency', 
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(val);
  };

  const selectedMemberObj = state.members.find(m => m.id === memberId);
  const maxBorrow = selectedMemberObj ? selectedMemberObj.totalContributed * 3 : 0;
  
  // Real-time calculation projection
  const pVal = Number(principal) || 0;
  const iRate = (Number(interestRate) || 0) / 100;
  const dMonths = Number(durationMonths) || 1;
  const calculatedInterest = pVal * iRate * dMonths;
  const totalRepayDue = pVal + calculatedInterest;

  // Theoretical Loan Calculator calculations
  const cpVal = Number(calcPrincipal) || 0;
  const cdMonths = Number(calcDuration) || 1;
  const crPercent = Number(calcInterestRate) || 0;
  const crRateDecimal = crPercent / 100;
  
  const calcTotalInterest = cpVal * crRateDecimal * cdMonths;
  const calcTotalDue = cpVal + calcTotalInterest;
  const calcMonthlyPrincipal = cpVal > 0 && cdMonths > 0 ? cpVal / cdMonths : 0;
  const calcMonthlyInterest = cpVal * crRateDecimal;
  const calcTotalMonthlyPayment = calcMonthlyPrincipal + calcMonthlyInterest;

  // Schedule generator
  const calcSchedule = [];
  let remainingCalcPrincipal = cpVal;
  for (let i = 1; i <= cdMonths; i++) {
    const endBal = Math.max(0, remainingCalcPrincipal - calcMonthlyPrincipal);
    calcSchedule.push({
      month: i,
      principalPaid: calcMonthlyPrincipal,
      interestPaid: calcMonthlyInterest,
      totalPayment: calcTotalMonthlyPayment,
      endBalance: i === cdMonths ? 0 : endBal,
    });
    remainingCalcPrincipal = endBal;
  }

  const handleDisburseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!memberId || pVal <= 0 || dMonths <= 0) {
      setErrorMsg('Please select a valid member and non-zero principal.');
      return;
    }

    if (pVal > maxBorrow) {
      setErrorMsg(`Constitutional violation (Rule 2.1): Maximum eligible borrow threshold is 3x contributions. Multiplier cap for ${selectedMemberObj?.name} is KES ${maxBorrow.toLocaleString()}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onDisburseLoan(memberId, pVal, dMonths, iRate);
      setSuccessMsg(`Capital disbursed successfully for ${selectedMemberObj?.name}! Disbursed KES ${pVal.toLocaleString()}`);
      setMemberId('');
      setPrincipal('10000');
    } catch (err: any) {
      setErrorMsg(err.message || 'Disbursement failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeRepayment = async (loanId: string) => {
    setErrorMsg('');
    setSuccessMsg('');
    const amt = Number(repayAmount);

    if (amt <= 0) {
      setErrorMsg('Please supply a positive installment amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onRepayLoan(loanId, amt, repaySmsText);
      setSuccessMsg(`Installment payment of KES ${repayAmount.toLocaleString()} logged and verified in the audit trail.`);
      setActiveRepayLoanId(null);
      setRepayAmount('');
      setRepaySmsText('');
      setRepayParsedProof(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Installment failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="loan-ledger" className="space-y-6 animate-fadeIn text-slate-800">
      {/* Banner Feedback messages */}
      {(errorMsg || successMsg) && (
        <div className="flex flex-col gap-2">
          {errorMsg && (
            <div className="bg-rose-50 text-rose-800 border border-rose-105 text-xs p-4 rounded-xl flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="bg-emerald-50 text-emerald-900 border border-emerald-150 text-xs p-4 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Active borrowing contracts catalog */}
        <div className="lg:col-span-2 bento-card p-6 space-y-6 bg-white">
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight m-0">{t.loanBookTitle}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{t.loanBookDesc}</p>
          </div>

          <div className="space-y-4">
            {state.loans.map((l) => {
              const outstandingWithLateFines = l.outstandingBalance + l.penaltyBalance;
              return (
                <div 
                  key={l.id} 
                  className={`border rounded-2xl p-5 hover:-translate-y-0.5 transition-all duration-250 ${
                    l.status === 'overdue' 
                      ? 'border-rose-200 bg-rose-50/10' 
                      : l.status === 'repaid'
                      ? 'border-slate-100 bg-slate-50/30 opacity-70'
                      : l.status === 'pending_approval'
                      ? 'border-amber-200 bg-amber-50/20'
                      : l.status === 'rejected'
                      ? 'border-stone-200 bg-stone-50/40 opacity-70'
                      : 'border-slate-100 bg-slate-50/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800 text-sm m-0">{l.memberName}</h3>
                        <span className={`text-[9px] uppercase font-bold font-mono tracking-wider px-2 py-0.5 rounded-full border ${
                          l.status === 'overdue' 
                            ? 'bg-rose-50 border-rose-100 text-rose-700' 
                            : l.status === 'repaid'
                            ? 'bg-slate-100 border-slate-200 text-slate-500'
                            : l.status === 'pending_approval'
                            ? 'bg-amber-100 border-amber-200 text-amber-800'
                            : l.status === 'rejected'
                            ? 'bg-stone-105 border-stone-200 text-stone-500'
                            : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                        }`}>
                          {l.status === 'pending_approval' ? '⏳ Pending Approval (Checker)' : l.status === 'rejected' ? '❌ Declined' : l.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono text-slate-400">
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mb-0.5">DISBURSED</span>
                          <span className="font-medium text-slate-600">
                            {l.disbursementDate ? new Date(l.disbursementDate).toLocaleDateString('en-GB') : 'Awaiting Approval'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mb-0.5">DUE MATURITY</span>
                          <span className="font-bold text-slate-700">
                            {l.dueDate ? new Date(l.dueDate).toLocaleDateString('en-GB') : 'Awaiting Approval'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mb-0.5">PRINCIPAL</span>
                          <span className="font-medium text-slate-600">{formatKES(l.principal)}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mb-0.5">COMMITTED INTEREST</span>
                          <span className="font-medium text-slate-600">{formatKES(l.interestOwed)} ({l.interestRate * 100}% flat/mo)</span>
                        </div>
                      </div>
                    </div>

                    {/* Financial totals column */}
                    <div className="text-right space-y-2 self-stretch sm:self-auto flex flex-col justify-between items-end">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mb-0.5">Current Outstanding</span>
                        <span className={`text-base font-extrabold font-sans leading-none block ${l.outstandingBalance > 0 ? 'text-rose-650' : 'text-slate-800'}`}>
                          {formatKES(outstandingWithLateFines)}
                        </span>
                        {l.penaltyBalance > 0 && (
                          <span className="text-[10px] text-rose-500 font-bold block mt-1 tracking-tight">
                            Includes faini ya chelewo {formatKES(l.penaltyBalance)}
                          </span>
                        )}
                      </div>

                      {l.status !== 'repaid' && l.status !== 'pending_approval' && l.status !== 'rejected' && activeRepayLoanId !== l.id && (
                        <button
                          onClick={() => {
                            setActiveRepayLoanId(l.id);
                            setRepayAmount(l.outstandingBalance.toString());
                          }}
                          className="bg-slate-900 hover:bg-slate-850 active:scale-95 text-white text-xs px-3.5 py-1.5 rounded-xl cursor-pointer font-bold transition-all"
                        >
                          {t.repayInstallmentBtn}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Maker-Checker Workflow döntés indicators (Requirement 1) */}
                  {l.status === 'pending_approval' && (
                    <div className="mt-4 p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-3 animate-fadeIn text-amber-900">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4 text-amber-600 animate-pulse" />
                        <span>Work-In-Progress Maker-Checker flow</span>
                      </div>
                      <p className="text-xs leading-relaxed font-sans font-medium text-amber-800">
                        This capital disbursement proposal of <b>{formatKES(l.principal)}</b> was initiated by the Treasurer (Maker). Ready for authorization / sign-off by Chairman (Checker: John Mwangi/Brian Kiprop).
                      </p>

                      {currentRole === 'chairperson' ? (
                        <div className="space-y-2 bg-white/70 border border-amber-200 p-3.5 rounded-xl">
                          <label className="text-[9px] uppercase font-bold text-amber-800 block mb-1">Chairperson Decision Remarks (Optional)</label>
                          <input
                            type="text"
                            id={`remarks-${l.id}`}
                            placeholder="e.g., Confirmed reserves checked. Eligible borrower sign-off okay."
                            className="w-full text-xs p-2.5 bg-white border border-slate-200 focus:outline-none focus:border-amber-500 rounded-lg text-slate-800 font-sans"
                          />
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={async () => {
                                try {
                                  await onApproveLoan(l.id);
                                  alert("Success: Disbursement approved!");
                                } catch (e: any) {
                                  alert(e.message);
                                }
                              }}
                              className="bg-emerald-600 hover:bg-emerald-500 transition-all text-white font-extrabold text-[11px] px-3.5 py-2 rounded-xl cursor-pointer shadow-xs inline-flex items-center gap-1.5 font-sans"
                            >
                              <CheckCircle className="w-4 h-4 font-bold" />
                              <span>Authorize Disbursement</span>
                            </button>
                            <button
                              onClick={async () => {
                                const remVal = (document.getElementById(`remarks-${l.id}`) as HTMLInputElement)?.value;
                                try {
                                  await onRejectLoan(l.id, remVal);
                                  alert("Success: Proposed disbursement declined.");
                                } catch (e: any) {
                                  alert(e.message);
                                }
                              }}
                              className="bg-rose-600 hover:bg-rose-500 transition-all text-white font-extrabold text-[11px] px-3.5 py-2 rounded-xl cursor-pointer inline-flex items-center gap-1.5 font-sans"
                            >
                              <AlertTriangle className="w-4 h-4 text-white" />
                              <span>Decline of Allocation</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[10px] font-bold text-amber-800 bg-white/80 p-2.5 rounded-xl border border-amber-200/50 flex items-center gap-1.5 leading-relaxed">
                          <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Simulation Warning: Change user to <b>Brian Kiprop (Chairperson)</b> in the header bar dropdown to approve or decline this transaction.</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Rejected details status card */}
                  {l.status === 'rejected' && (
                    <div className="mt-4 p-4 bg-stone-50 border border-stone-250 rounded-2xl space-y-1 text-xs text-stone-605">
                      <div className="flex items-center gap-1.5 font-bold text-rose-700 uppercase font-mono text-[9px] tracking-wider">
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                        <span>Disbursement Blocked by Chairman</span>
                      </div>
                      <p className="font-sans text-stone-500 leading-relaxed">
                        The requested disbursement was officially declined from group allocations.
                      </p>
                      {l.rejectionRemarks && (
                        <div className="bg-white border border-stone-100 p-2.5 rounded-lg text-stone-500 font-mono text-[10px] leading-relaxed mt-1">
                          Reason: {l.rejectionRemarks}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Active inline repayment input expansion with Safaricom SMS Paste validation */}
                  {activeRepayLoanId === l.id && (
                    <div className="mt-4 p-4 border border-slate-200 bg-slate-50 rounded-xl space-y-3 animate-fadeIn">
                      <div className="flex flex-col sm:flex-row items-start gap-3 w-full">
                        <div className="w-full sm:w-1/3">
                          <label className="text-[10px] text-slate-500 font-bold block mb-1">Repayment Amount (KES)</label>
                          <input
                            type="number"
                            value={repayAmount}
                            onChange={(e) => setRepayAmount(e.target.value)}
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-505 font-sans"
                          />
                        </div>
                        <div className="w-full sm:w-2/3 space-y-1">
                          <label className="text-[10px] text-indigo-900 font-bold flex items-center gap-1 leading-none">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-550" /> Paste M-Pesa SMS Receipt
                          </label>
                          <textarea
                            rows={1}
                            value={repaySmsText}
                            onChange={(e) => handleRepaySmsChange(e.target.value)}
                            placeholder="e.g. RCA192DJ81 Confirmed..."
                            className="w-full bg-white border border-indigo-200 rounded-lg p-2 text-[10px] leading-relaxed font-mono focus:outline-none focus:border-indigo-505"
                          />
                          {repayParsedProof && (
                            <div className="bg-white border border-indigo-120 p-2.5 rounded-lg text-[10px] font-mono leading-relaxed text-slate-600 animate-fadeIn space-y-0.5">
                              <span className="text-[8px] font-bold text-emerald-800 uppercase block">Extracted Payment Proof Details:</span>
                              <div className="flex gap-4">
                                <span>Code: <b className="text-slate-850 uppercase">{repayParsedProof.transactionId}</b></span>
                                <span>Verified Amt: <b className="text-indigo-800">{formatKES(repayParsedProof.amount)}</b></span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end border-t border-slate-200/50 pt-2.5">
                        <button
                          onClick={() => executeRepayment(l.id)}
                          disabled={isSubmitting}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2 rounded-lg font-bold cursor-pointer transition-all active:scale-95 shadow-sm"
                        >
                          Confirm Repay
                        </button>
                        <button
                          onClick={() => setActiveRepayLoanId(null)}
                          className="bg-transparent text-slate-400 text-xs px-3 py-2 font-bold hover:text-slate-700 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Installments Breakdown with Verified Check Indicators */}
                  {l.installmentsPaid.length > 0 && (
                    <div className="mt-4 border-t border-slate-100 pt-3">
                      <span className="text-[9px] text-slate-400 uppercase font-mono tracking-wider font-semibold block mb-2">History ({l.installmentsPaid.length})</span>
                      <div className="flex flex-wrap gap-2">
                        {l.installmentsPaid.map((inst, index) => (
                          <span key={index} className="bg-slate-100 text-slate-700 text-[10px] px-2.5 py-1 rounded-lg font-mono inline-flex items-center gap-1.5 border border-slate-200/50">
                            <span className="font-semibold">{formatKES(inst.amount)}</span>
                            <span className="text-slate-400">({new Date(inst.date).toLocaleDateString('en-GB')})</span>
                            <span className="text-slate-350">|</span>
                            {/* Verify Check inside repayment history pill */}
                            <span className="text-slate-500 uppercase flex items-center gap-1 font-bold">
                              {inst.verificationEvidence ? <ShieldCheck className="w-3.5 h-3.5 text-indigo-700 font-bold" /> : null}
                              {inst.ref}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column Layout: Credit Facility & Interactive Simulator */}
        <div id="right-panel-column" className="space-y-6">
          {/* Credit Facility Card */}
          <div className="bento-card p-6 bg-slate-50/20 space-y-6 relative overflow-hidden">
            {currentRole === 'member' && <div className="absolute inset-0 bg-stone-100/55 backdrop-blur-[1px] z-10 cursor-not-allowed" />}
            <div>
              <h2 className="text-lg font-bold text-slate-800 m-0 flex items-center gap-2 font-sans tracking-tight">
                <Calculator className="w-5 h-5 text-indigo-600 font-bold" />
                <span>{t.applyLoanTitle}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">{t.applyLoanDesc}</p>
            </div>

            {currentRole === 'member' && (
              <div className="bg-rose-50 text-rose-800 border border-rose-100 p-3.5 rounded-xl text-[11px] leading-relaxed">
                <b>Read-Only Notice:</b> As a standard member, you are prohibited from submitting or proposing new loans. Log in as a Treasurer inside the top user selector.
              </div>
            )}

            <form onSubmit={handleDisburseSubmit} className="space-y-4">
              <fieldset disabled={currentRole === 'member'} className="space-y-4 border-0 p-0 m-0">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">Select Member Borrower</label>
                <select
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-505"
                  required
                >
                  <option value="">-- Choose Member --</option>
                  {state.members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Real-time multiplier widget */}
              {selectedMemberObj && (
                <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-2 text-xs animate-fadeIn">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Savings base:</span>
                    <span className="font-semibold text-slate-800">{formatKES(selectedMemberObj.totalContributed)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-2 font-medium">
                    <span className="text-slate-500 font-semibold">Max eligibility (3x cap):</span>
                    <span className="text-emerald-700 font-extrabold">{formatKES(maxBorrow)}</span>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">Requested Loan Principal (KES)</label>
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-505"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Duration (Months)</label>
                  <input
                    type="number"
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Monthly Interest (%)</label>
                  <input
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. 10"
                    required
                  />
                </div>
              </div>

              {/* Simulated projection card */}
              <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-2 text-xs">
                <h4 className="font-mono text-[9px] text-slate-400 font-bold uppercase tracking-wider m-0">Projected Loan Schedule</h4>
                <div className="flex justify-between text-slate-350">
                  <span>Total Interest Payable:</span>
                  <span className="font-medium font-mono">{formatKES(calculatedInterest)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2 font-bold text-white">
                  <span>Repayment Maturity Owed:</span>
                  <span className="text-amber-400 font-mono text-sm">{formatKES(totalRepayDue)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-900 hover:bg-slate-850 active:scale-95 disabled:bg-slate-200 text-white p-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer mt-2"
              >
                {isSubmitting ? '...' : t.disburseLoanBtn}
              </button>
              </fieldset>
            </form>
          </div>

          {/* Interactive Loan Repayment Calculator widget */}
          <div id="repayment-simulator" className="bento-card p-6 bg-white border border-slate-100 rounded-2xl space-y-5 shadow-sm">
            <div className="flex gap-2.5 items-center">
              <div className="bg-indigo-50 text-indigo-850 p-2.5 rounded-xl border border-indigo-100">
                <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 tracking-tight m-0">{t.estimatorTitle}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{t.estimatorSubtitle}</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Theoretical Principal Input */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-600">Theoretical Principal (KES)</label>
                  <span className="text-xs font-bold font-mono text-indigo-600 bg-indigo-50/50 px-2 py-0.5 rounded-md">{formatKES(cpVal)}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="300000"
                  step="5000"
                  value={calcPrincipal}
                  onChange={(e) => setCalcPrincipal(e.target.value)}
                  className="w-full accent-indigo-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Min KES 5K</span>
                  <span>Max KES 300K</span>
                </div>
              </div>

              {/* Preset buttons */}
              <div className="flex flex-wrap gap-1.5">
                {['10000', '25000', '50000', '100000', '150000'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCalcPrincipal(preset)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg font-mono font-semibold transition-all cursor-pointer border ${
                      calcPrincipal === preset
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 text-slate-500 border-slate-200/60 hover:bg-slate-100'
                    }`}
                  >
                    {formatKES(Number(preset))}
                  </button>
                ))}
              </div>

              {/* Grid block for duration & rate */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label className="text-xs font-semibold text-slate-600">Terms (Months)</label>
                    <span className="text-xs font-bold text-slate-700 font-mono">{cdMonths} mo</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    step="1"
                    value={calcDuration}
                    onChange={(e) => setCalcDuration(e.target.value)}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>1 mo</span>
                    <span>12 mo</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label className="text-xs font-semibold text-slate-600">Monthly Interest</label>
                    <span className="text-xs font-bold text-slate-700 font-mono">{crPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={calcInterestRate}
                    onChange={(e) => setCalcInterestRate(e.target.value)}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>1%</span>
                    <span>20%</span>
                  </div>
                </div>
              </div>

              {/* Preset helper buttons for Interest */}
              <div className="flex flex-wrap gap-1.5">
                {['1', '3', '6', '12'].map((mo) => (
                  <button
                    key={mo}
                    type="button"
                    onClick={() => setCalcDuration(mo)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg font-mono font-semibold transition-all cursor-pointer border ${
                      calcDuration === mo
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-slate-50 text-slate-500 border-slate-200/60 hover:bg-slate-100'
                    }`}
                  >
                    {mo} Month{mo !== '1' ? 's' : ''}
                  </button>
                ))}
                <span className="text-slate-200 font-light text-xs self-center">|</span>
                {['5', '10', '12'].map((ir) => (
                  <button
                    key={ir}
                    type="button"
                    onClick={() => setCalcInterestRate(ir)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg font-mono font-semibold transition-all cursor-pointer border ${
                      calcInterestRate === ir
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-50 text-slate-500 border-slate-200/60 hover:bg-slate-100'
                    }`}
                  >
                    {ir}% Rate
                  </button>
                ))}
              </div>

              {/* Projections breakdown header metrics */}
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium font-sans">Est. Interest:</span>
                  <span className="font-bold font-mono text-slate-700">+{formatKES(calcTotalInterest)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200/60 pt-2 font-semibold font-sans">
                  <span className="text-indigo-600 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    <span>Monthly Repay:</span>
                  </span>
                  <span className="text-sm font-extrabold text-indigo-600 font-mono">
                    {formatKES(calcTotalMonthlyPayment)}/mo
                  </span>
                </div>
              </div>

              {/* Amortization / Monthly installments table/list */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">Installment Run</span>
                  <span className="text-[10px] text-slate-400 font-mono font-semibold">{cdMonths} Periods</span>
                </div>
                
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {calcSchedule.map((item) => (
                    <div key={item.month} className="flex justify-between items-center bg-slate-50/50 p-3 rounded-xl border border-slate-100 text-xs hover:bg-slate-50 transition-colors">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-800">Month {item.month}</div>
                        <div className="text-[9px] text-slate-400 font-mono flex gap-1">
                          <span>Principal: <b className="text-slate-500">{formatKES(item.principalPaid)}</b></span>
                          <span>•</span>
                          <span>Interest: <b className="text-slate-500">{formatKES(item.interestPaid)}</b></span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-indigo-600 font-mono">{formatKES(item.totalPayment)}</div>
                        <div className="text-[9px] text-slate-400 font-mono">Bal: {formatKES(item.endBalance)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interaction actions - Copy parameters & Reset */}
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleCopyValues}
                  className={`flex-1 flex items-center justify-center gap-2 text-xs font-bold py-3 rounded-xl transition-all active:scale-95 cursor-pointer border ${
                    copiedFeedback
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-105'
                  }`}
                >
                  {copiedFeedback ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Applied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{t.applySimBtn}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCalcPrincipal('25000');
                    setCalcDuration('3');
                    setCalcInterestRate('10');
                  }}
                  className="p-3 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/55 rounded-xl transition-colors cursor-pointer"
                  title="Reset Calculator"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
