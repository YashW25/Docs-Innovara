import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/utils/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { uploadFileToGitHub } from '@/utils/github'
import { revalidatePath } from 'next/cache'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'No valid file provided' }, { status: 400 })
    }

    const finalFileName = file.name
    const buffer = Buffer.from(await file.arrayBuffer())
    const base64Content = buffer.toString('base64')
    const size = file.size

    // Get user's repo
    const { data: repo } = await supabaseAdmin
      .from('repositories')
      .select('repo_name, id')
      .eq('user_id', user.id)
      .single()

    if (!repo) {
      return NextResponse.json({ error: 'No linked repository found. Please contact your manager.' }, { status: 400 })
    }

    // Upload to GitHub
    await uploadFileToGitHub(repo.repo_name, finalFileName, base64Content, `Upload document: ${finalFileName}`)

    // Insert into DB
    const { error: dbError } = await supabaseAdmin
      .from('documents')
      .insert({
        repo_id: repo.id,
        file_path: finalFileName,
        status: 'pending',
        size_bytes: size
      })

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    // Notify manager
    const { data: userProfile } = await supabaseAdmin.from('users').select('full_name, manager_id').eq('id', user.id).single()
    if (userProfile?.manager_id) {
      const { createNotification } = await import('@/app/dashboard/notifications/actions')
      await createNotification({
        userId: userProfile.manager_id,
        actorName: userProfile.full_name,
        title: 'New Document Uploaded',
        message: `${userProfile.full_name} uploaded a new document: ${finalFileName}`,
        link: '/dashboard/documents'
      })
    }

    revalidatePath('/dashboard/documents')
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("API Upload Error:", error)
    return NextResponse.json(
      { error: `API Crash: ${error.message}` },
      { status: 500 }
    )
  }
}
