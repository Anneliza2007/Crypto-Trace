import { BookmarkedWallet } from '../types';

const STORAGE_KEY = 'cryptotrace_bookmarks';

const DEFAULT_BOOKMARKS: BookmarkedWallet[] = [
  {
    id: 'bm-1',
    address: '0x71C839a9bF32D15781a704e19B64aF38A1552F1',
    label: 'Primary Suspect (Ransomware Drainer)',
    category: 'suspect',
    addedAt: '2026-09-08 14:15 UTC',
    notes: 'Ground-zero root drainer address linked to LockBit extortion payoff.'
  },
  {
    id: 'bm-2',
    address: '0x3A9F82dE77114Ac076a9D91834f890A9214441B',
    label: 'Hop 1 - Primary Split Mule',
    category: 'mule',
    addedAt: '2026-09-08 15:30 UTC',
    notes: 'Intermediary peel split wallet; transferred 12.5 ETH.'
  },
  {
    id: 'bm-3',
    address: '0x28C5fe699d75F79b291c530fB69a19c1e89B',
    label: 'Binance Ingress Hotwallet (Target)',
    category: 'vasp',
    addedAt: '2026-09-09 10:00 UTC',
    notes: 'Terminal deposit endpoint; statutory BNSS Section 94 notice served.'
  }
];

export function getStoredBookmarks(): BookmarkedWallet[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with initial defaults for smooth out-of-the-box experience
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BOOKMARKS));
      return DEFAULT_BOOKMARKS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_BOOKMARKS;
  } catch (e) {
    console.error('Error reading bookmarks from localStorage', e);
    return DEFAULT_BOOKMARKS;
  }
}

export function saveStoredBookmarks(bookmarks: BookmarkedWallet[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch (e) {
    console.error('Error saving bookmarks to localStorage', e);
  }
}
