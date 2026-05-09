'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './Store'
import { toast } from 'sonner'
import { Plus, Trash2, GraduationCap, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function AcademicTracker() {
  const terms = useQuery({ queryKey: ['terms'], queryFn: () => api.get('/api/academic/terms') })
  const activeTerm = terms.data?.find((t: any) => t.status === 'active')
  if (activeTerm) return <TermView termId={activeTerm.id} term={activeTerm} />
  return <NoActiveTerm />
}

function NoActiveTerm() {
  const qc = useQueryClient()
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '' })
  const create = useMutation({ mutationFn: () => api.post('/api/academic/terms', { ...form, status: 'active' }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['terms'] }); toast.success('Term created'); setShow(false) } })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">Academics</h2></div>
      <Card className="bg-stone-900 border-stone-800"><CardContent className="p-8 text-center">
        <GraduationCap className="h-12 w-12 text-stone-600 mx-auto mb-3" />
        <p className="text-stone-400">No active term. Create one to start tracking.</p>
        <Button onClick={() => setShow(true)} className="bg-green-700 hover:bg-green-800 mt-4"><Plus className="h-4 w-4 mr-1" />New Term</Button>
      </CardContent></Card>
      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent className="bg-stone-900 border-stone-800 text-stone-100">
          <DialogHeader><DialogTitle>Create Term</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Semester 1 2026" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></div>
              <div><Label>End Date</Label><Input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter><Button onClick={() => create.mutate()} className="bg-green-700 hover:bg-green-800">Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TermView({ termId, term }: { termId: string; term: any }) {
  const qc = useQueryClient()
  const units = useQuery({ queryKey: ['units', termId], queryFn: () => api.get(`/api/academic/units?termId=${termId}`) })
  const [showUnit, setShowUnit] = useState(false)
  const [unitForm, setUnitForm] = useState({ name: '', code: '', hasPracticals: false, hasProject: false, hasExams: true })
  const createUnit = useMutation({ mutationFn: () => api.post('/api/academic/units', { ...unitForm, termId }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['units', termId] }); toast.success('Unit added'); setShowUnit(false); setUnitForm({ name: '', code: '', hasPracticals: false, hasProject: false, hasExams: true }) } })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">{term.name}</h2><p className="text-sm text-stone-500">{units.data?.length || 0} units</p></div>
        <Button onClick={() => setShowUnit(true)} className="bg-green-700 hover:bg-green-800"><Plus className="h-4 w-4 mr-1" />Unit</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {units.data?.map((u: any) => (
          <Card key={u.id} className="bg-stone-900 border-stone-800"><CardContent className="p-4">
            <div className="flex justify-between"><h4 className="font-medium">{u.name}</h4><Badge variant="outline" className="text-[10px]">{u.status}</Badge></div>
            {u.code && <p className="text-xs text-stone-500 mt-0.5">{u.code}</p>}
            <div className="flex gap-2 mt-2">
              {u.hasPracticals && <Badge className="text-[10px] bg-green-700/20 text-lime-400">Practicals</Badge>}
              {u.hasProject && <Badge className="text-[10px] bg-amber-700/20 text-amber-400">Project</Badge>}
              {u.hasExams && <Badge className="text-[10px] bg-blue-700/20 text-blue-400">Exams</Badge>}
            </div>
            {u.grade && <p className="text-sm text-lime-400 mt-2 font-semibold">Grade: {u.grade}</p>}
          </CardContent></Card>
        ))}
      </div>
      <Dialog open={showUnit} onOpenChange={setShowUnit}>
        <DialogContent className="bg-stone-900 border-stone-800 text-stone-100">
          <DialogHeader><DialogTitle>Add Unit</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={unitForm.name} onChange={e => setUnitForm({ ...unitForm, name: e.target.value })} /></div>
            <div><Label>Code</Label><Input value={unitForm.code} onChange={e => setUnitForm({ ...unitForm, code: e.target.value })} /></div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={unitForm.hasPracticals} onChange={e => setUnitForm({ ...unitForm, hasPracticals: e.target.checked })} />Practicals</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={unitForm.hasProject} onChange={e => setUnitForm({ ...unitForm, hasProject: e.target.checked })} />Project</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={unitForm.hasExams} onChange={e => setUnitForm({ ...unitForm, hasExams: e.target.checked })} />Exams</label>
            </div>
          </div>
          <DialogFooter><Button onClick={() => createUnit.mutate()} className="bg-green-700 hover:bg-green-800">Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function AcademicNotesView() {
  const terms = useQuery({ queryKey: ['terms'], queryFn: () => api.get('/api/academic/terms') })
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null)
  const allUnits = terms.data?.flatMap((t: any) => t.units || []) || []

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Notes</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          {allUnits.map((u: any) => (
            <button key={u.id} onClick={() => setSelectedUnit(u.id)} className={`w-full text-left p-2 rounded-lg text-sm ${selectedUnit === u.id ? 'bg-green-700/20 text-lime-400' : 'hover:bg-stone-800 text-stone-400'}`}>{u.name}</button>
          ))}
          {allUnits.length === 0 && <p className="text-stone-500 text-sm">No units yet</p>}
        </div>
        <div className="md:col-span-3">
          {selectedUnit ? <UnitNotes unitId={selectedUnit} /> : <p className="text-stone-500">Select a unit to view notes</p>}
        </div>
      </div>
    </div>
  )
}

function UnitNotes({ unitId }: { unitId: string }) {
  const qc = useQueryClient()
  const notes = useQuery({ queryKey: ['unit-notes', unitId], queryFn: () => api.get(`/api/academic/unit-notes?unitId=${unitId}`) })
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', type: 'general' })
  const create = useMutation({ mutationFn: () => api.post('/api/academic/unit-notes', { ...form, unitId }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['unit-notes', unitId] }); toast.success('Note added'); setShow(false); setForm({ title: '', content: '', type: 'general' }) } })

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button onClick={() => setShow(true)} size="sm" className="bg-green-700 hover:bg-green-800"><Plus className="h-4 w-4 mr-1" />Note</Button></div>
      {notes.data?.map((n: any) => (
        <Card key={n.id} className="bg-stone-900 border-stone-800"><CardContent className="p-4">
          <div className="flex justify-between"><h4 className="font-medium">{n.title}</h4><Badge variant="outline" className="text-[10px]">{n.type}</Badge></div>
          {n.content && <p className="text-sm text-stone-400 mt-2 whitespace-pre-wrap">{n.content}</p>}
        </CardContent></Card>
      ))}
      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent className="bg-stone-900 border-stone-800 text-stone-100">
          <DialogHeader><DialogTitle>Add Note</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Type</Label><Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="general">General</SelectItem><SelectItem value="lecture">Lecture</SelectItem><SelectItem value="assignment">Assignment</SelectItem><SelectItem value="exam-prep">Exam Prep</SelectItem></SelectContent></Select></div>
            <div><Label>Content</Label><Textarea rows={6} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={() => create.mutate()} className="bg-green-700 hover:bg-green-800">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
