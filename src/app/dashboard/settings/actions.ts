'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const fullName = formData.get('full_name') as string

  if (!fullName || fullName.trim() === '') {
    return { error: 'Full name is required' }
  }

  // Update public users table (RLS allows users to update their own profile typically, or we can use admin client if RLS is strict, but let's try normal client first, if not we will fix)
  // Wait, let's check schema.sql. Users can't update. "Note: INSERT, UPDATE, DELETE operations will primarily be handled by Next.js Server Actions using the Service Role Key for security"
  
  const { createClient: createAdminClient } = await import('@supabase/supabase-js')
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabaseAdmin
    .from('users')
    .update({ full_name: fullName, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) {
    console.error("Error updating profile", error)
    return { error: 'Failed to update profile' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/settings')

  return { success: 'Profile updated successfully' }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const newPassword = formData.get('new_password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (!newPassword || newPassword.length < 6) {
    return { error: 'Password must be at least 6 characters long' }
  }

  if (newPassword !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) {
    console.error("Error updating password", error)
    return { error: error.message || 'Failed to update password' }
  }

  return { success: 'Password updated successfully' }
}
