import React, { useState } from 'react';
import { ShieldAlert, Database, Cpu, ChevronDown, ChevronUp, FileCode } from 'lucide-react';

interface AboutPrototypeProps {
  onOpenPythonScript: () => void;
}

export const AboutPrototype: React.FC<AboutPrototypeProps> = ({ onOpenPythonScript }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div id="about-prototype-card" className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden mb-6">
      <div 
        className="px-6 py-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        id="toggle-about-section-btn"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">About This Prototype</h2>
            <p className="text-xs text-slate-500">Autonomous cryptocurrency forensic tracing architecture & execution parameters</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenPythonScript();
            }}
            id="view-streamlit-code-btn"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-2xs transition-colors"
          >
            <FileCode className="w-3.5 h-3.5 text-blue-600" />
            <span>Python / Streamlit app.py</span>
          </button>
          <span className="text-slate-400">
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="p-6 text-sm text-slate-700 bg-white divide-y divide-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-2">
            <div className="flex items-start space-x-3.5">
              <div className="mt-1 p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1">Simulated Transaction Graph</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Demonstrates the automated multi-hop BFS (Breadth-First Search) tracing algorithm using an in-memory deterministic blockchain topology with 18+ nodes, peel chains, and decoys without requiring external API keys.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5">
              <div className="mt-1 p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1">Production Ingestion Architecture</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  A production deployment streams real-time raw UTXO and EVM transaction blocks from <strong>Blockstream Esplora</strong> and blockchain full-nodes, continuously ingesting Directed Acyclic Graphs (DAG) into <strong>Neo4j</strong> for sub-second index traversal across billions of edges.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5">
              <div className="mt-1 p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1">Statutory Compliance Output</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Converts completed trace paths directly into actionable forensic freezing notices under <strong>Section 94 of the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023</strong> for immediate submission to centralized VASPs (Binance, CoinDCX, WazirX).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
