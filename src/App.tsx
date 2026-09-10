import React, { useState, useEffect } from 'react';
import { SAMPLE_WALLETS, SAMPLE_TRANSACTIONS, runBfsTrace } from './data/mockBlockchain';
import { WalletNode, Transaction, TraceResult, BookmarkedWallet } from './types';
import { NetworkGraph } from './components/NetworkGraph';
import { HopTable } from './components/HopTable';
import { AboutPrototype } from './components/AboutPrototype';
import { VaspFreezerModal } from './components/VaspFreezerModal';
import { PythonScriptModal } from './components/PythonScriptModal';
import { AiSummaryCard } from './components/AiSummaryCard';
import { AiChatBox } from './components/AiChatBox';
import { LoginScreen } from './components/LoginScreen';
import { BookmarksDrawer } from './components/BookmarksDrawer';
import { WalletRiskScore } from './components/WalletRiskScore';
import { getStoredBookmarks, saveStoredBookmarks } from './utils/bookmarkStorage';
import { generateBnssSection94Pdf } from './utils/pdfGenerator';
import { 
  Search, 
  Play, 
  RefreshCw, 
  ShieldCheck, 
  Building2, 
  Clock, 
  Download, 
  Layers, 
  FileCode, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Bot,
  LogOut,
  UserCheck,
  Bookmark,
  Check
} from 'lucide-react';

export default function App() {
  // Session Authentication State (testuser / 123456)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('cryptotrace_auth') === 'true';
  });
  const [currentUser, setCurrentUser] = useState<string>(() => {
    return localStorage.getItem('cryptotrace_user') || 'testuser';
  });

  const handleLogin = (user: string) => {
    localStorage.setItem('cryptotrace_auth', 'true');
    localStorage.setItem('cryptotrace_user', user);
    setIsAuthenticated(true);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('cryptotrace_auth');
    localStorage.removeItem('cryptotrace_user');
    setIsAuthenticated(false);
  };

  const [wallets] = useState<WalletNode[]>(SAMPLE_WALLETS);
  const [transactions] = useState<Transaction[]>(SAMPLE_TRANSACTIONS);

  // Bookmarks State & Persistence
  const [bookmarks, setBookmarks] = useState<BookmarkedWallet[]>(() => getStoredBookmarks());
  const [isBookmarksOpen, setIsBookmarksOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const isAddressBookmarked = (addr: string): boolean => {
    if (!addr) return false;
    return bookmarks.some(b => b.address.toLowerCase() === addr.trim().toLowerCase());
  };

  const handleAddBookmark = (newBm: Omit<BookmarkedWallet, 'id' | 'addedAt'>) => {
    const item: BookmarkedWallet = {
      ...newBm,
      id: `bm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      addedAt: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC'
    };
    const updated = [item, ...bookmarks];
    setBookmarks(updated);
    saveStoredBookmarks(updated);
    showToast(`Wallet ${item.address.slice(0, 8)}... saved to bookmarks`);
  };

  const handleRemoveBookmark = (id: string) => {
    const updated = bookmarks.filter(b => b.id !== id);
    setBookmarks(updated);
    saveStoredBookmarks(updated);
    showToast('Bookmark removed from local storage');
  };

  const handleToggleBookmark = (address: string, defaultLabel = 'Investigative Address', category: 'suspect' | 'mule' | 'vasp' | 'custom' = 'suspect') => {
    const cleanAddr = address.trim();
    if (!cleanAddr) return;
    const existing = bookmarks.find(b => b.address.toLowerCase() === cleanAddr.toLowerCase());
    if (existing) {
      handleRemoveBookmark(existing.id);
    } else {
      handleAddBookmark({
        address: cleanAddr,
        label: defaultLabel,
        category,
        notes: `Quick bookmarked on ${new Date().toLocaleDateString()}`
      });
    }
  };

  const handleBookmarkSelectAndTrace = (addr: string) => {
    setSelectedSuspect(addr);
    setCustomInput(addr);
    handleRunTrace(addr);
    setIsBookmarksOpen(false);
    showToast(`Re-tracing ${addr.slice(0, 8)}... via BFS`);
  };

  // Default selected suspect: Primary Suspect with 5-hop path to Binance
  const [selectedSuspect, setSelectedSuspect] = useState<string>(
    '0x71C839a9bF32D15781a704e19B64aF38A1552F1'
  );
  const [customInput, setCustomInput] = useState<string>('');
  const [traceResult, setTraceResult] = useState<TraceResult | null>(null);
  const [isTracing, setIsTracing] = useState<boolean>(false);

  // Modals & Chat
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState<boolean>(false);
  const [isPythonModalOpen, setIsPythonModalOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string>('');

  // Preset suspect options
  const PRESET_SUSPECTS = [
    {
      address: '0x71C839a9bF32D15781a704e19B64aF38A1552F1',
      title: 'Primary Suspect (Ransomware Drainer)',
      tag: '5 Hops to Binance (Live Demo Ready)',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    },
    {
      address: '0x992334Fbb73816a7E01a91097241285A810',
      title: 'Suspect 2 (Darknet Market Cashier)',
      tag: '2 Hops to CoinDCX (Express Exit)',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      address: '0xDEAD88102374628a5F389100155b400971',
      title: 'Suspect 3 (Stagnant Hoarder)',
      tag: 'Decoy Unhosted DeFi (No VASP)',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
    }
  ];

  // Execute BFS Trace
  const handleRunTrace = async (addressToTrace = selectedSuspect) => {
    setIsTracing(true);
    const target = addressToTrace.trim();

    try {
      // First attempt backend API call
      const res = await fetch('/api/trace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspectAddress: target })
      });

      if (res.ok) {
        const data = await res.json();
        setTraceResult(data.trace);
      } else {
        // Fallback to client-side BFS if server route in dev transition
        const result = runBfsTrace(target, transactions, wallets);
        setTraceResult(result);
      }
    } catch {
      // Seamless client-side BFS execution ensures hackathon demo NEVER fails
      const result = runBfsTrace(target, transactions, wallets);
      setTraceResult(result);
    } finally {
      setIsTracing(false);
    }
  };

  // Run initial trace on component mount so the demo opens ready
  useEffect(() => {
    handleRunTrace('0x71C839a9bF32D15781a704e19B64aF38A1552F1');
  }, []);

  const handleSelectPreset = (addr: string) => {
    setSelectedSuspect(addr);
    setCustomInput('');
    handleRunTrace(addr);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    setSelectedSuspect(customInput.trim());
    handleRunTrace(customInput.trim());
  };

  const handleOpenChatWithPrompt = (prompt: string) => {
    setChatInitialPrompt(prompt);
    setIsChatOpen(true);
  };

  // Enforce authentication gate (username: testuser, password: 123456)
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs font-black text-lg">
              CT
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">CryptoTrace</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Automated Crypto Wallet Tracing & Forensic Intelligence</p>
            </div>
          </div>

          {/* Header Action Badges */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>18 Wallets • 13 Tx</span>
            </div>

            <button
              id="header-bookmarks-btn"
              type="button"
              onClick={() => setIsBookmarksOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs relative"
              title="View Bookmarked Wallets & Watchlist"
            >
              <Bookmark className={`w-3.5 h-3.5 ${bookmarks.length > 0 ? 'text-blue-600 fill-blue-600' : 'text-slate-400'}`} />
              <span>Watchlist</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                {bookmarks.length}
              </span>
            </button>

            <button
              id="header-open-chat-btn"
              type="button"
              onClick={() => setIsChatOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg transition-colors shadow-2xs"
            >
              <Bot className="w-4 h-4 text-indigo-600" />
              <span>AI Chat</span>
            </button>

            <button
              id="header-open-python-modal-btn"
              type="button"
              onClick={() => setIsPythonModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <FileCode className="w-4 h-4 text-orange-600" />
              <span className="hidden sm:inline">Streamlit Code</span>
              <span className="sm:hidden">app.py</span>
            </button>

            {traceResult?.found && (
              <button
                id="header-download-report-btn"
                type="button"
                onClick={() => generateBnssSection94Pdf(traceResult)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF Report</span>
              </button>
            )}

            {/* Authenticated Officer Badge & Logout */}
            <div className="flex items-center space-x-1.5 pl-2 border-l border-slate-200">
              <div 
                id="officer-badge"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-mono"
                title="Active Forensic Officer"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-semibold text-slate-900">{currentUser}</span>
              </div>

              <button
                id="header-logout-btn"
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1 p-2 sm:px-2.5 sm:py-1.5 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-colors"
                title="Sign out of session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Section 4: About This Prototype */}
        <AboutPrototype onOpenPythonScript={() => setIsPythonModalOpen(true)} />

        {/* Tracing Control Panel Card */}
        <div id="trace-control-card" className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-600" />
                <span>Select or Enter Suspect Wallet Address</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                The BFS algorithm traverses the transaction graph until a regulated VASP deposit hotwallet is identified.
              </p>
            </div>

            {/* Tracing Latency & Status Pill */}
            {traceResult && (
              <div className="flex items-center space-x-3 text-xs">
                <span className="text-slate-500 font-mono">
                  Traversal: <strong className="text-slate-800">{traceResult.elapsedMs} ms</strong>
                </span>
                <span className="text-slate-500 font-mono">
                  Explored: <strong className="text-slate-800">{traceResult.visitedCount} wallets</strong>
                </span>
              </div>
            )}
          </div>

          {/* Preset Buttons for Quick Demo Testing */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-600">
                Preset Forensic Scenarios:
              </label>
              <button
                type="button"
                onClick={() => setIsBookmarksOpen(true)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Open Watchlist ({bookmarks.length})</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {PRESET_SUSPECTS.map((p) => {
                const isActive = selectedSuspect.toLowerCase() === p.address.toLowerCase();
                const isBookmarked = isAddressBookmarked(p.address);
                return (
                  <div
                    key={p.address}
                    className={`relative text-left p-3 rounded-xl border transition-all ${
                      isActive 
                        ? 'bg-blue-50/70 border-blue-500 ring-1 ring-blue-500 shadow-xs' 
                        : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div 
                      onClick={() => handleSelectPreset(p.address)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-1 mb-1 pr-6">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {p.title}
                        </span>
                        {isActive && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />}
                      </div>
                      <div className="font-mono text-[11px] text-slate-500 truncate mb-1.5">
                        {p.address}
                      </div>
                      <span className={`inline-block text-[10px] px-2 py-0.5 rounded border font-medium ${p.badgeColor}`}>
                        {p.tag}
                      </span>
                    </div>

                    {/* Bookmark Toggle on Preset Card */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleBookmark(p.address, p.title, 'suspect');
                      }}
                      className={`absolute top-3 right-3 p-1 rounded-md hover:bg-white/80 transition-colors ${
                        isBookmarked ? 'text-blue-600' : 'text-slate-400 hover:text-blue-600'
                      }`}
                      title={isBookmarked ? 'Remove from Watchlist' : 'Bookmark to Watchlist'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-blue-600' : ''}`} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Quick Watchlist Pill Strip */}
            {bookmarks.length > 0 && (
              <div className="mt-3.5 p-2.5 bg-slate-50/90 border border-slate-200 rounded-lg flex items-center justify-between gap-2 overflow-hidden text-xs">
                <div className="flex items-center gap-2 overflow-x-auto py-0.5 scrollbar-none">
                  <span className="font-semibold text-slate-700 flex items-center gap-1 shrink-0 text-[11px]">
                    <Bookmark className="w-3 h-3 text-blue-600 fill-blue-600" />
                    Watchlist:
                  </span>
                  {bookmarks.slice(0, 5).map((bm) => (
                    <button
                      key={bm.id}
                      type="button"
                      onClick={() => handleBookmarkSelectAndTrace(bm.address)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-md font-mono text-[11px] text-slate-700 hover:text-blue-700 transition-colors shrink-0 shadow-2xs group"
                      title={`Trace saved address: ${bm.label} (${bm.address})`}
                    >
                      <span className="font-sans font-medium text-slate-900 max-w-[110px] truncate group-hover:text-blue-700">
                        {bm.label}
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        ({bm.address.slice(0, 4)}...{bm.address.slice(-3)})
                      </span>
                    </button>
                  ))}
                  {bookmarks.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setIsBookmarksOpen(true)}
                      className="text-blue-600 hover:underline text-[11px] font-semibold shrink-0"
                    >
                      +{bookmarks.length - 5} more
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsBookmarksOpen(true)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 ml-2 shrink-0 hover:underline"
                >
                  Manage
                </button>
              </div>
            )}
          </div>

          {/* Custom Wallet Input & Action Button */}
          <form onSubmit={handleCustomSubmit} className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <input
                id="suspect-wallet-input"
                type="text"
                value={customInput || selectedSuspect}
                onChange={(e) => {
                  setCustomInput(e.target.value);
                  setSelectedSuspect(e.target.value);
                }}
                placeholder="0x... Enter any Ethereum/Bitcoin wallet address"
                className="w-full pl-4 pr-12 py-2.5 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-2xs"
              />
              {selectedSuspect && (
                <span className="absolute right-3 top-2.5 text-[11px] text-slate-400 font-mono">
                  {selectedSuspect.startsWith('0x') ? 'EVM' : 'ADDR'}
                </span>
              )}
            </div>

            {/* Quick Bookmark Toggle Button */}
            <button
              id="bookmark-current-input-btn"
              type="button"
              onClick={() => handleToggleBookmark(customInput || selectedSuspect, 'Investigative Target', 'suspect')}
              disabled={!((customInput || selectedSuspect).trim())}
              className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-lg border transition-colors shrink-0 shadow-2xs ${
                isAddressBookmarked(customInput || selectedSuspect)
                  ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-blue-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isAddressBookmarked(customInput || selectedSuspect) ? 'Wallet Bookmarked (Click to Remove)' : 'Bookmark Wallet Address to Watchlist'}
            >
              <Bookmark className={`w-4 h-4 ${isAddressBookmarked(customInput || selectedSuspect) ? 'fill-blue-600 text-blue-600' : 'text-slate-400'}`} />
              <span className="hidden md:inline">
                {isAddressBookmarked(customInput || selectedSuspect) ? 'Bookmarked' : 'Bookmark'}
              </span>
            </button>

            <button
              id="run-trace-btn"
              type="submit"
              disabled={isTracing || !selectedSuspect.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors shrink-0"
            >
              {isTracing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing BFS...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Trace Funds (BFS)</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Trace Result Summary Alert / Cards */}
        {traceResult?.found && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Target VASP</div>
              <div className="text-lg font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>{traceResult.targetVasp?.name}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 truncate font-mono">
                {traceResult.targetVasp?.address}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Path Depth (Hops)</div>
              <div className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>{traceResult.totalHops} Consecutive Hops</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Unbroken cryptographic lineage
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Terminal Ingress Volume</div>
              <div className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{traceResult.targetVasp?.receivedAmount} {traceResult.targetVasp?.currency}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Total Traced: {traceResult.totalVolumeTraced} ETH
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Statutory Remedy</div>
              <div className="text-lg font-bold text-red-700 mt-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-red-600" />
                <span>BNSS Section 94</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Immediate account freeze order
              </div>
            </div>
          </div>
        )}

        {/* Heuristic Wallet Risk Score Card */}
        <WalletRiskScore 
          traceResult={traceResult}
          suspectAddress={customInput || selectedSuspect}
          onOpenChatWithPrompt={handleOpenChatWithPrompt}
        />

        {/* AI Summary Card */}
        <AiSummaryCard 
          traceResult={traceResult}
          onOpenChatWithPrompt={handleOpenChatWithPrompt}
        />

        {/* Section 3 (part a): Network Graph Visualization */}
        <NetworkGraph
          wallets={wallets}
          transactions={transactions}
          traceResult={traceResult}
          selectedSuspect={selectedSuspect}
          onSelectWallet={(addr) => {
            setSelectedSuspect(addr);
            setCustomInput(addr);
          }}
        />

        {/* Section 3 (part b): Hop-by-Hop Table & PDF Generation */}
        <HopTable
          traceResult={traceResult}
          onOpenNoticeModal={() => setIsNoticeModalOpen(true)}
          onToggleBookmark={handleToggleBookmark}
          isBookmarked={isAddressBookmarked}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">CryptoTrace</span>
            <span>•</span>
            <span>Autonomous On-Chain Forensic BFS Pathfinding Engine</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setIsBookmarksOpen(true)}
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Watchlist ({bookmarks.length})</span>
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsPythonModalOpen(true)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Inspect app.py
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsChatOpen(true)}
              className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Open AI Chat</span>
            </button>
            <span>•</span>
            <span>BNSS 2023 §94 Requisition Compliant</span>
          </div>
        </div>
      </footer>

      {/* Floating AI Chat Trigger Button */}
      {!isChatOpen && (
        <button
          id="floating-ai-chat-btn"
          type="button"
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-full shadow-xl hover:shadow-2xl border border-slate-700 flex items-center space-x-2.5 transition-all group hover:scale-105"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-indigo-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
          </div>
          <span className="text-xs font-bold tracking-wide">
            AI Forensic Assistant
          </span>
        </button>
      )}

      {/* Interactive AI Chat Box Drawer */}
      <AiChatBox
        traceResult={traceResult}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initialPrompt={chatInitialPrompt}
        onClearInitialPrompt={() => setChatInitialPrompt('')}
      />

      {/* Statutory Freeze Notice Modal */}
      <VaspFreezerModal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        traceResult={traceResult}
      />

      {/* Streamlit Python app.py Viewer Modal */}
      <PythonScriptModal
        isOpen={isPythonModalOpen}
        onClose={() => setIsPythonModalOpen(false)}
      />

      {/* Officers' Bookmarked Wallets & Watchlist Drawer */}
      <BookmarksDrawer
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarks={bookmarks}
        onAddBookmark={handleAddBookmark}
        onRemoveBookmark={handleRemoveBookmark}
        onSelectAndTrace={handleBookmarkSelectAndTrace}
        currentAddress={customInput || selectedSuspect}
      />

      {/* Transient Action Confirmation Toast */}
      {toastMessage && (
        <div 
          id="bookmark-toast"
          className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs flex items-center gap-2.5 font-medium animate-bounce-short"
        >
          <Bookmark className="w-4 h-4 text-blue-400 fill-blue-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

