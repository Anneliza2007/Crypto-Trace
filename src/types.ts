export interface WalletNode {
  address: string;
  label: string;
  isVasp: boolean;
  vaspName?: string;
  riskCategory?: 'suspect' | 'mule' | 'mixer' | 'decoy' | 'vasp' | 'neutral';
  balance?: string;
  totalSent?: string;
  totalReceived?: string;
}

export interface Transaction {
  id: string;
  txHash: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  currency: string;
  timestamp: string;
  hopNumber?: number;
  note?: string;
}

export interface TraceHop {
  hopNumber: number;
  fromAddress: string;
  fromLabel?: string;
  toAddress: string;
  toLabel?: string;
  amount: number;
  currency: string;
  timestamp: string;
  txHash: string;
  isTerminalVasp?: boolean;
  vaspName?: string;
}

export interface TraceResult {
  found: boolean;
  suspectAddress: string;
  targetVasp?: {
    name: string;
    address: string;
    receivedAmount: number;
    currency: string;
  };
  totalHops: number;
  totalVolumeTraced: number;
  elapsedMs: number;
  path: TraceHop[];
  visitedCount: number;
  allNodesExplored: string[];
}

export interface BookmarkedWallet {
  id: string;
  address: string;
  label: string;
  category?: 'suspect' | 'mule' | 'vasp' | 'custom';
  addedAt: string;
  notes?: string;
}

export type RiskLevel = 'High' | 'Medium' | 'Low';

export interface RiskFactor {
  id: string;
  name: string;
  category: 'obfuscation' | 'amount' | 'mixer' | 'velocity' | 'vasp';
  scoreImpact: number;
  severity: 'high' | 'medium' | 'low' | 'neutral';
  detected: boolean;
  description: string;
  evidence: string;
}

export interface WalletRiskAssessment {
  score: number; // 0 - 100
  level: RiskLevel;
  suspectAddress: string;
  hopCount: number;
  totalVolume: number;
  averageAmount: number;
  mixerDetected: boolean;
  mixerNames: string[];
  rapidVelocity: boolean;
  terminalVaspReached: boolean;
  terminalVaspName?: string;
  factors: RiskFactor[];
  summary: string;
  statutoryAdvice: string;
}
