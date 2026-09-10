import { WalletNode, Transaction, TraceResult, TraceHop } from '../types';

export const SAMPLE_WALLETS: WalletNode[] = [
  // Primary Suspect
  {
    address: '0x71C839a9bF32D15781a704e19B64aF38A1552F1',
    label: 'Suspect Root (Ransomware Drainer)',
    isVasp: false,
    riskCategory: 'suspect',
    balance: '0.45 ETH',
    totalSent: '14.50 ETH',
    totalReceived: '14.95 ETH'
  },
  // Layer 1
  {
    address: '0x3A9F82dE77114Ac076a9D91834f890A9214441B',
    label: 'Intermediary Mule Layer-1',
    isVasp: false,
    riskCategory: 'mule',
    balance: '0.08 ETH',
    totalSent: '12.42 ETH',
    totalReceived: '12.50 ETH'
  },
  {
    address: '0x91F22C51a99A045bD61066B8e239eBc898842',
    label: 'Decoy Pass-through (Phishing Funnel)',
    isVasp: false,
    riskCategory: 'decoy',
    balance: '0.05 ETH',
    totalSent: '1.95 ETH',
    totalReceived: '2.00 ETH'
  },
  // Layer 2
  {
    address: '0x44D7A144e05b9fB4F3218776ca1a94cD190C3',
    label: 'Mixer Peel Address Layer-2',
    isVasp: false,
    riskCategory: 'mixer',
    balance: '0.12 ETH',
    totalSent: '12.30 ETH',
    totalReceived: '12.42 ETH'
  },
  {
    address: '0x12E55Be38466cc0455Bf11904a25c6020031',
    label: 'Dead-end Decoy Wallet (Unmoved)',
    isVasp: false,
    riskCategory: 'decoy',
    balance: '1.95 ETH',
    totalSent: '0.00 ETH',
    totalReceived: '1.95 ETH'
  },
  // Layer 3
  {
    address: '0x88C31Dc611B291Af00b651Fe4c19412A511AE',
    label: 'Consolidator Mule Layer-3',
    isVasp: false,
    riskCategory: 'mule',
    balance: '0.05 ETH',
    totalSent: '8.75 ETH',
    totalReceived: '8.80 ETH'
  },
  {
    address: '0x67B49EeB93466a9d7B41527Fc090334889',
    label: 'Stagnant Split Wallet (Decoy)',
    isVasp: false,
    riskCategory: 'decoy',
    balance: '3.50 ETH',
    totalSent: '0.00 ETH',
    totalReceived: '3.50 ETH'
  },
  // Layer 4
  {
    address: '0x23F98A77b49Ce0a84b069d3119Af889077D6',
    label: 'Laundering Aggregator Layer-4',
    isVasp: false,
    riskCategory: 'mule',
    balance: '0.04 ETH',
    totalSent: '8.71 ETH',
    totalReceived: '8.75 ETH'
  },
  {
    address: '0x55A64D432168Aa096Ec0773b0649722284',
    label: 'Decoy Unhosted Cold Storage',
    isVasp: false,
    riskCategory: 'decoy',
    balance: '0.00 ETH',
    totalSent: '0.00 ETH',
    totalReceived: '0.00 ETH'
  },
  // Layer 5
  {
    address: '0x98E11F369910dCbAf51079367F47e65C0',
    label: 'Pre-Exchange OTC Mule Layer-5',
    isVasp: false,
    riskCategory: 'mule',
    balance: '0.03 ETH',
    totalSent: '8.68 ETH',
    totalReceived: '8.71 ETH'
  },
  // Secondary Suspect (Short 2-hop scenario)
  {
    address: '0x992334Fbb73816a7E01a91097241285A810',
    label: 'Suspect 2 (Darknet Market Cashier)',
    isVasp: false,
    riskCategory: 'suspect',
    balance: '0.20 ETH',
    totalSent: '5.20 ETH',
    totalReceived: '5.40 ETH'
  },
  {
    address: '0x5D4A91753c07e0c4013401579644D257721',
    label: 'Express Mule (Fast Offramp)',
    isVasp: false,
    riskCategory: 'mule',
    balance: '0.05 ETH',
    totalSent: '5.15 ETH',
    totalReceived: '5.20 ETH'
  },
  // Tertiary Suspect (Decoy Branch Only - No VASP)
  {
    address: '0xDEAD88102374628a5F389100155b400971',
    label: 'Suspect 3 (Stagnant Hoarder)',
    isVasp: false,
    riskCategory: 'suspect',
    balance: '4.20 ETH',
    totalSent: '4.00 ETH',
    totalReceived: '8.20 ETH'
  },
  {
    address: '0x66B88114c071295A8c64119842a781295',
    label: 'Decoy DeFi Liquidity Pool Contract',
    isVasp: false,
    riskCategory: 'decoy',
    balance: '4.00 ETH',
    totalSent: '0.00 ETH',
    totalReceived: '4.00 ETH'
  },
  // Known VASP Wallets
  {
    address: '0x28C5fe699d75F79b291c530fB69a19c1e89B',
    label: 'Binance Hot Wallet 14',
    isVasp: true,
    vaspName: 'Binance',
    riskCategory: 'vasp',
    balance: '48,230.12 ETH',
    totalSent: '1,420,900 ETH',
    totalReceived: '1,469,130 ETH'
  },
  {
    address: '0x84A3b1097b6e414c330fAc9392D0860A77F4',
    label: 'CoinDCX Institutional Ingress',
    isVasp: true,
    vaspName: 'CoinDCX',
    riskCategory: 'vasp',
    balance: '9,410.50 ETH',
    totalSent: '320,400 ETH',
    totalReceived: '329,810 ETH'
  },
  {
    address: '0x11B9d4077Ab834Ec9a738c8c2275A01233E0',
    label: 'WazirX Liquidity Vault 02',
    isVasp: true,
    vaspName: 'WazirX',
    riskCategory: 'vasp',
    balance: '6,120.30 ETH',
    totalSent: '198,100 ETH',
    totalReceived: '204,220 ETH'
  },
  {
    address: '0x77E1a29910cDa08745C227aBf891040899C1',
    label: 'Kraken Prime Custody Hotwallet',
    isVasp: true,
    vaspName: 'Kraken',
    riskCategory: 'vasp',
    balance: '31,890.80 ETH',
    totalSent: '890,200 ETH',
    totalReceived: '922,090 ETH'
  }
];

export const SAMPLE_TRANSACTIONS: Transaction[] = [
  // --- Chain 1: Suspect 1 -> 5 hops to Binance (Plus decoys) ---
  {
    id: 'tx-001',
    txHash: '0x9a8f4c12d3e4b5a6f7890123456789abcdef0123456789abcdef0123456789ab',
    fromAddress: '0x71C839a9bF32D15781a704e19B64aF38A1552F1',
    toAddress: '0x3A9F82dE77114Ac076a9D91834f890A9214441B',
    amount: 12.50,
    currency: 'ETH',
    timestamp: '2026-09-08 14:20:11 UTC',
    note: 'Primary drain transfer'
  },
  {
    id: 'tx-002',
    txHash: '0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c',
    fromAddress: '0x71C839a9bF32D15781a704e19B64aF38A1552F1',
    toAddress: '0x91F22C51a99A045bD61066B8e239eBc898842',
    amount: 2.00,
    currency: 'ETH',
    timestamp: '2026-09-08 14:25:34 UTC',
    note: 'Decoy split branch 1'
  },
  // Decoy branch dead-end
  {
    id: 'tx-003',
    txHash: '0x2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d',
    fromAddress: '0x91F22C51a99A045bD61066B8e239eBc898842',
    toAddress: '0x12E55Be38466cc0455Bf11904a25c6020031',
    amount: 1.95,
    currency: 'ETH',
    timestamp: '2026-09-08 15:10:02 UTC',
    note: 'Decoy transfer (Dead end, unspent)'
  },
  // Hop 2
  {
    id: 'tx-004',
    txHash: '0x3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e',
    fromAddress: '0x3A9F82dE77114Ac076a9D91834f890A9214441B',
    toAddress: '0x44D7A144e05b9fB4F3218776ca1a94cD190C3',
    amount: 12.42,
    currency: 'ETH',
    timestamp: '2026-09-08 16:45:19 UTC',
    note: 'Relay through mixer peel wallet'
  },
  // Hop 3 + Decoy peel
  {
    id: 'tx-005',
    txHash: '0x4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f',
    fromAddress: '0x44D7A144e05b9fB4F3218776ca1a94cD190C3',
    toAddress: '0x88C31Dc611B291Af00b651Fe4c19412A511AE',
    amount: 8.80,
    currency: 'ETH',
    timestamp: '2026-09-08 19:10:44 UTC',
    note: 'Primary flow forward'
  },
  {
    id: 'tx-006',
    txHash: '0x5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a',
    fromAddress: '0x44D7A144e05b9fB4F3218776ca1a94cD190C3',
    toAddress: '0x67B49EeB93466a9d7B41527Fc090334889',
    amount: 3.50,
    currency: 'ETH',
    timestamp: '2026-09-08 19:12:05 UTC',
    note: 'Peel change retained in cold storage'
  },
  // Hop 4
  {
    id: 'tx-007',
    txHash: '0x6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b',
    fromAddress: '0x88C31Dc611B291Af00b651Fe4c19412A511AE',
    toAddress: '0x23F98A77b49Ce0a84b069d3119Af889077D6',
    amount: 8.75,
    currency: 'ETH',
    timestamp: '2026-09-09 02:15:30 UTC',
    note: 'Consolidation transfer'
  },
  // Hop 5
  {
    id: 'tx-008',
    txHash: '0x7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c',
    fromAddress: '0x23F98A77b49Ce0a84b069d3119Af889077D6',
    toAddress: '0x98E11F369910dCbAf51079367F47e65C0',
    amount: 8.71,
    currency: 'ETH',
    timestamp: '2026-09-09 06:40:12 UTC',
    note: 'Final staging to offramp broker'
  },
  // Hop 6 -> Hits VASP (Binance)
  {
    id: 'tx-009',
    txHash: '0x8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d',
    fromAddress: '0x98E11F369910dCbAf51079367F47e65C0',
    toAddress: '0x28C5fe699d75F79b291c530fB69a19c1e89B',
    amount: 8.68,
    currency: 'ETH',
    timestamp: '2026-09-09 10:05:48 UTC',
    note: 'Deposit to Binance hot wallet account'
  },

  // --- Chain 2: Suspect 2 -> 2 hops to CoinDCX ---
  {
    id: 'tx-010',
    txHash: '0x9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e',
    fromAddress: '0x992334Fbb73816a7E01a91097241285A810',
    toAddress: '0x5D4A91753c07e0c4013401579644D257721',
    amount: 5.20,
    currency: 'ETH',
    timestamp: '2026-09-09 11:15:00 UTC',
    note: 'Darknet exit staging'
  },
  {
    id: 'tx-011',
    txHash: '0x0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f',
    fromAddress: '0x5D4A91753c07e0c4013401579644D257721',
    toAddress: '0x84A3b1097b6e414c330fAc9392D0860A77F4',
    amount: 5.15,
    currency: 'ETH',
    timestamp: '2026-09-09 12:00:22 UTC',
    note: 'Direct deposit to CoinDCX exchange'
  },

  // --- Chain 3: Suspect 3 -> Decoy DeFi only (No VASP) ---
  {
    id: 'tx-012',
    txHash: '0x1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a',
    fromAddress: '0xDEAD88102374628a5F389100155b400971',
    toAddress: '0x66B88114c071295A8c64119842a781295',
    amount: 4.00,
    currency: 'ETH',
    timestamp: '2026-09-09 13:45:00 UTC',
    note: 'Sent to unhosted DeFi pool (no centralized VASP)'
  },

  // Decoy branch from independent cold storage to WazirX
  {
    id: 'tx-013',
    txHash: '0x2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b',
    fromAddress: '0x55A64D432168Aa096Ec0773b0649722284',
    toAddress: '0x77E1a29910cDa08745C227aBf891040899C1',
    amount: 0.05,
    currency: 'ETH',
    timestamp: '2026-09-09 15:30:12 UTC',
    note: 'Decoy micro-sweep to Kraken'
  }
];

// Graph lookup helper
export const WALLET_MAP = new Map<string, WalletNode>(
  SAMPLE_WALLETS.map(w => [w.address.toLowerCase(), w])
);

/**
 * BFS Traversal implementation:
 * Runs breadth-first search from suspect wallet through transactions.
 * Stops immediately upon reaching any wallet marked isVasp === true.
 */
export function runBfsTrace(
  startAddress: string,
  transactions: Transaction[] = SAMPLE_TRANSACTIONS,
  wallets: WalletNode[] = SAMPLE_WALLETS
): TraceResult {
  const startTime = performance.now();
  const normalizedStart = startAddress.trim().toLowerCase();

  const walletMap = new Map<string, WalletNode>(
    wallets.map(w => [w.address.toLowerCase(), w])
  );

  // Build adjacency list: fromAddress -> outgoing transactions
  const adjacency = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    const from = tx.fromAddress.toLowerCase();
    if (!adjacency.has(from)) {
      adjacency.set(from, []);
    }
    adjacency.get(from)!.push(tx);
  }

  // Queue of paths: each item is { current: string, txPath: Transaction[] }
  const queue: Array<{ current: string; path: Transaction[] }> = [
    { current: normalizedStart, path: [] }
  ];
  const visited = new Set<string>([normalizedStart]);

  let successfulTxPath: Transaction[] | null = null;
  let targetVaspWallet: WalletNode | null = null;

  while (queue.length > 0) {
    const { current, path } = queue.shift()!;
    const currentNode = walletMap.get(current);

    // If we reached a VASP (and it's not the initial starting node if start was already VASP)
    if (path.length > 0 && currentNode && currentNode.isVasp) {
      successfulTxPath = path;
      targetVaspWallet = currentNode;
      break;
    }

    const outgoing = adjacency.get(current) || [];
    for (const tx of outgoing) {
      const nextAddress = tx.toAddress.toLowerCase();
      if (!visited.has(nextAddress)) {
        visited.add(nextAddress);
        queue.push({
          current: nextAddress,
          path: [...path, tx]
        });
      }
    }
  }

  const elapsedMs = Math.round((performance.now() - startTime) * 100) / 100;

  if (successfulTxPath && targetVaspWallet) {
    let hopCount = 0;
    let totalVolume = 0;
    const formattedHops: TraceHop[] = successfulTxPath.map((tx, idx) => {
      hopCount++;
      totalVolume += tx.amount;
      const isTerminal = idx === successfulTxPath!.length - 1;
      const fromNode = walletMap.get(tx.fromAddress.toLowerCase());
      const toNode = walletMap.get(tx.toAddress.toLowerCase());

      return {
        hopNumber: hopCount,
        fromAddress: tx.fromAddress,
        fromLabel: fromNode?.label || 'External Wallet',
        toAddress: tx.toAddress,
        toLabel: toNode?.label || 'External Wallet',
        amount: tx.amount,
        currency: tx.currency,
        timestamp: tx.timestamp,
        txHash: tx.txHash,
        isTerminalVasp: isTerminal && (toNode?.isVasp ?? false),
        vaspName: toNode?.vaspName
      };
    });

    const terminalTx = successfulTxPath[successfulTxPath.length - 1];

    return {
      found: true,
      suspectAddress: startAddress,
      targetVasp: {
        name: targetVaspWallet.vaspName || 'Exchange',
        address: targetVaspWallet.address,
        receivedAmount: terminalTx.amount,
        currency: terminalTx.currency
      },
      totalHops: formattedHops.length,
      totalVolumeTraced: Math.round(totalVolume * 100) / 100,
      elapsedMs,
      path: formattedHops,
      visitedCount: visited.size,
      allNodesExplored: Array.from(visited)
    };
  }

  // Not found (e.g., dead-end suspect or decoy)
  return {
    found: false,
    suspectAddress: startAddress,
    totalHops: 0,
    totalVolumeTraced: 0,
    elapsedMs,
    path: [],
    visitedCount: visited.size,
    allNodesExplored: Array.from(visited)
  };
}
