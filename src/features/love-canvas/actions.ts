'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server'

export async function saveDrawing(experienceSlug: string, formData: FormData) {
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

  const cloudinary_url = formData.get('cloudinary_url') as string
  const note = formData.get('note') as string
  const wallpaper_enabled = formData.get('wallpaper_enabled') === 'true'

  if (!cloudinary_url) return { error: 'Please provide a drawing URL.' }

  const { error } = await supabase.from('drawings').insert({
    experience_id: experience.id,
    artist_id: user.id,
    cloudinary_url,
    note: note || null,
    wallpaper_enabled,
  })

  if (error) return { error: 'Failed to save drawing.' }

  revalidatePath(`/gift/${experienceSlug}/canvas`)
  return { success: true }
}

export async function getDrawings(experienceSlug: string) {
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
    .from('drawings')
    .select('*')
    .eq('experience_id', experience.id)
    .order('created_at', { ascending: false })

  return data ?? []
}

export async function deleteDrawing(experienceSlug: string, drawingId: string) {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { error } = await supabase
    .from('drawings')
    .delete()
    .eq('id', drawingId)
    .eq('artist_id', user.id)

  if (error) return { error: 'Failed to delete drawing.' }

  revalidatePath(`/gift/${experienceSlug}/canvas`)
  return { success: true }
}
