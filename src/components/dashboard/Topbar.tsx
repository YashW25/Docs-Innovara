"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
import { NotificationBell } from "./NotificationBell"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

export function Topbar({ user }: { user: any }) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-800/60 bg-zinc-950/40 backdrop-blur-xl px-8 z-10">
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <NotificationBell />
        <DropdownMenu>
          <DropdownMenuTrigger className="relative h-9 w-9 rounded-full border border-zinc-700/50 hover:border-indigo-500/50 transition-all overflow-hidden p-0 focus:outline-none">
            <Avatar className="h-full w-full">
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium text-sm">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-zinc-900/95 backdrop-blur-xl border-zinc-800 text-zinc-100 shadow-2xl shadow-black/50" align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal px-3 py-2.5">
                <div className="flex flex-col space-y-1.5">
                  <p className="text-sm font-medium leading-none text-zinc-100">My Account</p>
                  <p className="text-xs leading-none text-zinc-400 truncate">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-zinc-800/60" />
            <DropdownMenuItem onClick={() => router.push('/dashboard/settings')} className="focus:bg-zinc-800/80 focus:text-white cursor-pointer py-2.5 px-3 transition-colors">
              <User className="mr-3 h-4 w-4 text-zinc-400" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800/60" />
            <DropdownMenuItem onClick={handleSignOut} className="focus:bg-red-500/10 focus:text-red-400 cursor-pointer text-red-400 py-2.5 px-3 transition-colors">
              <LogOut className="mr-3 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
