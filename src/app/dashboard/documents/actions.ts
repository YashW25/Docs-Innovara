'use server'

import { createClient as createServerClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function updateDocumentStatus(documentId: string, status: 'approved' | 'rejected') {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Check role
  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'manager' && profile?.role !== 'super_admin') {
    return { error: 'Unauthorized to change document status' }
  }

  const { error } = await supabaseAdmin
    .from('documents')
    .update({ status })
    .eq('id', documentId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/documents')
  return { success: true }
}

export async function createDocument(formData: FormData) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const file = formData.get('file') as File | null
    const textContent = formData.get('textContent') as string | null
    const customFileName = formData.get('fileName') as string | null

    let finalFileName = ''
    let base64Content = ''
    let size = 0

    if (file && file.size > 0) {
      finalFileName = file.name
      const buffer = Buffer.from(await file.arrayBuffer())
      base64Content = buffer.toString('base64')
      size = file.size
    } else if (textContent && customFileName) {
      finalFileName = customFileName.endsWith('.md') ? customFileName : `${customFileName}.md`
      base64Content = Buffer.from(textContent, 'utf-8').toString('base64')
      size = Buffer.byteLength(textContent, 'utf-8')
    } else {
      return { error: 'No valid file or text content provided' }
    }

    // Get user's repo
    const { data: repo } = await supabaseAdmin
      .from('repositories')
      .select('repo_name, id')
      .eq('user_id', user.id)
      .single()

    if (!repo) return { error: 'No linked repository found. Please contact your manager.' }

    // Upload to GitHub
    const { uploadFileToGitHub } = await import('@/utils/github')
    await uploadFileToGitHub(repo.repo_name, finalFileName, base64Content, `Create document: ${finalFileName}`)

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
      return { error: dbError.message }
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
    return { success: true }
  } catch (error: any) {
    console.error(error)
    return { error: error.message || 'An unexpected error occurred' }
  }
}

export async function updateDocumentContent(documentId: string, newContent: string) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Fetch document details
    const { data: doc } = await supabaseAdmin
      .from('documents')
      .select('*, repositories(repo_name, user_id)')
      .eq('id', documentId)
      .single()

    if (!doc) return { error: 'Document not found' }
    if (doc.repositories.user_id !== user.id) return { error: 'Unauthorized to edit this document' }

    const repoName = doc.repositories.repo_name
    
    // Get latest SHA from GitHub
    const { getFileFromGitHub, uploadFileToGitHub } = await import('@/utils/github')
    const fileData = await getFileFromGitHub(repoName, doc.file_path)
    
    if (!fileData || Array.isArray(fileData)) return { error: 'File not found on GitHub' }

    // Push update to GitHub
    const base64Content = Buffer.from(newContent, 'utf-8').toString('base64')
    await uploadFileToGitHub(
      repoName, 
      doc.file_path, 
      base64Content, 
      `Update document: ${doc.file_path}`,
      fileData.sha
    )

    // Update DB timestamps and size
    await supabaseAdmin
      .from('documents')
      .update({ 
        updated_at: new Date().toISOString(),
        size_bytes: Buffer.byteLength(newContent, 'utf-8')
      })
      .eq('id', documentId)

    // Notify manager
    const { data: userProfile } = await supabaseAdmin.from('users').select('full_name, manager_id').eq('id', user.id).single()
    if (userProfile?.manager_id) {
      const { createNotification } = await import('@/app/dashboard/notifications/actions')
      await createNotification({
        userId: userProfile.manager_id,
        actorName: userProfile.full_name,
        title: 'Document Updated',
        message: `${userProfile.full_name} updated the document: ${doc.file_path}`,
        link: '/dashboard/documents'
      })
    }

    revalidatePath('/dashboard/documents')
    return { success: true }
  } catch (error: any) {
    console.error(error)
    return { error: error.message || 'An unexpected error occurred' }
  }
}

export async function getDocumentContent(documentId: string) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Fetch document details
    const { data: doc } = await supabaseAdmin
      .from('documents')
      .select('*, repositories(repo_name, user_id)')
      .eq('id', documentId)
      .single()

    if (!doc) return { error: 'Document not found' }

    const repoName = doc.repositories.repo_name
    
    // Get content from GitHub
    const { getFileFromGitHub } = await import('@/utils/github')
    const fileData = await getFileFromGitHub(repoName, doc.file_path)
    
    if (!fileData || Array.isArray(fileData)) return { error: 'File not found on GitHub' }
    if (!('content' in fileData)) return { error: 'File content not available (symlink or submodule)' }

    // Decode base64
    const content = Buffer.from(fileData.content, 'base64').toString('utf-8')
    return { success: true, content, filePath: doc.file_path }
  } catch (error: any) {
    console.error(error)
    return { error: error.message || 'An unexpected error occurred' }
  }
}

export async function deleteDocumentRecord(documentId: string) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Fetch document details
    const { data: doc } = await supabaseAdmin
      .from('documents')
      .select('*, repositories(repo_name, user_id)')
      .eq('id', documentId)
      .single()

    if (!doc) return { error: 'Document not found' }
    if (doc.repositories.user_id !== user.id) return { error: 'Unauthorized to delete this document' }

    const repoName = doc.repositories.repo_name
    
    // Get latest SHA from GitHub
    const { getFileFromGitHub, deleteFileFromGitHub } = await import('@/utils/github')
    const fileData = await getFileFromGitHub(repoName, doc.file_path)
    
    if (fileData && !Array.isArray(fileData)) {
       await deleteFileFromGitHub(repoName, doc.file_path, fileData.sha, `Delete document: ${doc.file_path}`)
    }

    // Delete from DB
    await supabaseAdmin
      .from('documents')
      .delete()
      .eq('id', documentId)

    revalidatePath('/dashboard/documents')
    return { success: true }
  } catch (error: any) {
    console.error(error)
    return { error: error.message || 'An unexpected error occurred' }
  }
}

export async function updateDocumentFeedback(documentId: string, feedback: string) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Check role
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('role, full_name')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'manager' && profile?.role !== 'super_admin') {
      return { error: 'Only managers can leave feedback' }
    }

    const { error: dbError } = await supabaseAdmin
      .from('documents')
      .update({ manager_feedback: feedback })
      .eq('id', documentId)

    if (dbError) {
      return { error: dbError.message }
    }

    // Notify user
    const { data: doc } = await supabaseAdmin.from('documents').select('repositories(user_id), file_path').eq('id', documentId).single()
    const docUserId = Array.isArray(doc?.repositories) ? doc?.repositories[0]?.user_id : (doc?.repositories as any)?.user_id
    if (docUserId) {
      const { createNotification } = await import('@/app/dashboard/notifications/actions')
      await createNotification({
        userId: docUserId,
        actorName: profile.full_name,
        title: 'New Feedback',
        message: `Your manager left feedback on your document: ${doc?.file_path || 'Unknown Document'}`,
        link: '/dashboard/documents'
      })
    }

    revalidatePath('/dashboard/documents')
    return { success: true }
  } catch (error: any) {
    console.error(error)
    return { error: error.message || 'An unexpected error occurred' }
  }
}
