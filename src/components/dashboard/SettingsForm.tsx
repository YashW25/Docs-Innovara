'use client'

import { useState } from 'react'
import { updateProfile, updatePassword } from '@/app/dashboard/settings/actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { User, Lock, Mail, CheckCircle2, AlertCircle } from "lucide-react"

export function SettingsForm({ userProfile }: { userProfile: any }) {
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  async function handleUpdateProfile(formData: FormData) {
    setProfileLoading(true)
    setProfileMessage(null)
    const result = await updateProfile(formData)
    
    if (result.error) {
      setProfileMessage({ type: 'error', text: result.error })
    } else if (result.success) {
      setProfileMessage({ type: 'success', text: result.success })
    }
    setProfileLoading(false)
  }

  async function handleUpdatePassword(formData: FormData) {
    setPasswordLoading(true)
    setPasswordMessage(null)
    const result = await updatePassword(formData)
    
    if (result.error) {
      setPasswordMessage({ type: 'error', text: result.error })
    } else if (result.success) {
      setPasswordMessage({ type: 'success', text: result.success })
      // Clear password fields
      const form = document.getElementById('password-form') as HTMLFormElement
      form?.reset()
    }
    setPasswordLoading(false)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-zinc-100 font-semibold tracking-tight flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-400" />
            Profile Details
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Update your personal information.
          </CardDescription>
        </CardHeader>
        <form action={handleUpdateProfile}>
          <CardContent className="space-y-4">
            {profileMessage && (
              <div className={`p-3 rounded-md flex items-center gap-2 text-sm ${profileMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {profileMessage.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                {profileMessage.text}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <Input 
                  id="email"
                  name="email"
                  defaultValue={userProfile?.email || ''} 
                  disabled 
                  className="pl-10 bg-black/20 border-white/10 text-zinc-400 disabled:opacity-70"
                />
              </div>
              <p className="text-xs text-zinc-500">Your email address cannot be changed.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-zinc-300">Full Name</Label>
              <Input 
                id="full_name"
                name="full_name"
                defaultValue={userProfile?.full_name || ''} 
                placeholder="Enter your full name"
                className="bg-black/20 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="border-t border-white/5 pt-6 bg-transparent">
            <Button type="submit" disabled={profileLoading} className="bg-indigo-600 hover:bg-indigo-500 text-white border-0 transition-colors">
              {profileLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-zinc-100 font-semibold tracking-tight flex items-center gap-2">
            <Lock className="h-5 w-5 text-indigo-400" />
            Security
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Update your password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <form id="password-form" action={handleUpdatePassword}>
          <CardContent className="space-y-4">
            {passwordMessage && (
              <div className={`p-3 rounded-md flex items-center gap-2 text-sm ${passwordMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {passwordMessage.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                {passwordMessage.text}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="new_password" className="text-zinc-300">New Password</Label>
              <Input 
                id="new_password"
                name="new_password"
                type="password"
                placeholder="Enter new password"
                className="bg-black/20 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password" className="text-zinc-300">Confirm New Password</Label>
              <Input 
                id="confirm_password"
                name="confirm_password"
                type="password"
                placeholder="Confirm new password"
                className="bg-black/20 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
                required
                minLength={6}
              />
            </div>
          </CardContent>
          <CardFooter className="border-t border-white/5 pt-6 bg-transparent">
            <Button type="submit" disabled={passwordLoading} className="bg-indigo-600 hover:bg-indigo-500 text-white border-0 transition-colors">
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
