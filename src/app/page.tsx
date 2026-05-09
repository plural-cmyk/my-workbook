'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { format, formatDistanceToNow } from 'date-fns'
import {
  LayoutDashboard, Briefcase, DollarSign, GraduationCap, Heart, Brain,
  Search, Settings, ChevronDown, ChevronRight, Plus, Trash2, Edit3,
  CheckCircle2, Circle, AlertCircle, TrendingUp, TrendingDown, Eye, EyeOff,
  Menu, X, Shield, FileText, Key, StickyNote, Clock, Users, Target,
  Lightbulb, Repeat, Calendar, BarChart3, PieChart as PieChartIcon,
  ArrowRight, Save, XCircle, Loader2
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
  PieChart, Pie, Cell
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'

// ─── Types ───────────────────────────────────────────────────────────
type ViewKey = 'dashboard' | 'venture-dashboard' | 'finance-overview' | 'finance-accounts' | 'finance-transactions' | 'finance-budgets' | 'academic-current' | 'academic-notes' | 'relationships' | 'time-planner' | 'balance-check' | 'insights' | 'habits' | 'daily-checkin' | 'weekly-review' | 'brain-dump' | 'digital-store' | 'search' | 'settings'

// ─── Navigation Store (simple useState) ──────────────────────────────
function useNav() {
  const [view, setView] = useState<ViewKey>('dashboard')
  const [ventureId, setVentureId] = useState<string | null>(null)
  const openVenture = (id: string) => { setVentureId(id); setView('venture-dashboard') }
  return { view, setView, ventureId, openVenture }
}

// ─── API helpers ─────────────────────────────────────────────────────
const api = {
  get: (url: string) => fetch(url).then(r => r.ok ? r.json() : Promise.reject(r.statusText)),
  post: (url: string, body: unknown) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.ok ? r.json() : Promise.reject(r.statusText)),
  put: (url: string, body: unknown) => fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.ok ? r.json() : Promise.reject(r.statusText)),
  del: (url: string) => fetch(url, { method: 'DELETE' }).then(r => r.ok ? r.json() : Promise.reject(r.statusText)),
}

// ─── Main App ────────────────────────────────────────────────────────
export default function WorkbookApp() {
  const nav = useNav()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sectionsOpen, setSectionsOpen] = useState<Record<string, boolean>>({ main: true, ventures: true, finance: true, academics: true, life: true, growth: true, workbook: true })

  const toggleSection = (s: string) => setSectionsOpen(p => ({ ...p, [s]: !p[s] }))

  const ventures = useQuery({ queryKey: ['ventures'], queryFn: () => api.get('/api/ventures') })

  const navItems = (view: ViewKey, label: string, icon: React.ReactNode, section?: string) => (
    <button
      key={view}
      onClick={() => { nav.setView(view); setSidebarOpen(false) }}
      className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors ${nav.view === view ? 'bg-emerald-600/20 text-emerald-400' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
    >
      {icon}<span>{label}</span>
    </button>
  )

  const SectionHeader = ({ id, label }: { id: string; label: string }) => (
    <button onClick={() => toggleSection(id)} className="flex items-center gap-1 w-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-300">
      {sectionsOpen[id] ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      {label}
    </button>
  )

  const sidebar = (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-zinc-800">
        <img src="/logo.jpeg" alt="Logo" className="h-9 w-9 rounded-lg object-cover" />
        <div>
          <h1 className="text-sm font-bold text-white leading-tight">My Workbook</h1>
          <p className="text-[10px] text-zinc-500">Operations Hub</p>
        </div>
        <button className="ml-auto lg:hidden text-zinc-400" onClick={() => setSidebarOpen(false)}><X className="h-5 w-5" /></button>
      </div>
      <ScrollArea className="flex-1 px-2 py-2">
        <div className="space-y-0.5">
          <SectionHeader id="main" label="Main" />
          {sectionsOpen.main && navItems('dashboard', 'Dashboard', <LayoutDashboard className="h-4 w-4" />)}

          <SectionHeader id="ventures" label="Ventures" />
          {sectionsOpen.ventures && (
            <div>
              {navItems('dashboard', 'All Ventures', <Briefcase className="h-4 w-4" />)}
              {ventures.data?.map((v: any) => (
                <button key={v.id} onClick={() => { nav.openVenture(v.id); setSidebarOpen(false) }}
                  className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors ${nav.ventureId === v.id && nav.view === 'venture-dashboard' ? 'bg-emerald-600/20 text-emerald-400' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}>
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: v.color }} />
                  <span className="truncate">{v.name}</span>
                </button>
              ))}
            </div>
          )}

          <SectionHeader id="finance" label="Finance" />
          {sectionsOpen.finance && (
            <div>
              {navItems('finance-overview', 'Overview', <DollarSign className="h-4 w-4" />)}
              {navItems('finance-accounts', 'Accounts', <BarChart3 className="h-4 w-4" />)}
              {navItems('finance-transactions', 'Transactions', <TrendingUp className="h-4 w-4" />)}
              {navItems('finance-budgets', 'Budgets', <PieChartIcon className="h-4 w-4" />)}
            </div>
          )}

          <SectionHeader id="academics" label="Academics" />
          {sectionsOpen.academics && (
            <div>
              {navItems('academic-current', 'Current Term', <GraduationCap className="h-4 w-4" />)}
              {navItems('academic-notes', 'Notes', <StickyNote className="h-4 w-4" />)}
            </div>
          )}

          <SectionHeader id="life" label="Life & Relationships" />
          {sectionsOpen.life && (
            <div>
              {navItems('relationships', 'Relationships', <Users className="h-4 w-4" />)}
              {navItems('time-planner', 'Time Planner', <Clock className="h-4 w-4" />)}
              {navItems('balance-check', 'Life Audit', <Target className="h-4 w-4" />)}
            </div>
          )}

          <SectionHeader id="growth" label="Growth" />
          {sectionsOpen.growth && (
            <div>
              {navItems('insights', 'Insights', <Lightbulb className="h-4 w-4" />)}
              {navItems('habits', 'Habits', <Repeat className="h-4 w-4" />)}
              {navItems('daily-checkin', 'Daily Check-In', <Calendar className="h-4 w-4" />)}
              {navItems('weekly-review', 'Weekly Review', <BarChart3 className="h-4 w-4" />)}
            </div>
          )}

          <SectionHeader id="workbook" label="Workbook" />
          {sectionsOpen.workbook && navItems('brain-dump', 'Brain Dump', <Brain className="h-4 w-4" />)}

          <div className="pt-1">
            {navItems('digital-store', 'Digital Store', <Shield className="h-4 w-4" />)}
            {navItems('search', 'Search', <Search className="h-4 w-4" />)}
            {navItems('settings', 'Settings', <Settings className="h-4 w-4" />)}
          </div>
        </div>
      </ScrollArea>
    </div>
  )

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-[260px] shrink-0">{sidebar}</div>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-50 lg:hidden"><div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} /><div className="relative w-[260px] h-full">{sidebar}</div></div>}
      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-zinc-400"><Menu className="h-5 w-5" /></button>
          <span className="font-semibold text-sm">My Workbook</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <ViewRouter nav={nav} />
        </main>
      </div>
    </div>
  )
}

// ─── View Router ─────────────────────────────────────────────────────
function ViewRouter({ nav }: { nav: ReturnType<typeof useNav> }) {
  switch (nav.view) {
    case 'dashboard': return <DashboardView nav={nav} />
    case 'venture-dashboard': return <VentureDashboard ventureId={nav.ventureId!} />
    case 'finance-overview': return <FinanceOverview />
    case 'finance-accounts': return <AccountsView />
    case 'finance-transactions': return <TransactionsView />
    case 'finance-budgets': return <BudgetsView />
    case 'academic-current': return <AcademicView />
    case 'academic-notes': return <AcademicNotesView />
    case 'relationships': return <RelationshipsView />
    case 'time-planner': return <TimePlannerView />
    case 'balance-check': return <LifeAuditView />
    case 'insights': return <InsightsView />
    case 'habits': return <HabitsView />
    case 'daily-checkin': return <DailyCheckInView />
    case 'weekly-review': return <WeeklyReviewView />
    case 'brain-dump': return <BrainDumpView />
    case 'digital-store': return <DigitalStoreView />
    case 'search': return <SearchView />
    case 'settings': return <SettingsView />
    default: return <DashboardView nav={nav} />
  }
}

// ─── Shared components ───────────────────────────────────────────────
function StatCard({ title, value, icon, sub }: { title: string; value: string | number; icon: React.ReactNode; sub?: string }) {
  return <Card className="bg-zinc-900 border-zinc-800">
    <CardContent className="p-4 flex items-center gap-4">
      <div className="p-2 rounded-lg bg-emerald-600/10 text-emerald-400">{icon}</div>
      <div><p className="text-xs text-zinc-500">{title}</p><p className="text-xl font-bold">{value}</p>{sub && <p className="text-xs text-zinc-500">{sub}</p>}</div>
    </CardContent>
  </Card>
}

function CreateDialog({ title, trigger, children, onSubmit, open, onOpenChange }: { title: string; trigger: React.ReactNode; children: React.ReactNode; onSubmit: () => void; open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-3">{children}</div>
        <DialogFooter><Button onClick={onSubmit} className="bg-emerald-600 hover:bg-emerald-700">Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function LoadingSpinner() { return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-400" /></div> }

// ─── Dashboard ───────────────────────────────────────────────────────
function DashboardView({ nav }: { nav: ReturnType<typeof useNav> }) {
  const ventures = useQuery({ queryKey: ['ventures'], queryFn: () => api.get('/api/ventures') })
  const tasks = useQuery({ queryKey: ['tasks'], queryFn: () => api.get('/api/tasks') })
  const accounts = useQuery({ queryKey: ['accounts'], queryFn: () => api.get('/api/finance/accounts') })
  const commitments = useQuery({ queryKey: ['time-commitments'], queryFn: () => api.get('/api/time-commitments') })

  const activeTasks = tasks.data?.filter((t: any) => t.status !== 'done')?.length || 0
  const totalBalance = accounts.data?.reduce((s: number, a: any) => s + (a.balance || 0), 0) || 0
  const upcoming = commitments.data?.filter((c: any) => new Date(c.date) >= new Date())?.length || 0

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Ventures" value={ventures.data?.length || 0} icon={<Briefcase className="h-5 w-5" />} />
        <StatCard title="Active Tasks" value={activeTasks} icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard title="Net Balance" value={`$${totalBalance.toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard title="Upcoming" value={upcoming} icon={<Clock className="h-5 w-5" />} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader><CardTitle className="text-lg">Ventures</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {ventures.data?.map((v: any) => (
              <button key={v.id} onClick={() => nav.openVenture(v.id)} className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-zinc-800 transition-colors">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: v.color }} />
                <span className="text-sm font-medium">{v.name}</span>
                <Badge variant="outline" className="ml-auto text-[10px]">{v.stage}</Badge>
              </button>
            )) || <p className="text-zinc-500 text-sm">No ventures yet</p>}
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader><CardTitle className="text-lg">Recent Tasks</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {tasks.data?.slice(0, 5).map((t: any) => (
              <div key={t.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-800">
                {t.status === 'done' ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Circle className="h-4 w-4 text-zinc-500" />}
                <span className="text-sm">{t.title}</span>
                <Badge variant="outline" className="ml-auto text-[10px]">{t.priority}</Badge>
              </div>
            )) || <p className="text-zinc-500 text-sm">No tasks yet</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── Venture Dashboard ───────────────────────────────────────────────
function VentureDashboard({ ventureId }: { ventureId: string }) {
  const qc = useQueryClient()
  const venture = useQuery({ queryKey: ['venture', ventureId], queryFn: () => api.get(`/api/ventures/${ventureId}`) })
  const [tab, setTab] = useState('tasks')
  const [showEdit, setShowEdit] = useState(false)
  const [editForm, setEditForm] = useState<any>({})

  useEffect(() => { if (venture.data) setEditForm(venture.data) }, [venture.data])

  const updateVenture = useMutation({ mutationFn: (data: any) => api.put(`/api/ventures/${ventureId}`, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['venture', ventureId] }); qc.invalidateQueries({ queryKey: ['ventures'] }); toast.success('Venture updated'); setShowEdit(false) } })

  if (venture.isLoading) return <LoadingSpinner />
  if (!venture.data) return <p className="text-zinc-500">Venture not found</p>
  const v = venture.data

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3"><div className="h-4 w-4 rounded-full" style={{ backgroundColor: v.color }} /><h2 className="text-2xl font-bold">{v.name}</h2><Badge className="bg-emerald-600/20 text-emerald-400">{v.stage}</Badge></div>
          <p className="text-zinc-400 text-sm mt-1">{v.description || 'No description'}</p>
          <div className="flex gap-4 mt-2 text-sm">
            <span className="text-zinc-500">Value: <span className="text-emerald-400 font-semibold">${v.monetaryValue?.toLocaleString()}</span></span>
            {v.valueDescription && <span className="text-zinc-500">({v.valueDescription})</span>}
          </div>
          {v.needs && <p className="text-sm text-amber-400/80 mt-1">Needs: {v.needs}</p>}
        </div>
        <Dialog open={showEdit} onOpenChange={setShowEdit}>
          <DialogTrigger asChild><Button variant="outline" size="sm"><Edit3 className="h-4 w-4 mr-1" />Edit</Button></DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Edit Venture</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Stage</Label><Select value={editForm.stage} onValueChange={v => setEditForm({ ...editForm, stage: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ideation">Ideation</SelectItem><SelectItem value="validation">Validation</SelectItem><SelectItem value="building">Building</SelectItem><SelectItem value="scaling">Scaling</SelectItem><SelectItem value="mature">Mature</SelectItem><SelectItem value="exited">Exited</SelectItem></SelectContent></Select></div>
                <div><Label>Status</Label><Select value={editForm.status} onValueChange={v => setEditForm({ ...editForm, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="paused">Paused</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Monetary Value</Label><Input type="number" value={editForm.monetaryValue || 0} onChange={e => setEditForm({ ...editForm, monetaryValue: +e.target.value })} /></div>
                <div><Label>Color</Label><Input type="color" value={editForm.color || '#10b981'} onChange={e => setEditForm({ ...editForm, color: e.target.value })} /></div>
              </div>
              <div><Label>Value Description</Label><Input value={editForm.valueDescription || ''} onChange={e => setEditForm({ ...editForm, valueDescription: e.target.value })} /></div>
              <div><Label>Needs</Label><Textarea value={editForm.needs || ''} onChange={e => setEditForm({ ...editForm, needs: e.target.value })} /></div>
            </div>
            <DialogFooter><Button onClick={() => updateVenture.mutate(editForm)} className="bg-emerald-600 hover:bg-emerald-700">Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-zinc-800"><TabsTrigger value="tasks">Tasks ({v.tasks?.length || 0})</TabsTrigger><TabsTrigger value="decisions">Decisions ({v.decisions?.length || 0})</TabsTrigger><TabsTrigger value="meetings">Meetings ({v.meetings?.length || 0})</TabsTrigger><TabsTrigger value="contacts">Contacts ({v.contacts?.length || 0})</TabsTrigger></TabsList>
        <TabsContent value="tasks"><VentureTasks ventureId={ventureId} /></TabsContent>
        <TabsContent value="decisions"><VentureDecisions ventureId={ventureId} /></TabsContent>
        <TabsContent value="meetings"><VentureMeetings ventureId={ventureId} /></TabsContent>
        <TabsContent value="contacts"><VentureContacts ventureId={ventureId} /></TabsContent>
      </Tabs>
    </div>
  )
}

function VentureTasks({ ventureId }: { ventureId: string }) {
  const qc = useQueryClient()
  const tasks = useQuery({ queryKey: ['tasks', ventureId], queryFn: () => api.get(`/api/tasks?ventureId=${ventureId}`) })
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', status: 'todo', dueDate: '' })

  const create = useMutation({ mutationFn: () => api.post('/api/tasks', { ...form, ventureId, dueDate: form.dueDate || undefined }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks', ventureId] }); toast.success('Task created'); setShowCreate(false); setForm({ title: '', description: '', priority: 'medium', status: 'todo', dueDate: '' }) } })
  const del = useMutation({ mutationFn: (id: string) => api.del(`/api/tasks/${id}`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks', ventureId] }); toast.success('Task deleted') } })
  const updateStatus = useMutation({ mutationFn: ({ id, status }: any) => api.put(`/api/tasks/${id}`, { status }), onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', ventureId] }) })

  const todo = tasks.data?.filter((t: any) => t.status === 'todo') || []
  const inProgress = tasks.data?.filter((t: any) => t.status === 'in-progress') || []
  const done = tasks.data?.filter((t: any) => t.status === 'done') || []

  const TaskCard = ({ t }: { t: any }) => (
    <div className="p-3 rounded-lg bg-zinc-800 border border-zinc-700 space-y-2">
      <div className="flex items-start justify-between"><span className="text-sm font-medium">{t.title}</span><button onClick={() => del.mutate(t.id)} className="text-zinc-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button></div>
      {t.description && <p className="text-xs text-zinc-400">{t.description}</p>}
      <div className="flex items-center gap-2"><Badge variant="outline" className="text-[10px]">{t.priority}</Badge>
        {t.status !== 'done' && <button onClick={() => updateStatus.mutate({ id: t.id, status: t.status === 'todo' ? 'in-progress' : 'done' })} className="text-[10px] text-emerald-400 hover:underline">{t.status === 'todo' ? 'Start →' : 'Done ✓'}</button>}
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button onClick={() => setShowCreate(true)} size="sm" className="bg-emerald-600 hover:bg-emerald-700"><Plus className="h-4 w-4 mr-1" />Task</Button></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[['To Do', todo], ['In Progress', inProgress], ['Done', done]].map(([label, items]: any) => (
          <div key={label}><h4 className="text-xs font-semibold text-zinc-500 uppercase mb-2">{label} ({items.length})</h4><div className="space-y-2">{items.map((t: any) => <TaskCard key={t.id} t={t} />)}</div></div>
        ))}
      </div>
      <CreateDialog title="New Task" trigger={<></>} onSubmit={() => create.mutate()} open={showCreate} onOpenChange={setShowCreate}>
        <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
        <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Priority</Label><Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent></Select></div>
          <div><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
        </div>
      </CreateDialog>
    </div>
  )
}

function VentureDecisions({ ventureId }: { ventureId: string }) {
  const qc = useQueryClient()
  const items = useQuery({ queryKey: ['decisions', ventureId], queryFn: () => api.get(`/api/decisions?ventureId=${ventureId}`) })
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ title: '', context: '', decision: '', rationale: '' })
  const create = useMutation({ mutationFn: () => api.post('/api/decisions', { ...form, ventureId }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['decisions', ventureId] }); toast.success('Decision logged'); setShow(false); setForm({ title: '', context: '', decision: '', rationale: '' }) } })
  const del = useMutation({ mutationFn: (id: string) => api.del(`/api/decisions/${id}`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['decisions', ventureId] }); toast.success('Deleted') } })

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button onClick={() => setShow(true)} size="sm" className="bg-emerald-600 hover:bg-emerald-700"><Plus className="h-4 w-4 mr-1" />Decision</Button></div>
      {items.data?.map((d: any) => (
        <Card key={d.id} className="bg-zinc-900 border-zinc-800"><CardContent className="p-4">
          <div className="flex justify-between"><h4 className="font-medium">{d.title}</h4><button onClick={() => del.mutate(d.id)} className="text-zinc-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button></div>
          {d.context && <p className="text-xs text-zinc-400 mt-1">Context: {d.context}</p>}
          {d.decision && <p className="text-xs text-emerald-400 mt-1">Decision: {d.decision}</p>}
          {d.rationale && <p className="text-xs text-zinc-500 mt-1">Rationale: {d.rationale}</p>}
        </CardContent></Card>
      ))}
      <CreateDialog title="Log Decision" trigger={<></>} onSubmit={() => create.mutate()} open={show} onOpenChange={setShow}>
        <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
        <div><Label>Context</Label><Textarea value={form.context} onChange={e => setForm({ ...form, context: e.target.value })} /></div>
        <div><Label>Decision</Label><Textarea value={form.decision} onChange={e => setForm({ ...form, decision: e.target.value })} /></div>
        <div><Label>Rationale</Label><Textarea value={form.rationale} onChange={e => setForm({ ...form, rationale: e.target.value })} /></div>
      </CreateDialog>
    </div>
  )
}

function VentureMeetings({ ventureId }: { ventureId: string }) {
  const qc = useQueryClient()
  const items = useQuery({ queryKey: ['meetings', ventureId], queryFn: () => api.get(`/api/meetings?ventureId=${ventureId}`) })
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ title: '', notes: '', date: '', attendees: '' })
  const create = useMutation({ mutationFn: () => api.post('/api/meetings', { ...form, ventureId }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['meetings', ventureId] }); toast.success('Meeting added'); setShow(false); setForm({ title: '', notes: '', date: '', attendees: '' }) } })

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button onClick={() => setShow(true)} size="sm" className="bg-emerald-600 hover:bg-emerald-700"><Plus className="h-4 w-4 mr-1" />Meeting</Button></div>
      {items.data?.map((m: any) => (
        <Card key={m.id} className="bg-zinc-900 border-zinc-800"><CardContent className="p-4">
          <div className="flex justify-between"><h4 className="font-medium">{m.title}</h4><span className="text-xs text-zinc-500">{format(new Date(m.date), 'MMM d, yyyy')}</span></div>
          {m.attendees && <p className="text-xs text-zinc-400 mt-1">Attendees: {m.attendees}</p>}
          {m.notes && <p className="text-xs text-zinc-500 mt-1">{m.notes}</p>}
        </CardContent></Card>
      ))}
      <CreateDialog title="Add Meeting" trigger={<></>} onSubmit={() => create.mutate()} open={show} onOpenChange={setShow}>
        <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
        <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
        <div><Label>Attendees</Label><Input value={form.attendees} onChange={e => setForm({ ...form, attendees: e.target.value })} /></div>
        <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
      </CreateDialog>
    </div>
  )
}

function VentureContacts({ ventureId }: { ventureId: string }) {
  const qc = useQueryClient()
  const items = useQuery({ queryKey: ['contacts', ventureId], queryFn: () => api.get(`/api/contacts?ventureId=${ventureId}`) })
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ name: '', role: '', email: '', phone: '', notes: '' })
  const create = useMutation({ mutationFn: () => api.post('/api/contacts', { ...form, ventureId }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['contacts', ventureId] }); toast.success('Contact added'); setShow(false); setForm({ name: '', role: '', email: '', phone: '', notes: '' }) } })

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button onClick={() => setShow(true)} size="sm" className="bg-emerald-600 hover:bg-emerald-700"><Plus className="h-4 w-4 mr-1" />Contact</Button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.data?.map((c: any) => (
          <Card key={c.id} className="bg-zinc-900 border-zinc-800"><CardContent className="p-4">
            <h4 className="font-medium">{c.name}</h4>
            {c.role && <p className="text-xs text-zinc-400">{c.role}</p>}
            {c.email && <p className="text-xs text-emerald-400">{c.email}</p>}
            {c.phone && <p className="text-xs text-zinc-500">{c.phone}</p>}
          </CardContent></Card>
        ))}
      </div>
      <CreateDialog title="Add Contact" trigger={<></>} onSubmit={() => create.mutate()} open={show} onOpenChange={setShow}>
        <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
        <div><Label>Role</Label><Input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} /></div>
        <div><Label>Email</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
        <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
        <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
      </CreateDialog>
    </div>
  )
}

// ─── Finance Overview ────────────────────────────────────────────────
function FinanceOverview() {
  const accounts = useQuery({ queryKey: ['accounts'], queryFn: () => api.get('/api/finance/accounts') })
  const [aiInsight, setAiInsight] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const totalBalance = accounts.data?.reduce((s: number, a: any) => s + (a.balance || 0), 0) || 0
  const personal = accounts.data?.filter((a: any) => a.type === 'personal').reduce((s: number, a: any) => s + (a.balance || 0), 0) || 0
  const venture = accounts.data?.filter((a: any) => a.type === 'venture').reduce((s: number, a: any) => s + (a.balance || 0), 0) || 0

  const handleAI = async () => {
    setAiLoading(true)
    try {
      const res = await api.post('/api/ai/insights', { prompt: `Analyze my financial overview: Total balance $${totalBalance}, Personal accounts $${personal}, Venture accounts $${venture}. Number of accounts: ${accounts.data?.length || 0}. Give me brief actionable insights.` })
      setAiInsight(res.insight)
    } catch { setAiInsight('Could not generate insights.') }
    setAiLoading(false)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Finance Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Balance" value={`$${totalBalance.toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard title="Personal" value={`$${personal.toLocaleString()}`} icon={<Users className="h-5 w-5" />} />
        <StatCard title="Venture" value={`$${venture.toLocaleString()}`} icon={<Briefcase className="h-5 w-5" />} />
      </div>
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader><CardTitle className="text-lg">Accounts</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {accounts.data?.map((a: any) => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800">
                <div><span className="font-medium text-sm">{a.name}</span><Badge variant="outline" className="ml-2 text-[10px]">{a.type}</Badge></div>
                <span className={`font-semibold ${a.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>${a.balance?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="flex-row items-center justify-between"><CardTitle className="text-lg">AI Financial Insights</CardTitle><Button onClick={handleAI} size="sm" className="bg-emerald-600 hover:bg-emerald-700" disabled={aiLoading}>{aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4 mr-1" />}Analyze</Button></CardHeader>
        {aiInsight && <CardContent><p className="text-sm text-zinc-300 whitespace-pre-wrap">{aiInsight}</p></CardContent>}
      </Card>
    </div>
  )
}

// ─── Accounts ────────────────────────────────────────────────────────
function AccountsView() {
  const qc = useQueryClient()
  const accounts = useQuery({ queryKey: ['accounts'], queryFn: () => api.get('/api/finance/accounts') })
  const ventures = useQuery({ queryKey: ['ventures'], queryFn: () => api.get('/api/ventures') })
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'personal', balance: 0, currency: 'USD', description: '', ventureId: '' })
  const create = useMutation({ mutationFn: () => api.post('/api/finance/accounts', form), onSuccess: () => { qc.invalidateQueries({ queryKey: ['accounts'] }); toast.success('Account created'); setShow(false); setForm({ name: '', type: 'personal', balance: 0, currency: 'USD', description: '', ventureId: '' }) } })
  const del = useMutation({ mutationFn: (id: string) => api.del(`/api/finance/accounts/${id}`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['accounts'] }); toast.success('Account deleted') } })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">Accounts</h2><Button onClick={() => setShow(true)} className="bg-emerald-600 hover:bg-emerald-700"><Plus className="h-4 w-4 mr-1" />Account</Button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.data?.map((a: any) => (
          <Card key={a.id} className="bg-zinc-900 border-zinc-800"><CardContent className="p-4">
            <div className="flex justify-between"><h4 className="font-medium">{a.name}</h4><button onClick={() => del.mutate(a.id)} className="text-zinc-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button></div>
            <div className="flex items-center gap-2 mt-1"><Badge variant="outline" className="text-[10px]">{a.type}</Badge><span className="text-xs text-zinc-500">{a.currency}</span></div>
            <p className={`text-xl font-bold mt-2 ${a.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>${a.balance?.toLocaleString()}</p>
            {a.description && <p className="text-xs text-zinc-500 mt-1">{a.description}</p>}
          </CardContent></Card>
        ))}
      </div>
      <CreateDialog title="New Account" trigger={<></>} onSubmit={() => create.mutate()} open={show} onOpenChange={setShow}>
        <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Type</Label><Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="personal">Personal</SelectItem><SelectItem value="venture">Venture</SelectItem><SelectItem value="savings">Savings</SelectItem><SelectItem value="investment">Investment</SelectItem></SelectContent></Select></div>
          <div><Label>Balance</Label><Input type="number" value={form.balance} onChange={e => setForm({ ...form, balance: +e.target.value })} /></div>
        </div>
        <div><Label>Currency</Label><Select value={form.currency} onValueChange={v => setForm({ ...form, currency: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem><SelectItem value="GBP">GBP</SelectItem><SelectItem value="KES">KES</SelectItem></SelectContent></Select></div>
        {form.type === 'venture' && <div><Label>Linked Venture</Label><Select value={form.ventureId} onValueChange={v => setForm({ ...form, ventureId: v })}><SelectTrigger><SelectValue placeholder="Select venture" /></SelectTrigger><SelectContent>{ventures.data?.map((v: any) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent></Select></div>}
        <div><Label>Description</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
      </CreateDialog>
    </div>
  )
}

// ─── Transactions ────────────────────────────────────────────────────
function TransactionsView() {
  const qc = useQueryClient()
  const accounts = useQuery({ queryKey: ['accounts'], queryFn: () => api.get('/api/finance/accounts') })
  const transactions = useQuery({ queryKey: ['transactions'], queryFn: () => api.get('/api/finance/transactions') })
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ amount: 0, type: 'expense', category: '', description: '', date: format(new Date(), 'yyyy-MM-dd'), accountId: '', tags: '' })
  const create = useMutation({ mutationFn: () => api.post('/api/finance/transactions', form), onSuccess: () => { qc.invalidateQueries({ queryKey: ['transactions'] }); qc.invalidateQueries({ queryKey: ['accounts'] }); toast.success('Transaction added'); setShow(false); setForm({ amount: 0, type: 'expense', category: '', description: '', date: format(new Date(), 'yyyy-MM-dd'), accountId: '', tags: '' }) } })
  const del = useMutation({ mutationFn: (id: string) => api.del(`/api/finance/transactions/${id}`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['transactions'] }); toast.success('Deleted') } })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">Transactions</h2><Button onClick={() => setShow(true)} className="bg-emerald-600 hover:bg-emerald-700"><Plus className="h-4 w-4 mr-1" />Transaction</Button></div>
      <div className="space-y-2">
        {transactions.data?.map((t: any) => (
          <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800">
            <div className="flex items-center gap-3">
              {t.type === 'income' ? <TrendingUp className="h-4 w-4 text-emerald-400" /> : <TrendingDown className="h-4 w-4 text-red-400" />}
              <div><p className="text-sm font-medium">{t.description || t.category || 'Transaction'}</p><p className="text-xs text-zinc-500">{format(new Date(t.date), 'MMM d, yyyy')}{t.category && ` · ${t.category}`}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`font-semibold ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>{t.type === 'income' ? '+' : '-'}${t.amount?.toLocaleString()}</span>
              <button onClick={() => del.mutate(t.id)} className="text-zinc-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
      <CreateDialog title="New Transaction" trigger={<></>} onSubmit={() => create.mutate()} open={show} onOpenChange={setShow}>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Amount</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: +e.target.value })} /></div>
          <div><Label>Type</Label><Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="income">Income</SelectItem><SelectItem value="expense">Expense</SelectItem></SelectContent></Select></div>
        </div>
        <div><Label>Account</Label><Select value={form.accountId} onValueChange={v => setForm({ ...form, accountId: v })}><SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger><SelectContent>{accounts.data?.map((a: any) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Category</Label><Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></div>
          <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
        </div>
        <div><Label>Description</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
      </CreateDialog>
    </div>
  )
}

// ─── Budgets ─────────────────────────────────────────────────────────
function BudgetsView() {
  const qc = useQueryClient()
  const budgets = useQuery({ queryKey: ['budgets'], queryFn: () => api.get('/api/finance/budgets') })
  const accounts = useQuery({ queryKey: ['accounts'], queryFn: () => api.get('/api/finance/accounts') })
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ name: '', amount: 0, period: 'monthly', category: '', accountId: '', startDate: format(new Date(), 'yyyy-MM-dd') })
  const create = useMutation({ mutationFn: () => api.post('/api/finance/budgets', form), onSuccess: () => { qc.invalidateQueries({ queryKey: ['budgets'] }); toast.success('Budget created'); setShow(false) } })
  const del = useMutation({ mutationFn: (id: string) => api.del(`/api/finance/budgets/${id}`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['budgets'] }); toast.success('Deleted') } })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">Budgets</h2><Button onClick={() => setShow(true)} className="bg-emerald-600 hover:bg-emerald-700"><Plus className="h-4 w-4 mr-1" />Budget</Button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.data?.map((b: any) => {
          const pct = b.amount > 0 ? Math.min((b.spent / b.amount) * 100, 100) : 0
          return (
            <Card key={b.id} className="bg-zinc-900 border-zinc-800"><CardContent className="p-4">
              <div className="flex justify-between"><h4 className="font-medium">{b.name}</h4><button onClick={() => del.mutate(b.id)} className="text-zinc-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button></div>
              <p className="text-xs text-zinc-500 mt-1">{b.period}{b.category && ` · ${b.category}`}</p>
              <div className="mt-3"><div className="flex justify-between text-sm mb-1"><span className="text-zinc-400">${b.spent?.toLocaleString()}</span><span className="text-zinc-500">${b.amount?.toLocaleString()}</span></div><Progress value={pct} className="h-2" /></div>
              <p className="text-xs text-right mt-1 text-zinc-500">{pct.toFixed(0)}% used</p>
            </CardContent></Card>
          )
        })}
      </div>
      <CreateDialog title="New Budget" trigger={<></>} onSubmit={() => create.mutate()} open={show} onOpenChange={setShow}>
        <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Amount</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: +e.target.value })} /></div>
          <div><Label>Period</Label><Select value={form.period} onValueChange={v => setForm({ ...form, period: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="quarterly">Quarterly</SelectItem></SelectContent></Select></div>
        </div>
        <div><Label>Account</Label><Select value={form.accountId} onValueChange={v => setForm({ ...form, accountId: v })}><SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger><SelectContent>{accounts.data?.map((a: any) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Category</Label><Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></div>
          <div><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></div>
        </div>
      </CreateDialog>
    </div>
  )
}

// ─── Academic View ───────────────────────────────────────────────────
function AcademicView() {
  const qc = useQueryClient()
  const terms = useQuery({ queryKey: ['terms'], queryFn: () => api.get('/api/academic/terms') })
  const [showTerm, setShowTerm] = useState(false)
  const [showUnit, setShowUnit] = useState(false)
  const [showNote, setShowNote] = useState(false)
  const [termForm, setTermForm] = useState({ name: '', startDate: '', endDate: '' })
  const [unitForm, setUnitForm] = useState({ name: '', code: '', hasPracticals: false, hasProject: false, hasExams: true, termId: '' })
  const [noteForm, setNoteForm] = useState({ title: '', content: '', type: 'general', unitId: '' })
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null)

  const createTerm = useMutation({ mutationFn: () => api.post('/api/academic/terms', termForm), onSuccess: () => { qc.invalidateQueries({ queryKey: ['terms'] }); toast.success('Term created'); setShowTerm(false); setTermForm({ name: '', startDate: '', endDate: '' }) } })
  const createUnit = useMutation({ mutationFn: () => api.post('/api/academic/units', unitForm), onSuccess: () => { qc.invalidateQueries({ queryKey: ['terms'] }); toast.success('Unit added'); setShowUnit(false); setUnitForm({ name: '', code: '', hasPracticals: false, hasProject: false, hasExams: true, termId: '' }) } })
  const createNote = useMutation({ mutationFn: () => api.post('/api/academic/unit-notes', noteForm), onSuccess: () => { qc.invalidateQueries({ queryKey: ['terms'] }); toast.success('Note added'); setShowNote(false); setNoteForm({ title: '', content: '', type: 'general', unitId: '' }) } })
  const updateTermStatus = useMutation({ mutationFn: ({ id, status }: any) => api.put(`/api/academic/terms/${id}`, { status }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['terms'] }); toast.success('Term status updated') } })

  const activeTerm = terms.data?.find((t: any) => t.status === 'active')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">Academics</h2>
        <div className="flex gap-2">
          <Button onClick={() => setShowTerm(true)} size="sm" className="bg-emerald-600 hover:bg-emerald-700"><Plus className="h-4 w-4 mr-1" />Term</Button>
          {activeTerm && <Button onClick={() => { setUnitForm(p => ({ ...p, termId: activeTerm.id })); setShowUnit(true) }} size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" />Unit</Button>}
        </div>
      </div>

      {terms.data?.map((term: any) => (
        <Card key={term.id} className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <div><CardTitle className="text-lg">{term.name}</CardTitle><p className="text-xs text-zinc-500">{format(new Date(term.startDate), 'MMM d, yyyy')}{term.endDate ? ` — ${format(new Date(term.endDate), 'MMM d, yyyy')}` : ''}</p></div>
            <div className="flex items-center gap-2"><Badge className={term.status === 'active' ? 'bg-emerald-600/20 text-emerald-400' : 'bg-zinc-600/20 text-zinc-400'}>{term.status}</Badge>
              {term.status === 'active' && <Button size="sm" variant="outline" onClick={() => updateTermStatus.mutate({ id: term.id, status: 'completed' })}>End Term</Button>}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {term.units?.map((u: any) => (
              <div key={u.id} className="border border-zinc-800 rounded-lg">
                <button onClick={() => setExpandedUnit(expandedUnit === u.id ? null : u.id)} className="flex items-center justify-between w-full p-3 hover:bg-zinc-800/50">
                  <div className="flex items-center gap-2"><span className="font-medium text-sm">{u.name}</span>{u.code && <span className="text-xs text-zinc-500">({u.code})</span>}
                    {u.hasPracticals && <Badge variant="outline" className="text-[9px]">Practicals</Badge>}
                    {u.hasProject && <Badge variant="outline" className="text-[9px]">Project</Badge>}
                  </div>
                  <div className="flex items-center gap-2"><Badge className={`text-[9px] ${u.status === 'completed' ? 'bg-emerald-600/20 text-emerald-400' : 'bg-amber-600/20 text-amber-400'}`}>{u.status}</Badge>
                    {u.grade && <span className="text-xs font-semibold text-emerald-400">{u.grade}</span>}
                    {expandedUnit === u.id ? <ChevronDown className="h-4 w-4 text-zinc-500" /> : <ChevronRight className="h-4 w-4 text-zinc-500" />}
                  </div>
                </button>
                {expandedUnit === u.id && (
                  <div className="p-3 pt-0 space-y-2 border-t border-zinc-800">
                    {u.unitNotes?.map((n: any) => (
                      <div key={n.id} className="p-2 rounded bg-zinc-800/50"><p className="text-sm font-medium">{n.title}</p><p className="text-xs text-zinc-400 mt-1">{n.content}</p></div>
                    ))}
                    <Button size="sm" variant="ghost" onClick={() => { setNoteForm(p => ({ ...p, unitId: u.id })); setShowNote(true) }}><Plus className="h-3 w-3 mr-1" />Add Note</Button>
                  </div>
                )}
              </div>
            ))}
            {!term.units?.length && <p className="text-sm text-zinc-500">No units yet</p>}
          </CardContent>
        </Card>
      ))}

      <CreateDialog title="New Term" trigger={<></>} onSubmit={() => createTerm.mutate()} open={showTerm} onOpenChange={setShowTerm}>
        <div><Label>Term Name</Label><Input value={termForm.name} onChange={e => setTermForm({ ...termForm, name: e.target.value })} placeholder="e.g. Semester 1 2026" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Start Date</Label><Input type="date" value={termForm.startDate} onChange={e => setTermForm({ ...termForm, startDate: e.target.value })} /></div>
          <div><Label>End Date</Label><Input type="date" value={termForm.endDate} onChange={e => setTermForm({ ...termForm, endDate: e.target.value })} /></div>
        </div>
      </CreateDialog>
      <CreateDialog title="New Unit" trigger={<></>} onSubmit={() => createUnit.mutate()} open={showUnit} onOpenChange={setShowUnit}>
        <div><Label>Unit Name</Label><Input value={unitForm.name} onChange={e => setUnitForm({ ...unitForm, name: e.target.value })} /></div>
        <div><Label>Code</Label><Input value={unitForm.code} onChange={e => setUnitForm({ ...unitForm, code: e.target.value })} placeholder="e.g. CS101" /></div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={unitForm.hasPracticals} onChange={e => setUnitForm({ ...unitForm, hasPracticals: e.target.checked })} /> Practicals</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={unitForm.hasProject} onChange={e => setUnitForm({ ...unitForm, hasProject: e.target.checked })} /> Project</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={unitForm.hasExams} onChange={e => setUnitForm({ ...unitForm, hasExams: e.target.checked })} /> Exams</label>
        </div>
      </CreateDialog>
      <CreateDialog title="New Note" trigger={<></>} onSubmit={() => createNote.mutate()} open={showNote} onOpenChange={setShowNote}>
        <div><Label>Title</Label><Input value={noteForm.title} onChange={e => setNoteForm({ ...noteForm, title: e.target.value })} /></div>
        <div><Label>Type</Label><Select value={noteForm.type} onValueChange={v => setNoteForm({ ...noteForm, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="general">General</SelectItem><SelectItem value="lecture">Lecture</SelectItem><SelectItem value="practical">Practical</SelectItem><SelectItem value="assignment">Assignment</SelectItem><SelectItem value="exam-prep">Exam Prep</SelectItem></SelectContent></Select></div>
        <div><Label>Content</Label><Textarea rows={5} value={noteForm.content} onChange={e => setNoteForm({ ...noteForm, content: e.target.value })} /></div>
      </CreateDialog>
    </div>
  )
}

function AcademicNotesView() { return <AcademicView /> }

// ─── Relationships ───────────────────────────────────────────────────
function RelationshipsView() {
  const qc = useQueryClient()
  const items = useQuery({ queryKey: ['relationships'], queryFn: () => api.get('/api/relationships') })
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'friend', notes: '', birthday: '' })
  const create = useMutation({ mutationFn: () => api.post('/api/relationships', form), onSuccess: () => { qc.invalidateQueries({ queryKey: ['relationships'] }); toast.success('Added'); setShow(false); setForm({ name: '', type: 'friend', notes: '', birthday: '' }) } })
  const del = useMutation({ mutationFn: (id: string) => api.del(`/api/relationships/${id}`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['relationships'] }); toast.success('Deleted') } })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">Relationships</h2><Button onClick={() => setShow(true)} className="bg-emerald-600 hover:bg-emerald-700"><Plus className="h-4 w-4 mr-1" />Add</Button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.data?.map((r: any) => (
          <Card key={r.id} className="bg-zinc-900 border-zinc-800"><CardContent className="p-4">
            <div className="flex justify-between"><h4 className="font-medium">{r.name}</h4><button onClick={() => del.mutate(r.id)} className="text-zinc-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button></div>
            <Badge variant="outline" className="mt-1 text-[10px]">{r.type}</Badge>
            {r.notes && <p className="text-xs text-zinc-400 mt-2">{r.notes}</p>}
            {r.lastContact && <p className="text-xs text-zinc-500 mt-1">Last contact: {formatDistanceToNow(new Date(r.lastContact))} ago</p>}
          </CardContent></Card>
        ))}
      </div>
      <CreateDialog title="Add Relationship" trigger={<></>} onSubmit={() => create.mutate()} open={show} onOpenChange={setShow}>
        <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
        <div><Label>Type</Label><Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="family">Family</SelectItem><SelectItem value="friend">Friend</SelectItem><SelectItem value="colleague">Colleague</SelectItem><SelectItem value="mentor">Mentor</SelectItem></SelectContent></Select></div>
        <div><Label>Birthday</Label><Input type="date" value={form.birthday} onChange={e => setForm({ ...form, birthday: e.target.value })} /></div>
        <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
      </CreateDialog>
    </div>
  )
}

// ─── Time Planner ────────────────────────────────────────────────────
function TimePlannerView() {
  const qc = useQueryClient()
  const items = useQuery({ queryKey: ['time-commitments'], queryFn: () => api.get('/api/time-commitments') })
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'family', date: '', duration: 60, notes: '' })
  const create = useMutation({ mutationFn: () => api.post('/api/time-commitments', form), onSuccess: () => { qc.invalidateQueries({ queryKey: ['time-commitments'] }); toast.success('Added'); setShow(false) } })
  const del = useMutation({ mutationFn: (id: string) => api.del(`/api/time-commitments/${id}`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['time-commitments'] }); toast.success('Deleted') } })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">Time Planner</h2><Button onClick={() => setShow(true)} className="bg-emerald-600 hover:bg-emerald-700"><Plus className="h-4 w-4 mr-1" />Add</Button></div>
      <div className="space-y-2">
        {items.data?.map((c: any) => (
          <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800">
            <div><p className="text-sm font-medium">{c.title}</p><p className="text-xs text-zinc-500">{format(new Date(c.date), 'MMM d, yyyy')} · {c.duration} min</p></div>
            <div className="flex items-center gap-2"><Badge variant="outline" className="text-[10px]">{c.type}</Badge><button onClick={() => del.mutate(c.id)} className="text-zinc-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button></div>
          </div>
        ))}
      </div>
      <CreateDialog title="Add Commitment" trigger={<></>} onSubmit={() => create.mutate()} open={show} onOpenChange={setShow}>
        <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Type</Label><Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="family">Family</SelectItem><SelectItem value="friends">Friends</SelectItem><SelectItem value="self">Self</SelectItem><SelectItem value="work">Work</SelectItem></SelectContent></Select></div>
          <div><Label>Duration (min)</Label><Input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: +e.target.value })} /></div>
        </div>
        <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
        <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
      </CreateDialog>
    </div>
  )
}

// ─── Life Audit ──────────────────────────────────────────────────────
function LifeAuditView() {
  const qc = useQueryClient()
  const checks = useQuery({ queryKey: ['balance-checks'], queryFn: () => api.get('/api/balance-checks') })
  const [show, setShow] = useState(false)
  const [scores, setScores] = useState({ careerScore: 5, healthScore: 5, relationshipsScore: 5, financesScore: 5, educationScore: 5, mentalWellbeingScore: 5, notes: '' })
  const create = useMutation({ mutationFn: () => api.post('/api/balance-checks', { ...scores, weekStart: new Date().toISOString() }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['balance-checks'] }); toast.success('Life audit saved'); setShow(false) } })

  const latest = checks.data?.[0]
  const radarData = latest ? [
    { subject: 'Career', value: latest.careerScore }, { subject: 'Health', value: latest.healthScore },
    { subject: 'Relationships', value: latest.relationshipsScore }, { subject: 'Finances', value: latest.financesScore },
    { subject: 'Education', value: latest.educationScore }, { subject: 'Mental Wellbeing', value: latest.mentalWellbeingScore },
  ] : []

  const dims = [{ key: 'careerScore', label: 'Career & Business' }, { key: 'healthScore', label: 'Health & Wellness' }, { key: 'relationshipsScore', label: 'Relationships' }, { key: 'financesScore', label: 'Finances' }, { key: 'educationScore', label: 'Education' }, { key: 'mentalWellbeingScore', label: 'Mental Wellbeing' }] as const

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">Life Audit</h2><Button onClick={() => setShow(true)} className="bg-emerald-600 hover:bg-emerald-700"><Plus className="h-4 w-4 mr-1" />New Check</Button></div>
      {latest && (
        <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-6">
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={radarData}><PolarGrid stroke="#333" /><PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 12 }} /><PolarRadiusAxis domain={[0, 10]} tick={{ fill: '#666', fontSize: 10 }} /><Radar name="Score" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.2} /></RadarChart>
          </ResponsiveContainer>
          <p className="text-xs text-zinc-500 text-center mt-2">Latest check: {format(new Date(latest.weekStart), 'MMM d, yyyy')}</p>
        </CardContent></Card>
      )}
      <Card className="bg-zinc-900 border-zinc-800"><CardHeader><CardTitle className="text-lg">History</CardTitle></CardHeader><CardContent className="space-y-2">
        {checks.data?.map((c: any) => (
          <div key={c.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800">
            <span className="text-sm">{format(new Date(c.weekStart), 'MMM d, yyyy')}</span>
            <div className="flex gap-1">{dims.map(d => <Badge key={d.key} variant="outline" className="text-[9px]">{d.label.split(' ')[0]}: {(c as any)[d.key]}</Badge>)}</div>
          </div>
        ))}
      </CardContent></Card>
      <CreateDialog title="New Life Audit" trigger={<></>} onSubmit={() => create.mutate()} open={show} onOpenChange={setShow}>
        {dims.map(d => (
          <div key={d.key}><Label className="text-sm">{d.label}: {scores[d.key]}</Label><Slider value={[scores[d.key]]} onValueChange={([v]) => setScores({ ...scores, [d.key]: v })} min={1} max={10} step={1} className="mt-2" /></div>
        ))}
        <div><Label>Notes</Label><Textarea value={scores.notes} onChange={e => setScores({ ...scores, notes: e.target.value })} /></div>
      </CreateDialog>
    </div>
  )
}

// ─── Insights ────────────────────────────────────────────────────────
function InsightsView() {
  const qc = useQueryClient()
  const items = useQuery({ queryKey: ['insights'], queryFn: () => api.get('/api/insights') })
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', source: '', tags: '' })
  const create = useMutation({ mutationFn: () => api.post('/api/insights', form), onSuccess: () => { qc.invalidateQueries({ queryKey: ['insights'] }); toast.success('Insight captured'); setShow(false) } })
  const del = useMutation({ mutationFn: (id: string) => api.del(`/api/insights/${id}`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['insights'] }); toast.success('Deleted') } })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">Insights</h2><Button onClick={() => setShow(true)} className="bg-emerald-600 hover:bg-emerald-700"><Plus className="h-4 w-4 mr-1" />Insight</Button></div>
      <div className="space-y-3">
        {items.data?.map((i: any) => (
          <Card key={i.id} className="bg-zinc-900 border-zinc-800"><CardContent className="p-4">
            <div className="flex justify-between"><h4 className="font-medium">{i.title}</h4><button onClick={() => del.mutate(i.id)} className="text-zinc-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button></div>
            <p className="text-sm text-zinc-400 mt-1">{i.content}</p>
            {i.tags && <div className="flex gap-1 mt-2">{i.tags.split(',').map((t: string, idx: number) => <Badge key={idx} variant="outline" className="text-[10px]">{t.trim()}</Badge>)}</div>}
          </CardContent></Card>
        ))}
      </div>
      <CreateDialog title="New Insight" trigger={<></>} onSubmit={() => create.mutate()} open={show} onOpenChange={setShow}>
        <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
        <div><Label>Content</Label><Textarea rows={4} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Source</Label><Input value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} /></div>
          <div><Label>Tags (comma sep)</Label><Input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} /></div>
        </div>
      </CreateDialog>
    </div>
  )
}

// ─── Habits ──────────────────────────────────────────────────────────
function HabitsView() {
  const qc = useQueryClient()
  const habits = useQuery({ queryKey: ['habits'], queryFn: () => api.get('/api/habits') })
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', frequency: 'daily' })
  const create = useMutation({ mutationFn: () => api.post('/api/habits', form), onSuccess: () => { qc.invalidateQueries({ queryKey: ['habits'] }); toast.success('Habit created'); setShow(false) } })
  const del = useMutation({ mutationFn: (id: string) => api.del(`/api/habits/${id}`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['habits'] }); toast.success('Deleted') } })
  const checkIn = useMutation({ mutationFn: (habitId: string) => api.post('/api/habit-logs', { habitId, date: new Date().toISOString(), completed: true }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['habits'] }); toast.success('Checked in!') } })

  const today = format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">Habits</h2><Button onClick={() => setShow(true)} className="bg-emerald-600 hover:bg-emerald-700"><Plus className="h-4 w-4 mr-1" />Habit</Button></div>
      <div className="space-y-3">
        {habits.data?.map((h: any) => {
          const checkedToday = h.logs?.some((l: any) => format(new Date(l.date), 'yyyy-MM-dd') === today)
          const streak = h.logs?.filter((l: any) => l.completed).length || 0
          return (
            <Card key={h.id} className="bg-zinc-900 border-zinc-800"><CardContent className="p-4 flex items-center gap-4">
              <button onClick={() => !checkedToday && checkIn.mutate(h.id)} className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-colors ${checkedToday ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' : 'border-zinc-600 hover:border-emerald-500'}`}>
                {checkedToday && <CheckCircle2 className="h-5 w-5" />}
              </button>
              <div className="flex-1"><h4 className="font-medium text-sm">{h.name}</h4><p className="text-xs text-zinc-500">{h.frequency} · Streak: {streak}</p></div>
              <button onClick={() => del.mutate(h.id)} className="text-zinc-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
            </CardContent></Card>
          )
        })}
      </div>
      <CreateDialog title="New Habit" trigger={<></>} onSubmit={() => create.mutate()} open={show} onOpenChange={setShow}>
        <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
        <div><Label>Description</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
        <div><Label>Frequency</Label><Select value={form.frequency} onValueChange={v => setForm({ ...form, frequency: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem></SelectContent></Select></div>
      </CreateDialog>
    </div>
  )
}

// ─── Daily Check-In ──────────────────────────────────────────────────
function DailyCheckInView() {
  const qc = useQueryClient()
  const items = useQuery({ queryKey: ['daily-checkins'], queryFn: () => api.get('/api/daily-checkins') })
  const [form, setForm] = useState({ focus: '', gratitude: '', challenges: '', notes: '' })
  const create = useMutation({ mutationFn: () => api.post('/api/daily-checkins', { ...form, date: new Date().toISOString() }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['daily-checkins'] }); toast.success('Check-in saved'); setForm({ focus: '', gratitude: '', challenges: '', notes: '' }) } })

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Daily Check-In</h2>
      <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-4 space-y-4">
        <div><Label>Today&apos;s Focus</Label><Input value={form.focus} onChange={e => setForm({ ...form, focus: e.target.value })} placeholder="What's the main thing today?" /></div>
        <div><Label>Gratitude</Label><Textarea value={form.gratitude} onChange={e => setForm({ ...form, gratitude: e.target.value })} placeholder="What are you grateful for?" /></div>
        <div><Label>Challenges</Label><Textarea value={form.challenges} onChange={e => setForm({ ...form, challenges: e.target.value })} placeholder="What's challenging?" /></div>
        <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
        <Button onClick={() => create.mutate()} className="bg-emerald-600 hover:bg-emerald-700 w-full">Save Check-In</Button>
      </CardContent></Card>
      <div className="space-y-2">
        {items.data?.slice(0, 7).map((c: any) => (
          <Card key={c.id} className="bg-zinc-900 border-zinc-800"><CardContent className="p-3">
            <p className="text-xs text-zinc-500">{format(new Date(c.date), 'EEEE, MMM d')}</p>
            {c.focus && <p className="text-sm mt-1"><span className="text-zinc-400">Focus:</span> {c.focus}</p>}
            {c.gratitude && <p className="text-sm"><span className="text-zinc-400">Gratitude:</span> {c.gratitude}</p>}
          </CardContent></Card>
        ))}
      </div>
    </div>
  )
}

// ─── Weekly Review ───────────────────────────────────────────────────
function WeeklyReviewView() {
  const qc = useQueryClient()
  const items = useQuery({ queryKey: ['weekly-reviews'], queryFn: () => api.get('/api/weekly-reviews') })
  const [form, setForm] = useState({ wins: '', challenges: '', lessons: '', adjustments: '' })
  const create = useMutation({ mutationFn: () => api.post('/api/weekly-reviews', { ...form, weekStart: new Date().toISOString() }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['weekly-reviews'] }); toast.success('Review saved'); setForm({ wins: '', challenges: '', lessons: '', adjustments: '' }) } })

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Weekly Review</h2>
      <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-4 space-y-4">
        <div><Label>Wins</Label><Textarea value={form.wins} onChange={e => setForm({ ...form, wins: e.target.value })} placeholder="What went well?" /></div>
        <div><Label>Challenges</Label><Textarea value={form.challenges} onChange={e => setForm({ ...form, challenges: e.target.value })} /></div>
        <div><Label>Lessons</Label><Textarea value={form.lessons} onChange={e => setForm({ ...form, lessons: e.target.value })} /></div>
        <div><Label>Adjustments</Label><Textarea value={form.adjustments} onChange={e => setForm({ ...form, adjustments: e.target.value })} /></div>
        <Button onClick={() => create.mutate()} className="bg-emerald-600 hover:bg-emerald-700 w-full">Save Review</Button>
      </CardContent></Card>
      <div className="space-y-2">
        {items.data?.slice(0, 4).map((r: any) => (
          <Card key={r.id} className="bg-zinc-900 border-zinc-800"><CardContent className="p-3">
            <p className="text-xs text-zinc-500 mb-1">Week of {format(new Date(r.weekStart), 'MMM d, yyyy')}</p>
            {r.wins && <p className="text-sm"><span className="text-emerald-400">Wins:</span> {r.wins}</p>}
            {r.lessons && <p className="text-sm"><span className="text-amber-400">Lessons:</span> {r.lessons}</p>}
          </CardContent></Card>
        ))}
      </div>
    </div>
  )
}

// ─── Brain Dump ──────────────────────────────────────────────────────
function BrainDumpView() {
  const qc = useQueryClient()
  const items = useQuery({ queryKey: ['brain-dumps'], queryFn: () => api.get('/api/brain-dumps') })
  const [form, setForm] = useState({ content: '', tags: '' })
  const create = useMutation({ mutationFn: () => api.post('/api/brain-dumps', form), onSuccess: () => { qc.invalidateQueries({ queryKey: ['brain-dumps'] }); toast.success('Dumped!'); setForm({ content: '', tags: '' }) } })
  const del = useMutation({ mutationFn: (id: string) => api.del(`/api/brain-dumps/${id}`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['brain-dumps'] }); toast.success('Deleted') } })

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Brain Dump</h2>
      <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-4 space-y-3">
        <Textarea rows={4} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Dump everything on your mind..." />
        <div className="flex gap-3">
          <Input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="Tags (comma separated)" className="flex-1" />
          <Button onClick={() => create.mutate()} className="bg-emerald-600 hover:bg-emerald-700">Dump</Button>
        </div>
      </CardContent></Card>
      <div className="space-y-2">
        {items.data?.map((d: any) => (
          <Card key={d.id} className="bg-zinc-900 border-zinc-800"><CardContent className="p-3">
            <div className="flex justify-between"><p className="text-sm whitespace-pre-wrap flex-1">{d.content}</p><button onClick={() => del.mutate(d.id)} className="text-zinc-500 hover:text-red-400 ml-2"><Trash2 className="h-4 w-4" /></button></div>
            {d.tags && <div className="flex gap-1 mt-2">{d.tags.split(',').map((t: string, i: number) => <Badge key={i} variant="outline" className="text-[10px]">{t.trim()}</Badge>)}</div>}
            <p className="text-xs text-zinc-600 mt-1">{formatDistanceToNow(new Date(d.createdAt))} ago</p>
          </CardContent></Card>
        ))}
      </div>
    </div>
  )
}

// ─── Digital Store ───────────────────────────────────────────────────
function DigitalStoreView() {
  const qc = useQueryClient()
  const items = useQuery({ queryKey: ['digital-items'], queryFn: () => api.get('/api/digital-store') })
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ title: '', category: 'note', content: '', tags: '', isProtected: false })
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set())
  const create = useMutation({ mutationFn: () => api.post('/api/digital-store', form), onSuccess: () => { qc.invalidateQueries({ queryKey: ['digital-items'] }); toast.success('Item stored'); setShow(false); setForm({ title: '', category: 'note', content: '', tags: '', isProtected: false }) } })
  const del = useMutation({ mutationFn: (id: string) => api.del(`/api/digital-store/${id}`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['digital-items'] }); toast.success('Deleted') } })

  const toggleVisible = (id: string) => setVisibleItems(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">Digital Store</h2><Button onClick={() => setShow(true)} className="bg-emerald-600 hover:bg-emerald-700"><Plus className="h-4 w-4 mr-1" />Item</Button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.data?.map((d: any) => {
          const isVisible = visibleItems.has(d.id)
          const catIcon = d.category === 'password' ? <Key className="h-3.5 w-3.5" /> : d.category === 'document' ? <FileText className="h-3.5 w-3.5" /> : <StickyNote className="h-3.5 w-3.5" />
          return (
            <Card key={d.id} className="bg-zinc-900 border-zinc-800"><CardContent className="p-4">
              <div className="flex items-center justify-between"><div className="flex items-center gap-2">{catIcon}<h4 className="font-medium text-sm">{d.title}</h4></div><div className="flex items-center gap-2">
                {d.isProtected && <button onClick={() => toggleVisible(d.id)} className="text-zinc-400 hover:text-emerald-400">{isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>}
                <button onClick={() => del.mutate(d.id)} className="text-zinc-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
              </div></div>
              <Badge variant="outline" className="mt-1 text-[10px]">{d.category}</Badge>
              <p className="text-sm text-zinc-400 mt-2 font-mono whitespace-pre-wrap">{d.isProtected && !isVisible ? '••••••••••••' : d.content}</p>
            </CardContent></Card>
          )
        })}
      </div>
      <CreateDialog title="Store Item" trigger={<></>} onSubmit={() => create.mutate()} open={show} onOpenChange={setShow}>
        <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
        <div><Label>Category</Label><Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="note">Note</SelectItem><SelectItem value="password">Password</SelectItem><SelectItem value="document">Document</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
        <div><Label>Content</Label><Textarea rows={4} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} /></div>
        <div><Label>Tags</Label><Input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="comma separated" /></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isProtected} onChange={e => setForm({ ...form, isProtected: e.target.checked })} /> Protected (hide content by default)</label>
      </CreateDialog>
    </div>
  )
}

// ─── Search ──────────────────────────────────────────────────────────
function SearchView() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const doSearch = async () => {
    if (query.length < 2) return
    setLoading(true)
    try { setResults(await api.get(`/api/search?q=${encodeURIComponent(query)}`)) } catch { setResults(null) }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Search</h2>
      <div className="flex gap-3">
        <Input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && doSearch()} placeholder="Search everything..." className="flex-1" />
        <Button onClick={doSearch} className="bg-emerald-600 hover:bg-emerald-700">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}</Button>
      </div>
      {results && (
        <div className="space-y-4">
          {results.ventures?.length > 0 && <Card className="bg-zinc-900 border-zinc-800"><CardHeader><CardTitle className="text-sm">Ventures</CardTitle></CardHeader><CardContent>{results.ventures.map((v: any) => <p key={v.id} className="text-sm py-1">{v.name}</p>)}</CardContent></Card>}
          {results.tasks?.length > 0 && <Card className="bg-zinc-900 border-zinc-800"><CardHeader><CardTitle className="text-sm">Tasks</CardTitle></CardHeader><CardContent>{results.tasks.map((t: any) => <p key={t.id} className="text-sm py-1">{t.title}</p>)}</CardContent></Card>}
          {results.brainDumps?.length > 0 && <Card className="bg-zinc-900 border-zinc-800"><CardHeader><CardTitle className="text-sm">Brain Dumps</CardTitle></CardHeader><CardContent>{results.brainDumps.map((d: any) => <p key={d.id} className="text-sm py-1 truncate">{d.content}</p>)}</CardContent></Card>}
          {results.insights?.length > 0 && <Card className="bg-zinc-900 border-zinc-800"><CardHeader><CardTitle className="text-sm">Insights</CardTitle></CardHeader><CardContent>{results.insights.map((i: any) => <p key={i.id} className="text-sm py-1">{i.title}</p>)}</CardContent></Card>}
          {results.digitalItems?.length > 0 && <Card className="bg-zinc-900 border-zinc-800"><CardHeader><CardTitle className="text-sm">Digital Items</CardTitle></CardHeader><CardContent>{results.digitalItems.map((d: any) => <p key={d.id} className="text-sm py-1">{d.title}</p>)}</CardContent></Card>}
          {Object.values(results).every((v: any) => !v?.length) && <p className="text-zinc-500 text-sm">No results found</p>}
        </div>
      )}
    </div>
  )
}

// ─── Settings ────────────────────────────────────────────────────────
function SettingsView() {
  const { theme, setTheme } = useTheme()
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>
      <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div><p className="font-medium">Dark Mode</p><p className="text-xs text-zinc-500">Toggle between light and dark themes</p></div>
          <Switch checked={theme === 'dark'} onCheckedChange={v => setTheme(v ? 'dark' : 'light')} />
        </div>
      </CardContent></Card>
    </div>
  )
}
