'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createServerComponentClient } from '@/lib/supabase/server'
import { toSlug, generateSlugSuffix } from '@/utils/slugs'

// ─── Redeem Activation Key ────────────────────────────────────────────────────

export async function redeemActivationKey(formData: FormData) {
  const key = (formData.get('key') as string)?.trim().toUpperCase()

  if (!key || key.length < 4) {
    return { error: 'Please enter a valid activation key.' }
  }

  const supabase = await createServerComponentClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Please sign in before redeeming your key.' }
  }

  // Call the secure database function (handles race conditions with FOR UPDATE)
  const { data, error } = await supabase.rpc('redeem_activation_key', {
    p_key: key,
    p_user_id: user.id,
  })

  if (error) {
    return { error: 'Something went wrong. Please try again.' }
  }

  if (!data.success) {
    return { error: data.error }
  }

  return {
    success: true,
    keyId: data.key_id as string,
    productType: data.product_type as string,
  }
}

// ─── Create Experience ────────────────────────────────────────────────────────

const createExperienceSchema = z.object({
  title: z.string().min(2).max(80),
  recipientName: z.string().min(2).max(50),
  welcomeMessage: z.string().max(500).optional(),
  activationKeyId: z.string().uuid(),
  experienceType: z.enum([
    'digital_gift', 'time_capsule', 'proposal', 'anniversary',
    'birthday', 'friendship', 'graduation', 'wedding',
    'ramadan', 'eid', 'christmas',
  ]).default('digital_gift'),
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
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/sign-in')

  // Generate a unique slug from the title
  let slug = toSlug(result.data.title)
  if (slug.length < 3) slug = `gift-${slug}`

  // Check uniqueness, append suffix if taken
  const { data: existing } = await supabase
    .from('experiences')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (existing) {
    slug = `${slug}-${generateSlugSuffix()}`
  }

  const { data: experience, error } = await supabase
    .from('experiences')
    .insert({
      activation_key_id: result.data.activationKeyId,
      owner_id: user.id,
      experience_type: result.data.experienceType,
      title: result.data.title,
      slug,
      welcome_message: result.data.welcomeMessage || null,
      status: 'draft',
      is_private: true,
    })
    .select('slug')
    .single()

  if (error) {
    return { error: 'Failed to create your gift. Please try again.' }
  }

  redirect(`/gift/${experience.slug}/edit`)
}

// ─── Update Experience ────────────────────────────────────────────────────────

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

  if (error) {
    return { error: 'Failed to save changes. Please try again.' }
  }

  revalidatePath(`/gift/${slug}/edit`)
  return { success: true }
}

// ─── Publish Experience ───────────────────────────────────────────────────────

export async function publishExperience(slug: string) {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { error } = await supabase
    .from('experiences')
    .update({ status: 'published' })
    .eq('slug', slug)
    .eq('owner_id', user.id)

  if (error) {
    return { error: 'Failed to publish. Please try again.' }
  }

  revalidatePath(`/gift/${slug}/edit`)
  revalidatePath(`/us/${slug}`)
  redirect(`/gift/${slug}/preview`)
}

// ─── Get Experience (owner view) ──────────────────────────────────────────────

export async function getExperienceBySlug(slug: string) {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('experiences')
    .select(`
      *,
      theme:themes(id, name, configuration_json)
    `)
    .eq('slug', slug)
    .eq('owner_id', user.id)
    .single()

  return data
}

// ─── Get All Experiences for Dashboard ────────────────────────────────────────

export async function getMyExperiences() {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('experiences')
    .select(`
      id, title, slug, status, experience_type,
      cover_image, created_at,
      theme:themes(name)
    `)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  return data ?? []
}
