'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './Store'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Plus, Trash2, Users, Calendar, Heart, Repeat, Lightbulb, Target, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { CheckCircle2 } from 'lucide-react'

export function RelationshipsView() {
  const qc = useQueryClient()
  const items = useQuery({ queryKey: ['relationships'], queryFn: () => api.get('/api/relationships') })
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'friend', notes: '', birthday: '' })
  const create = useMutation({ mutationFn: () => api.post('/api/relationships', { ...form, birthday: form.birthday || undefined, lastContact: new Date().toISOString() }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['relationships'] }); toast.success('Relationship added'); setShow(false); setForm({ name: '', type: 'friend', notes: '', birthday: '' }) } })

  const typeColors: Record<string, string> = { friend: 'bg-blue-700/20 text-blue-400', family: 'bg-pink-700/20 text-pink-400', partner: 'bg-red-700/20 text-red-400', colleague: 'bg-amber-700/20 text-amber-400', mentor: 'bg-purple-700/20 text-purple-400' }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">Relationships</h2><Button onClick={() => setShow(true)} className="bg-green-700 hover:bg-green-800"><Plus className="h-4 w-4 mr-1" />Relationship</Button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.data?.map((r: any) => (
          <Card key={r.id} className="bg-stone-900 border-stone-800"><CardContent className="p-4">
            <div className="flex justify-between"><h4 className="font-medium">{r.name}</h4><Badge className={`text-[10px] ${typeColors[r.type] || 'bg-stone-700/20 text-stone-400'}`}>{r.type}</Badge></div>
            {r.notes && <p className="text-xs text-stone-400 mt-1">{r.notes}</p>}
            {r.birthday && <p className="text-xs text-stone-500 mt-1"><Calendar className="h-3 w-3 inline mr-1" />{format(new Date(r.birthday), 'MMM d')}</p>}
          </CardContent></Card>
        ))}
      </div>
      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent className="bg-stone-900 border-stone-800 text-stone-100">
          <DialogHeader><DialogTitle>Add Relationship</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Type</Label><Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="friend">Friend</SelectItem><SelectItem value="family">Family</SelectItem><SelectItem value="partner">Partner</SelectItem><SelectItem value="colleague">Colleague</SelectItem><SelectItem value="mentor">Mentor</SelectItem></SelectContent></Select></div>
            <div><Label>Birthday</Label><Input type="date" value={form.birthday} onChange={e => setForm({ ...form, birthday: e.target.value })} /></div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={() => create.mutate()} className="bg-green-700 hover:bg-green-800">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function TimePlannerView() {
  const qc = useQueryClient()
  const items = useQuery({ queryKey: ['time-commitments'], queryFn: () => api.get('/api/time-commitments') })
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'family', date: '', duration: 60, notes: '' })
  const create = useMutation({ mutationFn: () => api.post('/api/time-commitments', { ...form, date: form.date || new Date().toISOString() }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['time-commitments'] }); toast.success('Commitment added'); setShow(false) } })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">Time Planner</h2><Button onClick={() => setShow(true)} className="bg-green-700 hover:bg-green-800"><Plus className="h-4 w-4 mr-1" />Commitment</Button></div>
      <div className="space-y-2">
        {items.data?.map((c: any) => (
          <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-stone-900 border border-stone-800">
            <div><span className="font-medium text-sm">{c.title}</span><div className="flex gap-2 mt-0.5"><Badge variant="outline" className="text-[10px]">{c.type}</Badge><span className="text-xs text-stone-500">{format(new Date(c.date), 'MMM d')} · {c.duration}min</span></div></div>
          </div>
        ))}
      </div>
      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent className="bg-stone-900 border-stone-800 text-stone-100">
          <DialogHeader><DialogTitle>Add Commitment</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Type</Label><Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="family">Family</SelectItem><SelectItem value="friends">Friends</SelectItem><SelectItem value="self">Self</SelectItem><SelectItem value="partner">Partner</SelectItem></SelectContent></Select></div>
              <div><Label>Duration (min)</Label><Input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: +e.target.value })} /></div>
            </div>
            <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
            <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={() => create.mutate()} className="bg-green-700 hover:bg-green-800">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function LifeAuditView() {
  const qc = useQueryClient()
  const checks = useQuery({ queryKey: ['balance-checks'], queryFn: () => api.get('/api/balance-checks') })
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ careerScore: 5, healthScore: 5, relationshipsScore: 5, financesScore: 5, educationScore: 5, mentalWellbeingScore: 5, notes: '' })
  const create = useMutation({ mutationFn: () => api.post('/api/balance-checks', { ...form, weekStart: new Date().toISOString() }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['balance-checks'] }); toast.success('Life audit saved'); setShow(false) } })

  const latest = checks.data?.[0]
  const radarData = latest ? [
    { subject: 'Career', value: latest.careerScore }, { subject: 'Health', value: latest.healthScore },
    { subject: 'Relationships', value: latest.relationshipsScore }, { subject: 'Finances', value: latest.financesScore },
    { subject: 'Education', value: latest.educationScore }, { subject: 'Mental', value: latest.mentalWellbeingScore },
  ] : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">Life Audit</h2><Button onClick={() => setShow(true)} className="bg-green-700 hover:bg-green-800"><Plus className="h-4 w-4 mr-1" />New Check</Button></div>
      {latest && (
        <Card className="bg-stone-900 border-stone-800"><CardContent className="p-6">
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={radarData}><PolarGrid stroke="#3a3a35" /><PolarAngleAxis dataKey="subject" tick={{ fill: '#a8a29e', fontSize: 12 }} /><PolarRadiusAxis domain={[0, 10]} tick={{ fill: '#78716c', fontSize: 10 }} /><Radar name="Score" dataKey="value" stroke="#65a30d" fill="#65a30d" fillOpacity={0.2} /></RadarChart>
          </ResponsiveContainer>
          <p className="text-xs text-stone-500 text-center mt-2">Latest check: {format(new Date(latest.weekStart), 'MMM d, yyyy')}</p>
        </CardContent></Card>
      )}
      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent className="bg-stone-900 border-stone-800 text-stone-100">
          <DialogHeader><DialogTitle>Life Audit Check</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {[
              ['careerScore', 'Career & Business'], ['healthScore', 'Health & Wellness'], ['relationshipsScore', 'Relationships'],
              ['financesScore', 'Finances'], ['educationScore', 'Education'], ['mentalWellbeingScore', 'Mental Wellbeing']
            ].map(([key, label]: any) => (
              <div key={key} className="flex items-center justify-between"><Label className="flex-1">{label}</Label><div className="flex items-center gap-2"><Input type="range" min={0} max={10} value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: +e.target.value })} className="w-32" /><span className="text-sm font-bold w-6 text-center">{(form as any)[key]}</span></div></div>
            ))}
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={() => create.mutate()} className="bg-green-700 hover:bg-green-800">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function InsightsView() {
  const qc = useQueryClient()
  const items = useQuery({ queryKey: ['insights'], queryFn: () => api.get('/api/insights') })
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', source: '', tags: '' })
  const create = useMutation({ mutationFn: () => api.post('/api/insights', form), onSuccess: () => { qc.invalidateQueries({ queryKey: ['insights'] }); toast.success('Insight captured'); setShow(false); setForm({ title: '', content: '', source: '', tags: '' }) } })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">Insights</h2><Button onClick={() => setShow(true)} className="bg-green-700 hover:bg-green-800"><Plus className="h-4 w-4 mr-1" />Insight</Button></div>
      {items.data?.map((ins: any) => (
        <Card key={ins.id} className="bg-stone-900 border-stone-800"><CardContent className="p-4">
          <h4 className="font-medium">{ins.title}</h4>
          <p className="text-sm text-stone-400 mt-1">{ins.content}</p>
          <div className="flex gap-2 mt-2">
            {ins.source && <Badge variant="outline" className="text-[10px]">{ins.source}</Badge>}
            {ins.tags && ins.tags.split(',').map((t: string, i: number) => <Badge key={i} variant="outline" className="text-[10px]">{t.trim()}</Badge>)}
          </div>
        </CardContent></Card>
      ))}
      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent className="bg-stone-900 border-stone-800 text-stone-100">
          <DialogHeader><DialogTitle>Capture Insight</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Content</Label><Textarea rows={4} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} /></div>
            <div><Label>Source</Label><Input value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} /></div>
            <div><Label>Tags (comma-separated)</Label><Input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={() => create.mutate()} className="bg-green-700 hover:bg-green-800">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function HabitsView() {
  const qc = useQueryClient()
  const habits = useQuery({ queryKey: ['habits'], queryFn: () => api.get('/api/habits') })
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', frequency: 'daily' })
  const create = useMutation({ mutationFn: () => api.post('/api/habits', form), onSuccess: () => { qc.invalidateQueries({ queryKey: ['habits'] }); toast.success('Habit created'); setShow(false); setForm({ name: '', description: '', frequency: 'daily' }) } })
  const del = useMutation({ mutationFn: (id: string) => api.del(`/api/habits/${id}`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['habits'] }); toast.success('Deleted') } })
  const checkIn = useMutation({ mutationFn: (habitId: string) => api.post('/api/habit-logs', { habitId, date: new Date().toISOString(), completed: true }), onSuccess: () => qc.invalidateQueries({ queryKey: ['habits'] }) })

  const today = format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">Habits</h2><Button onClick={() => setShow(true)} className="bg-green-700 hover:bg-green-800"><Plus className="h-4 w-4 mr-1" />Habit</Button></div>
      <div className="space-y-3">
        {habits.data?.map((h: any) => {
          const checkedToday = h.logs?.some((l: any) => format(new Date(l.date), 'yyyy-MM-dd') === today)
          const streak = h.logs?.filter((l: any) => l.completed).length || 0
          return (
            <Card key={h.id} className="bg-stone-900 border-stone-800"><CardContent className="p-4 flex items-center gap-4">
              <button onClick={() => !checkedToday && checkIn.mutate(h.id)} className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-colors ${checkedToday ? 'border-lime-500 bg-lime-500/20 text-lime-400' : 'border-stone-600 hover:border-lime-500'}`}>
                {checkedToday && <CheckCircle2 className="h-5 w-5" />}
              </button>
              <div className="flex-1"><h4 className="font-medium text-sm">{h.name}</h4><p className="text-xs text-stone-500">{h.frequency} · Streak: {streak}</p></div>
              <button onClick={() => del.mutate(h.id)} className="text-stone-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
            </CardContent></Card>
          )
        })}
      </div>
      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent className="bg-stone-900 border-stone-800 text-stone-100">
          <DialogHeader><DialogTitle>New Habit</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Description</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div><Label>Frequency</Label><Select value={form.frequency} onValueChange={v => setForm({ ...form, frequency: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button onClick={() => create.mutate()} className="bg-green-700 hover:bg-green-800">Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function DailyCheckInView() {
  const qc = useQueryClient()
  const items = useQuery({ queryKey: ['daily-checkins'], queryFn: () => api.get('/api/daily-checkins') })
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ focus: '', gratitude: '', challenges: '', notes: '' })
  const create = useMutation({ mutationFn: () => api.post('/api/daily-checkins', { ...form, date: new Date().toISOString() }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['daily-checkins'] }); toast.success('Check-in saved'); setShow(false); setForm({ focus: '', gratitude: '', challenges: '', notes: '' }) } })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">Daily Check-In</h2><Button onClick={() => setShow(true)} className="bg-green-700 hover:bg-green-800"><Plus className="h-4 w-4 mr-1" />Today's Check-In</Button></div>
      {items.data?.slice(0, 7).map((d: any) => (
        <Card key={d.id} className="bg-stone-900 border-stone-800"><CardContent className="p-4">
          <p className="text-xs text-stone-500 mb-2">{format(new Date(d.date), 'EEEE, MMMM d')}</p>
          {d.focus && <p className="text-sm"><span className="text-lime-400 font-medium">Focus:</span> {d.focus}</p>}
          {d.gratitude && <p className="text-sm mt-1"><span className="text-amber-400 font-medium">Gratitude:</span> {d.gratitude}</p>}
          {d.challenges && <p className="text-sm mt-1"><span className="text-red-400 font-medium">Challenges:</span> {d.challenges}</p>}
        </CardContent></Card>
      ))}
      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent className="bg-stone-900 border-stone-800 text-stone-100">
          <DialogHeader><DialogTitle>Today's Check-In</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>What's your focus today?</Label><Textarea value={form.focus} onChange={e => setForm({ ...form, focus: e.target.value })} /></div>
            <div><Label>What are you grateful for?</Label><Textarea value={form.gratitude} onChange={e => setForm({ ...form, gratitude: e.target.value })} /></div>
            <div><Label>Challenges</Label><Textarea value={form.challenges} onChange={e => setForm({ ...form, challenges: e.target.value })} /></div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={() => create.mutate()} className="bg-green-700 hover:bg-green-800">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function WeeklyReviewView() {
  const qc = useQueryClient()
  const items = useQuery({ queryKey: ['weekly-reviews'], queryFn: () => api.get('/api/weekly-reviews') })
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ wins: '', challenges: '', lessons: '', adjustments: '' })
  const create = useMutation({ mutationFn: () => api.post('/api/weekly-reviews', { ...form, weekStart: new Date().toISOString() }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['weekly-reviews'] }); toast.success('Review saved'); setShow(false); setForm({ wins: '', challenges: '', lessons: '', adjustments: '' }) } })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">Weekly Review</h2><Button onClick={() => setShow(true)} className="bg-green-700 hover:bg-green-800"><Plus className="h-4 w-4 mr-1" />This Week</Button></div>
      {items.data?.map((w: any) => (
        <Card key={w.id} className="bg-stone-900 border-stone-800"><CardContent className="p-4">
          <p className="text-xs text-stone-500 mb-2">Week of {format(new Date(w.weekStart), 'MMM d, yyyy')}</p>
          {w.wins && <p className="text-sm"><span className="text-lime-400 font-medium">Wins:</span> {w.wins}</p>}
          {w.challenges && <p className="text-sm mt-1"><span className="text-red-400 font-medium">Challenges:</span> {w.challenges}</p>}
          {w.lessons && <p className="text-sm mt-1"><span className="text-blue-400 font-medium">Lessons:</span> {w.lessons}</p>}
          {w.adjustments && <p className="text-sm mt-1"><span className="text-amber-400 font-medium">Adjustments:</span> {w.adjustments}</p>}
        </CardContent></Card>
      ))}
      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent className="bg-stone-900 border-stone-800 text-stone-100">
          <DialogHeader><DialogTitle>Weekly Review</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Wins</Label><Textarea value={form.wins} onChange={e => setForm({ ...form, wins: e.target.value })} /></div>
            <div><Label>Challenges</Label><Textarea value={form.challenges} onChange={e => setForm({ ...form, challenges: e.target.value })} /></div>
            <div><Label>Lessons</Label><Textarea value={form.lessons} onChange={e => setForm({ ...form, lessons: e.target.value })} /></div>
            <div><Label>Adjustments for next week</Label><Textarea value={form.adjustments} onChange={e => setForm({ ...form, adjustments: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={() => create.mutate()} className="bg-green-700 hover:bg-green-800">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function BrainDumpView() {
  const qc = useQueryClient()
  const items = useQuery({ queryKey: ['brain-dumps'], queryFn: () => api.get('/api/brain-dumps') })
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ content: '', tags: '' })
  const create = useMutation({ mutationFn: () => api.post('/api/brain-dumps', form), onSuccess: () => { qc.invalidateQueries({ queryKey: ['brain-dumps'] }); toast.success('Dumped'); setShow(false); setForm({ content: '', tags: '' }) } })
  const del = useMutation({ mutationFn: (id: string) => api.del(`/api/brain-dumps/${id}`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['brain-dumps'] }); toast.success('Deleted') } })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">Brain Dump</h2><Button onClick={() => setShow(true)} className="bg-green-700 hover:bg-green-800"><Plus className="h-4 w-4 mr-1" />Dump</Button></div>
      {items.data?.map((b: any) => (
        <Card key={b.id} className="bg-stone-900 border-stone-800"><CardContent className="p-4">
          <div className="flex justify-between"><p className="text-sm whitespace-pre-wrap flex-1">{b.content}</p><button onClick={() => del.mutate(b.id)} className="text-stone-500 hover:text-red-400 ml-3"><Trash2 className="h-4 w-4" /></button></div>
          {b.tags && <div className="flex gap-1 mt-2">{b.tags.split(',').map((t: string, i: number) => <Badge key={i} variant="outline" className="text-[10px]">{t.trim()}</Badge>)}</div>}
          <p className="text-[10px] text-stone-600 mt-1">{format(new Date(b.createdAt), 'MMM d, h:mm a')}</p>
        </CardContent></Card>
      ))}
      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent className="bg-stone-900 border-stone-800 text-stone-100">
          <DialogHeader><DialogTitle>Brain Dump</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Get it all out</Label><Textarea rows={6} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Write whatever is on your mind..." /></div>
            <div><Label>Tags (comma-separated)</Label><Input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={() => create.mutate()} className="bg-green-700 hover:bg-green-800">Dump</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function SearchView() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    try { const res = await api.get(`/api/search?q=${encodeURIComponent(query)}`); setResults(res) } catch { setResults({ error: 'Search failed' }) }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Search</h2>
      <div className="flex gap-3">
        <Input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Search across everything..." className="bg-stone-900 border-stone-700" />
        <Button onClick={handleSearch} className="bg-green-700 hover:bg-green-800">Search</Button>
      </div>
      {loading && <p className="text-stone-500">Searching...</p>}
      {results && !results.error && Object.entries(results).map(([type, items]: any) => items.length > 0 && (
        <div key={type}><h3 className="text-sm font-semibold text-stone-400 uppercase mb-2">{type} ({items.length})</h3>
          <div className="space-y-2">{items.map((item: any, i: number) => (
            <div key={i} className="p-3 rounded-lg bg-stone-900 border border-stone-800"><span className="text-sm font-medium">{item.name || item.title || item.content?.slice(0, 50)}</span></div>
          ))}</div>
        </div>
      ))}
    </div>
  )
}

export function SettingsView() {
  const { theme, setTheme } = useTheme()
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>
      <Card className="bg-stone-900 border-stone-800"><CardContent className="p-4">
        <div className="flex items-center justify-between"><div><p className="font-medium">Dark Mode</p><p className="text-xs text-stone-500">Toggle dark/light theme</p></div>
          <Switch checked={theme === 'dark'} onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} />
        </div>
      </CardContent></Card>
    </div>
  )
}

import { useTheme } from 'next-themes'
import { Switch } from '@/components/ui/switch'
