'use client'

import { useEffect, useState } from 'react'
import { Bell, Check, Circle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/app/dashboard/notifications/actions'
import { useRouter } from 'next/navigation'

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    fetchNotifications()
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  async function fetchNotifications() {
    const { data } = await getNotifications()
    if (data) {
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.is_read).length)
    }
  }

  async function handleMarkAsRead(id: string, link?: string) {
    await markNotificationAsRead(id)
    fetchNotifications()
    if (link) {
      router.push(link)
    }
  }

  async function handleMarkAllAsRead() {
    await markAllNotificationsAsRead()
    fetchNotifications()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative flex items-center justify-center h-9 w-9 rounded-full hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-zinc-400 hover:text-zinc-300">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500 border-2 border-zinc-950 flex items-center justify-center">
            <span className="sr-only">{unreadCount} unread</span>
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-zinc-900 border-zinc-800 text-zinc-100 shadow-xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-2 sticky top-0 bg-zinc-900/95 backdrop-blur-sm z-10 border-b border-zinc-800">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="p-0 font-medium text-sm">Notifications</DropdownMenuLabel>
          </DropdownMenuGroup>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="h-auto p-0 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-transparent">
              <Check className="mr-1 h-3 w-3" /> Mark all read
            </Button>
          )}
        </div>
        
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 text-sm">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
            No notifications yet
          </div>
        ) : (
          <div className="py-2">
            {notifications.map((notif) => (
              <DropdownMenuItem 
                key={notif.id}
                onClick={() => handleMarkAsRead(notif.id, notif.link)}
                className={`flex flex-col items-start px-4 py-3 cursor-pointer ${
                  notif.is_read ? 'opacity-60' : 'bg-indigo-500/5'
                } focus:bg-zinc-800 transition-colors`}
              >
                <div className="flex items-start justify-between w-full gap-2">
                  <div className="flex items-start gap-2">
                    {!notif.is_read && <Circle className="h-2 w-2 mt-1.5 fill-indigo-500 text-indigo-500 shrink-0" />}
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none text-zinc-200">
                        {notif.title}
                      </p>
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-zinc-500 font-medium">
                  {new Date(notif.created_at).toLocaleDateString()} at {new Date(notif.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
