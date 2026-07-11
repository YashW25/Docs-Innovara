'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createManager } from '@/app/dashboard/managers/actions'

export function CreateManagerForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await createManager(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        // Success! Reload the page
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
        <Label htmlFor="fullName">Full Name</Label>
        <Input id="fullName" name="fullName" placeholder="Jane Doe" className="bg-zinc-900 border-zinc-800" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input id="email" name="email" type="email" placeholder="jane@docs.app" className="bg-zinc-900 border-zinc-800" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Temporary Password</Label>
        <Input id="password" name="password" type="password" className="bg-zinc-900 border-zinc-800" required />
      </div>
      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-500 text-white">
          {isLoading ? 'Creating...' : 'Create Manager'}
        </Button>
      </div>
    </form>
  )
}
