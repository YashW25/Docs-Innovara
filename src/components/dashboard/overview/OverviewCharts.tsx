'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { LineChart } from "lucide-react"

export function OverviewCharts({ data }: { data: any }) {
  const hasData = data?.uploads && data.uploads.length > 0

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-xl col-span-full lg:col-span-2">
      <CardHeader className="pb-4 border-b border-white/5">
        <CardTitle className="text-xl text-zinc-100 font-semibold tracking-tight flex items-center gap-2">
          <LineChart className="h-5 w-5 text-indigo-400" />
          Document Upload Trends
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-64 rounded-xl bg-zinc-950/50 border border-white/5">
            <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 ring-1 ring-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              <LineChart className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-zinc-200 font-medium mb-1">No analytics available</h3>
            <p className="text-zinc-500 text-sm max-w-sm text-center">
              Charts will automatically generate here once users start uploading documents.
            </p>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.uploads} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="date" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5', borderRadius: '8px' }}
                  itemStyle={{ color: '#818cf8' }}
                  cursor={{ fill: '#ffffff05' }}
                />
                <Bar dataKey="count" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
