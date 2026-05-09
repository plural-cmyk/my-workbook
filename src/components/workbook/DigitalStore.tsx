'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './Store'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Plus, Trash2, Eye, EyeOff, Shield, Key, FileText, StickyNote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function DigitalStore() {
  const qc = useQueryClient()
  const items = useQuery({ queryKey: ['digital-store'], queryFn: () => api.get('/api/digital-store') })
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ title: '', category: 'note', content: '', tags: '', isProtected: false })
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const create = useMutation({ mutationFn: () => api.post('/api/digital-store', form), onSuccess: () => { qc.invalidateQueries({ queryKey: ['digital-store'] }); toast.success('Item stored'); setShow(false); setForm({ title: '', category: 'note', content: '', tags: '', isProtected: false }) } })
  const del = useMutation({ mutationFn: (id: string) => api.del(`/api/digital-store/${id}`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['digital-store'] }); toast.success('Deleted') } })

  const categoryIcon = (cat: string) => {
    switch (cat) {
      case 'password': return <Key className="h-4 w-4 text-red-400" />
      case 'document': return <FileText className="h-4 w-4 text-blue-400" />
      case 'credential': return <Shield className="h-4 w-4 text-amber-400" />
      default: return <StickyNote className="h-4 w-4 text-lime-400" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">Digital Store</h2><Button onClick={() => setShow(true)} className="bg-green-700 hover:bg-green-800"><Plus className="h-4 w-4 mr-1" />Item</Button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.data?.map((item: any) => (
          <Card key={item.id} className="bg-stone-900 border-stone-800"><CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">{categoryIcon(item.category)}<h4 className="font-medium text-sm">{item.title}</h4></div>
              <div className="flex gap-1">
                {item.isProtected && <button onClick={() => setRevealed(p => { const n = new Set(p); n.has(item.id) ? n.delete(item.id) : n.add(item.id); return n })} className="text-stone-500 hover:text-stone-300">{revealed.has(item.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>}
                <button onClick={() => del.mutate(item.id)} className="text-stone-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] mt-1">{item.category}</Badge>
            {item.isProtected && !revealed.has(item.id) ? (
              <p className="text-sm text-stone-600 mt-2">••••••••</p>
            ) : (
              <p className="text-sm text-stone-400 mt-2 whitespace-pre-wrap">{item.content}</p>
            )}
            {item.tags && <div className="flex gap-1 mt-2">{item.tags.split(',').map((t: string, i: number) => <Badge key={i} variant="outline" className="text-[10px]">{t.trim()}</Badge>)}</div>}
          </CardContent></Card>
        ))}
      </div>
      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent className="bg-stone-900 border-stone-800 text-stone-100">
          <DialogHeader><DialogTitle>Store Item</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Category</Label><Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="note">Note</SelectItem><SelectItem value="password">Password</SelectItem><SelectItem value="document">Document</SelectItem><SelectItem value="credential">Credential</SelectItem><SelectItem value="key">Key</SelectItem></SelectContent></Select></div>
            <div><Label>Content</Label><Textarea rows={4} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} /></div>
            <div><Label>Tags (comma-separated)</Label><Input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isProtected} onChange={e => setForm({ ...form, isProtected: e.target.checked })} />Mark as sensitive (hidden by default)</label>
          </div>
          <DialogFooter><Button onClick={() => create.mutate()} className="bg-green-700 hover:bg-green-800">Store</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
