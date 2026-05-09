'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, useNav } from './Store'
import { toast } from 'sonner'
import { Plus, Trash2, Edit3, ChevronRight, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const QUADRANTS = [
  { key: 'strength', label: 'Strengths', bg: 'bg-green-700/10', border: 'border-green-700/30', text: 'text-green-400', dot: 'bg-green-500' },
  { key: 'weakness', label: 'Weaknesses', bg: 'bg-red-700/10', border: 'border-red-700/30', text: 'text-red-400', dot: 'bg-red-500' },
  { key: 'opportunity', label: 'Opportunities', bg: 'bg-blue-700/10', border: 'border-blue-700/30', text: 'text-blue-400', dot: 'bg-blue-500' },
  { key: 'threat', label: 'Threats', bg: 'bg-amber-700/10', border: 'border-amber-700/30', text: 'text-amber-400', dot: 'bg-amber-500' },
] as const

type CategoryKey = 'strength' | 'weakness' | 'opportunity' | 'threat'

/* ─── Standalone SWOT View (accessible from sidebar) ────────────── */
export function SWOTView() {
  const nav = useNav()
  const analyses = useQuery({ queryKey: ['swot'], queryFn: () => api.get('/api/swot') })
  const [selectedId, setSelectedId] = useState<string | null>(null)

  if (selectedId) {
    return <SWOTDetail analysisId={selectedId} onBack={() => setSelectedId(null)} />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">SWOT Analysis</h2>
        <CreateSWOTDialog />
      </div>

      {analyses.data?.length === 0 && (
        <div className="text-center py-12">
          <LayoutGrid className="h-12 w-12 text-stone-700 mx-auto mb-3" />
          <p className="text-stone-500 text-sm">No SWOT analyses yet</p>
          <p className="text-stone-600 text-xs mt-1">Analyze your ventures with Strengths, Weaknesses, Opportunities & Threats</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analyses.data?.map((a: any) => {
          const counts: Record<string, number> = { strength: 0, weakness: 0, opportunity: 0, threat: 0 }
          a.items?.forEach((item: any) => { counts[item.category] = (counts[item.category] || 0) + 1 })
          return (
            <Card key={a.id} className="bg-stone-900 border-stone-800 cursor-pointer hover:border-stone-700 transition-colors" onClick={() => setSelectedId(a.id)}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{a.title}</CardTitle>
                  <ChevronRight className="h-4 w-4 text-stone-500" />
                </div>
                {a.venture && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: a.venture.color }} />
                    <span className="text-xs text-stone-500">{a.venture.name}</span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {QUADRANTS.map(q => (
                    <div key={q.key} className={`rounded-md px-2 py-1.5 ${q.bg} border ${q.border}`}>
                      <p className={`text-[10px] font-semibold uppercase ${q.text}`}>{q.label}</p>
                      <p className="text-xs text-stone-400">{counts[q.key]} items</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

/* ─── SWOT Detail with 2x2 Matrix ─────────────────────────────── */
export function SWOTDetail({ analysisId, onBack }: { analysisId: string; onBack?: () => void }) {
  const qc = useQueryClient()
  const nav = useNav()
  const analysis = useQuery({
    queryKey: ['swot', analysisId],
    queryFn: () => api.get(`/api/swot/${analysisId}`)
  })
  const [addItemCategory, setAddItemCategory] = useState<CategoryKey | null>(null)
  const [newItemText, setNewItemText] = useState('')
  const [editingItem, setEditingItem] = useState<any>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const addAnalysisItem = useMutation({
    mutationFn: () => api.post('/api/swot-items', { analysisId, category: addItemCategory, content: newItemText }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['swot', analysisId] }); toast.success('Item added'); setAddItemCategory(null); setNewItemText('') }
  })

  const updateAnalysisItem = useMutation({
    mutationFn: (data: any) => api.put(`/api/swot-items/${data.id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['swot', analysisId] }); toast.success('Item updated'); setEditingItem(null) }
  })

  const deleteAnalysisItem = useMutation({
    mutationFn: (id: string) => api.del(`/api/swot-items/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['swot', analysisId] }); toast.success('Item removed') }
  })

  const deleteAnalysis = useMutation({
    mutationFn: () => api.del(`/api/swot/${analysisId}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['swot'] }); toast.success('Analysis deleted'); if (onBack) onBack(); else nav.setView('swot') }
  })

  if (analysis.isLoading) return <div className="flex items-center justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-lime-400 border-t-transparent" /></div>
  if (!analysis.data) return <p className="text-stone-500">Analysis not found</p>
  const a = analysis.data

  const getItems = (category: string) => a.items?.filter((i: any) => i.category === category) || []

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          {onBack && (
            <button onClick={onBack} className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-300 mb-2">
              <ChevronRight className="h-3 w-3 rotate-180" />Back to SWOT List
            </button>
          )}
          <h2 className="text-2xl font-bold">{a.title}</h2>
          {a.venture && (
            <div className="flex items-center gap-2 mt-1">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: a.venture.color }} />
              <span className="text-sm text-stone-400">{a.venture.name}</span>
            </div>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => setConfirmDelete(true)} className="text-red-400 hover:bg-red-900/20 hover:text-red-300 border-red-900/30">
          <Trash2 className="h-4 w-4 mr-1" />Delete
        </Button>
      </div>

      {/* ─── 2x2 SWOT Matrix ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {QUADRANTS.map(q => (
          <div key={q.key} className={`rounded-xl border ${q.border} ${q.bg} p-4 space-y-3`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${q.dot}`} />
                <h3 className={`font-semibold text-sm ${q.text}`}>{q.label}</h3>
              </div>
              <button onClick={() => setAddItemCategory(q.key)} className="p-1 rounded hover:bg-stone-700/50 text-stone-500 hover:text-stone-300 transition-colors">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1.5 min-h-[60px]">
              {getItems(q.key).length === 0 && (
                <p className="text-xs text-stone-600 italic py-2">Click + to add {q.label.toLowerCase()}</p>
              )}
              {getItems(q.key).map((item: any) => (
                <div key={item.id} className="group flex items-start gap-2 rounded-lg bg-stone-900/60 border border-stone-800 px-3 py-2">
                  <span className="text-sm flex-1">{item.content}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => setEditingItem(item)} className="p-0.5 text-stone-500 hover:text-lime-400"><Edit3 className="h-3 w-3" /></button>
                    <button onClick={() => deleteAnalysisItem.mutate(item.id)} className="p-0.5 text-stone-500 hover:text-red-400"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ─── Add Item Dialog ────────────────────────────────────── */}
      <Dialog open={!!addItemCategory} onOpenChange={() => setAddItemCategory(null)}>
        <DialogContent className="bg-stone-900 border-stone-800 text-stone-100">
          <DialogHeader>
            <DialogTitle>Add {addItemCategory && QUADRANTS.find(q => q.key === addItemCategory)?.label.slice(0, -1)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Content</Label>
              <Input
                value={newItemText}
                onChange={e => setNewItemText(e.target.value)}
                placeholder={`Describe a ${addItemCategory}...`}
                onKeyDown={e => { if (e.key === 'Enter' && newItemText.trim()) addAnalysisItem.mutate() }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => addAnalysisItem.mutate()} className="bg-green-700 hover:bg-green-800" disabled={!newItemText.trim()}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Edit Item Dialog ───────────────────────────────────── */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="bg-stone-900 border-stone-800 text-stone-100">
          <DialogHeader><DialogTitle>Edit Item</DialogTitle></DialogHeader>
          {editingItem && (
            <div className="space-y-3">
              <div>
                <Label>Category</Label>
                <Select value={editingItem.category} onValueChange={val => setEditingItem({ ...editingItem, category: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strength">Strength</SelectItem>
                    <SelectItem value="weakness">Weakness</SelectItem>
                    <SelectItem value="opportunity">Opportunity</SelectItem>
                    <SelectItem value="threat">Threat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Content</Label>
                <Input value={editingItem.content} onChange={e => setEditingItem({ ...editingItem, content: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => updateAnalysisItem.mutate(editingItem)} className="bg-green-700 hover:bg-green-800">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Analysis Dialog ─────────────────────────────── */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="bg-stone-900 border-stone-800 text-stone-100">
          <DialogHeader><DialogTitle>Delete SWOT Analysis?</DialogTitle></DialogHeader>
          <p className="text-sm text-stone-400">This will permanently delete <span className="text-white font-medium">{a.title}</span> and all its items. This cannot be undone.</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button onClick={() => deleteAnalysis.mutate()} className="bg-red-600 hover:bg-red-700">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ─── Create SWOT Analysis Dialog ──────────────────────────────── */
export function CreateSWOTDialog({ ventureId }: { ventureId?: string } = {}) {
  const qc = useQueryClient()
  const [show, setShow] = useState(false)
  const [title, setTitle] = useState('')
  const [selectedVentureId, setSelectedVentureId] = useState(ventureId || '')
  const ventures = useQuery({ queryKey: ['ventures'], queryFn: () => api.get('/api/ventures') })

  // Quick-start items per quadrant
  const [items, setItems] = useState<Record<CategoryKey, string[]>>({
    strength: [''],
    weakness: [''],
    opportunity: [''],
    threat: ['']
  })

  const create = useMutation({
    mutationFn: () => {
      const allItems = Object.entries(items).flatMap(([cat, vals]) =>
        vals.filter(v => v.trim()).map((content, i) => ({ category: cat, content, order: i }))
      )
      return api.post('/api/swot', {
        title,
        ventureId: selectedVentureId || null,
        items: allItems
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['swot'] })
      qc.invalidateQueries({ queryKey: ['swot-venture'] })
      toast.success('SWOT analysis created')
      setShow(false)
      setTitle('')
      setItems({ strength: [''], weakness: [''], opportunity: [''], threat: [''] })
      setSelectedVentureId(ventureId || '')
    }
  })

  const addItemLine = (category: CategoryKey) => {
    setItems(prev => ({ ...prev, [category]: [...prev[category], ''] }))
  }

  const updateItemLine = (category: CategoryKey, index: number, value: string) => {
    setItems(prev => {
      const updated = [...prev[category]]
      updated[index] = value
      return { ...prev, [category]: updated }
    })
  }

  const removeItemLine = (category: CategoryKey, index: number) => {
    setItems(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }))
  }

  return (
    <>
      <Button onClick={() => setShow(true)} className="bg-green-700 hover:bg-green-800">
        <Plus className="h-4 w-4 mr-1" />New Analysis
      </Button>

      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent className="bg-stone-900 border-stone-800 text-stone-100 max-h-[85vh] overflow-y-auto max-w-2xl">
          <DialogHeader><DialogTitle>Create SWOT Analysis</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Q2 Venture Analysis" /></div>
            {!ventureId && (
              <div>
                <Label>Link to Venture (optional)</Label>
                <Select value={selectedVentureId} onValueChange={setSelectedVentureId}>
                  <SelectTrigger><SelectValue placeholder="None — standalone analysis" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None — standalone analysis</SelectItem>
                    {ventures.data?.map((v: any) => (
                      <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Quick-add items per quadrant */}
            <div className="grid grid-cols-2 gap-3">
              {QUADRANTS.map(q => (
                <div key={q.key} className={`rounded-lg border ${q.border} ${q.bg} p-3`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-semibold ${q.text}`}>{q.label}</span>
                    <button onClick={() => addItemLine(q.key)} className="text-stone-500 hover:text-stone-300"><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="space-y-1.5">
                    {items[q.key].map((val, idx) => (
                      <div key={idx} className="flex gap-1">
                        <Input
                          value={val}
                          onChange={e => updateItemLine(q.key, idx, e.target.value)}
                          placeholder={`${q.label.slice(0, -1)}...`}
                          className="h-8 text-xs bg-stone-900/80 border-stone-700"
                        />
                        {items[q.key].length > 1 && (
                          <button onClick={() => removeItemLine(q.key, idx)} className="text-stone-600 hover:text-red-400 shrink-0"><Trash2 className="h-3.5 w-3.5" /></button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter><Button onClick={() => create.mutate()} className="bg-green-700 hover:bg-green-800" disabled={!title.trim()}>Create Analysis</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

/* ─── Venture-specific SWOT tab ────────────────────────────────── */
export function VentureSWOT({ ventureId }: { ventureId: string }) {
  const qc = useQueryClient()
  const analyses = useQuery({
    queryKey: ['swot-venture', ventureId],
    queryFn: () => api.get(`/api/swot?ventureId=${ventureId}`)
  })
  const [selectedId, setSelectedId] = useState<string | null>(null)

  if (selectedId) {
    return <SWOTDetail analysisId={selectedId} onBack={() => setSelectedId(null)} />
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreateSWOTDialog ventureId={ventureId} />
      </div>

      {analyses.data?.length === 0 && (
        <div className="text-center py-8">
          <LayoutGrid className="h-10 w-10 text-stone-700 mx-auto mb-2" />
          <p className="text-stone-500 text-sm">No SWOT analyses for this venture</p>
          <p className="text-stone-600 text-xs mt-1">Create one to analyze Strengths, Weaknesses, Opportunities & Threats</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {analyses.data?.map((a: any) => {
          const counts: Record<string, number> = { strength: 0, weakness: 0, opportunity: 0, threat: 0 }
          a.items?.forEach((item: any) => { counts[item.category] = (counts[item.category] || 0) + 1 })
          return (
            <Card key={a.id} className="bg-stone-900 border-stone-800 cursor-pointer hover:border-stone-700 transition-colors" onClick={() => setSelectedId(a.id)}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{a.title}</CardTitle>
                  <ChevronRight className="h-4 w-4 text-stone-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-1.5">
                  {QUADRANTS.map(q => (
                    <div key={q.key} className={`rounded px-2 py-1 ${q.bg}`}>
                      <p className={`text-[9px] font-semibold ${q.text}`}>{counts[q.key]} {q.label.toLowerCase()}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
