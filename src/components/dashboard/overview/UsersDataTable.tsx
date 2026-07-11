'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, FolderGit2, HardDrive, FileText, Download, MoreHorizontal, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserDetailDrawer } from './UserDetailDrawer'

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function UsersDataTable({ users }: { users: any[] }) {
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<any | null>(null)

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-xl col-span-full">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-white/5 gap-4">
          <CardTitle className="text-xl text-zinc-100 font-semibold tracking-tight">Users Directory</CardTitle>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
              <Input 
                placeholder="Search users..." 
                className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white shrink-0">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-white/5">
                <TableHead className="text-zinc-400 font-medium pl-6">Name & Email</TableHead>
                <TableHead className="text-zinc-400 font-medium">Role</TableHead>
                <TableHead className="text-zinc-400 font-medium">Repositories</TableHead>
                <TableHead className="text-zinc-400 font-medium">Documents</TableHead>
                <TableHead className="text-zinc-400 font-medium">Storage Used</TableHead>
                <TableHead className="text-zinc-400 font-medium text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableCell colSpan={6} className="h-48 text-center text-zinc-500">
                    <User className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    No users found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => (
                  <TableRow key={u.id} className="border-white/5 hover:bg-white/5 cursor-pointer transition-colors" onClick={() => setSelectedUser(u)}>
                    <TableCell className="pl-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-zinc-200">{u.full_name || 'Unnamed User'}</span>
                        <span className="text-sm text-zinc-500">{u.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        u.role === 'super_admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        u.role === 'manager' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                        'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                      }`}>
                        {u.role.replace('_', ' ').toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-zinc-300">
                        <FolderGit2 className="h-4 w-4 text-blue-400" />
                        {u.reposCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-zinc-300">
                        <FileText className="h-4 w-4 text-emerald-400" />
                        {u.docsCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-zinc-300">
                        <HardDrive className="h-4 w-4 text-rose-400" />
                        {formatBytes(u.storageUsed)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="relative flex items-center justify-center h-8 w-8 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-200">
                          <DropdownMenuItem onClick={() => setSelectedUser(u)} className="cursor-pointer hover:bg-white/10">
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer hover:bg-white/10">
                            Edit User
                          </DropdownMenuItem>
                          {u.role !== 'super_admin' && (
                            <DropdownMenuItem className="cursor-pointer text-red-400 hover:bg-red-500/10 focus:text-red-400">
                              Suspend User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <UserDetailDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />
    </>
  )
}
