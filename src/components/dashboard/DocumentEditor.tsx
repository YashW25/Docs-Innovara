'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { updateDocumentContent, deleteDocumentRecord, getDocumentContent, updateDocumentFeedback } from '@/app/dashboard/documents/actions'
import { Edit, Trash2, Save, X, Loader2 } from "lucide-react"

export function DocumentActions({ documentId, filePath, role = 'user', feedback = '' }: { documentId: string, filePath: string, role?: string, feedback?: string | null }) {
  const [isOpen, setIsOpen] = useState(false)
  const [content, setContent] = useState('')
  const [managerFeedback, setManagerFeedback] = useState(feedback || '')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingFeedback, setIsSavingFeedback] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isImage = filePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)

  useEffect(() => {
    if (isOpen && !isImage) {
      loadContent()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isImage])

  async function loadContent() {
    setIsLoading(true)
    setError(null)
    try {
      const res = await getDocumentContent(documentId)
      if (res?.error) {
        setError(res.error)
      } else if (res?.content) {
        setContent(res.content)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load content')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSave() {
    setIsSaving(true)
    setError(null)
    try {
      const res = await updateDocumentContent(documentId, content)
      if (res?.error) {
        setError(res.error)
      } else {
        setIsOpen(false)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSaveFeedback() {
    setIsSavingFeedback(true)
    setError(null)
    try {
      const res = await updateDocumentFeedback(documentId, managerFeedback)
      if (res?.error) {
        setError(res.error)
      } else {
        setIsOpen(false)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save feedback')
    } finally {
      setIsSavingFeedback(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this document from GitHub?')) return
    
    setIsDeleting(true)
    try {
      const res = await deleteDocumentRecord(documentId)
      if (res?.error) {
        alert(res.error)
      } else {
        window.location.reload()
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} className="h-8 w-8 text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10">
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleDelete} disabled={isDeleting} className="h-8 w-8 text-zinc-400 hover:text-red-400 hover:bg-red-500/10">
          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-[1000px] w-[95vw]">
          <DialogHeader>
            <DialogTitle>{filePath}</DialogTitle>
          </DialogHeader>
          
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-zinc-400 border-b border-zinc-800 pb-2">Document Content</label>
              {isImage ? (
                <div className="text-center p-8 bg-zinc-900 rounded-md border border-zinc-800 h-[60vh]">
                  <p className="text-zinc-400 mb-4 mt-10">Image preview available on GitHub.</p>
                  <p className="text-xs text-zinc-500">Image editing is not supported in this editor.</p>
                </div>
              ) : isLoading ? (
                <div className="flex items-center justify-center h-[60vh] bg-zinc-900 border border-zinc-800 rounded-md">
                  <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
                </div>
              ) : (
                <Textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  readOnly={role !== 'user'}
                  className="h-[60vh] min-h-[300px] font-mono text-sm bg-zinc-900 border-zinc-800"
                  placeholder="Document content..."
                />
              )}
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-zinc-400 border-b border-zinc-800 pb-2">Manager Feedback & Corrections</label>
              <Textarea 
                value={managerFeedback}
                onChange={(e) => setManagerFeedback(e.target.value)}
                readOnly={role === 'user'}
                className="h-[60vh] min-h-[300px] font-mono text-sm bg-zinc-900 border-zinc-800 placeholder:text-zinc-600"
                placeholder={role === 'user' ? "No feedback provided yet." : "Leave corrections or feedback here..."}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={() => setIsOpen(false)} className="hover:bg-zinc-800 text-zinc-300">
              Close
            </Button>
            {role === 'user' && !isImage && (
              <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Document
              </Button>
            )}
            {role !== 'user' && (
              <Button onClick={handleSaveFeedback} disabled={isSavingFeedback} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                {isSavingFeedback ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Feedback
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
