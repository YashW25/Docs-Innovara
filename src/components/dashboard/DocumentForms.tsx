'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createDocument } from '@/app/dashboard/documents/actions'
import { FileText, Upload } from "lucide-react"

export function CreateDocumentForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function formAction(formData: FormData) {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await createDocument(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        window.location.reload()
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form action={formAction} className="space-y-4 pt-4">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-md text-sm">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="fileName">File Name</Label>
        <Input id="fileName" name="fileName" placeholder="my-document" className="bg-zinc-900 border-zinc-800" required />
        <p className="text-xs text-zinc-500">Will be saved as .md file</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="textContent">Content</Label>
        <Textarea 
          id="textContent" 
          name="textContent" 
          placeholder="Start writing..." 
          className="bg-zinc-900 border-zinc-800 min-h-[150px]" 
          required 
        />
      </div>
      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-500 text-white">
          {isLoading ? 'Creating...' : 'Create Document'}
        </Button>
      </div>
    </form>
  )
}

export function UploadDocumentForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!file) {
      setError("Please select a file")
      return
    }

    setIsLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      let data;
      try {
        data = await response.json()
      } catch (parseErr) {
        // If it's an HTML response (e.g. Next.js error page), show the raw status
        throw new Error(`Server returned ${response.status} ${response.statusText}. It may be too large.`)
      }

      if (!response.ok || data.error) {
        setError(data.error || `HTTP ${response.status}: ${response.statusText}`)
      } else {
        window.location.reload()
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 pt-4">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-md text-sm">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label>Select File</Label>
        <div className="flex items-center justify-center w-full">
            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-zinc-800 border-dashed rounded-lg cursor-pointer bg-zinc-900/50 hover:bg-zinc-900 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-zinc-500" />
                    <p className="mb-2 text-sm text-zinc-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-zinc-500">{file ? file.name : "TXT, MD, PNG, JPG, PDF"}</p>
                </div>
                <input 
                  id="dropzone-file" 
                  name="file"
                  type="file" 
                  className="hidden" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                />
            </label>
        </div>
      </div>
      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={isLoading || !file} className="bg-indigo-600 hover:bg-indigo-500 text-white">
          {isLoading ? 'Uploading...' : 'Upload File'}
        </Button>
      </div>
    </form>
  )
}
