'use client'

import { useQuery } from '@tanstack/react-query'
import { api, useNav } from './Store'
import { Briefcase, DollarSign, CheckCircle2, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function Dashboard() {
  const nav = useNav()
  const ventures = useQuery({ queryKey: ['ventures'], queryFn: () => api.get('/api/ventures') })
  const tasks = useQuery({ queryKey: ['tasks'], queryFn: () => api.get('/api/tasks') })
  const accounts = useQuery({ queryKey: ['accounts'], queryFn: () => api.get('/api/finance/accounts') })
  const commitments = useQuery({ queryKey: ['time-commitments'], queryFn: () => api.get('/api/time-commitments') })

  const activeTasks = tasks.data?.filter((t: any) => t.status !== 'done')?.length || 0
  const totalBalance = accounts.data?.reduce((s: number, a: any) => s + (a.balance || 0), 0) || 0
  const upcoming = commitments.data?.filter((c: any) => new Date(c.date) >= new Date())?.length || 0

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
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Ventures" value={ventures.data?.length || 0} icon={<Briefcase className="h-5 w-5" />} />
        <StatCard title="Active Tasks" value={activeTasks} icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard title="Net Balance" value={`$${totalBalance.toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard title="Upcoming" value={upcoming} icon={<Clock className="h-5 w-5" />} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-stone-900 border-stone-800">
          <CardHeader><CardTitle className="text-lg">Ventures</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {ventures.data?.map((v: any) => (
              <button key={v.id} onClick={() => nav.openVenture(v.id)} className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-stone-800 transition-colors">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: v.color }} />
                <span className="text-sm font-medium">{v.name}</span>
                <Badge variant="outline" className="ml-auto text-[10px]">{v.stage}</Badge>
              </button>
            )) || <p className="text-stone-500 text-sm">No ventures yet</p>}
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
    </div>
  )
}
