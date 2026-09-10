import React, { useState } from 'react';
import { TraceResult } from '../types';
import { X, Copy, Check, Download, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import { generateBnssSection94Pdf } from '../utils/pdfGenerator';

interface VaspFreezerModalProps {
  isOpen: boolean;
  onClose: () => void;
  traceResult: TraceResult | null;
}

export const VaspFreezerModal: React.FC<VaspFreezerModalProps> = ({ isOpen, onClose, traceResult }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !traceResult || !traceResult.targetVasp) return null;

  const vasp = traceResult.targetVasp;
  const lastHop = traceResult.path[traceResult.path.length - 1];

  const noticeText = `FORM OF STATUTORY NOTICE UNDER SECTION 94 OF BHARATIYA NAGARIK SURAKSHA SANHITA (BNSS), 2023
(READ WITH SECTION 91 & SECTION 102 OF CODE OF CRIMINAL PROCEDURE / BSA 2023)

TO:
The Designated Nodal Officer / Head of Compliance
${vasp.name} Virtual Asset Service Provider
Deposit Wallet Ingress: ${vasp.address}

SUBJECT: URGENT STATUTORY REQUISITION FOR IMMEDIATE FREEZING OF CRYPTO ASSETS AND DISCLOSURE OF KYC RECORDS

Sir / Madam,

1. In connection with ongoing cyber crime and crypto fraud investigations conducted by the Cyber Crime Law Enforcement Division, automated forensic transaction path analysis conducted via CryptoTrace has definitively tracked illicit proceeds originating from the suspect wallet address:
   ORIGIN SUSPECT ADDRESS: ${traceResult.suspectAddress}

2. Through an auditable trail of ${traceResult.totalHops} cryptographic multi-hop layering transactions, an aggregate volume of ${lastHop?.amount || traceResult.totalVolumeTraced} ETH has been deposited into accounts held under your custodial platform:
   TERMINAL TRANSACTION HASH: ${lastHop?.txHash || 'N/A'}
   RECEPTION TIMESTAMP: ${lastHop?.timestamp || 'N/A'}
   VASP RECIPIENT WALLET: ${vasp.address}

3. Under powers conferred under Section 94 of the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023, you are hereby directed to:
   (a) IMMEDIATE ACCOUNT FREEZE: Instantly freeze, debit-freeze, and immobilize the target deposit wallet and any linked trading, spot, margin, P2P, or withdrawal accounts.
   (b) DISCLOSURE OF KYC DOSSIER: Furnish complete verified user profile including full legal name, government-issued photo ID (Aadhaar / PAN / Passport), registered mobile number, email address, IP access logs with port numbers, and associated bank settlement accounts within twenty-four (24) hours.
   (c) PRESERVATION OF EVIDENCE: Preserve all transaction ledgers, device fingerprints, and off-chain chat/P2P records under Section 65B of Indian Evidence Act / BSA 2023.

4. Take notice that failure to comply with this statutory order without reasonable excuse shall invite criminal prosecution under applicable provisions of Bharatiya Nyaya Sanhita (BNS) and the Information Technology Act, 2000.

ISSUED UNDER OFFICIAL SEAL:
Cyber Crime Forensic Investigation Cell
Docket Reference: CT-BNSS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(noticeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">BNSS Section 94 Statutory Freeze Notice</h3>
              <p className="text-xs text-slate-500">Official legal freezing notice directed to {vasp.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-red-700 shrink-0" />
              <span>Mandatory legal notice ready for transmission to {vasp.name} compliance desk.</span>
            </div>
            <span className="font-bold uppercase text-[10px] px-2 py-0.5 bg-red-200 text-red-900 rounded">
              High Priority
            </span>
          </div>

          <div className="relative">
            <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-[380px] overflow-y-auto border border-slate-800">
              {noticeText}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Notice Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Notice Text</span>
              </>
            )}
          </button>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => {
                generateBnssSection94Pdf(traceResult);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Official PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
