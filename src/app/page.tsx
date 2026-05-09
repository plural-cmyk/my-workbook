'use client'

import { useState } from 'react'
import { useNav } from '@/components/workbook/Store'
import { Sidebar } from '@/components/workbook/Sidebar'
import { Dashboard } from '@/components/workbook/Dashboard'
import { VentureDashboard, VentureForm } from '@/components/workbook/VentureDashboard'
import { FinanceOverview, AccountsView, TransactionsView, BudgetsView } from '@/components/workbook/FinanceDashboard'
import { AcademicTracker, AcademicNotesView } from '@/components/workbook/AcademicTracker'
import { DigitalStore } from '@/components/workbook/DigitalStore'
import { SWOTView } from '@/components/workbook/SWOTAnalysis'
import {
  RelationshipsView, TimePlannerView, LifeAuditView, InsightsView,
  HabitsView, DailyCheckInView, WeeklyReviewView, BrainDumpView,
  SearchView, SettingsView
} from '@/components/workbook/OtherViews'
import { Menu } from 'lucide-react'

export default function WorkbookApp() {
  const nav = useNav()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-3 px-4 py-3 border-b border-stone-800 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-stone-400"><Menu className="h-5 w-5" /></button>
          <span className="font-semibold text-sm">My Workbook</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <ViewRouter />
        </main>
      </div>
    </div>
  )
}

function ViewRouter() {
  const nav = useNav()
  switch (nav.view) {
    case 'dashboard': return <Dashboard />
    case 'venture-dashboard': return nav.ventureId ? <VentureDashboard ventureId={nav.ventureId} /> : <Dashboard />
    case 'finance-overview': return <FinanceOverview />
    case 'finance-accounts': return <AccountsView />
    case 'finance-transactions': return <TransactionsView />
    case 'finance-budgets': return <BudgetsView />
    case 'academic-current': return <AcademicTracker />
    case 'academic-notes': return <AcademicNotesView />
    case 'relationships': return <RelationshipsView />
    case 'time-planner': return <TimePlannerView />
    case 'balance-check': return <LifeAuditView />
    case 'insights': return <InsightsView />
    case 'habits': return <HabitsView />
    case 'daily-checkin': return <DailyCheckInView />
    case 'weekly-review': return <WeeklyReviewView />
    case 'brain-dump': return <BrainDumpView />
    case 'digital-store': return <DigitalStore />
    case 'swot': return <SWOTView />
    case 'search': return <SearchView />
    case 'settings': return <SettingsView />
    default: return <Dashboard />
  }
}
