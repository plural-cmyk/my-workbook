import { create } from 'zustand'

export type ViewKey =
  | 'dashboard'
  | 'venture-dashboard'
  | 'finance-overview'
  | 'finance-accounts'
  | 'finance-transactions'
  | 'finance-budgets'
  | 'academic-current'
  | 'academic-notes'
  | 'relationships'
  | 'time-planner'
  | 'balance-check'
  | 'insights'
  | 'habits'
  | 'daily-checkin'
  | 'weekly-review'
  | 'brain-dump'
  | 'digital-store'
  | 'swot'
  | 'search'
  | 'settings'

interface NavState {
  view: ViewKey
  ventureId: string | null
  setView: (view: ViewKey) => void
  openVenture: (id: string) => void
}

export const useNav = create<NavState>((set) => ({
  view: 'dashboard',
  ventureId: null,
  setView: (view) => set({ view }),
  openVenture: (id) => set({ view: 'venture-dashboard', ventureId: id }),
}))

// ─── API helpers ─────────────────────────────────────────────────────
export const api = {
  get: (url: string) => fetch(url).then(r => r.ok ? r.json() : Promise.reject(r.statusText)),
  post: (url: string, body: unknown) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.ok ? r.json() : Promise.reject(r.statusText)),
  put: (url: string, body: unknown) => fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.ok ? r.json() : Promise.reject(r.statusText)),
  del: (url: string) => fetch(url, { method: 'DELETE' }).then(r => r.ok ? r.json() : Promise.reject(r.statusText)),
}
