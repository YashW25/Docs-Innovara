import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, FolderGit2 } from "lucide-react"
import { CreateCandidateForm } from "@/components/dashboard/CreateCandidateForm"

export default async function UsersPage() {
  const supabase = await createClient()

  // This relies on RLS to only show users the manager created (or all if super admin)
  const { data: usersList } = await supabase
    .from('users')
    .select('*, repositories(repo_name, repo_url)')
    .eq('role', 'user')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">My Candidates</h1>
          <p className="text-zinc-400">Manage candidate accounts and their linked GitHub repositories.</p>
        </div>
        
        <Dialog>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:pointer-events-none h-10 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white border-0">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Candidate
          </DialogTrigger>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Candidate</DialogTitle>
              <DialogDescription className="text-zinc-400">
                A new GitHub repository will be automatically provisioned for this user.
              </DialogDescription>
            </DialogHeader>
            <CreateCandidateForm />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-lg text-zinc-100">All Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                <TableHead className="text-zinc-400">Name</TableHead>
                <TableHead className="text-zinc-400">Email</TableHead>
                <TableHead className="text-zinc-400">GitHub Repository</TableHead>
                <TableHead className="text-zinc-400 text-right">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersList && usersList.length > 0 ? (
                usersList.map((usr) => (
                  <TableRow key={usr.id} className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableCell className="font-medium text-zinc-200">{usr.full_name || 'N/A'}</TableCell>
                    <TableCell className="text-zinc-400">{usr.email}</TableCell>
                    <TableCell>
                      {usr.repositories && usr.repositories.length > 0 ? (
                        <a href={usr.repositories[0].repo_url} target="_blank" rel="noreferrer" className="flex items-center text-blue-400 hover:text-blue-300">
                          <FolderGit2 className="mr-2 h-4 w-4" />
                          {usr.repositories[0].repo_name}
                        </a>
                      ) : (
                        <span className="text-zinc-500 italic">No repo</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-zinc-400">
                      {new Date(usr.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableCell colSpan={4} className="h-24 text-center text-zinc-500">
                    No candidates found. Create one to provision their workspace.
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
