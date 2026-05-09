'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNav, api } from './Store'
import { toast } from 'sonner'
import {
  LayoutDashboard, Briefcase, DollarSign, GraduationCap, Heart, Brain,
  Search, Settings, ChevronDown, ChevronRight, Menu, X, Shield, FileText,
  StickyNote, Clock, Users, Target, Lightbulb, Repeat, Calendar, BarChart3,
  PieChart as PieChartIcon, Plus, LayoutGrid
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const nav = useNav()
  const qc = useQueryClient()
  const ventures = useQuery({ queryKey: ['ventures'], queryFn: () => api.get('/api/ventures') })
  const [sectionsOpen, setSectionsOpen] = useState<Record<string, boolean>>({
    main: true, ventures: true, finance: true, academics: true, life: true, growth: true, workbook: true
  })
  const toggleSection = (s: string) => setSectionsOpen(p => ({ ...p, [s]: !p[s] }))

  // ─── New Venture from Sidebar ─────────────────────────────
  const [showNewVenture, setShowNewVenture] = useState(false)
  const [ventureForm, setVentureForm] = useState({ name: '', description: '', stage: 'ideation', status: 'active', color: '#4d7c0f', monetaryValue: 0, valueDescription: '', needs: '' })
  const createVenture = useMutation({
    mutationFn: () => api.post('/api/ventures', ventureForm),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['ventures'] })
      toast.success('Venture created')
      setShowNewVenture(false)
      setVentureForm({ name: '', description: '', stage: 'ideation', status: 'active', color: '#4d7c0f', monetaryValue: 0, valueDescription: '', needs: '' })
      if (data?.id) nav.openVenture(data.id)
      onClose()
    }
  })

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

          <div className="flex items-center">
            <SectionHeader id="ventures" label="Ventures" />
            <button onClick={() => setShowNewVenture(true)} className="ml-auto mr-3 p-1 rounded text-stone-500 hover:text-lime-400 hover:bg-stone-800 transition-colors" title="Add Venture">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          {sectionsOpen.ventures && (
            <div>
              <NavItem view="dashboard" label="All Ventures" icon={<Briefcase className="h-4 w-4" />} />
              <NavItem view="swot" label="SWOT Analysis" icon={<LayoutGrid className="h-4 w-4" />} />
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

      {/* New Venture Dialog (accessible from Sidebar) */}
      <Dialog open={showNewVenture} onOpenChange={setShowNewVenture}>
        <DialogContent className="bg-stone-900 border-stone-800 text-stone-100 max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create Venture</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={ventureForm.name} onChange={e => setVentureForm({ ...ventureForm, name: e.target.value })} placeholder="e.g. My Startup" /></div>
            <div><Label>Description</Label><Textarea value={ventureForm.description} onChange={e => setVentureForm({ ...ventureForm, description: e.target.value })} placeholder="What is this venture about?" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Stage</Label>
                <Select value={ventureForm.stage} onValueChange={v => setVentureForm({ ...ventureForm, stage: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ideation">Ideation</SelectItem>
                    <SelectItem value="validation">Validation</SelectItem>
                    <SelectItem value="building">Building</SelectItem>
                    <SelectItem value="scaling">Scaling</SelectItem>
                    <SelectItem value="mature">Mature</SelectItem>
                    <SelectItem value="exited">Exited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Color</Label><Input type="color" value={ventureForm.color} onChange={e => setVentureForm({ ...ventureForm, color: e.target.value })} /></div>
            </div>
            <div><Label>Monetary Value ($)</Label><Input type="number" value={ventureForm.monetaryValue} onChange={e => setVentureForm({ ...ventureForm, monetaryValue: +e.target.value })} /></div>
            <div><Label>Value Description</Label><Input value={ventureForm.valueDescription} onChange={e => setVentureForm({ ...ventureForm, valueDescription: e.target.value })} placeholder="e.g. Pre-revenue, 500 users" /></div>
            <div><Label>Needs</Label><Textarea value={ventureForm.needs} onChange={e => setVentureForm({ ...ventureForm, needs: e.target.value })} placeholder="What does this venture need right now?" /></div>
          </div>
          <DialogFooter><Button onClick={() => createVenture.mutate()} className="bg-green-700 hover:bg-green-800" disabled={!ventureForm.name.trim()}>Create Venture</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
