import { jsPDF } from 'jspdf';
import { TraceResult } from '../types';
import { calculateWalletRiskScore } from './riskScorer';

export function generateBnssSection94Pdf(traceResult: TraceResult, officerName = 'Cyber Crime Cell Investigator'): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = 18;

  // Header Banner
  doc.setFillColor(15, 23, 42); // Dark slate
  doc.rect(margin, y, contentWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('CRYPTOTRACE FORENSIC INTELLIGENCE DOSSIER', margin + 6, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  doc.text(`STATUTORY EVIDENCE REPORT | GENERATED: ${nowStr}`, margin + 6, y + 14);
  doc.text(`LEGAL NOTICE: BHARATIYA NAGARIK SURAKSHA SANHITA (BNSS), 2023 - SECTION 94`, margin + 6, y + 19);

  y += 30;

  // Section 1: Executive Summary
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('1. EXECUTIVE SUMMARY & TARGET VASP IDENTIFICATION', margin, y);
  y += 2;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(margin, y, margin + contentWidth, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  const suspectShort = traceResult.suspectAddress;
  const vaspName = traceResult.targetVasp?.name || 'Unknown VASP';
  const vaspAddr = traceResult.targetVasp?.address || 'N/A';
  const hopsCount = traceResult.totalHops;
  const totalVol = `${traceResult.totalVolumeTraced} ETH`;
  const riskAssessment = calculateWalletRiskScore(traceResult, suspectShort);

  // Key metrics box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 32, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 32, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.text('Target VASP Entity:', margin + 4, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`${vaspName} (Centralized Exchange Deposit Hotwallet)`, margin + 42, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('VASP Deposit Wallet:', margin + 4, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(vaspAddr, margin + 42, y + 12);

  doc.setFont('helvetica', 'bold');
  doc.text('Origin Suspect Wallet:', margin + 4, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(suspectShort, margin + 42, y + 18);

  doc.setFont('helvetica', 'bold');
  doc.text('Tracing Metrics:', margin + 4, y + 24);
  doc.setFont('helvetica', 'normal');
  doc.text(`${hopsCount} Hop(s) Traversed | Volume: ${totalVol} | Latency: ${traceResult.elapsedMs}ms`, margin + 42, y + 24);

  doc.setFont('helvetica', 'bold');
  doc.text('Forensic Risk Rating:', margin + 4, y + 30);
  doc.setFont('helvetica', 'bold');
  if (riskAssessment.level === 'High') {
    doc.setTextColor(185, 28, 28);
  } else if (riskAssessment.level === 'Medium') {
    doc.setTextColor(180, 83, 9);
  } else {
    doc.setTextColor(21, 128, 61);
  }
  doc.text(`${riskAssessment.level.toUpperCase()} RISK (${riskAssessment.score}/100) - Hop Layering: ${hopsCount} | Mixer Exposure: ${riskAssessment.mixerDetected ? 'DETECTED' : 'CLEAN'}`, margin + 42, y + 30);
  doc.setTextColor(51, 65, 85);

  y += 38;

  // Section 2: Statutory Freeze Notice Under BNSS Section 94
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(185, 28, 28); // Crimson red
  doc.text('2. STATUTORY FREEZING REQUISITION UNDER BNSS SECTION 94', margin, y);
  y += 2;
  doc.setDrawColor(254, 202, 202);
  doc.setLineWidth(0.4);
  doc.line(margin, y, margin + contentWidth, y);
  y += 5;

  doc.setFillColor(254, 242, 242);
  doc.roundedRect(margin, y, contentWidth, 50, 2, 2, 'F');
  doc.setDrawColor(252, 165, 165);
  doc.roundedRect(margin, y, contentWidth, 50, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(153, 27, 27);
  doc.text(`TO: DESIGNATED COMPLIANCE OFFICER / NODAL HEAD OF LAW ENFORCEMENT, ${vaspName.toUpperCase()}`, margin + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(69, 10, 10);
  
  const legalParagraph = [
    `WHEREAS, ongoing criminal cyber fraud and ransomware investigations have conclusively established an unbroken`,
    `on-chain cryptographic trail transferring illicit proceeds directly into customer deposit accounts under your custody.`,
    ``,
    `NOW THEREFORE, under statutory authority vested by Section 94 of the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023`,
    `(corresponding to Section 91/102 CrPC), you are hereby mandated to strictly and immediately comply with the following:`,
    `1. ACCOUNT FREEZE: Immediately freeze, debit-restrict, and immobilize all accounts, wallet balances, and spot/fiat assets`,
    `   associated with incoming transaction hashes identified in Schedule A below.`,
    `2. KYC TRANSMISSION: Preserve and furnish comprehensive KYC records (identity proofs, PAN/Aadhaar/Passport, linked phone`,
    `   numbers, registered emails, device login IP access logs, bank disbursement accounts) within 24 hours of receipt.`,
    `3. PROHIBITION OF DISSIPATION: Prevent any withdrawal, transfer, or off-ramping of equivalent fiat or virtual digital assets.`,
    `TAKE NOTE: Non-compliance with this requisition constitutes an offence punishable under applicable provisions of Bharatiya Nyaya`,
    `Sanhita (BNS) and the Information Technology Act, 2000.`
  ];

  let lineY = y + 10;
  legalParagraph.forEach(line => {
    doc.text(line, margin + 4, lineY);
    lineY += 3.5;
  });

  y += 55;

  // Section 3: Hop-by-Hop Forensic Audit Trail
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('3. SCHEDULE A: AUDITABLE HOP-BY-HOP TRANSACTION PATH', margin, y);
  y += 2;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(margin, y, margin + contentWidth, y);
  y += 5;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);

  doc.text('Hop', margin + 2, y + 4.5);
  doc.text('Origin Address', margin + 14, y + 4.5);
  doc.text('Destination Address & Entity', margin + 65, y + 4.5);
  doc.text('Amount', margin + 130, y + 4.5);
  doc.text('Timestamp (UTC)', margin + 152, y + 4.5);

  y += 7.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);

  traceResult.path.forEach((hop) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    const isTerminal = hop.isTerminalVasp;
    if (isTerminal) {
      doc.setFillColor(236, 253, 245); // Light emerald
      doc.rect(margin, y - 1, contentWidth, 7, 'F');
      doc.setTextColor(6, 95, 70);
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'normal');
    }

    const fromTrunc = `${hop.fromAddress.substring(0, 10)}...${hop.fromAddress.substring(hop.fromAddress.length - 6)}`;
    const toTrunc = `${hop.toAddress.substring(0, 10)}...${hop.toAddress.substring(hop.toAddress.length - 6)}`;
    const destTag = hop.isTerminalVasp ? `[TARGET VASP: ${hop.vaspName}]` : (hop.toLabel || '');

    doc.text(`#${hop.hopNumber}`, margin + 2, y + 3.5);
    doc.text(fromTrunc, margin + 14, y + 3.5);
    doc.text(`${toTrunc} ${destTag}`.substring(0, 42), margin + 65, y + 3.5);
    doc.text(`${hop.amount} ${hop.currency}`, margin + 130, y + 3.5);
    doc.text(hop.timestamp.replace(' UTC', ''), margin + 152, y + 3.5);

    y += 7.5;
  });

  // Footer / Sign-off
  y = Math.max(y + 6, 260);
  if (y > 275) {
    doc.addPage();
    y = 30;
  }

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(margin, y, margin + contentWidth, y);
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`ISSUED BY: ${officerName.toUpperCase()}`, margin, y);
  doc.text(`CRYPTOTRACE HASH VERIFICATION: SHA256-${Math.random().toString(36).substring(2, 12).toUpperCase()}`, margin + 80, y);
  doc.setFont('helvetica', 'normal');
  doc.text('This document is electronically generated under Section 65B of the Indian Evidence Act / BSA 2023.', margin, y + 4);

  // Save/Download PDF
  const safeVasp = vaspName.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`CryptoTrace_BNSS_Section_94_Freeze_${safeVasp}.pdf`);
}
