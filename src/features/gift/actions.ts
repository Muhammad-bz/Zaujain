'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createServerComponentClient } from '@/lib/supabase/server'
import { toSlug, generateSlugSuffix } from '@/utils/slugs'

export async function redeemActivationKey(formData: FormData) {
  const key = (formData.get('key') as string)?.trim().toUpperCase()
  if (!key || key.length < 4) return { error: 'Please enter a valid activation key.' }

  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Please sign in before redeeming your key.' }

  const { data, error } = await supabase.rpc('redeem_activation_key', {
    p_key: key,
    p_user_id: user.id,
  })

  if (error) return { error: 'Something went wrong. Please try again.' }
  if (!data.success) return { error: data.error }

  return { success: true, keyId: data.key_id as string, productType: data.product_type as string }
}

const createExperienceSchema = z.object({
  title: z.string().min(2).max(80),
  recipientName: z.string().min(2).max(50),
  welcomeMessage: z.string().max(500).optional(),
  activationKeyId: z.string().uuid(),
  experienceType: z.string().default('digital_gift'),
})

export async function createExperience(formData: FormData) {
  const raw = {
    title: formData.get('title') as string,
    recipientName: formData.get('recipientName') as string,
    welcomeMessage: formData.get('welcomeMessage') as string,
    activationKeyId: formData.get('activationKeyId') as string,
    experienceType: (formData.get('experienceType') as string) || 'digital_gift',
  }

  const result = createExperienceSchema.safeParse(raw)
  if (!result.success) return { error: result.error.issues[0].message }

  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  let slug = toSlug(result.data.title)
  if (slug.length < 3) slug = `gift-${slug}`

  const { data: existing } = await supabase
    .from('experiences')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (existing) slug = `${slug}-${generateSlugSuffix()}`

  const insertData = {
    activation_key_id: result.data.activationKeyId,
    owner_id: user.id,
    experience_type: 'digital_gift' as const,
    title: result.data.title,
    slug,
    welcome_message: result.data.welcomeMessage || null,
    status: 'draft' as const,
    is_private: true,
  }

  const { data: experience, error: insertError } = await supabase
    .from('experiences')
    .insert(insertData)
    .select('slug')
    .single()

  if (insertError) {
    console.error('Insert error:', insertError)
    return { error: `Failed to create gift: ${insertError.message}` }
  }

  redirect(`/gift/${experience.slug}/edit`)
}

export async function updateExperience(slug: string, formData: FormData) {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const updates: Record<string, string | boolean | null> = {}
  const title = formData.get('title') as string
  const welcomeMessage = formData.get('welcomeMessage') as string
  const themeId = formData.get('themeId') as string
  const coverImage = formData.get('coverImage') as string
  const backgroundMusic = formData.get('backgroundMusic') as string

  if (title) updates.title = title
  if (welcomeMessage !== null) updates.welcome_message = welcomeMessage || null
  if (themeId) updates.theme_id = themeId
  if (coverImage !== null) updates.cover_image = coverImage || null
  if (backgroundMusic !== null) updates.background_music = backgroundMusic || null

  const { error } = await supabase
    .from('experiences')
    .update(updates)
    .eq('slug', slug)
    .eq('owner_id', user.id)

  if (error) return { error: 'Failed to save changes.' }

  revalidatePath(`/gift/${slug}/edit`)
  return { success: true }
}

export async function publishExperience(slug: string) {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { error } = await supabase
    .from('experiences')
    .update({ status: 'published' })
    .eq('slug', slug)
    .eq('owner_id', user.id)

  if (error) return { error: 'Failed to publish.' }

  revalidatePath(`/gift/${slug}/edit`)
  revalidatePath(`/us/${slug}`)
  redirect(`/gift/${slug}/preview`)
}

export async function getMyExperiences() {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('experiences')
    .select('id, title, slug, status, experience_type, cover_image, created_at, theme:themes(name)')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  return data ?? []
}
