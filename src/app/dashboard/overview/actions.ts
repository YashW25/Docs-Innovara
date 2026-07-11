'use server'

import { createClient as createServerClient } from '@/utils/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { cache } from 'react'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Helper to get role and target user IDs for scoping
const getScope = cache(async () => {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, role: null, scopedUserIds: [] }

  const { data: profile } = await supabaseAdmin.from('users').select('role').eq('id', user.id).single()
  const role = profile?.role || 'user'

  let scopedUserIds: string[] = []
  if (role === 'super_admin') {
    // Empty means all
  } else if (role === 'manager') {
    const { data: managed } = await supabaseAdmin.from('users').select('id').eq('manager_id', user.id)
    scopedUserIds = managed?.map(u => u.id) || []
  } else {
    scopedUserIds = [user.id]
  }

  return { user, role, scopedUserIds }
})

export async function getDashboardStats() {
  const { role, scopedUserIds, user } = await getScope()
  if (!user) return null

  try {
    let usersQuery = supabaseAdmin.from('users').select('id', { count: 'exact' })
    let reposQuery = supabaseAdmin.from('repositories').select('id, user_id', { count: 'exact' })
    let docsQuery = supabaseAdmin.from('documents').select('id, status, size_bytes, repo_id', { count: 'exact' })

    if (role === 'manager' || role === 'user') {
      usersQuery = usersQuery.in('id', scopedUserIds)
      reposQuery = reposQuery.in('user_id', scopedUserIds)
      
      const { data: repos } = await supabaseAdmin.from('repositories').select('id').in('user_id', scopedUserIds)
      const repoIds = repos?.map(r => r.id) || []
      if (repoIds.length > 0) {
        docsQuery = docsQuery.in('repo_id', repoIds)
      } else {
        docsQuery = docsQuery.in('repo_id', ['00000000-0000-0000-0000-000000000000']) // empty
      }
    }

    const [usersRes, reposRes, docsRes] = await Promise.all([
      usersQuery,
      reposQuery,
      docsQuery
    ])

    const documents = docsRes.data || []
    const pendingDocs = documents.filter(d => d.status === 'pending').length
    const storageUsed = documents.reduce((acc, curr) => acc + (curr.size_bytes || 0), 0)

    // Count managers if super admin
    let managersCount = 0
    if (role === 'super_admin') {
      const { count } = await supabaseAdmin.from('users').select('id', { count: 'exact' }).eq('role', 'manager')
      managersCount = count || 0
    }

    return {
      totalUsers: usersRes.count || 0,
      managersCount,
      totalRepos: reposRes.count || 0,
      totalDocs: documents.length,
      pendingDocs,
      storageUsed
    }
  } catch (error) {
    console.error("Error fetching stats", error)
    return null
  }
}

export async function getOverviewUsers() {
  const { role, scopedUserIds, user } = await getScope()
  if (!user) return []

  try {
    let query = supabaseAdmin
      .from('users')
      .select(`
        id, 
        full_name, 
        email, 
        role, 
        created_at,
        repositories ( id, repo_name, documents ( id, size_bytes ) )
      `)
      .order('created_at', { ascending: false })

    if (role === 'manager' || role === 'user') {
      query = query.in('id', scopedUserIds)
    }

    const { data } = await query
    
    // Transform data
    return (data || []).map((u: any) => {
      const repos = u.repositories || []
      const docs = repos.flatMap((r: any) => r.documents || [])
      const storage = docs.reduce((acc: number, curr: any) => acc + (curr.size_bytes || 0), 0)
      
      return {
        ...u,
        reposCount: repos.length,
        docsCount: docs.length,
        storageUsed: storage
      }
    })
  } catch (error) {
    console.error("Error fetching users", error)
    return []
  }
}

export async function getOverviewActivity() {
  const { role, scopedUserIds, user } = await getScope()
  if (!user) return []

  try {
    let query = supabaseAdmin
      .from('activity_logs')
      .select('*, users(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(10)

    if (role === 'manager' || role === 'user') {
      query = query.in('actor_id', scopedUserIds)
    }

    const { data } = await query
    return data || []
  } catch (error) {
    console.error("Error fetching activity", error)
    return []
  }
}

export async function getChartData() {
  const { role, scopedUserIds, user } = await getScope()
  if (!user) return { uploads: [], storage: [] }

  try {
    let docsQuery = supabaseAdmin.from('documents').select('created_at, size_bytes, repo_id')

    if (role === 'manager' || role === 'user') {
      const { data: repos } = await supabaseAdmin.from('repositories').select('id').in('user_id', scopedUserIds)
      const repoIds = repos?.map(r => r.id) || []
      if (repoIds.length > 0) {
        docsQuery = docsQuery.in('repo_id', repoIds)
      } else {
        docsQuery = docsQuery.in('repo_id', ['00000000-0000-0000-0000-000000000000'])
      }
    }

    const { data: docs } = await docsQuery
    if (!docs || docs.length === 0) return { uploads: [], storage: [] }

    // Group by date
    const uploadsByDate: Record<string, number> = {}
    docs.forEach(d => {
      const date = new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      uploadsByDate[date] = (uploadsByDate[date] || 0) + 1
    })

    const uploads = Object.entries(uploadsByDate).map(([date, count]) => ({ date, count }))

    return { uploads }
  } catch (error) {
    console.error("Error fetching chart data", error)
    return { uploads: [] }
  }
}
