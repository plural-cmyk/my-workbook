'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNav, api } from './Store'
import {
  LayoutDashboard, Briefcase, DollarSign, GraduationCap, Heart, Brain,
  Search, Settings, ChevronDown, ChevronRight, Menu, X, Shield, FileText,
  StickyNote, Clock, Users, Target, Lightbulb, Repeat, Calendar, BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const nav = useNav()
  const ventures = useQuery({ queryKey: ['ventures'], queryFn: () => api.get('/api/ventures') })
  const [sectionsOpen, setSectionsOpen] = useState<Record<string, boolean>>({
    main: true, ventures: true, finance: true, academics: true, life: true, growth: true, workbook: true
  })
  const toggleSection = (s: string) => setSectionsOpen(p => ({ ...p, [s]: !p[s] }))

  const NavItem = ({ view, label, icon }: { view: any; label: string; icon: React.ReactNode }) => (
    <button
      onClick={() => { nav.setView(view); onClose() }}
      className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors ${nav.view === view ? 'bg-green-700/20 text-lime-400' : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'}`}
    >
      {icon}<span>{label}</span>
    </button>
  )

  const SectionHeader = ({ id, label }: { id: string; label: string }) => (
    <button onClick={() => toggleSection(id)} className="flex items-center gap-1 w-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-stone-500 hover:text-stone-300">
      {sectionsOpen[id] ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      {label}
    </button>
  )

  const content = (
    <div className="flex flex-col h-full bg-stone-950 border-r border-stone-800">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-stone-800">
        <img src="/logo.jpeg" alt="Logo" className="h-9 w-9 rounded-lg object-cover" />
        <div>
          <h1 className="text-sm font-bold text-white leading-tight">My Workbook</h1>
          <p className="text-[10px] text-stone-500">Operations Hub</p>
        </div>
        <button className="ml-auto lg:hidden text-stone-400" onClick={onClose}><X className="h-5 w-5" /></button>
      </div>
      <ScrollArea className="flex-1 px-2 py-2">
        <div className="space-y-0.5">
          <SectionHeader id="main" label="Main" />
          {sectionsOpen.main && <NavItem view="dashboard" label="Dashboard" icon={<LayoutDashboard className="h-4 w-4" />} />}

          <SectionHeader id="ventures" label="Ventures" />
          {sectionsOpen.ventures && (
            <div>
              <NavItem view="dashboard" label="All Ventures" icon={<Briefcase className="h-4 w-4" />} />
              {ventures.data?.map((v: any) => (
                <button key={v.id} onClick={() => { nav.openVenture(v.id); onClose() }}
                  className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors ${nav.ventureId === v.id && nav.view === 'venture-dashboard' ? 'bg-green-700/20 text-lime-400' : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'}`}>
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: v.color }} />
                  <span className="truncate">{v.name}</span>
                </button>
              ))}
            </div>
          )}

          <SectionHeader id="finance" label="Finance" />
          {sectionsOpen.finance && (
            <div>
              <NavItem view="finance-overview" label="Overview" icon={<DollarSign className="h-4 w-4" />} />
              <NavItem view="finance-accounts" label="Accounts" icon={<BarChart3 className="h-4 w-4" />} />
              <NavItem view="finance-transactions" label="Transactions" icon={<DollarSign className="h-4 w-4" />} />
              <NavItem view="finance-budgets" label="Budgets" icon={<PieChartIcon className="h-4 w-4" />} />
            </div>
          )}

          <SectionHeader id="academics" label="Academics" />
          {sectionsOpen.academics && (
            <div>
              <NavItem view="academic-current" label="Current Term" icon={<GraduationCap className="h-4 w-4" />} />
              <NavItem view="academic-notes" label="Notes" icon={<StickyNote className="h-4 w-4" />} />
            </div>
          )}

          <SectionHeader id="life" label="Life & Relationships" />
          {sectionsOpen.life && (
            <div>
              <NavItem view="relationships" label="Relationships" icon={<Users className="h-4 w-4" />} />
              <NavItem view="time-planner" label="Time Planner" icon={<Clock className="h-4 w-4" />} />
              <NavItem view="balance-check" label="Life Audit" icon={<Target className="h-4 w-4" />} />
            </div>
          )}

          <SectionHeader id="growth" label="Growth" />
          {sectionsOpen.growth && (
            <div>
              <NavItem view="insights" label="Insights" icon={<Lightbulb className="h-4 w-4" />} />
              <NavItem view="habits" label="Habits" icon={<Repeat className="h-4 w-4" />} />
              <NavItem view="daily-checkin" label="Daily Check-In" icon={<Calendar className="h-4 w-4" />} />
              <NavItem view="weekly-review" label="Weekly Review" icon={<BarChart3 className="h-4 w-4" />} />
            </div>
          )}

          <SectionHeader id="workbook" label="Workbook" />
          {sectionsOpen.workbook && <NavItem view="brain-dump" label="Brain Dump" icon={<Brain className="h-4 w-4" />} />}

          <div className="pt-1">
            <NavItem view="digital-store" label="Digital Store" icon={<Shield className="h-4 w-4" />} />
            <NavItem view="search" label="Search" icon={<Search className="h-4 w-4" />} />
            <NavItem view="settings" label="Settings" icon={<Settings className="h-4 w-4" />} />
          </div>
        </div>
      </ScrollArea>
    </div>
  )

  return (
    <>
      <div className="hidden lg:flex w-[260px] shrink-0">{content}</div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <div className="relative w-[260px] h-full">{content}</div>
        </div>
      )}
    </>
  )
}
