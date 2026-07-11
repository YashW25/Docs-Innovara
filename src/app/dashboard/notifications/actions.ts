'use server'

import { createClient as createServerClient } from '@/utils/supabase/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Internal helper for other actions to trigger notifications
export async function createNotification({
  userId,
  actorName,
  title,
  message,
  link
}: {
  userId: string,
  actorName?: string,
  title: string,
  message: string,
  link?: string
}) {
  try {
    await supabaseAdmin.from('notifications').insert({
      user_id: userId,
      actor_name: actorName,
      title,
      message,
      link
    })
  } catch (error) {
    console.error('Failed to create notification', error)
  }
}

// Fetch notifications for the current user
export async function getNotifications() {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'Unauthorized' }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) return { data: null, error: error.message }
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

// Mark a single notification as read
export async function markNotificationAsRead(notificationId: string) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false }

    await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id)

    return { success: true }
  } catch (error) {
    return { success: false }
  }
}

// Mark all as read
export async function markAllNotificationsAsRead() {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false }

    await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)

    return { success: true }
  } catch (error) {
    return { success: false }
  }
}
