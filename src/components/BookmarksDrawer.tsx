import React, { useState } from 'react';
import { BookmarkedWallet } from '../types';
import { 
  Bookmark, 
  X, 
  Trash2, 
  Play, 
  Copy, 
  Check, 
  Plus, 
  Search, 
  ExternalLink, 
  Clock, 
  Shield, 
  Tag,
  Building2,
  AlertCircle
} from 'lucide-react';

interface BookmarksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: BookmarkedWallet[];
  onAddBookmark: (bookmark: Omit<BookmarkedWallet, 'id' | 'addedAt'>) => void;
  onRemoveBookmark: (id: string) => void;
  onSelectAndTrace: (address: string) => void;
  currentAddress?: string;
}

export const BookmarksDrawer: React.FC<BookmarksDrawerProps> = ({
  isOpen,
  onClose,
  bookmarks,
  onAddBookmark,
  onRemoveBookmark,
  onSelectAndTrace,
  currentAddress = ''
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // New Bookmark Form State
  const [newAddress, setNewAddress] = useState<string>(currentAddress || '');
  const [newLabel, setNewLabel] = useState<string>('');
  const [newCategory, setNewCategory] = useState<'suspect' | 'mule' | 'vasp' | 'custom'>('suspect');
  const [newNotes, setNewNotes] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  if (!isOpen) return null;

  const handleCopy = (address: string, id: string) => {
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanAddr = newAddress.trim();
    if (!cleanAddr) {
      setFormError('Wallet address is required.');
      return;
    }

    if (bookmarks.some(b => b.address.toLowerCase() === cleanAddr.toLowerCase())) {
      setFormError('This wallet address is already bookmarked.');
      return;
    }

    onAddBookmark({
      address: cleanAddr,
      label: newLabel.trim() || `Wallet ${cleanAddr.slice(0, 6)}...${cleanAddr.slice(-4)}`,
      category: newCategory,
      notes: newNotes.trim() || undefined
    });

    // Reset form
    setNewAddress('');
    setNewLabel('');
    setNewNotes('');
    setShowAddForm(false);
  };

  const filteredBookmarks = bookmarks.filter(b => {
    const q = searchTerm.toLowerCase();
    return (
      b.address.toLowerCase().includes(q) ||
      b.label.toLowerCase().includes(q) ||
      (b.notes && b.notes.toLowerCase().includes(q)) ||
      (b.category && b.category.toLowerCase().includes(q))
    );
  });

  const getCategoryBadge = (cat?: string) => {
    switch (cat) {
      case 'suspect':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'mule':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'vasp':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                <Bookmark className="w-5 h-5 fill-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Officer Watchlist</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                    {bookmarks.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Bookmarked wallet addresses for instant re-tracing
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  if (!showAddForm && currentAddress) {
                    setNewAddress(currentAddress);
                  }
                  setShowAddForm(!showAddForm);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddForm ? 'Close Form' : 'Add New'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Add Bookmark Collapsible Form */}
          {showAddForm && (
            <div className="p-4 bg-blue-50/50 border-b border-blue-100">
              <h3 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-blue-600" />
                <span>Save New Wallet to Watchlist</span>
              </h3>

              {formError && (
                <div className="mb-3 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateBookmark} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Wallet Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="0x... EVM address or hash"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Case Label / Alias
                    </label>
                    <input
                      type="text"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      placeholder="e.g., Mule #4 (Extortion)"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Classification
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="suspect">Suspect Drainer</option>
                      <option value="mule">Intermediary Mule</option>
                      <option value="vasp">Target VASP</option>
                      <option value="custom">Custom Watchlist</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Investigative Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="e.g., Linked to FIR #102/2026 Cyber Crime PS"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-200/60 rounded font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow-xs"
                  >
                    Save Bookmark
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Search Filter */}
          <div className="p-3 border-b border-slate-200 bg-white">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by address, alias, note, or type..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Bookmarks List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {filteredBookmarks.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-slate-700">No Bookmarked Wallets</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  {searchTerm 
                    ? 'No bookmarks match your search filter.' 
                    : 'Bookmark addresses from the search bar, presets, or hop table for instant 1-click re-tracing.'}
                </p>
                {currentAddress && !showAddForm && (
                  <button
                    type="button"
                    onClick={() => {
                      setNewAddress(currentAddress);
                      setShowAddForm(true);
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Bookmark Active Address</span>
                  </button>
                )}
              </div>
            ) : (
              filteredBookmarks.map((bm) => (
                <div 
                  key={bm.id} 
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-3.5 shadow-2xs transition-all space-y-2.5 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {bm.label}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${getCategoryBadge(bm.category)}`}>
                          {bm.category || 'custom'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 font-mono text-[11px] text-slate-600">
                        <span className="truncate max-w-[240px] sm:max-w-[280px]">
                          {bm.address}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(bm.address, bm.id)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                          title="Copy address"
                        >
                          {copiedId === bm.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveBookmark(bm.id)}
                      className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-80 group-hover:opacity-100"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {bm.notes && (
                    <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-md border border-slate-100">
                      {bm.notes}
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{bm.addedAt}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectAndTrace(bm.address);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Re-Trace (BFS)</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Status */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Stored securely in local browser storage</span>
            </span>
            <span className="font-mono text-slate-400">BNSS Sec-94 Ready</span>
          </div>

        </div>
      </div>
    </div>
  );
};
