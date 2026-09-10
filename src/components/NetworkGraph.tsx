import React, { useState, useMemo, useRef, useEffect } from 'react';
import { WalletNode, Transaction, TraceResult } from '../types';
import { ZoomIn, ZoomOut, RotateCcw, Filter, Eye, ShieldAlert, Building2, CheckCircle2 } from 'lucide-react';

interface NetworkGraphProps {
  wallets: WalletNode[];
  transactions: Transaction[];
  traceResult: TraceResult | null;
  selectedSuspect: string;
  onSelectWallet: (address: string) => void;
}

interface NodePosition {
  x: number;
  y: number;
  node: WalletNode;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  wallets,
  transactions,
  traceResult,
  selectedSuspect,
  onSelectWallet
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState<'all' | 'traceOnly'>('all');
  const [hoveredNode, setHoveredNode] = useState<WalletNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<WalletNode | null>(null);

  // Set of addresses in the active trace path
  const pathAddressSet = useMemo(() => {
    if (!traceResult || !traceResult.found) return new Set<string>();
    const set = new Set<string>();
    set.add(traceResult.suspectAddress.toLowerCase());
    traceResult.path.forEach(h => {
      set.add(h.fromAddress.toLowerCase());
      set.add(h.toAddress.toLowerCase());
    });
    return set;
  }, [traceResult]);

  // Set of edge IDs in the active trace path
  const pathEdgeSet = useMemo(() => {
    if (!traceResult || !traceResult.found) return new Set<string>();
    const set = new Set<string>();
    traceResult.path.forEach(h => {
      set.add(`${h.fromAddress.toLowerCase()}->${h.toAddress.toLowerCase()}`);
    });
    return set;
  }, [traceResult]);

  // Filter nodes & transactions based on viewMode
  const visibleTransactions = useMemo(() => {
    if (viewMode === 'traceOnly' && traceResult?.found) {
      return transactions.filter(tx => 
        pathEdgeSet.has(`${tx.fromAddress.toLowerCase()}->${tx.toAddress.toLowerCase()}`)
      );
    }
    return transactions;
  }, [viewMode, traceResult, transactions, pathEdgeSet]);

  const visibleWallets = useMemo(() => {
    if (viewMode === 'traceOnly' && traceResult?.found) {
      return wallets.filter(w => pathAddressSet.has(w.address.toLowerCase()));
    }
    return wallets;
  }, [viewMode, traceResult, wallets, pathAddressSet]);

  // Calculate layout positions using layered topological layout
  const nodePositions = useMemo(() => {
    const positions = new Map<string, NodePosition>();
    const width = 860;
    const height = 480;

    // Fixed layering layout for clear forensic path visualization
    // Layer 0: Suspect Root (x ~ 80, y ~ 240)
    // Layer 1: Mules & Decoy 1 (x ~ 220)
    // Layer 2: Mixer Peel & Decoy 2 (x ~ 360)
    // Layer 3: Consolidators & Split Decoy (x ~ 500)
    // Layer 4: Aggregators (x ~ 640)
    // Layer 5 / Target: VASPs (x ~ 780)

    const layerMap: Record<string, { x: number; y: number }> = {
      // Suspect 1 Main Chain
      '0x71c839a9bf32d15781a704e19b64af38a1552f1': { x: 80, y: 220 },
      '0x3a9f82de77114ac076a9d91834f890a9214441b': { x: 230, y: 170 },
      '0x91f22c51a99a045bd61066b8e239ebc898842': { x: 220, y: 340 },
      '0x12e55be38466cc0455bf11904a25c6020031': { x: 360, y: 370 }, // dead-end decoy
      '0x44d7a144e05b9fb4f3218776ca1a94cd190c3': { x: 370, y: 170 },
      '0x67b49eeb93466a9d7b41527fc090334889': { x: 490, y: 290 }, // stagnant split decoy
      '0x88c31dc611b291af00b651fe4c19412a511ae': { x: 500, y: 160 },
      '0x55a64d432168aa096ec0773b0649722284': { x: 620, y: 260 }, // decoy cold storage
      '0x23f98a77b49ce0a84b069d3119af889077d6': { x: 630, y: 150 },
      '0x98e11f369910dcbaf51079367f47e65c0': { x: 740, y: 150 },
      
      // Known VASPs (Exchange destination)
      '0x28c5fe699d75f79b291c530fb69a19c1e89b': { x: 860, y: 140 }, // Binance
      '0x84a3b1097b6e414c330fac9392d0860a77f4': { x: 860, y: 310 }, // CoinDCX
      '0x11b9d4077ab834ec9a738c8c2275a01233e0': { x: 860, y: 400 }, // WazirX
      '0x77e1a29910cda08745c227abf891040899c1': { x: 860, y: 230 }, // Kraken

      // Suspect 2 Chain (2 hops to CoinDCX)
      '0x992334fbb73816a7e01a91097241285a810': { x: 80, y: 340 },
      '0x5d4a91753c07e0c4013401579644d257721': { x: 420, y: 340 },

      // Suspect 3 Chain (DeFi Decoy)
      '0xdead88102374628a5f389100155b400971': { x: 80, y: 440 },
      '0x66b88114c071295a8c64119842a781295': { x: 380, y: 440 }
    };

    visibleWallets.forEach((wallet, i) => {
      const lower = wallet.address.toLowerCase();
      const pos = layerMap[lower] || {
        x: 100 + (i % 5) * 150,
        y: 100 + Math.floor(i / 5) * 80
      };
      positions.set(lower, {
        x: pos.x,
        y: pos.y,
        node: wallet
      });
    });

    return positions;
  }, [visibleWallets]);

  // Handle pan & drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof SVGElement && e.target.tagName === 'svg') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div id="network-graph-container" className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Graph Toolbar */}
      <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Visualization View:</span>
          <div className="inline-flex rounded-lg p-0.5 bg-slate-200/80">
            <button
              id="graph-view-all-btn"
              type="button"
              onClick={() => setViewMode('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                viewMode === 'all' 
                  ? 'bg-white text-slate-900 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Full Blockchain DAG ({visibleWallets.length} Wallets)
            </button>
            <button
              id="graph-view-trace-btn"
              type="button"
              onClick={() => setViewMode('traceOnly')}
              disabled={!traceResult?.found}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                viewMode === 'traceOnly' 
                  ? 'bg-white text-slate-900 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              Traced Path Only ({traceResult?.totalHops || 0} Hops)
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 ring-2 ring-rose-200" />
            <span className="text-slate-600 font-medium">Suspect Root</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400 ring-2 ring-amber-100" />
            <span className="text-slate-600 font-medium">Laundering Hop</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
            <span className="text-slate-600 font-medium">Target VASP (Exchange)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-300 ring-1 ring-slate-200" />
            <span className="text-slate-500 font-medium">Decoy / Inactive</span>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1.5">
          <button
            id="zoom-in-btn"
            type="button"
            onClick={() => setZoom(z => Math.min(z + 0.15, 2.2))}
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            id="zoom-out-btn"
            type="button"
            onClick={() => setZoom(z => Math.max(z - 0.15, 0.5))}
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            id="zoom-reset-btn"
            type="button"
            onClick={resetView}
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div 
        ref={containerRef}
        className="relative w-full h-[460px] bg-slate-950 overflow-hidden cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Subtle grid background */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        <svg 
          className="w-full h-full"
          viewBox="0 0 960 520"
        >
          <defs>
            {/* Arrow marker for standard links */}
            <marker
              id="arrow-default"
              viewBox="0 0 10 10"
              refX="22"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569" />
            </marker>

            {/* Arrow marker for traced active path */}
            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="22"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#38BDF8" />
            </marker>

            {/* Glowing filter for active path */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Render Edges (Transactions) */}
            {visibleTransactions.map(tx => {
              const fromPos = nodePositions.get(tx.fromAddress.toLowerCase());
              const toPos = nodePositions.get(tx.toAddress.toLowerCase());
              if (!fromPos || !toPos) return null;

              const isPathEdge = pathEdgeSet.has(`${tx.fromAddress.toLowerCase()}->${tx.toAddress.toLowerCase()}`);

              // Calculate control points for smooth bezier curves
              const dx = toPos.x - fromPos.x;
              const dy = toPos.y - fromPos.y;
              const cx = fromPos.x + dx * 0.5;
              const cy = fromPos.y + dy * 0.5 - (dx > 0 ? 10 : -10);

              const edgePath = `M ${fromPos.x} ${fromPos.y} Q ${cx} ${cy} ${toPos.x} ${toPos.y}`;

              return (
                <g key={tx.id} className="transition-all">
                  {/* Outer glow for active path */}
                  {isPathEdge && (
                    <path
                      d={edgePath}
                      fill="none"
                      stroke="#0284C7"
                      strokeWidth="6"
                      strokeOpacity="0.4"
                      filter="url(#glow)"
                    />
                  )}

                  <path
                    d={edgePath}
                    fill="none"
                    stroke={isPathEdge ? '#38BDF8' : '#334155'}
                    strokeWidth={isPathEdge ? 2.8 : 1.2}
                    strokeDasharray={isPathEdge ? 'none' : '4 3'}
                    markerEnd={isPathEdge ? 'url(#arrow-active)' : 'url(#arrow-default)'}
                    className="transition-all"
                  />

                  {/* Flow amount label on edge midpoint */}
                  {(isPathEdge || zoom > 1.1) && (
                    <g transform={`translate(${cx}, ${cy - 4})`}>
                      <rect
                        x="-24"
                        y="-8"
                        width="48"
                        height="14"
                        rx="4"
                        fill={isPathEdge ? '#0F172A' : '#1E293B'}
                        stroke={isPathEdge ? '#38BDF8' : '#475569'}
                        strokeWidth="0.8"
                      />
                      <text
                        x="0"
                        y="2"
                        textAnchor="middle"
                        fontSize="8.5"
                        fontWeight="600"
                        fill={isPathEdge ? '#38BDF8' : '#94A3B8'}
                        fontFamily="monospace"
                      >
                        {tx.amount} {tx.currency}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Render Nodes (Wallets) */}
            {Array.from(nodePositions.values()).map(({ x, y, node }) => {
              const isSuspect = node.address.toLowerCase() === selectedSuspect.toLowerCase();
              const isVasp = node.isVasp;
              const isInPath = pathAddressSet.has(node.address.toLowerCase());
              const isSelected = selectedNode?.address.toLowerCase() === node.address.toLowerCase();

              // Style attributes based on forensic role
              let fillColor = '#1E293B';
              let strokeColor = '#475569';
              let radius = 16;

              if (isSuspect) {
                fillColor = '#E11D48'; // Crimson Rose
                strokeColor = '#FDA4AF';
                radius = 20;
              } else if (isVasp) {
                fillColor = '#059669'; // Emerald
                strokeColor = '#6EE7B7';
                radius = 22;
              } else if (isInPath) {
                fillColor = '#D97706'; // Amber / Laundering Mule
                strokeColor = '#FDE68A';
                radius = 17;
              } else if (node.riskCategory === 'decoy') {
                fillColor = '#1E293B';
                strokeColor = '#334155';
                radius = 13;
              }

              return (
                <g
                  key={node.address}
                  transform={`translate(${x}, ${y})`}
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(node);
                    onSelectWallet(node.address);
                  }}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Pulse ring for suspect or VASP */}
                  {(isSuspect || (isVasp && isInPath)) && (
                    <circle
                      r={radius + 8}
                      fill="none"
                      stroke={isSuspect ? '#F43F5E' : '#10B981'}
                      strokeWidth="1.5"
                      strokeOpacity="0.5"
                      className="animate-ping"
                    />
                  )}

                  {/* Node Base Circle */}
                  <circle
                    r={radius}
                    fill={fillColor}
                    stroke={isSelected ? '#FFFFFF' : strokeColor}
                    strokeWidth={isSelected ? 3 : 2}
                    filter={isInPath ? 'url(#glow)' : undefined}
                    className="transition-transform duration-200 group-hover:scale-110"
                  />

                  {/* Icon or Monogram */}
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize={isVasp ? '10' : '9'}
                    fontWeight="bold"
                    fontFamily="sans-serif"
                    pointerEvents="none"
                  >
                    {isVasp ? 'VASP' : isSuspect ? 'ROOT' : isInPath ? 'MULE' : 'HOLD'}
                  </text>

                  {/* Node Sub-Label */}
                  <g transform={`translate(0, ${radius + 14})`}>
                    <rect
                      x="-55"
                      y="-7"
                      width="110"
                      height="15"
                      rx="3"
                      fill="#0B0F19"
                      fillOpacity="0.85"
                      stroke={isInPath ? strokeColor : '#334155'}
                      strokeWidth="0.5"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill={isVasp ? '#6EE7B7' : isSuspect ? '#FDA4AF' : isInPath ? '#FDE68A' : '#94A3B8'}
                      fontSize="8"
                      fontWeight="600"
                      fontFamily="monospace"
                      pointerEvents="none"
                    >
                      {isVasp ? node.vaspName : `${node.address.substring(0, 6)}...${node.address.substring(node.address.length - 4)}`}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Hover / Selected Node Overlay Dossier */}
        {(hoveredNode || selectedNode) && (
          <div className="absolute bottom-4 left-4 max-w-sm bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-4 text-xs text-white shadow-xl pointer-events-auto">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                {(hoveredNode || selectedNode)?.isVasp ? (
                  <Building2 className="w-4 h-4 text-emerald-400" />
                ) : (hoveredNode || selectedNode)?.address.toLowerCase() === selectedSuspect.toLowerCase() ? (
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                )}
                <span className="font-semibold text-slate-100">
                  {(hoveredNode || selectedNode)?.label}
                </span>
              </div>
              <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                (hoveredNode || selectedNode)?.isVasp ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-300'
              }`}>
                {(hoveredNode || selectedNode)?.riskCategory || 'Node'}
              </span>
            </div>

            <div className="mt-2 space-y-1.5 font-mono text-[11px]">
              <div>
                <span className="text-slate-400">Address: </span>
                <span className="text-sky-300 select-all">{(hoveredNode || selectedNode)?.address}</span>
              </div>
              {(hoveredNode || selectedNode)?.vaspName && (
                <div>
                  <span className="text-slate-400">Entity: </span>
                  <span className="text-emerald-400 font-bold">{(hoveredNode || selectedNode)?.vaspName} (Centralized Exchange)</span>
                </div>
              )}
              <div className="flex items-center justify-between text-slate-300 pt-1">
                <span>Balance: {(hoveredNode || selectedNode)?.balance || 'N/A'}</span>
                <span>Sent: {(hoveredNode || selectedNode)?.totalSent || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
