import { createClient } from "@/utils/supabase/server"
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { FileText, Upload, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CreateDocumentForm, UploadDocumentForm } from "@/components/dashboard/DocumentForms"
import { DocumentActions } from "@/components/dashboard/DocumentEditor"

export default async function DocumentsPage() {
  const supabase = await createClient()
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  let documents = []
  
  // Basic display logic based on role
  if (profile?.role === 'user') {
    // User sees their own documents
    const { data } = await supabaseAdmin
      .from('documents')
      .select('*, repositories!inner(user_id, repo_name)')
      .eq('repositories.user_id', user.id)
      .order('created_at', { ascending: false })
    documents = data || []
  } else if (profile?.role === 'manager') {
    // Manager sees documents of their assigned users (two-step: get user IDs, then their docs)
    const { data: managedUsers } = await supabase
      .from('users')
      .select('id')
      .eq('manager_id', user.id)
    const managedUserIds = managedUsers?.map(u => u.id) || []

    if (managedUserIds.length > 0) {
      const { data: repos } = await supabase
        .from('repositories')
        .select('id')
        .in('user_id', managedUserIds)
      const repoIds = repos?.map(r => r.id) || []

      if (repoIds.length > 0) {
        const { data } = await supabaseAdmin
          .from('documents')
          .select('*, repositories(repo_name)')
          .in('repo_id', repoIds)
          .order('created_at', { ascending: false })
        documents = data || []
      }
    }
  } else {
    // Super Admin sees everything
    const { data } = await supabaseAdmin
      .from('documents')
      .select('*, repositories(repo_name)')
      .order('created_at', { ascending: false })
    documents = data || []
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Documents</h1>
          <p className="text-zinc-400">Manage and view files synchronized with GitHub storage.</p>
        </div>
        
        {profile?.role === 'user' && (
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:pointer-events-none h-10 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white border-0">
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </DialogTrigger>
              <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Upload Document</DialogTitle>
                </DialogHeader>
                <UploadDocumentForm />
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:pointer-events-none h-10 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white border-0">
                <FileText className="mr-2 h-4 w-4" />
                New Document
              </DialogTrigger>
              <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create Document</DialogTitle>
                </DialogHeader>
                <CreateDocumentForm />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-lg text-zinc-100">Repository Files</CardTitle>
          <CardDescription className="text-zinc-400">All documents are securely stored in GitHub.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                <TableHead className="text-zinc-400">File Name</TableHead>
                {profile?.role !== 'user' && <TableHead className="text-zinc-400">Owner Repo</TableHead>}
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400">Size</TableHead>
                <TableHead className="text-zinc-400">Last Modified</TableHead>
                <TableHead className="text-zinc-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents && documents.length > 0 ? (
                documents.map((doc: any) => (
                  <TableRow key={doc.id} className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableCell className="font-medium text-zinc-200">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-zinc-500" />
                        {doc.file_path}
                      </div>
                    </TableCell>
                    {profile?.role !== 'user' && (
                      <TableCell className="text-zinc-400">{doc.repositories?.repo_name || 'Unknown'}</TableCell>
                    )}
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">
                        Uploaded
                      </span>
                    </TableCell>
                    <TableCell className="text-zinc-400">{doc.size_bytes ? (doc.size_bytes / 1024).toFixed(1) : '0.0'} KB</TableCell>
                    <TableCell className="text-zinc-400">{new Date(doc.updated_at || doc.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DocumentActions 
                        documentId={doc.id} 
                        filePath={doc.file_path} 
                        role={profile?.role} 
                        feedback={doc.manager_feedback} 
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableCell colSpan={6} className="h-24 text-center text-zinc-500">
                    No documents found. {profile?.role === 'user' ? 'Upload a file to get started.' : ''}
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
