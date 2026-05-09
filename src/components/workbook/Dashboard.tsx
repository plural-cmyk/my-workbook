'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, useNav } from './Store'
import { toast } from 'sonner'
import { Briefcase, DollarSign, CheckCircle2, Clock, Plus, Trash2, Edit3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function Dashboard() {
  const nav = useNav()
  const qc = useQueryClient()
  const ventures = useQuery({ queryKey: ['ventures'], queryFn: () => api.get('/api/ventures') })
  const tasks = useQuery({ queryKey: ['tasks'], queryFn: () => api.get('/api/tasks') })
  const accounts = useQuery({ queryKey: ['accounts'], queryFn: () => api.get('/api/finance/accounts') })
  const commitments = useQuery({ queryKey: ['time-commitments'], queryFn: () => api.get('/api/time-commitments') })

  const activeTasks = tasks.data?.filter((t: any) => t.status !== 'done')?.length || 0
  const totalBalance = accounts.data?.reduce((s: number, a: any) => s + (a.balance || 0), 0) || 0
  const upcoming = commitments.data?.filter((c: any) => new Date(c.date) >= new Date())?.length || 0

  // ─── New Venture Form ─────────────────────────────────────
  const [showNewVenture, setShowNewVenture] = useState(false)
  const [ventureForm, setVentureForm] = useState({ name: '', description: '', stage: 'ideation', status: 'active', color: '#4d7c0f', monetaryValue: 0, valueDescription: '', needs: '' })
  const createVenture = useMutation({
    mutationFn: () => api.post('/api/ventures', ventureForm),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ventures'] }); toast.success('Venture created'); setShowNewVenture(false); setVentureForm({ name: '', description: '', stage: 'ideation', status: 'active', color: '#4d7c0f', monetaryValue: 0, valueDescription: '', needs: '' }) }
  })

  // ─── Delete Venture ───────────────────────────────────────
  const deleteVenture = useMutation({
    mutationFn: (id: string) => api.del(`/api/ventures/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ventures'] }); toast.success('Venture deleted'); if (nav.ventureId) nav.setView('dashboard') }
  })

  // ─── Edit Venture ─────────────────────────────────────────
  const [showEditVenture, setShowEditVenture] = useState(false)
  const [editForm, setEditForm] = useState<any>(null)
  const updateVenture = useMutation({
    mutationFn: (data: any) => api.put(`/api/ventures/${data.id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ventures'] }); toast.success('Venture updated'); setShowEditVenture(false); setEditForm(null) }
  })

  const openEdit = (v: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditForm({ ...v })
    setShowEditVenture(true)
  }

  const StatCard = ({ title, value, icon, sub }: { title: string; value: string | number; icon: React.ReactNode; sub?: string }) => (
    <Card className="bg-stone-900 border-stone-800">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="p-2 rounded-lg bg-green-700/10 text-lime-400">{icon}</div>
        <div>
          <p className="text-xs text-stone-500">{title}</p>
          <p className="text-xl font-bold">{value}</p>
          {sub && <p className="text-xs text-stone-500">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <Button onClick={() => setShowNewVenture(true)} className="bg-green-700 hover:bg-green-800">
          <Plus className="h-4 w-4 mr-1" />New Venture
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Ventures" value={ventures.data?.length || 0} icon={<Briefcase className="h-5 w-5" />} />
        <StatCard title="Active Tasks" value={activeTasks} icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard title="Net Balance" value={`$${totalBalance.toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard title="Upcoming" value={upcoming} icon={<Clock className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-stone-900 border-stone-800">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-lg">Ventures</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowNewVenture(true)} className="text-lime-400 hover:text-lime-300">
              <Plus className="h-4 w-4 mr-1" />Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {ventures.data?.length === 0 && (
              <div className="text-center py-6">
                <Briefcase className="h-10 w-10 text-stone-700 mx-auto mb-2" />
                <p className="text-stone-500 text-sm">No ventures yet</p>
                <Button variant="outline" size="sm" onClick={() => setShowNewVenture(true)} className="mt-2 border-stone-700 text-lime-400 hover:bg-stone-800">Create your first venture</Button>
              </div>
            )}
            {ventures.data?.map((v: any) => (
              <div key={v.id} className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-stone-800 transition-colors group">
                <button onClick={() => nav.openVenture(v.id)} className="flex items-center gap-3 flex-1 text-left">
                  <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: v.color }} />
                  <span className="text-sm font-medium">{v.name}</span>
                  <Badge variant="outline" className="text-[10px]">{v.stage}</Badge>
                </button>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => openEdit(v, e)} className="p-1 rounded text-stone-500 hover:text-lime-400 hover:bg-stone-700"><Edit3 className="h-3.5 w-3.5" /></button>
                  <button onClick={(e) => { e.stopPropagation(); deleteVenture.mutate(v.id) }} className="p-1 rounded text-stone-500 hover:text-red-400 hover:bg-stone-700"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-stone-900 border-stone-800">
          <CardHeader><CardTitle className="text-lg">Recent Tasks</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {tasks.data?.slice(0, 5).map((t: any) => (
              <div key={t.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-stone-800">
                {t.status === 'done' ? <CheckCircle2 className="h-4 w-4 text-lime-400" /> : <div className="h-4 w-4 rounded-full border-2 border-stone-500" />}
                <span className="text-sm">{t.title}</span>
                <Badge variant="outline" className="ml-auto text-[10px]">{t.priority}</Badge>
              </div>
            )) || <p className="text-stone-500 text-sm">No tasks yet</p>}
          </CardContent>
        </Card>
      </div>

      {/* ─── New Venture Dialog ──────────────────────────────── */}
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

      {/* ─── Edit Venture Dialog ─────────────────────────────── */}
      <Dialog open={showEditVenture} onOpenChange={setShowEditVenture}>
        <DialogContent className="bg-stone-900 border-stone-800 text-stone-100 max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Venture</DialogTitle></DialogHeader>
          {editForm && (
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Stage</Label>
                  <Select value={editForm.stage} onValueChange={v => setEditForm({ ...editForm, stage: v })}>
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
                <div><Label>Status</Label>
                  <Select value={editForm.status} onValueChange={v => setEditForm({ ...editForm, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Monetary Value ($)</Label><Input type="number" value={editForm.monetaryValue || 0} onChange={e => setEditForm({ ...editForm, monetaryValue: +e.target.value })} /></div>
                <div><Label>Color</Label><Input type="color" value={editForm.color || '#4d7c0f'} onChange={e => setEditForm({ ...editForm, color: e.target.value })} /></div>
              </div>
              <div><Label>Value Description</Label><Input value={editForm.valueDescription || ''} onChange={e => setEditForm({ ...editForm, valueDescription: e.target.value })} /></div>
              <div><Label>Needs</Label><Textarea value={editForm.needs || ''} onChange={e => setEditForm({ ...editForm, needs: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter><Button onClick={() => updateVenture.mutate(editForm)} className="bg-green-700 hover:bg-green-800">Save Changes</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
