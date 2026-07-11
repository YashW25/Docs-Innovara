'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { FolderGit2, FileText, HardDrive, Mail, Clock, Shield } from "lucide-react"

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function UserDetailDrawer({ user, onClose }: { user: any, onClose: () => void }) {
  if (!user) return null

  return (
    <Sheet open={!!user} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-md w-full overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold text-white tracking-tight">{user.full_name || 'Unnamed User'}</SheetTitle>
          <SheetDescription className="text-zinc-400">
            User profile, storage, and linked resources overview.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Profile Information</h3>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-zinc-400" />
                <span className="text-sm text-zinc-200">{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-zinc-400" />
                <span className="text-sm text-zinc-200 capitalize">{user.role.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-zinc-400" />
                <span className="text-sm text-zinc-200">Joined {new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Resources Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Resources Overview</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2">
                <FolderGit2 className="h-6 w-6 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{user.reposCount}</div>
                  <div className="text-xs text-zinc-400">Repositories</div>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2">
                <FileText className="h-6 w-6 text-emerald-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{user.docsCount}</div>
                  <div className="text-xs text-zinc-400">Documents</div>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 col-span-2">
                <HardDrive className="h-6 w-6 text-rose-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{formatBytes(user.storageUsed)}</div>
                  <div className="text-xs text-zinc-400">Total Storage Consumed</div>
                </div>
              </div>
            </div>
          </div>

          {/* Repositories List */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Linked Repositories</h3>
            {user.repositories && user.repositories.length > 0 ? (
              <div className="space-y-2">
                {user.repositories.map((repo: any) => (
                  <div key={repo.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FolderGit2 className="h-4 w-4 text-zinc-400" />
                      <span className="text-sm font-medium text-zinc-200 truncate max-w-[180px]">{repo.repo_name}</span>
                    </div>
                    <span className="text-xs text-zinc-500">
                      {repo.documents?.length || 0} files
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 border-dashed rounded-xl p-4 text-center">
                <p className="text-sm text-zinc-500">No repositories linked yet.</p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
