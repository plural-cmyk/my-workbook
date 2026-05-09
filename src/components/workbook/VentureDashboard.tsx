'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './Store'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Plus, Trash2, Edit3, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function VentureDashboard({ ventureId }: { ventureId: string }) {
  const qc = useQueryClient()
  const venture = useQuery({ queryKey: ['venture', ventureId], queryFn: () => api.get(`/api/ventures/${ventureId}`) })
  const [tab, setTab] = useState('tasks')
  const [showEdit, setShowEdit] = useState(false)
  const [editForm, setEditForm] = useState<any>({})

  useEffect(() => { if (venture.data) setEditForm(venture.data) }, [venture.data])

  const updateVenture = useMutation({
    mutationFn: (data: any) => api.put(`/api/ventures/${ventureId}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['venture', ventureId] }); qc.invalidateQueries({ queryKey: ['ventures'] }); toast.success('Venture updated'); setShowEdit(false) }
  })

  if (venture.isLoading) return <div className="flex items-center justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-lime-400 border-t-transparent" /></div>
  if (!venture.data) return <p className="text-stone-500">Venture not found</p>
  const v = venture.data

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: v.color }} />
            <h2 className="text-2xl font-bold">{v.name}</h2>
            <Badge className="bg-green-700/20 text-lime-400">{v.stage}</Badge>
          </div>
          <p className="text-stone-400 text-sm mt-1">{v.description || 'No description'}</p>
          <div className="flex gap-4 mt-2 text-sm">
            <span className="text-stone-500">Value: <span className="text-lime-400 font-semibold">${v.monetaryValue?.toLocaleString()}</span></span>
            {v.valueDescription && <span className="text-stone-500">({v.valueDescription})</span>}
          </div>
          {v.needs && <p className="text-sm text-amber-400/80 mt-1">Needs: {v.needs}</p>}
        </div>
        <Dialog open={showEdit} onOpenChange={setShowEdit}>
          <DialogTrigger asChild><Button variant="outline" size="sm"><Edit3 className="h-4 w-4 mr-1" />Edit</Button></DialogTrigger>
          <DialogContent className="bg-stone-900 border-stone-800 text-stone-100 max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Edit Venture</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Stage</Label><Select value={editForm.stage} onValueChange={val => setEditForm({ ...editForm, stage: val })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ideation">Ideation</SelectItem><SelectItem value="validation">Validation</SelectItem><SelectItem value="building">Building</SelectItem><SelectItem value="scaling">Scaling</SelectItem><SelectItem value="mature">Mature</SelectItem><SelectItem value="exited">Exited</SelectItem></SelectContent></Select></div>
                <div><Label>Status</Label><Select value={editForm.status} onValueChange={val => setEditForm({ ...editForm, status: val })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="paused">Paused</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Monetary Value</Label><Input type="number" value={editForm.monetaryValue || 0} onChange={e => setEditForm({ ...editForm, monetaryValue: +e.target.value })} /></div>
                <div><Label>Color</Label><Input type="color" value={editForm.color || '#4d7c0f'} onChange={e => setEditForm({ ...editForm, color: e.target.value })} /></div>
              </div>
              <div><Label>Value Description</Label><Input value={editForm.valueDescription || ''} onChange={e => setEditForm({ ...editForm, valueDescription: e.target.value })} /></div>
              <div><Label>Needs</Label><Textarea value={editForm.needs || ''} onChange={e => setEditForm({ ...editForm, needs: e.target.value })} /></div>
            </div>
            <DialogFooter><Button onClick={() => updateVenture.mutate(editForm)} className="bg-green-700 hover:bg-green-800">Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-stone-800">
          <TabsTrigger value="tasks">Tasks ({v.tasks?.length || 0})</TabsTrigger>
          <TabsTrigger value="decisions">Decisions ({v._count?.decisions || 0})</TabsTrigger>
          <TabsTrigger value="meetings">Meetings ({v._count?.meetings || 0})</TabsTrigger>
          <TabsTrigger value="contacts">Contacts ({v._count?.contacts || 0})</TabsTrigger>
        </TabsList>
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
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', status: 'todo', dueDate: '' })
  const create = useMutation({ mutationFn: () => api.post('/api/tasks', { ...form, ventureId, dueDate: form.dueDate || undefined }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks', ventureId] }); toast.success('Task created'); setShow(false); setForm({ title: '', description: '', priority: 'medium', status: 'todo', dueDate: '' }) } })
  const del = useMutation({ mutationFn: (id: string) => api.del(`/api/tasks/${id}`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks', ventureId] }); toast.success('Deleted') } })
  const updateStatus = useMutation({ mutationFn: ({ id, status }: any) => api.put(`/api/tasks/${id}`, { status }), onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', ventureId] }) })

  const todo = tasks.data?.filter((t: any) => t.status === 'todo') || []
  const inProgress = tasks.data?.filter((t: any) => t.status === 'in-progress') || []
  const done = tasks.data?.filter((t: any) => t.status === 'done') || []

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button onClick={() => setShow(true)} size="sm" className="bg-green-700 hover:bg-green-800"><Plus className="h-4 w-4 mr-1" />Task</Button></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[['To Do', todo], ['In Progress', inProgress], ['Done', done]].map(([label, items]: any) => (
          <div key={label}>
            <h4 className="text-xs font-semibold text-stone-500 uppercase mb-2">{label} ({items.length})</h4>
            <div className="space-y-2">
              {items.map((t: any) => (
                <div key={t.id} className="p-3 rounded-lg bg-stone-800 border border-stone-700 space-y-2">
                  <div className="flex items-start justify-between"><span className="text-sm font-medium">{t.title}</span><button onClick={() => del.mutate(t.id)} className="text-stone-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button></div>
                  {t.description && <p className="text-xs text-stone-400">{t.description}</p>}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{t.priority}</Badge>
                    {t.status !== 'done' && <button onClick={() => updateStatus.mutate({ id: t.id, status: t.status === 'todo' ? 'in-progress' : 'done' })} className="text-[10px] text-lime-400 hover:underline">{t.status === 'todo' ? 'Start →' : 'Done ✓'}</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent className="bg-stone-900 border-stone-800 text-stone-100">
          <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Priority</Label><Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent></Select></div>
              <div><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter><Button onClick={() => create.mutate()} className="bg-green-700 hover:bg-green-800">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
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
      <div className="flex justify-end"><Button onClick={() => setShow(true)} size="sm" className="bg-green-700 hover:bg-green-800"><Plus className="h-4 w-4 mr-1" />Decision</Button></div>
      {items.data?.map((d: any) => (
        <Card key={d.id} className="bg-stone-900 border-stone-800"><CardContent className="p-4">
          <div className="flex justify-between"><h4 className="font-medium">{d.title}</h4><button onClick={() => del.mutate(d.id)} className="text-stone-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button></div>
          {d.context && <p className="text-xs text-stone-400 mt-1">Context: {d.context}</p>}
          {d.decision && <p className="text-xs text-lime-400 mt-1">Decision: {d.decision}</p>}
          {d.rationale && <p className="text-xs text-stone-500 mt-1">Rationale: {d.rationale}</p>}
        </CardContent></Card>
      ))}
      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent className="bg-stone-900 border-stone-800 text-stone-100">
          <DialogHeader><DialogTitle>Log Decision</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Context</Label><Textarea value={form.context} onChange={e => setForm({ ...form, context: e.target.value })} /></div>
            <div><Label>Decision</Label><Textarea value={form.decision} onChange={e => setForm({ ...form, decision: e.target.value })} /></div>
            <div><Label>Rationale</Label><Textarea value={form.rationale} onChange={e => setForm({ ...form, rationale: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={() => create.mutate()} className="bg-green-700 hover:bg-green-800">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
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
      <div className="flex justify-end"><Button onClick={() => setShow(true)} size="sm" className="bg-green-700 hover:bg-green-800"><Plus className="h-4 w-4 mr-1" />Meeting</Button></div>
      {items.data?.map((m: any) => (
        <Card key={m.id} className="bg-stone-900 border-stone-800"><CardContent className="p-4">
          <div className="flex justify-between"><h4 className="font-medium">{m.title}</h4><span className="text-xs text-stone-500">{format(new Date(m.date), 'MMM d, yyyy')}</span></div>
          {m.attendees && <p className="text-xs text-stone-400 mt-1">Attendees: {m.attendees}</p>}
          {m.notes && <p className="text-xs text-stone-500 mt-1">{m.notes}</p>}
        </CardContent></Card>
      ))}
      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent className="bg-stone-900 border-stone-800 text-stone-100">
          <DialogHeader><DialogTitle>Add Meeting</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
            <div><Label>Attendees</Label><Input value={form.attendees} onChange={e => setForm({ ...form, attendees: e.target.value })} /></div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={() => create.mutate()} className="bg-green-700 hover:bg-green-800">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
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
      <div className="flex justify-end"><Button onClick={() => setShow(true)} size="sm" className="bg-green-700 hover:bg-green-800"><Plus className="h-4 w-4 mr-1" />Contact</Button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.data?.map((c: any) => (
          <Card key={c.id} className="bg-stone-900 border-stone-800"><CardContent className="p-4">
            <h4 className="font-medium">{c.name}</h4>
            {c.role && <p className="text-xs text-stone-400">{c.role}</p>}
            {c.email && <p className="text-xs text-lime-400">{c.email}</p>}
            {c.phone && <p className="text-xs text-stone-500">{c.phone}</p>}
          </CardContent></Card>
        ))}
      </div>
      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent className="bg-stone-900 border-stone-800 text-stone-100">
          <DialogHeader><DialogTitle>Add Contact</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Role</Label><Input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} /></div>
            <div><Label>Email</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={() => create.mutate()} className="bg-green-700 hover:bg-green-800">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function VentureForm() {
  const qc = useQueryClient()
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', stage: 'ideation', status: 'active', color: '#4d7c0f', monetaryValue: 0, valueDescription: '', needs: '' })
  const create = useMutation({
    mutationFn: () => api.post('/api/ventures', form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ventures'] }); toast.success('Venture created'); setShow(false); setForm({ name: '', description: '', stage: 'ideation', status: 'active', color: '#4d7c0f', monetaryValue: 0, valueDescription: '', needs: '' }) }
  })

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogTrigger asChild><Button className="bg-green-700 hover:bg-green-800"><Plus className="h-4 w-4 mr-1" />New Venture</Button></DialogTrigger>
      <DialogContent className="bg-stone-900 border-stone-800 text-stone-100 max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Create Venture</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Stage</Label><Select value={form.stage} onValueChange={v => setForm({ ...form, stage: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ideation">Ideation</SelectItem><SelectItem value="validation">Validation</SelectItem><SelectItem value="building">Building</SelectItem><SelectItem value="scaling">Scaling</SelectItem><SelectItem value="mature">Mature</SelectItem><SelectItem value="exited">Exited</SelectItem></SelectContent></Select></div>
            <div><Label>Color</Label><Input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} /></div>
          </div>
          <div><Label>Monetary Value</Label><Input type="number" value={form.monetaryValue} onChange={e => setForm({ ...form, monetaryValue: +e.target.value })} /></div>
          <div><Label>Value Description</Label><Input value={form.valueDescription} onChange={e => setForm({ ...form, valueDescription: e.target.value })} /></div>
          <div><Label>Needs</Label><Textarea value={form.needs} onChange={e => setForm({ ...form, needs: e.target.value })} /></div>
        </div>
        <DialogFooter><Button onClick={() => create.mutate()} className="bg-green-700 hover:bg-green-800">Create</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
