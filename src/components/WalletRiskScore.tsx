import React, { useState, useMemo } from 'react';
import { TraceResult, WalletRiskAssessment } from '../types';
import { calculateWalletRiskScore } from '../utils/riskScorer';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Layers, 
  Coins, 
  Flame, 
  Zap, 
  Building2, 
  ChevronDown, 
  ChevronUp, 
  Bot, 
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface WalletRiskScoreProps {
  traceResult: TraceResult | null;
  suspectAddress: string;
  onOpenChatWithPrompt?: (prompt: string) => void;
}

export const WalletRiskScore: React.FC<WalletRiskScoreProps> = ({
  traceResult,
  suspectAddress,
  onOpenChatWithPrompt
}) => {
  const [isDetailsExpanded, setIsDetailsExpanded] = useState<boolean>(false);

  // Compute heuristic score
  const assessment: WalletRiskAssessment = useMemo(() => {
    return calculateWalletRiskScore(traceResult, suspectAddress);
  }, [traceResult, suspectAddress]);

  // Visual styling according to Risk Level
  const config = useMemo(() => {
    switch (assessment.level) {
      case 'High':
        return {
          badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
          badgePill: 'bg-rose-600 text-white',
          borderAccent: 'border-rose-200 bg-gradient-to-b from-rose-50/50 to-white',
          scoreText: 'text-rose-700',
          barColor: 'bg-rose-600',
          meterBg: 'bg-rose-100',
          icon: ShieldAlert,
          iconColor: 'text-rose-600',
          label: 'HIGH RISK'
        };
      case 'Medium':
        return {
          badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
          badgePill: 'bg-amber-600 text-white',
          borderAccent: 'border-amber-200 bg-gradient-to-b from-amber-50/40 to-white',
          scoreText: 'text-amber-700',
          barColor: 'bg-amber-500',
          meterBg: 'bg-amber-100',
          icon: AlertTriangle,
          iconColor: 'text-amber-600',
          label: 'MEDIUM RISK'
        };
      case 'Low':
      default:
        return {
          badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          badgePill: 'bg-emerald-600 text-white',
          borderAccent: 'border-emerald-200 bg-gradient-to-b from-emerald-50/40 to-white',
          scoreText: 'text-emerald-700',
          barColor: 'bg-emerald-600',
          meterBg: 'bg-emerald-100',
          icon: ShieldCheck,
          iconColor: 'text-emerald-600',
          label: 'LOW RISK'
        };
    }
  }, [assessment.level]);

  const IconComponent = config.icon;

  if (!traceResult) {
    return null;
  }

  return (
    <div 
      id="wallet-risk-score-card"
      className={`border rounded-xl shadow-xs overflow-hidden transition-all duration-200 ${config.borderAccent}`}
    >
      {/* Primary Header Summary */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          
          {/* Left: Badge, Title & Executive Summary */}
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl border shrink-0 ${config.badgeBg}`}>
              <IconComponent className={`w-7 h-7 ${config.iconColor}`} />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Heuristic Risk Assessment
                </span>
                
                {/* Prominent High/Medium/Low Badge */}
                <span 
                  id="risk-score-badge"
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide border shadow-2xs ${config.badgeBg}`}
                >
                  <span className={`w-2 h-2 rounded-full ${config.meterBg === 'bg-rose-100' ? 'bg-rose-600 animate-pulse' : 'bg-current'}`} />
                  {config.label}
                </span>

                <span className="text-xs text-slate-400 font-mono">
                  Score: <strong className={config.scoreText}>{assessment.score}/100</strong>
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                Target Wallet Forensic Risk Profile
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                {assessment.summary}
              </p>
            </div>
          </div>

          {/* Right: Score Dial & Gauge */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 bg-white/80 p-4 rounded-xl border border-slate-200/80 shrink-0 min-w-[240px]">
            <div className="w-full">
              <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                <span className="text-slate-500">Composite Risk</span>
                <span className={`font-mono font-bold ${config.scoreText}`}>
                  {assessment.score} / 100
                </span>
              </div>

              {/* Segmented Risk Meter Bar */}
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex relative border border-slate-200">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${config.barColor}`}
                  style={{ width: `${assessment.score}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>0 (Low)</span>
                <span>40 (Med)</span>
                <span>70 (High)</span>
                <span>100</span>
              </div>
            </div>

            {onOpenChatWithPrompt && (
              <button
                type="button"
                onClick={() => onOpenChatWithPrompt(
                  `Explain the ${assessment.level} Risk Score (${assessment.score}/100) computed for wallet ${suspectAddress}. What specific indicators (hop count: ${assessment.hopCount}, volume: ${assessment.totalVolume.toFixed(2)} ETH, mixer exposure: ${assessment.mixerDetected}) drive this rating and how does it support a BNSS §94 freeze requisition?`
                )}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors w-full justify-center"
              >
                <Bot className="w-3.5 h-3.5 text-indigo-600" />
                <span>AI Risk Analysis</span>
              </button>
            )}
          </div>
        </div>

        {/* Heuristic Key Signal Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-200/70">
          {/* Signal 1: Obfuscation Depth */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Hop Depth</span>
            </div>
            <div className="mt-1 text-sm font-bold text-slate-900">
              {assessment.hopCount} Hops
            </div>
            <div className="text-[10px] text-slate-500 truncate">
              {assessment.hopCount >= 5 ? 'Extreme Layering' : assessment.hopCount >= 3 ? 'Moderate Mule Route' : 'Direct Flow'}
            </div>
          </div>

          {/* Signal 2: Average Flow per Hop */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
              <Coins className="w-3.5 h-3.5 text-emerald-600" />
              <span>Avg Flow / Hop</span>
            </div>
            <div className="mt-1 text-sm font-bold text-slate-900 font-mono">
              {assessment.averageAmount.toFixed(2)} ETH
            </div>
            <div className="text-[10px] text-slate-500 truncate">
              Total: {assessment.totalVolume.toFixed(2)} ETH
            </div>
          </div>

          {/* Signal 3: Mixers / Privacy Clusters */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
              <Flame className="w-3.5 h-3.5 text-rose-600" />
              <span>Mixer / Tumbler</span>
            </div>
            <div className="mt-1 text-sm font-bold text-slate-900">
              {assessment.mixerDetected ? (
                <span className="text-rose-600 flex items-center gap-1">
                  Detected
                </span>
              ) : (
                <span className="text-emerald-700">None Flagged</span>
              )}
            </div>
            <div className="text-[10px] text-slate-500 truncate font-mono">
              {assessment.mixerNames.length > 0 ? assessment.mixerNames.join(', ') : 'Clean Transparent Lineage'}
            </div>
          </div>

          {/* Signal 4: Velocity / Transit Cadence */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Transit Velocity</span>
            </div>
            <div className="mt-1 text-sm font-bold text-slate-900">
              {assessment.rapidVelocity ? 'Automated Script' : 'Standard Flow'}
            </div>
            <div className="text-[10px] text-slate-500 truncate">
              {assessment.rapidVelocity ? 'Compressed Hours' : 'Distributed Timing'}
            </div>
          </div>
        </div>

        {/* Toggle Detailed Heuristic Indicators Breakdown */}
        <div className="mt-4 pt-3 flex items-center justify-between border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Heuristics evaluated: <strong>5 vectors</strong> • Detected high-impact markers: <strong>{assessment.factors.filter(f => f.detected && f.severity === 'high').length}</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            <span>{isDetailsExpanded ? 'Hide Factor Breakdown' : 'View Heuristic Factor Breakdown'}</span>
            {isDetailsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Factor Breakdown Section */}
      {isDetailsExpanded && (
        <div className="bg-slate-50/80 border-t border-slate-200 p-5 sm:p-6 space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Forensic Risk Vectors & Empirical Findings
            </h3>
            <p className="text-xs text-slate-500">
              Each heuristic vector examines cryptographic and structural properties to quantify evasion probability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {assessment.factors.map((factor) => {
              const isDetected = factor.detected;
              return (
                <div 
                  key={factor.id}
                  className={`p-3.5 rounded-lg border bg-white shadow-2xs transition-all ${
                    isDetected && factor.severity === 'high'
                      ? 'border-rose-200 ring-1 ring-rose-100'
                      : isDetected && factor.severity === 'medium'
                      ? 'border-amber-200'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-900">
                      {isDetected && factor.severity === 'high' ? (
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      ) : isDetected ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                      <span>{factor.name}</span>
                    </div>

                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      factor.scoreImpact > 20 
                        ? 'bg-rose-100 text-rose-800' 
                        : factor.scoreImpact > 0 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      +{factor.scoreImpact} pts
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-2">
                    {factor.description}
                  </p>

                  <div className="bg-slate-50 rounded px-2.5 py-1 text-[11px] font-mono text-slate-700 border border-slate-200/80">
                    <strong className="font-semibold text-slate-900">Evidence:</strong> {factor.evidence}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Statutory Action Recommendation Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Investigative Guidance under BNSS 2023 §94
              </span>
              <p className="text-xs text-slate-700">
                {assessment.statutoryAdvice}
              </p>
            </div>
            
            {assessment.terminalVaspReached && (
              <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Target VASP: {assessment.terminalVaspName}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
