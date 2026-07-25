'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server'

export async function addMemory(experienceSlug: string, formData: FormData) {
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

  const type = formData.get('type') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const media_url = formData.get('media_url') as string
  const unlock_date = formData.get('unlock_date') as string

  const { error } = await supabase.from('memories').insert({
    experience_id: experience.id,
    type,
    title: title || null,
    description: description || null,
    media_url: media_url || null,
    unlock_date: unlock_date || null,
    created_by: user.id,
  })

  if (error) return { error: 'Failed to add memory.' }

  revalidatePath(`/gift/${experienceSlug}/memories`)
  return { success: true }
}

export async function deleteMemory(experienceSlug: string, memoryId: string) {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { error } = await supabase
    .from('memories')
    .delete()
    .eq('id', memoryId)
    .eq('created_by', user.id)

  if (error) return { error: 'Failed to delete memory.' }

  revalidatePath(`/gift/${experienceSlug}/memories`)
  return { success: true }
}

export async function getMemories(experienceSlug: string) {
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
    .from('memories')
    .select('*')
    .eq('experience_id', experience.id)
    .order('created_at', { ascending: false })

  return data ?? []
}
