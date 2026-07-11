'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Use the Service Role Key for Admin operations (creating users without logging in as them)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function createManager(formData: FormData) {
  // Verify the caller is authenticated and is a super_admin
  const supabase = await createServerClient()
  const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()

  if (authError || !currentUser) return { error: 'Unauthorized' }

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', currentUser.id)
    .single()

  if (profile?.role !== 'super_admin') {
    return { error: 'Only super admins can create managers' }
  }

  const email = formData.get('email') as string
  const fullName = formData.get('fullName') as string
  const password = formData.get('password') as string

  // 1. Create the user in Auth
  const { data: authData, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true, // Auto-confirm for managers created by Super Admin
  })

  if (createAuthError || !authData.user) {
    return { error: createAuthError?.message || 'Failed to create user' }
  }

  // 2. Insert into public.users table as a manager
  const { error: dbError } = await supabaseAdmin
    .from('users')
    .insert({
      id: authData.user.id,
      email: email,
      full_name: fullName,
      role: 'manager',
    })

  if (dbError) {
    return { error: dbError.message }
  }

  revalidatePath('/dashboard/managers')
  return { success: true }
}
