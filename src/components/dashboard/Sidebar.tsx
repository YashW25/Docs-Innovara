import Link from 'next/link'
import Image from 'next/image'
import { LayoutDashboard, Users, FileText, Settings, Database } from 'lucide-react'

export function Sidebar({ role }: { role: string }) {
  const isSuperAdmin = role === 'super_admin'
  const isManager = role === 'manager'
  const isUser = role === 'user'

  return (
    <div className="flex h-full w-64 flex-col border-r bg-zinc-950/80 backdrop-blur-xl border-zinc-800 text-white p-4 transition-all">
      <div className="flex items-center gap-3 px-2 py-4 mb-8 mt-2">
        <Image src="/logo.jpg" alt="Docs Innovara" width={32} height={32} className="rounded-[4px] shadow-sm" />
        <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">Docs Innovara</span>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        <Link href="/dashboard" className="group flex items-center gap-3 rounded-lg bg-zinc-900/60 border border-zinc-800/50 px-3 py-2.5 text-zinc-100 transition-all hover:bg-zinc-800 hover:border-zinc-700 shadow-sm">
          <LayoutDashboard className="h-5 w-5 text-indigo-400 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Dashboard</span>
        </Link>

        {isSuperAdmin && (
          <>
            <Link href="/dashboard/managers" className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-zinc-400 transition-all hover:bg-zinc-800/80 hover:text-zinc-100 border border-transparent hover:border-zinc-800">
              <Users className="h-5 w-5 text-indigo-400/70 group-hover:text-indigo-400 group-hover:scale-110 transition-all" />
              <span className="font-medium">Managers</span>
            </Link>
            <Link href="/dashboard/system" className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-zinc-400 transition-all hover:bg-zinc-800/80 hover:text-zinc-100 border border-transparent hover:border-zinc-800">
              <Database className="h-5 w-5 text-indigo-400/70 group-hover:text-indigo-400 group-hover:scale-110 transition-all" />
              <span className="font-medium">System Data</span>
            </Link>
          </>
        )}

        {isManager && (
          <Link href="/dashboard/users" className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-zinc-400 transition-all hover:bg-zinc-800/80 hover:text-zinc-100 border border-transparent hover:border-zinc-800">
            <Users className="h-5 w-5 text-indigo-400/70 group-hover:text-indigo-400 group-hover:scale-110 transition-all" />
            <span className="font-medium">My Candidates</span>
          </Link>
        )}

        <Link href="/dashboard/documents" className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-zinc-400 transition-all hover:bg-zinc-800/80 hover:text-zinc-100 border border-transparent hover:border-zinc-800">
          <FileText className="h-5 w-5 text-indigo-400/70 group-hover:text-indigo-400 group-hover:scale-110 transition-all" />
          <span className="font-medium">Documents</span>
        </Link>
      </nav>

      <div className="mt-auto pt-4 border-t border-zinc-800/50">
        <Link href="/dashboard/settings" className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-zinc-400 transition-all hover:bg-zinc-800/80 hover:text-zinc-100">
          <Settings className="h-5 w-5 text-zinc-500 group-hover:text-zinc-300 group-hover:rotate-45 transition-all" />
          <span className="font-medium">Settings</span>
        </Link>
      </div>
    </div>
  )
}
