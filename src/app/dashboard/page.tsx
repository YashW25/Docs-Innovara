import { Suspense } from 'react'
import { createClient } from "@/utils/supabase/server"
import { StatCards } from '@/components/dashboard/overview/StatCards'
import { OverviewCharts } from '@/components/dashboard/overview/OverviewCharts'
import { ActivityFeed } from '@/components/dashboard/overview/ActivityFeed'
import { UsersDataTable } from '@/components/dashboard/overview/UsersDataTable'
import { getDashboardStats, getOverviewUsers, getOverviewActivity, getChartData } from './overview/actions'
import { Skeleton } from "@/components/ui/skeleton"

function StatCardsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-28 w-full rounded-xl bg-white/5" />
      ))}
    </div>
  )
}

function GridSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3 mb-8">
      <Skeleton className="h-80 w-full col-span-2 rounded-xl bg-white/5" />
      <Skeleton className="h-80 w-full rounded-xl bg-white/5" />
    </div>
  )
}

async function DashboardContent() {
  const [stats, users, activities, chartData] = await Promise.all([
    getDashboardStats(),
    getOverviewUsers(),
    getOverviewActivity(),
    getChartData()
  ])

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('users').select('role').eq('id', user?.id).single()
  const role = profile?.role || 'user'

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 mb-2">
          {role === 'super_admin' ? 'System Overview' : role === 'manager' ? 'Manager Dashboard' : 'User Portal'}
        </h1>
        <p className="text-zinc-400 text-lg">
          {role === 'super_admin' ? "Global statistics, user management, and system activity." : 
           role === 'manager' ? "Manage your team, review documents, and monitor candidate progress." : 
           "View your personal analytics, repositories, and document statuses."}
        </p>
      </div>

      <StatCards stats={stats} role={role} />

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <OverviewCharts data={chartData} />
        <div className="col-span-1 h-[400px]">
          <ActivityFeed activities={activities} />
        </div>
      </div>

      <UsersDataTable users={users} />
    </>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Suspense fallback={
        <>
          <div className="mb-8 space-y-2">
            <Skeleton className="h-10 w-64 bg-white/10" />
            <Skeleton className="h-6 w-96 bg-white/5" />
          </div>
          <StatCardsSkeleton />
          <GridSkeleton />
          <Skeleton className="h-[400px] w-full rounded-xl bg-white/5" />
        </>
      }>
        <DashboardContent />
      </Suspense>
    </div>
  )
}
