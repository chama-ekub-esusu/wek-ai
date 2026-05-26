/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Sparkles, AlertCircle, Gavel, TrendingUp, HelpCircle, 
  MessageSquare, Brain, FileText, CheckCircle, RefreshCw, Layers 
} from 'lucide-react';
import { ChamaState, ChatMessage, Dispute } from '../types';
import { LocalizedTerms } from '../localization';
import Markdown from 'react-markdown';

interface ChamaAgentProps {
  state: ChamaState;
  onRefreshState: () => void;
  t: LocalizedTerms;
}

export default function ChamaAgent({ state, onRefreshState, t }: ChamaAgentProps) {
  // Current active sub-tab inside Chama Agent
  const [agentMode, setAgentMode] = useState<'chat' | 'arbitrator' | 'growth'>('chat');

  const formatKES = (val: number) => {
    return new Intl.NumberFormat('en-KE', { 
      style: 'currency', 
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(val);
  };

  // Chat States
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "wel-1",
      sender: "assistant",
      text: "Sasa! Niko tayari kusaidia chama yetu kuregulate chapaa na kupiga hesabu ya loan, akiba, na faini zetu. \n\nI can speak **Sheng, Kiswahili, or English**. Try asking me: \n- *'Nani ako na overdue loan mwezi huu?'*\n- *'Nieleze faini ya Mary Atieno kulingana na Katiba Wetu'*\n- *'Show me Weka's total savings contribution weight.'*",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Dispute Arbitrator States
  const [selectedDisputeId, setSelectedDisputeId] = useState<string>('');
  const [isArbitrating, setIsArbitrating] = useState(false);
  const [arbitrationResult, setArbitrationResult] = useState<Dispute | null>(null);

  // New Dispute Filing States
  const [newDisputeMemberId, setNewDisputeMemberId] = useState('');
  const [newDisputeText, setNewDisputeText] = useState('');
  const [isFilingDispute, setIsFilingDispute] = useState(false);

  // Growth Advisor States
  const [isGeneratingGrowth, setIsGeneratingGrowth] = useState(false);
  const [growthAdvice, setGrowthAdvice] = useState<string>('');
  const [growthMetrics, setGrowthMetrics] = useState<any>(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (agentMode === 'chat') {
      scrollToBottom();
    }
  }, [chatMessages, agentMode]);

  // Handle Q&A send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      sender: 'user',
      text: inputText,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsChatLoading(true);

    try {
      // Prepare history to send to server
      const chatHistoryAndInput = [...chatMessages, userMsg].map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: chatHistoryAndInput })
      });

      if (!res.ok) {
        throw new Error('Server returned error matching AI endpoint.');
      }

      const data = await res.json();
      
      setChatMessages(prev => [...prev, {
        id: `chat-${Date.now()}`,
        sender: 'assistant',
        text: data.text || "Poleni, kulikuwa na shida kupata dondoo za AI kwa sasa.",
        timestamp: new Date().toISOString()
      }]);
    } catch (err: any) {
      setChatMessages(prev => [...prev, {
        id: `chat-${Date.now()}`,
        sender: 'assistant',
        text: `Nimepata shida kidogo kuunganisha na server yetu. (Error: ${err.message}). Tafadhali weka mazingira sawa kisha ujaribu tena.`,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Run Formal Arbitration
  const handleRunArbitration = async () => {
    if (!selectedDisputeId) return;
    setIsArbitrating(true);
    setArbitrationResult(null);

    try {
      const res = await fetch('/api/gemini/arbitrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disputeId: selectedDisputeId })
      });

      if (!res.ok) {
        throw new Error('Arbitrator failed to perform desk audit.');
      }

      const data = await res.json();
      setArbitrationResult(data.dispute);
      onRefreshState(); // reload state in parent to get settled dispute
    } catch (err: any) {
      alert(`Arbitration failed: ${err.message}`);
    } finally {
      setIsArbitrating(false);
    }
  };

  // File a New Dispute
  const handleFileDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDisputeMemberId || !newDisputeText.trim()) return;

    setIsFilingDispute(true);
    try {
      const res = await fetch('/api/disputes/file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: newDisputeMemberId, text: newDisputeText })
      });

      if (res.ok) {
        setNewDisputeText('');
        setNewDisputeMemberId('');
        onRefreshState(); // refresh state
        alert("Dispute filed successfully! Under arbitration queue.");
      }
    } catch (err: any) {
      alert(`Error filing dispute: ${err.message}`);
    } finally {
      setIsFilingDispute(false);
    }
  };

  // Generate Growth Portfolio
  const handleGenerateGrowth = async () => {
    setIsGeneratingGrowth(true);
    setGrowthAdvice('');

    try {
      const res = await fetch('/api/gemini/growth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) {
        throw new Error('Failed to query wealth recommendation matrix.');
      }

      const data = await res.json();
      setGrowthAdvice(data.adviceMarkdown);
      setGrowthMetrics(data.metrics);
    } catch (err: any) {
      setGrowthAdvice(`### Error getting portfolio growth advice\n\nCould not fetch response: ${err.message}`);
    } finally {
      setIsGeneratingGrowth(false);
    }
  };

  // Feed pre-selected prompt questions
  const setQuickPrompt = (prompt: string) => {
    setInputText(prompt);
  };

  return (
    <div id="weka-ai-assistant" className="space-y-6 animate-fadeIn">
      {/* Top Tabs inside modern segmented pill container */}
      <div className="flex bg-slate-100/80 p-1.5 rounded-2xl w-full sm:max-w-lg shadow-inner">
        <button
          onClick={() => setAgentMode('chat')}
          className={`flex-1 px-4 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
            agentMode === 'chat' 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          <span>{t.shengChatTab}</span>
        </button>

        <button
          onClick={() => setAgentMode('arbitrator')}
          className={`flex-1 px-4 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
            agentMode === 'arbitrator' 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Gavel className="w-4 h-4 text-indigo-600" />
          <span>{t.arbitratorTab}</span>
        </button>

        <button
          onClick={() => setAgentMode('growth')}
          className={`flex-1 px-4 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
            agentMode === 'growth' 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>{t.growthTab}</span>
        </button>
      </div>

      {/* CORE CHAT TAB */}
      {agentMode === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[580px]">
          {/* Chat feed column */}
          <div className="lg:col-span-3 bento-card flex flex-col justify-between overflow-hidden bg-white">
            {/* Messages body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {chatMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex gap-3 max-w-[85%] ${
                    msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  }`}
                >
                  <div className={`p-4 rounded-3xl text-xs leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-slate-900 text-white rounded-tr-none shadow-md' 
                      : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-none'
                  }`}>
                    {/* Handle markdown rendering inside Assistant responses */}
                    {msg.sender === 'assistant' ? (
                      <div className="markdown-body space-y-2">
                        <Markdown>{msg.text}</Markdown>
                      </div>
                    ) : (
                      <p className="m-0 whitespace-pre-wrap">{msg.text}</p>
                    )}
                    <span className={`block text-[9px] mt-2 text-right font-mono font-bold ${
                      msg.sender === 'user' ? 'text-slate-400' : 'text-slate-400'
                    }`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex gap-2 items-center bg-emerald-50/50 border border-emerald-100/60 px-4 py-3 rounded-2xl text-xs text-slate-600 self-start w-max">
                  <Brain className="w-4 h-4 animate-pulse text-emerald-600" />
                  <span className="font-semibold">AI is analyzing rules & records...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Form footer */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t.chatInputPlaceholder}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-slate-400 font-sans"
                disabled={isChatLoading}
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white rounded-xl px-5 py-3 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-md shadow-emerald-200"
                disabled={isChatLoading}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Quick recommendations shortcut panel */}
          <div className="bento-card p-5 space-y-4 self-start bg-slate-50/30">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest m-0 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>Mapendekezo</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed m-0">Gusa swali lolote kuliuliza moja kwa moja:</p>
            
            <div className="space-y-2 text-xs">
              <button
                onClick={() => setQuickPrompt("Nani amepitisha tarehe ya kulipa loan?")}
                className="w-full text-left bg-white border border-slate-200/80 hover:border-emerald-500 hover:shadow-xs p-3.5 rounded-xl transition-all cursor-pointer block text-slate-700 font-medium"
              >
                "Nani amepitisha tarehe ya kulipa loan?"
              </button>
              <button
                onClick={() => setQuickPrompt("Sheria inasema nini kuhusu faini ya kuchelewa?")}
                className="w-full text-left bg-white border border-slate-200/80 hover:border-emerald-500 hover:shadow-xs p-3.5 rounded-xl transition-all cursor-pointer block text-slate-700 font-medium"
              >
                "Sheria inasema nini kuhusu faini?"
              </button>
              <button
                onClick={() => setQuickPrompt("Piga hesabu ya loan eligibility limit.")}
                className="w-full text-left bg-white border border-slate-200/80 hover:border-emerald-500 hover:shadow-xs p-3.5 rounded-xl transition-all cursor-pointer block text-slate-700 font-medium"
              >
                "Piga hesabu ya loan eligibility limit."
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISPUTE ARBITRATION TAB */}
      {agentMode === 'arbitrator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dispute Resolving center */}
          <div className="lg:col-span-2 bento-card p-6 space-y-6">
            <div className="flex gap-3 items-start border-b border-slate-100 pb-4">
              <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
                <Gavel className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 tracking-tight m-0">Arbitration Desk</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cite exact constitutional rules and transaction timestamps to resolve member disputes dynamically.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Arbitrate</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={selectedDisputeId}
                    onChange={(e) => {
                      setSelectedDisputeId(e.target.value);
                      setArbitrationResult(null);
                    }}
                    className="flex-1 bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-505"
                  >
                    <option value="">-- Choose Dispute --</option>
                    {state.disputes.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.memberName} - "{d.text.substring(0, 45)}..."
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleRunArbitration}
                    disabled={isArbitrating || !selectedDisputeId}
                    className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:bg-slate-200 text-white px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                  >
                    {isArbitrating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        ...
                      </>
                    ) : (
                      <>
                        <Layers className="w-4 h-4" />
                        Run Arbitration
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Dispute Resolution output rendering */}
              {arbitrationResult && (
                <div className="bg-slate-900 border border-slate-800 text-slate-100 p-6 rounded-2xl shadow-lg space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <span className="text-[10px] tracking-wider text-slate-400 font-mono font-bold">OFFICIAL RULING</span>
                    <span className="bg-emerald-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wide">
                      RESOLVED
                    </span>
                  </div>

                  <div className="markdown-body text-xs leading-relaxed space-y-2 mt-2">
                    <Markdown>{arbitrationResult.rulingText || ""}</Markdown>
                  </div>
                </div>
              )}

              {/* Resolved history display if list exists */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block">History</span>
                <div className="space-y-3">
                  {state.disputes.filter(d => d.status === 'resolved').map(d => (
                    <div key={d.id} className="border border-slate-100 p-4.5 rounded-2xl bg-slate-50/50 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-800">{d.memberName}</span>
                        <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-100 text-[10px]">Settled</span>
                      </div>
                      <p className="text-xs text-slate-500 italic m-0">"{d.text}"</p>
                      <div className="bg-white p-4 border border-slate-100 rounded-xl text-[11px] leading-relaxed max-h-[150px] overflow-y-auto font-mono text-slate-600 shadow-inner">
                        {d.rulingText}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: File a new member dispute */}
          <div className="bento-card p-6 self-start space-y-4 bg-slate-50/25">
            <div>
              <h3 className="text-lg font-bold text-slate-800 tracking-tight m-0">Log Dispute</h3>
              <p className="text-xs text-slate-400 mt-0.5">Book a query or penalty objection raised by a colleague</p>
            </div>

            <form onSubmit={handleFileDispute} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Claimant</label>
                <select
                  value={newDisputeMemberId}
                  onChange={(e) => setNewDisputeMemberId(e.target.value)}
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
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Details</label>
                <textarea
                  rows={4}
                  placeholder="Details..."
                  value={newDisputeText}
                  onChange={(e) => setNewDisputeText(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-505 font-sans"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isFilingDispute}
                className="w-full bg-slate-900 hover:bg-slate-850 text-white rounded-xl py-3 text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95"
              >
                File Dispute Query
              </button>
            </form>
          </div>
        </div>
      )}

      {/* GROWTH RECOMMENDATIONS TAB */}
      {agentMode === 'growth' && (
        <div className="bento-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div className="flex gap-3 items-start">
              <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 tracking-tight m-0">Wealth Recommendations Matrix</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dynamic portfolio advice on Money Market Funds, yield benchmarks, credit utilization, and diversification.
                </p>
              </div>
            </div>

            <button
              onClick={handleGenerateGrowth}
              disabled={isGeneratingGrowth}
              className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all text-white text-xs px-5 py-3 rounded-xl font-bold uppercase tracking-wider cursor-pointer shadow-md shadow-emerald-100"
            >
              {isGeneratingGrowth ? '...' : 'Generate Advisory Dossier'}
            </button>
          </div>

          {!growthAdvice && !isGeneratingGrowth && (
            <div className="text-center py-12 space-y-3 max-w-lg mx-auto bg-slate-50/50 rounded-2xl border border-slate-100">
              <RefreshCw className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="font-bold text-slate-800 m-0 text-sm">Interactive Growth Dossier Is Ready</h3>
              <p className="text-xs text-slate-500 leading-relaxed px-6">
                Click the generate button above to run asset allocation audit.
              </p>
            </div>
          )}

          {isGeneratingGrowth && (
            <div className="text-center py-12 space-y-3 max-w-lg mx-auto">
              <Brain className="w-10 h-10 animate-bounce text-emerald-600 mx-auto" />
              <h3 className="font-bold text-slate-800 m-0 text-sm">Analyzing compounding model...</h3>
            </div>
          )}

          {growthAdvice && !isGeneratingGrowth && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left stats quick widget */}
              {growthMetrics && (
                <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-4 self-start">
                  <span className="text-[9px] text-slate-400 font-mono tracking-wider uppercase block font-bold">CURRENT STATS INDICES</span>
                  <div className="space-y-3.5">
                    <div>
                      <span className="text-[10px] text-slate-455 block font-bold">SAVINGS</span>
                      <span className="text-xs font-bold text-slate-800 font-mono mt-0.5 block">{formatKES(growthMetrics.totalSavings)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-455 block font-bold">OUTSTANDING BOOK</span>
                      <span className="text-xs font-bold text-slate-800 font-mono mt-0.5 block">{formatKES(growthMetrics.totalLoansOutstanding)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-555 block font-bold">FLOAT</span>
                      <span className="text-xs font-bold text-emerald-600 font-mono mt-0.5 block">{formatKES(growthMetrics.activeFloat)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Advice markdown output column */}
              <div className="lg:col-span-3 bg-white border border-slate-100 rounded-2xl p-6 shadow-xs overflow-hidden text-slate-800">
                <div className="markdown-body space-y-3 text-xs leading-relaxed max-w-none text-left">
                  <Markdown>{growthAdvice}</Markdown>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
