import React, { useState } from 'react';
import { TraceResult } from '../types';
import { Download, FileText, ArrowRight, Copy, Check, ShieldCheck, Building2, Clock, AlertTriangle, Bookmark } from 'lucide-react';
import { generateBnssSection94Pdf } from '../utils/pdfGenerator';

interface HopTableProps {
  traceResult: TraceResult | null;
  onOpenNoticeModal: () => void;
  onToggleBookmark?: (address: string, label: string, category: 'suspect' | 'mule' | 'vasp') => void;
  isBookmarked?: (address: string) => boolean;
}

export const HopTable: React.FC<HopTableProps> = ({ 
  traceResult, 
  onOpenNoticeModal,
  onToggleBookmark,
  isBookmarked
}) => {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  if (!traceResult) {
    return (
      <div id="hop-table-empty" className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-xs mt-6">
        <p className="text-sm">Select a suspect wallet address above and click <strong>"Run BFS Trace"</strong> to generate the forensic hop-by-hop ledger trail.</p>
      </div>
    );
  }

  if (!traceResult.found) {
    return (
      <div id="hop-table-not-found" className="bg-amber-50/70 border border-amber-200 rounded-xl p-6 text-slate-800 shadow-xs mt-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-amber-100 text-amber-700 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-base">No VASP Reached Within Graph Depth</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              The Breadth-First Search traversed {traceResult.visitedCount} connected wallet nodes originating from <code className="bg-white px-1.5 py-0.5 rounded border border-amber-200 font-mono text-amber-800">{traceResult.suspectAddress}</code>. The funds in this branch terminate in unhosted cold wallets or smart contract liquidity pools without landing in a regulated Virtual Asset Service Provider.
            </p>
            <p className="text-xs text-amber-700 mt-2 font-medium">
              Tip: Select <strong>Primary Suspect (0x71C839...)</strong> or <strong>Suspect 2 (0x992334...)</strong> to observe successful multi-hop traces hitting Binance or CoinDCX.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const vasp = traceResult.targetVasp;

  return (
    <div id="hop-table-container" className="space-y-6 mt-6">
      {/* Target VASP Identified Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-emerald-200/60 text-emerald-800 rounded">
                Target VASP Ingress Identified
              </span>
              <span className="text-xs text-slate-500">({traceResult.totalHops} Hops Traversed)</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              {vasp?.name} Exchange Hotwallet
            </h3>
            <p className="text-xs text-slate-600 font-mono mt-0.5">
              Deposit Wallet: <span className="text-emerald-800 font-semibold">{vasp?.address}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons: Generate PDF & Preview Notice */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button
            id="preview-bnss-notice-btn"
            type="button"
            onClick={onOpenNoticeModal}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-2xs transition-colors"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Preview BNSS Notice</span>
          </button>

          <button
            id="generate-pdf-report-btn"
            type="button"
            onClick={() => generateBnssSection94Pdf(traceResult)}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Generate Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Hop Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Hop-by-Hop Financial Flow Trail</h3>
            <p className="text-xs text-slate-500">Auditable transaction lineage from suspect origin to regulated gateway</p>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Total Flow: <span className="font-semibold text-slate-900">{traceResult.totalVolumeTraced} ETH</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th scope="col" className="px-5 py-3">Hop</th>
                <th scope="col" className="px-4 py-3">Origin Wallet</th>
                <th scope="col" className="px-2 py-3 text-center">Flow</th>
                <th scope="col" className="px-4 py-3">Destination Wallet & Classification</th>
                <th scope="col" className="px-4 py-3 text-right">Amount</th>
                <th scope="col" className="px-4 py-3">Timestamp (UTC)</th>
                <th scope="col" className="px-4 py-3 text-center">Tx Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {traceResult.path.map((hop) => {
                const isTerminal = hop.isTerminalVasp;
                return (
                  <tr
                    key={hop.hopNumber}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isTerminal ? 'bg-emerald-50/40 font-medium' : ''
                    }`}
                  >
                    {/* Hop badge */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                        isTerminal 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        Hop #{hop.hopNumber}
                      </span>
                    </td>

                    {/* From Address */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center space-x-1.5 font-mono">
                        <span className="text-slate-900 font-medium" title={hop.fromAddress}>
                          {hop.fromAddress.substring(0, 8)}...{hop.fromAddress.substring(hop.fromAddress.length - 4)}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(hop.fromAddress)}
                          className="text-slate-400 hover:text-slate-600 p-0.5 rounded hover:bg-slate-100 transition-colors"
                          title="Copy address"
                        >
                          {copiedAddress === hop.fromAddress ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        {onToggleBookmark && (
                          <button
                            type="button"
                            onClick={() => onToggleBookmark(hop.fromAddress, hop.fromLabel || `Origin Hop #${hop.hopNumber}`, 'mule')}
                            className={`p-0.5 rounded hover:bg-slate-100 transition-colors ${
                              isBookmarked && isBookmarked(hop.fromAddress)
                                ? 'text-blue-600'
                                : 'text-slate-300 hover:text-blue-600'
                            }`}
                            title={isBookmarked && isBookmarked(hop.fromAddress) ? 'Remove bookmark' : 'Bookmark address for re-tracing'}
                          >
                            <Bookmark className={`w-3 h-3 ${isBookmarked && isBookmarked(hop.fromAddress) ? 'fill-blue-600' : ''}`} />
                          </button>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-sans mt-0.5">
                        {hop.fromLabel || 'External Wallet'}
                      </div>
                    </td>

                    {/* Arrow */}
                    <td className="px-2 py-3.5 text-center text-slate-400">
                      <ArrowRight className="w-3.5 h-3.5 mx-auto" />
                    </td>

                    {/* To Address */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center space-x-1.5 font-mono">
                        <span className={`font-medium ${isTerminal ? 'text-emerald-800 font-bold' : 'text-slate-900'}`} title={hop.toAddress}>
                          {hop.toAddress.substring(0, 8)}...{hop.toAddress.substring(hop.toAddress.length - 4)}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(hop.toAddress)}
                          className="text-slate-400 hover:text-slate-600 p-0.5 rounded hover:bg-slate-100 transition-colors"
                          title="Copy address"
                        >
                          {copiedAddress === hop.toAddress ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        {onToggleBookmark && (
                          <button
                            type="button"
                            onClick={() => onToggleBookmark(
                              hop.toAddress, 
                              isTerminal ? `Target VASP: ${hop.vaspName}` : (hop.toLabel || `Mule Hop #${hop.hopNumber}`),
                              isTerminal ? 'vasp' : 'mule'
                            )}
                            className={`p-0.5 rounded hover:bg-slate-100 transition-colors ${
                              isBookmarked && isBookmarked(hop.toAddress)
                                ? 'text-blue-600'
                                : 'text-slate-300 hover:text-blue-600'
                            }`}
                            title={isBookmarked && isBookmarked(hop.toAddress) ? 'Remove bookmark' : 'Bookmark address for re-tracing'}
                          >
                            <Bookmark className={`w-3 h-3 ${isBookmarked && isBookmarked(hop.toAddress) ? 'fill-blue-600' : ''}`} />
                          </button>
                        )}
                      </div>
                      <div className="mt-0.5 font-sans">
                        {isTerminal ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                            <ShieldCheck className="w-3 h-3 text-emerald-700" />
                            TARGET VASP: {hop.vaspName}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500">
                            {hop.toLabel || 'Intermediary Mule'}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap font-mono font-semibold text-slate-900">
                      {hop.amount.toFixed(2)} {hop.currency}
                    </td>

                    {/* Timestamp */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{hop.timestamp.replace(' UTC', '')}</span>
                      </div>
                    </td>

                    {/* Tx Hash */}
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(hop.txHash)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono text-[10px] transition-colors"
                        title="Copy Tx Hash"
                      >
                        <span>{hop.txHash.substring(0, 6)}...{hop.txHash.substring(hop.txHash.length - 4)}</span>
                        {copiedAddress === hop.txHash ? (
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-2.5 h-2.5 text-slate-400" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
