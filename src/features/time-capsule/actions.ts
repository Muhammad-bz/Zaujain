'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server'

export async function createCapsule(experienceSlug: string, formData: FormData) {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: experience } = await supabase
    .from('experiences')
    .select('id')
    .eq('slug', experienceSlug)
    .eq('owner_id', user.id)
    .single()

  if (!experience) return { error: 'Experience not found.' }

  const title = formData.get('title') as string
  const message = formData.get('message') as string
  const unlock_date = formData.get('unlock_date') as string

  if (!title || !unlock_date) return { error: 'Title and unlock date are required.' }

  if (new Date(unlock_date) <= new Date()) {
    return { error: 'Unlock date must be in the future.' }
  }

  const { error } = await supabase.from('time_capsules').insert({
    experience_id: experience.id,
    title,
    message: message || null,
    unlock_date: new Date(unlock_date).toISOString(),
    status: 'locked',
  })

  if (error) return { error: 'Failed to create time capsule.' }

  revalidatePath(`/gift/${experienceSlug}/capsule`)
  return { success: true }
}

export async function getCapsules(experienceSlug: string) {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: experience } = await supabase
    .from('experiences')
    .select('id')
    .eq('slug', experienceSlug)
    .eq('owner_id', user.id)
    .single()

  if (!experience) return []

  const { data } = await supabase
    .from('time_capsules')
    .select('*')
    .eq('experience_id', experience.id)
    .order('unlock_date', { ascending: true })

  return data ?? []
}

export async function deleteCapsule(experienceSlug: string, capsuleId: string) {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: experience } = await supabase
    .from('experiences')
    .select('id')
    .eq('slug', experienceSlug)
    .eq('owner_id', user.id)
    .single()

  if (!experience) return { error: 'Not found.' }

  const { error } = await supabase
    .from('time_capsules')
    .delete()
    .eq('id', capsuleId)
    .eq('experience_id', experience.id)

  if (error) return { error: 'Failed to delete.' }

  revalidatePath(`/gift/${experienceSlug}/capsule`)
  return { success: true }
}
