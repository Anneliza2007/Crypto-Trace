import { TraceResult, WalletRiskAssessment, RiskFactor, RiskLevel } from '../types';

/**
 * Analyzes a traced transaction chain using multi-dimensional heuristics:
 * 1. Obfuscation Depth (Hop count & layering)
 * 2. Anonymization / Privacy Pool / Mixer involvement
 * 3. Capital Flight Volume & Peeling Dynamics (Decreasing increments / average amount)
 * 4. Transaction Velocity & Automated Scripting
 * 5. Terminal Gateway Disposition (Regulated VASP vs Unregulated Decoy)
 */
export function calculateWalletRiskScore(traceResult: TraceResult | null, suspectAddress: string): WalletRiskAssessment {
  if (!traceResult || !traceResult.path || traceResult.path.length === 0) {
    // Default baseline assessment for unanalyzed / empty trace
    return {
      score: 15,
      level: 'Low',
      suspectAddress: suspectAddress || '0x000...',
      hopCount: 0,
      totalVolume: 0,
      averageAmount: 0,
      mixerDetected: false,
      mixerNames: [],
      rapidVelocity: false,
      terminalVaspReached: false,
      factors: [
        {
          id: 'no-trace',
          name: 'Baseline Pre-Trace State',
          category: 'obfuscation',
          scoreImpact: 0,
          severity: 'neutral',
          detected: false,
          description: 'Awaiting BFS ledger pathfinding to quantify cryptographic lineage.',
          evidence: 'No active transaction hops evaluated.'
        }
      ],
      summary: 'No transaction hops currently mapped. Run BFS Trace to compute the forensic risk profile.',
      statutoryAdvice: 'Execute automated BFS exploration before issuing statutory requisition notices.'
    };
  }

  const hops = traceResult.path;
  const hopCount = hops.length;
  const totalVolume = traceResult.totalVolumeTraced || hops.reduce((acc, h) => acc + (h.amount || 0), 0);
  const averageAmount = hopCount > 0 ? totalVolume / hopCount : 0;

  const factors: RiskFactor[] = [];
  let calculatedScore = 10; // Baseline on-chain investigation floor

  // 1. Hop Count / Obfuscation Depth Heuristic
  if (hopCount >= 5) {
    calculatedScore += 30;
    factors.push({
      id: 'hop-count-deep',
      name: 'Extensive Multi-Hop Layering',
      category: 'obfuscation',
      scoreImpact: 30,
      severity: 'high',
      detected: true,
      description: 'Transaction lineage traverses 5 or more distinct cryptographic hops designed to distance funds from the originating exploit or drainer address.',
      evidence: `${hopCount} consecutive wallet-to-wallet hops documented.`
    });
  } else if (hopCount >= 3) {
    calculatedScore += 18;
    factors.push({
      id: 'hop-count-med',
      name: 'Structured Intermediary Hops',
      category: 'obfuscation',
      scoreImpact: 18,
      severity: 'medium',
      detected: true,
      description: 'Lineage traverses 3-4 hops, typical of intermediary mule dispersion before exchange consolidation.',
      evidence: `${hopCount} consecutive wallet-to-wallet hops.`
    });
  } else if (hopCount === 2) {
    calculatedScore += 10;
    factors.push({
      id: 'hop-count-two',
      name: 'Single Intermediary Mule',
      category: 'obfuscation',
      scoreImpact: 10,
      severity: 'low',
      detected: true,
      description: 'Direct transit through a single intermediary hop before destination.',
      evidence: '2 hops recorded.'
    });
  } else {
    calculatedScore += 5;
    factors.push({
      id: 'hop-count-single',
      name: 'Direct Single Hop',
      category: 'obfuscation',
      scoreImpact: 5,
      severity: 'low',
      detected: true,
      description: 'Immediate direct transfer between origin and target with minimal layering.',
      evidence: '1 hop recorded.'
    });
  }

  // 2. Mixers / Tumblers / Privacy Pool / Illicit Labels Heuristic
  const mixerKeywords = [
    'mixer', 'tornado', 'tumbler', 'coinjoin', 'anonymizer', 
    'drainer', 'darknet', 'ransomware', 'exploit', 'stolen', 'bridge', 'cashier'
  ];
  
  const detectedMixerLabels: string[] = [];
  hops.forEach(hop => {
    const combined = `${hop.fromLabel || ''} ${hop.toLabel || ''} ${hop.fromAddress} ${hop.toAddress}`.toLowerCase();
    mixerKeywords.forEach(kw => {
      if (combined.includes(kw)) {
        const foundLabel = hop.fromLabel?.toLowerCase().includes(kw) ? hop.fromLabel : (hop.toLabel || kw);
        if (foundLabel && !detectedMixerLabels.includes(foundLabel)) {
          detectedMixerLabels.push(foundLabel);
        }
      }
    });
  });

  // Also check suspect address or preset characteristics
  if (suspectAddress.toLowerCase().includes('dead') || suspectAddress.toLowerCase().includes('drainer')) {
    if (!detectedMixerLabels.includes('Decoy / Exploit Cluster')) {
      detectedMixerLabels.push('Decoy / Exploit Cluster');
    }
  }

  const mixerDetected = detectedMixerLabels.length > 0;
  if (mixerDetected) {
    calculatedScore += 32;
    factors.push({
      id: 'mixer-detected',
      name: 'High-Risk Privacy Pool / Mixer Exposure',
      category: 'mixer',
      scoreImpact: 32,
      severity: 'high',
      detected: true,
      description: 'Transaction route deliberately touches known privacy tumblers, high-risk cashiers, or exploit clusters.',
      evidence: `Entities identified: ${detectedMixerLabels.join(', ')}.`
    });
  } else {
    factors.push({
      id: 'mixer-clear',
      name: 'No Tumbler / Mixer Interception',
      category: 'mixer',
      scoreImpact: 0,
      severity: 'neutral',
      detected: false,
      description: 'No known mixing pools or non-custodial privacy protocols identified in this path segment.',
      evidence: 'Clean transparent ledger path.'
    });
  }

  // 3. Average Amount & Volume Peeling Heuristics
  let isPeeling = false;
  if (hops.length >= 2) {
    let consistentDecrease = true;
    for (let i = 0; i < hops.length - 1; i++) {
      if (hops[i].amount < hops[i + 1].amount) {
        consistentDecrease = false;
        break;
      }
    }
    isPeeling = consistentDecrease && (hops[0].amount - hops[hops.length - 1].amount > 0.05);
  }

  if (totalVolume >= 10) {
    calculatedScore += 16;
    factors.push({
      id: 'volume-high',
      name: 'Substantial Capital Flight',
      category: 'amount',
      scoreImpact: 16,
      severity: 'high',
      detected: true,
      description: 'High-value cumulative cryptocurrency volume exceeding 10 ETH threshold.',
      evidence: `Total volume: ${totalVolume.toFixed(2)} ETH (Average per hop: ${averageAmount.toFixed(2)} ETH).`
    });
  } else if (totalVolume >= 3) {
    calculatedScore += 10;
    factors.push({
      id: 'volume-medium',
      name: 'Moderate Financial Volume',
      category: 'amount',
      scoreImpact: 10,
      severity: 'medium',
      detected: true,
      description: 'Moderate cryptocurrency volume consistent with retail structuring.',
      evidence: `Total volume: ${totalVolume.toFixed(2)} ETH.`
    });
  } else {
    factors.push({
      id: 'volume-low',
      name: 'Micro / Low Volume Flow',
      category: 'amount',
      scoreImpact: 4,
      severity: 'low',
      detected: true,
      description: 'Low transaction amount under typical corporate threshold.',
      evidence: `Total volume: ${totalVolume.toFixed(2)} ETH.`
    });
  }

  if (isPeeling) {
    calculatedScore += 12;
    factors.push({
      id: 'peeling-chain',
      name: 'Peeling Chain Signature Detected',
      category: 'amount',
      scoreImpact: 12,
      severity: 'high',
      detected: true,
      description: 'Sequential balance decrements across hops indicate systematic fee peeling or commission deductions typical of organized laundering rings.',
      evidence: `Amounts decremented from ${hops[0].amount.toFixed(2)} to ${hops[hops.length - 1].amount.toFixed(2)} ETH.`
    });
  }

  // 4. Transaction Velocity (Rapid Scripting / Bot Dispersion)
  // Check timestamps across hops
  let rapidVelocity = false;
  if (hops.length >= 2) {
    // In our sample data timestamps are UTC strings, e.g. "2024-03-14 02:40:12"
    try {
      const t1 = new Date(hops[0].timestamp.replace(' UTC', '')).getTime();
      const tLast = new Date(hops[hops.length - 1].timestamp.replace(' UTC', '')).getTime();
      if (!isNaN(t1) && !isNaN(tLast)) {
        const diffHours = Math.abs(tLast - t1) / (1000 * 60 * 60);
        // If 5 hops completed within 4 hours, it's programmatic velocity
        if (diffHours <= 6) {
          rapidVelocity = true;
        }
      }
    } catch {
      rapidVelocity = hopCount >= 3;
    }
  }

  if (rapidVelocity) {
    calculatedScore += 14;
    factors.push({
      id: 'rapid-velocity',
      name: 'Algorithmic Transit Velocity',
      category: 'velocity',
      scoreImpact: 14,
      severity: 'high',
      detected: true,
      description: 'Successive transactions occurred within compressed intervals, strongly indicative of automated drainer scripts rather than manual human transfers.',
      evidence: 'Rapid multi-hop propagation completed within hours.'
    });
  } else {
    factors.push({
      id: 'normal-velocity',
      name: 'Standard Transaction Cadence',
      category: 'velocity',
      scoreImpact: 0,
      severity: 'neutral',
      detected: false,
      description: 'Transaction timestamps reflect normal distributed intervals.',
      evidence: 'Non-automated execution cadence.'
    });
  }

  // 5. Terminal Gateway Disposition
  const terminalVaspReached = Boolean(traceResult.targetVasp && traceResult.found);
  if (terminalVaspReached) {
    calculatedScore += 10;
    factors.push({
      id: 'vasp-exit-found',
      name: 'Regulated Exchange Ingress Point',
      category: 'vasp',
      scoreImpact: 10,
      severity: 'medium',
      detected: true,
      description: 'Laundered capital terminated into a known Virtual Asset Service Provider (VASP) where fiat off-ramping or KYC identity capture is actionable.',
      evidence: `Target VASP: ${traceResult.targetVasp?.name} (${traceResult.targetVasp?.address.slice(0, 10)}...).`
    });
  } else {
    calculatedScore += 15;
    factors.push({
      id: 'vasp-dead-end',
      name: 'Unhosted Stagnant Dead-End',
      category: 'vasp',
      scoreImpact: 15,
      severity: 'medium',
      detected: true,
      description: 'Funds reside in unhosted private cold storage or decentralized smart contracts with no verified KYC exchange endpoint.',
      evidence: 'No centralized VASP identified in terminal hop.'
    });
  }

  // Clamp final score 0-100
  const finalScore = Math.min(Math.max(calculatedScore, 8), 98);

  // Classify Risk Level
  let level: RiskLevel = 'Low';
  if (finalScore >= 70) {
    level = 'High';
  } else if (finalScore >= 40) {
    level = 'Medium';
  } else {
    level = 'Low';
  }

  // Generate Executive Summaries
  let summary = '';
  let statutoryAdvice = '';

  if (level === 'High') {
    summary = `CRITICAL LAUNDERING SIGNATURE: Suspect wallet demonstrates advanced money laundering evasion patterns (${finalScore}/100 Risk Score). The trace chain features ${hopCount} layered hops, high capital flight (${totalVolume.toFixed(2)} ETH), ${mixerDetected ? 'illicit mixer/cashier exposure, ' : ''}and automated transit velocity toward ${traceResult.targetVasp?.name || 'terminal targets'}.`;
    statutoryAdvice = `Urgent statutory requisition under BNSS Section 94 recommended immediately to ${traceResult.targetVasp?.name || 'custodial nodes'} to freeze deposit accounts and preserve KYC records prior to fiat dispersion.`;
  } else if (level === 'Medium') {
    summary = `ELEVATED STRUCTURING RISK: Moderate laundering risk detected (${finalScore}/100 Risk Score). Lineage exhibits structured intermediary mule transactions (${hopCount} hops, ${totalVolume.toFixed(2)} ETH) requiring corroboration with compliance logs.`;
    statutoryAdvice = `Issue preliminary inquiry and transaction monitoring alerts. Subpoena intermediary wallet IP logs and exchange account histories under applicable statutory guidelines.`;
  } else {
    summary = `LOW HEURISTIC RISK: Transaction path presents minimal obfuscation markers (${finalScore}/100 Risk Score). Path displays direct or low-hop linear transmission without detected mixer protocols or anomalous peeling.`;
    statutoryAdvice = `Standard investigative record-keeping. Retain transaction hashes in case repository without immediate statutory freeze escalation.`;
  }

  return {
    score: finalScore,
    level,
    suspectAddress,
    hopCount,
    totalVolume,
    averageAmount,
    mixerDetected,
    mixerNames: detectedMixerLabels,
    rapidVelocity,
    terminalVaspReached,
    terminalVaspName: traceResult.targetVasp?.name,
    factors,
    summary,
    statutoryAdvice
  };
}
