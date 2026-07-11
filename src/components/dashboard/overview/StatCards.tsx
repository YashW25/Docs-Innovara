'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, HardDrive, FileText, Clock, FolderGit2, ShieldAlert } from "lucide-react"

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function StatCards({ stats, role }: { stats: any, role: string }) {
  if (!stats) return null

  const isSuperAdmin = role === 'super_admin'

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {role !== 'user' && (
        <Card className="bg-white/5 backdrop-blur-2xl border-white/10 shadow-xl transition-all duration-300 hover:bg-white/10 hover:border-indigo-500/30 hover:-translate-y-1 hover:shadow-indigo-500/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              {isSuperAdmin ? 'Total Users' : 'My Candidates'}
            </CardTitle>
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Users className="h-4 w-4 text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white tracking-tight">{stats.totalUsers}</div>
          </CardContent>
        </Card>
      )}

      {isSuperAdmin && (
        <Card className="bg-white/5 backdrop-blur-2xl border-white/10 shadow-xl transition-all duration-300 hover:bg-white/10 hover:border-indigo-500/30 hover:-translate-y-1 hover:shadow-indigo-500/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Managers</CardTitle>
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <ShieldAlert className="h-4 w-4 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white tracking-tight">{stats.managersCount}</div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white/5 backdrop-blur-2xl border-white/10 shadow-xl transition-all duration-300 hover:bg-white/10 hover:border-indigo-500/30 hover:-translate-y-1 hover:shadow-indigo-500/10">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-zinc-400">Linked Repositories</CardTitle>
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <FolderGit2 className="h-4 w-4 text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white tracking-tight">{stats.totalRepos}</div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 backdrop-blur-2xl border-white/10 shadow-xl transition-all duration-300 hover:bg-white/10 hover:border-indigo-500/30 hover:-translate-y-1 hover:shadow-indigo-500/10">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-zinc-400">Total Documents</CardTitle>
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <FileText className="h-4 w-4 text-emerald-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white tracking-tight">{stats.totalDocs}</div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 backdrop-blur-2xl border-white/10 shadow-xl transition-all duration-300 hover:bg-white/10 hover:border-indigo-500/30 hover:-translate-y-1 hover:shadow-indigo-500/10">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-zinc-400">Storage Used</CardTitle>
          <div className="p-2 bg-rose-500/10 rounded-lg">
            <HardDrive className="h-4 w-4 text-rose-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white tracking-tight">{formatBytes(stats.storageUsed)}</div>
        </CardContent>
      </Card>
    </div>
  )
}
