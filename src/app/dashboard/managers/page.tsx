import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, MoreHorizontal } from "lucide-react"
import { CreateManagerForm } from "@/components/dashboard/CreateManagerForm"

export default async function ManagersPage() {
  const supabase = await createClient()

  // Fetch all users with the 'manager' role
  const { data: managers } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'manager')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Managers</h1>
          <p className="text-zinc-400">Manage platform managers and their access.</p>
        </div>
        
        <Dialog>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:pointer-events-none h-10 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white border-0">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Manager
          </DialogTrigger>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Manager</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Add a new manager to the platform. They will receive access immediately.
              </DialogDescription>
            </DialogHeader>
            <CreateManagerForm />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-lg text-zinc-100">All Managers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                <TableHead className="text-zinc-400">Name</TableHead>
                <TableHead className="text-zinc-400">Email</TableHead>
                <TableHead className="text-zinc-400">Joined</TableHead>
                <TableHead className="text-zinc-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {managers && managers.length > 0 ? (
                managers.map((manager) => (
                  <TableRow key={manager.id} className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableCell className="font-medium text-zinc-200">{manager.full_name || 'N/A'}</TableCell>
                    <TableCell className="text-zinc-400">{manager.email}</TableCell>
                    <TableCell className="text-zinc-400">{new Date(manager.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableCell colSpan={4} className="h-24 text-center text-zinc-500">
                    No managers found. Add one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
