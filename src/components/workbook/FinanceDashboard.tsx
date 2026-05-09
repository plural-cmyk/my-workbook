'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './Store'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { DollarSign, Briefcase, Users, Lightbulb, Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function FinanceOverview() {
  const accounts = useQuery({ queryKey: ['accounts'], queryFn: () => api.get('/api/finance/accounts') })
  const [aiInsight, setAiInsight] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const totalBalance = accounts.data?.reduce((s: number, a: any) => s + (a.balance || 0), 0) || 0
  const personal = accounts.data?.filter((a: any) => a.type === 'personal').reduce((s: number, a: any) => s + (a.balance || 0), 0) || 0
  const venture = accounts.data?.filter((a: any) => a.type === 'venture').reduce((s: number, a: any) => s + (a.balance || 0), 0) || 0

  const handleAI = async () => {
    setAiLoading(true)
    try {
      const res = await api.post('/api/ai/insights', { prompt: `Analyze my financial overview: Total balance $${totalBalance}, Personal accounts $${personal}, Venture accounts $${venture}. Give me brief actionable insights.` })
      setAiInsight(res.insight)
    } catch { setAiInsight('Could not generate insights.') }
    setAiLoading(false)
  }

  const StatCard = ({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) => (
    <Card className="bg-stone-900 border-stone-800">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="p-2 rounded-lg bg-green-700/10 text-lime-400">{icon}</div>
        <div><p className="text-xs text-stone-500">{title}</p><p className="text-xl font-bold">{value}</p></div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Finance Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Balance" value={`$${totalBalance.toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard title="Personal" value={`$${personal.toLocaleString()}`} icon={<Users className="h-5 w-5" />} />
        <StatCard title="Venture" value={`$${venture.toLocaleString()}`} icon={<Briefcase className="h-5 w-5" />} />
      </div>
      <Card className="bg-stone-900 border-stone-800">
        <CardHeader><CardTitle className="text-lg">Accounts</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {accounts.data?.map((a: any) => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-stone-800">
                <div><span className="font-medium text-sm">{a.name}</span><Badge variant="outline" className="ml-2 text-[10px]">{a.type}</Badge></div>
                <span className={`font-semibold ${a.balance >= 0 ? 'text-lime-400' : 'text-red-400'}`}>${a.balance?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="bg-stone-900 border-stone-800">
        <CardHeader className="flex-row items-center justify-between"><CardTitle className="text-lg">AI Financial Insights</CardTitle><Button onClick={handleAI} size="sm" className="bg-green-700 hover:bg-green-800" disabled={aiLoading}>{aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4 mr-1" />}Analyze</Button></CardHeader>
        {aiInsight && <CardContent><p className="text-sm text-stone-300 whitespace-pre-wrap">{aiInsight}</p></CardContent>}
      </Card>
    </div>
  )
}

export function AccountsView() {
  const qc = useQueryClient()
  const accounts = useQuery({ queryKey: ['accounts'], queryFn: () => api.get('/api/finance/accounts') })
  const ventures = useQuery({ queryKey: ['ventures'], queryFn: () => api.get('/api/ventures') })
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'personal', balance: 0, currency: 'USD', description: '', ventureId: '' })
  const create = useMutation({ mutationFn: () => api.post('/api/finance/accounts', form), onSuccess: () => { qc.invalidateQueries({ queryKey: ['accounts'] }); toast.success('Account created'); setShow(false); setForm({ name: '', type: 'personal', balance: 0, currency: 'USD', description: '', ventureId: '' }) } })
  const del = useMutation({ mutationFn: (id: string) => api.del(`/api/finance/accounts/${id}`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['accounts'] }); toast.success('Deleted') } })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">Accounts</h2><Button onClick={() => setShow(true)} className="bg-green-700 hover:bg-green-800"><Plus className="h-4 w-4 mr-1" />Account</Button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.data?.map((a: any) => (
          <Card key={a.id} className="bg-stone-900 border-stone-800"><CardContent className="p-4">
            <div className="flex justify-between"><h4 className="font-medium">{a.name}</h4><button onClick={() => del.mutate(a.id)} className="text-stone-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button></div>
            <div className="flex items-center gap-2 mt-1"><Badge variant="outline" className="text-[10px]">{a.type}</Badge><span className="text-xs text-stone-500">{a.currency}</span></div>
            <p className={`text-xl font-bold mt-2 ${a.balance >= 0 ? 'text-lime-400' : 'text-red-400'}`}>${a.balance?.toLocaleString()}</p>
          </CardContent></Card>
        ))}
      </div>
      <AccountFormDialog show={show} setShow={setShow} form={form} setForm={setForm} onSubmit={() => create.mutate()} ventures={ventures.data} />
    </div>
  )
}

function AccountFormDialog({ show, setShow, form, setForm, onSubmit, ventures }: any) {
  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="bg-stone-900 border-stone-800 text-stone-100">
        <DialogHeader><DialogTitle>New Account</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Type</Label><Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="personal">Personal</SelectItem><SelectItem value="venture">Venture</SelectItem><SelectItem value="savings">Savings</SelectItem><SelectItem value="investment">Investment</SelectItem></SelectContent></Select></div>
            <div><Label>Balance</Label><Input type="number" value={form.balance} onChange={e => setForm({ ...form, balance: +e.target.value })} /></div>
          </div>
          <div><Label>Currency</Label><Select value={form.currency} onValueChange={v => setForm({ ...form, currency: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem><SelectItem value="GBP">GBP</SelectItem><SelectItem value="KES">KES</SelectItem></SelectContent></Select></div>
          {form.type === 'venture' && <div><Label>Linked Venture</Label><Select value={form.ventureId} onValueChange={v => setForm({ ...form, ventureId: v })}><SelectTrigger><SelectValue placeholder="Select venture" /></SelectTrigger><SelectContent>{ventures?.map((v: any) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent></Select></div>}
        </div>
        <DialogFooter><Button onClick={onSubmit} className="bg-green-700 hover:bg-green-800">Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function TransactionsView() {
  const qc = useQueryClient()
  const transactions = useQuery({ queryKey: ['transactions'], queryFn: () => api.get('/api/finance/transactions') })
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ amount: 0, type: 'expense', category: '', description: '', date: format(new Date(), 'yyyy-MM-dd'), accountId: '', tags: '' })
  const create = useMutation({ mutationFn: () => api.post('/api/finance/transactions', form), onSuccess: () => { qc.invalidateQueries({ queryKey: ['transactions'] }); toast.success('Transaction added'); setShow(false) } })
  const del = useMutation({ mutationFn: (id: string) => api.del(`/api/finance/transactions/${id}`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['transactions'] }); toast.success('Deleted') } })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">Transactions</h2><Button onClick={() => setShow(true)} className="bg-green-700 hover:bg-green-800"><Plus className="h-4 w-4 mr-1" />Transaction</Button></div>
      <div className="space-y-2">
        {transactions.data?.map((t: any) => (
          <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-stone-900 border border-stone-800">
            <div>
              <span className="font-medium text-sm">{t.description || t.category}</span>
              <div className="flex gap-2 mt-0.5"><Badge variant="outline" className="text-[10px]">{t.type}</Badge><span className="text-xs text-stone-500">{format(new Date(t.date), 'MMM d')}</span></div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`font-semibold ${t.type === 'income' ? 'text-lime-400' : 'text-red-400'}`}>{t.type === 'income' ? '+' : '-'}${t.amount?.toLocaleString()}</span>
              <button onClick={() => del.mutate(t.id)} className="text-stone-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent className="bg-stone-900 border-stone-800 text-stone-100">
          <DialogHeader><DialogTitle>New Transaction</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Amount</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: +e.target.value })} /></div>
              <div><Label>Type</Label><Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="expense">Expense</SelectItem><SelectItem value="income">Income</SelectItem><SelectItem value="transfer">Transfer</SelectItem></SelectContent></Select></div>
            </div>
            <div><Label>Category</Label><Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></div>
            <div><Label>Description</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={() => create.mutate()} className="bg-green-700 hover:bg-green-800">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function BudgetsView() {
  const qc = useQueryClient()
  const budgets = useQuery({ queryKey: ['budgets'], queryFn: () => api.get('/api/finance/budgets') })
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ name: '', amount: 0, period: 'monthly', category: '', startDate: format(new Date(), 'yyyy-MM-dd') })
  const create = useMutation({ mutationFn: () => api.post('/api/finance/budgets', form), onSuccess: () => { qc.invalidateQueries({ queryKey: ['budgets'] }); toast.success('Budget created'); setShow(false) } })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">Budgets</h2><Button onClick={() => setShow(true)} className="bg-green-700 hover:bg-green-800"><Plus className="h-4 w-4 mr-1" />Budget</Button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.data?.map((b: any) => {
          const pct = b.amount > 0 ? Math.min((b.spent / b.amount) * 100, 100) : 0
          return (
            <Card key={b.id} className="bg-stone-900 border-stone-800"><CardContent className="p-4">
              <div className="flex justify-between"><h4 className="font-medium">{b.name}</h4><Badge variant="outline" className="text-[10px]">{b.period}</Badge></div>
              <div className="mt-3"><div className="flex justify-between text-xs mb-1"><span className="text-stone-400">${b.spent?.toLocaleString()} spent</span><span className="text-stone-500">${b.amount?.toLocaleString()}</span></div>
                <div className="h-2 bg-stone-700 rounded-full overflow-hidden"><div className={`h-full rounded-full ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-lime-500'}`} style={{ width: `${pct}%` }} /></div>
              </div>
            </CardContent></Card>
          )
        })}
      </div>
      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent className="bg-stone-900 border-stone-800 text-stone-100">
          <DialogHeader><DialogTitle>New Budget</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Amount</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: +e.target.value })} /></div>
              <div><Label>Period</Label><Select value={form.period} onValueChange={v => setForm({ ...form, period: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="quarterly">Quarterly</SelectItem></SelectContent></Select></div>
            </div>
            <div><Label>Category</Label><Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></div>
            <div><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={() => create.mutate()} className="bg-green-700 hover:bg-green-800">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
