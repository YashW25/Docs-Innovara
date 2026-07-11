'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { createGitHubRepo } from '@/utils/github'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function createUser(formData: FormData) {
  try {
    const supabase = await createServerClient()
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !currentUser) return { error: 'Unauthorized' }

    // Check if current user is manager or super_admin
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', currentUser.id)
      .single()

    if (profile?.role !== 'manager' && profile?.role !== 'super_admin') {
      return { error: 'Unauthorized to create users' }
    }

    const email = formData.get('email') as string
    const fullName = formData.get('fullName') as string
    const password = formData.get('password') as string

    // 1. Create the user in Auth
    const { data: newAuthData, error: newAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, 
    })

    if (newAuthError || !newAuthData.user) {
      return { error: newAuthError?.message || 'Failed to create user' }
    }

    // 2. Insert into public.users table as a regular user
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .insert({
        id: newAuthData.user.id,
        email: email,
        full_name: fullName,
        role: 'user',
        manager_id: currentUser.id,
      })

    if (dbError) {
      return { error: dbError.message }
    }

    // 3. Create GitHub Repo
    try {
      const repoName = `candidate-${newAuthData.user.id.substring(0, 8)}-${fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`
      const repoData = await createGitHubRepo(repoName)

      // 4. Link repo to user in DB
      await supabaseAdmin
        .from('repositories')
        .insert({
          user_id: newAuthData.user.id,
          repo_name: repoName,
          repo_url: repoData.html_url,
        })

    } catch (err: any) {
      console.error("Failed to create GitHub Repo:", err)
      return { error: `User created, but failed to create GitHub repository: ${err.message}` }
    }

    revalidatePath('/dashboard/users')
    return { success: true }
  } catch (globalErr: any) {
    console.error("Global Action Error:", globalErr)
    return { error: `Server crash: ${globalErr.message}` }
  }
}
