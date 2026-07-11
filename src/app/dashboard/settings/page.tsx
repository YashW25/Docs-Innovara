import { createClient } from "@/utils/supabase/server"
import { SettingsForm } from "@/components/dashboard/SettingsForm"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // Fetch current profile from public.users table
  const { data: profile } = await supabase
    .from('users')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 mb-2">
          Profile Settings
        </h1>
        <p className="text-zinc-400 text-lg">
          Manage your account details and security preferences.
        </p>
      </div>

      <SettingsForm userProfile={profile} />
    </div>
  )
}
