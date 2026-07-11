'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Clock } from "lucide-react"

export function ActivityFeed({ activities }: { activities: any[] }) {
  if (!activities || activities.length === 0) {
    return (
      <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-xl h-full">
        <CardHeader>
          <CardTitle className="text-xl text-zinc-100 font-semibold tracking-tight flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-400" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-56 rounded-xl bg-zinc-950/50 border border-white/5">
            <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 ring-1 ring-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              <Clock className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-zinc-200 font-medium mb-1">No recent activity</h3>
            <p className="text-zinc-500 text-sm max-w-sm text-center">
              Activity logs and recent updates will automatically appear here once they happen.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-xl h-full overflow-hidden flex flex-col">
      <CardHeader className="pb-4 border-b border-white/5">
        <CardTitle className="text-xl text-zinc-100 font-semibold tracking-tight flex items-center gap-2">
          <Activity className="h-5 w-5 text-indigo-400" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        <div className="divide-y divide-white/5">
          {activities.map((activity) => (
            <div key={activity.id} className="p-4 hover:bg-white/5 transition-colors">
              <div className="flex items-start gap-4">
                <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-1">
                  <Activity className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-zinc-200">
                    <span className="font-semibold text-white">{activity.users?.full_name || 'System'}</span> {activity.action}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {new Date(activity.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
