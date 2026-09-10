import React, { useState, useEffect } from 'react';
import { TraceResult } from '../types';
import Markdown from 'react-markdown';
import { 
  BrainCircuit, 
  RefreshCw, 
  Copy, 
  Check, 
  AlertTriangle, 
  ShieldAlert, 
  MessageSquare, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

interface AiSummaryCardProps {
  traceResult: TraceResult | null;
  onOpenChatWithPrompt?: (prompt: string) => void;
}

export const AiSummaryCard: React.FC<AiSummaryCardProps> = ({
  traceResult,
  onOpenChatWithPrompt
}) => {
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [source, setSource] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const fetchSummary = async () => {
    if (!traceResult) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ traceResult }),
      });
      const data = await res.json();
      if (data.success && data.summary) {
        setSummary(data.summary);
        setSource(data.source || 'gemini-3.8-flash');
      }
    } catch (err) {
      console.error('Failed to fetch AI summary:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (traceResult?.suspectAddress) {
      fetchSummary();
    }
  }, [traceResult?.suspectAddress]);

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!traceResult) return null;

  const isVaspFound = traceResult.found;
  const initialAmount = traceResult.path?.[0]?.amount || traceResult.totalVolumeTraced || 0;
  const terminalAmount = traceResult.targetVasp?.receivedAmount ?? 0;
  const dissipationPercent = initialAmount > 0 
    ? Math.max(0, Math.round(((initialAmount - terminalAmount) / initialAmount) * 100))
    : 0;

  return (
    <div id="ai-summary-container" className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      {/* Header bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 px-6 py-4 flex flex-wrap items-center justify-between gap-3 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>AI Forensic Case Summary</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/25 border border-indigo-400/40 text-indigo-200">
                  <Sparkles className="w-2.5 h-2.5" />
                  {source === 'deterministic_engine' ? 'Automated Heuristic' : source ? source.replace('gemini-', 'Gemini ').replace('-', ' ') : 'Gemini AI'}
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Automated anti-money laundering (AML) pattern decoding & statutory assessment
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            id="ai-summary-copy-btn"
            type="button"
            onClick={handleCopy}
            disabled={!summary || isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors disabled:opacity-50"
            title="Copy forensic summary"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Brief'}</span>
          </button>

          <button
            id="ai-summary-refresh-btn"
            type="button"
            onClick={fetchSummary}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Analyzing...' : 'Regenerate'}</span>
          </button>
        </div>
      </div>

      {/* Forensic Intelligence KPI Ribbon */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-slate-500 block text-[11px]">Laundering Severity</span>
          <span className="font-bold flex items-center gap-1 mt-0.5">
            {isVaspFound ? (
              <span className="text-red-700 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                CRITICAL (Active CEX Deposit)
              </span>
            ) : (
              <span className="text-amber-700 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                LOW RISK (Decoy Stagnant)
              </span>
            )}
          </span>
        </div>

        <div>
          <span className="text-slate-500 block text-[11px]">Obfuscation Strategy</span>
          <span className="font-bold text-slate-800 mt-0.5 block truncate">
            {isVaspFound ? 'Peel Chain + Mule Layering' : 'Dead-end DeFi Liquidity'}
          </span>
        </div>

        <div>
          <span className="text-slate-500 block text-[11px]">Asset Flow Loss</span>
          <span className="font-bold text-slate-800 mt-0.5 block">
            {isVaspFound ? `${dissipationPercent}% Dissipation / Splits` : '0% (Unhosted Pool)'}
          </span>
        </div>

        <div>
          <span className="text-slate-500 block text-[11px]">Recommended Remedy</span>
          <span className="font-bold text-blue-700 mt-0.5 block truncate">
            {isVaspFound ? 'BNSS 2023 § 94 Freeze' : 'Address Surveillance Watch'}
          </span>
        </div>
      </div>

      {/* Main Content: Markdown Summary */}
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-3 py-4 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/3" />
            <div className="h-3 bg-slate-200 rounded w-full" />
            <div className="h-3 bg-slate-200 rounded w-5/6" />
            <div className="h-3 bg-slate-200 rounded w-4/6" />
            <div className="pt-2 h-4 bg-slate-200 rounded w-1/4" />
            <div className="h-3 bg-slate-200 rounded w-11/12" />
          </div>
        ) : summary ? (
          <div className="text-slate-700 text-xs sm:text-sm leading-relaxed prose prose-sm max-w-none prose-headings:text-slate-900 prose-headings:font-bold prose-h3:text-sm prose-h3:mt-4 prose-h3:mb-2 prose-h4:text-xs prose-h4:text-slate-800 prose-h4:mt-3 prose-h4:mb-1 prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5 prose-code:text-blue-700 prose-code:bg-blue-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-[11px]">
            <Markdown>{summary}</Markdown>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500 text-xs">
            Select a suspect wallet address to generate an AI forensic intelligence summary.
          </div>
        )}

        {/* Quick Question Prompts for Chat */}
        {onOpenChatWithPrompt && (
          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                Interrogate this case with AI:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onOpenChatWithPrompt("Explain the peel chain and layering technique detected in this trace.")}
                className="text-left text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5"
              >
                <span>Explain the peel chain technique</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => onOpenChatWithPrompt("How should law enforcement enforce Section 94 BNSS for this specific VASP deposit?")}
                className="text-left text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5"
              >
                <span>Draft legal requisitions under BNSS § 94</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => onOpenChatWithPrompt("What specific KYC and IP records should we demand from the exchange?")}
                className="text-left text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5"
              >
                <span>List subpoena items for the VASP</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
