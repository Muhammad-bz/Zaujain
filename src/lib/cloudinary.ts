/**
 * Cloudinary Configuration & Utilities
 *
 * Handles all media operations: upload, transform, optimize.
 * All media goes through Cloudinary — never store large files in the DB.
 */

// ─── Configuration ────────────────────────────────────────────────────────────

export const CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? '',
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? '',
  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ?? '',
} as const

// Upload size limits (bytes)
export const UPLOAD_LIMITS = {
  image: 10 * 1024 * 1024, // 10MB
  video: 100 * 1024 * 1024, // 100MB
  audio: 20 * 1024 * 1024, // 20MB
  drawing: 5 * 1024 * 1024, // 5MB
} as const

// Supported MIME types
export const SUPPORTED_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
  audio: ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/ogg'],
  document: ['application/pdf'],
} as const

// ─── Folder Structure ─────────────────────────────────────────────────────────
// Organizes uploads in Cloudinary by type and experience

export const CLOUDINARY_FOLDERS = {
  covers: 'zaujain/covers',
  memories: 'zaujain/memories',
  drawings: 'zaujain/drawings',
  wallpapers: 'zaujain/wallpapers',
  voiceNotes: 'zaujain/voice-notes',
  avatars: 'zaujain/avatars',
  music: 'zaujain/music',
  themes: 'zaujain/themes',
} as const

// ─── URL Builder ──────────────────────────────────────────────────────────────

interface CloudinaryTransformOptions {
  width?: number
  height?: number
  quality?: number | 'auto'
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png'
  crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'crop'
  gravity?: 'auto' | 'face' | 'center'
  blur?: number
  rounded?: boolean
}

/**
 * Builds a Cloudinary URL with transformation parameters.
 *
 * @example
 * const url = buildCloudinaryUrl('zaujain/covers/abc123', {
 *   width: 800,
 *   quality: 'auto',
 *   format: 'auto',
 * })
 */
export function buildCloudinaryUrl(
  publicId: string,
  options: CloudinaryTransformOptions = {}
): string {
  const { cloudName } = CLOUDINARY_CONFIG

  if (!cloudName) {
    console.warn('Cloudinary cloud name not configured')
    return publicId
  }

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto',
    blur,
    rounded,
  } = options

  const transforms: string[] = []

  if (width) transforms.push(`w_${width}`)
  if (height) transforms.push(`h_${height}`)
  if (crop) transforms.push(`c_${crop}`)
  if (gravity) transforms.push(`g_${gravity}`)
  if (quality) transforms.push(`q_${quality}`)
  if (format) transforms.push(`f_${format}`)
  if (blur) transforms.push(`e_blur:${blur}`)
  if (rounded) transforms.push('r_max')

  const transformString = transforms.join(',')

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString ? `${transformString}/` : ''}${publicId}`
}

/**
 * Builds a blur placeholder URL (small, low quality).
 * Used as img `blurDataURL` for progressive loading.
 */
export function buildBlurPlaceholder(publicId: string): string {
  return buildCloudinaryUrl(publicId, {
    width: 20,
    quality: 30,
    format: 'webp',
    blur: 1000,
  })
}

/**
 * Builds a video URL with Cloudinary transformations.
 */
export function buildVideoUrl(publicId: string, options: { width?: number } = {}): string {
  const { cloudName } = CLOUDINARY_CONFIG

  if (!cloudName) return publicId

  const transforms = ['q_auto', 'f_auto']
  if (options.width) transforms.push(`w_${options.width}`)

  return `https://res.cloudinary.com/${cloudName}/video/upload/${transforms.join(',')}/` + publicId
}

// ─── Upload Validation ────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validates a file before upload.
 */
export function validateFile(
  file: File,
  type: keyof typeof SUPPORTED_TYPES
): ValidationResult {
  const supportedMimes = SUPPORTED_TYPES[type] as readonly string[]
  const maxSize = UPLOAD_LIMITS[type as keyof typeof UPLOAD_LIMITS]

  if (!supportedMimes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not supported. Please use: ${supportedMimes.join(', ')}`,
    }
  }

  if (maxSize && file.size > maxSize) {
    const maxMB = Math.round(maxSize / 1024 / 1024)
    return {
      valid: false,
      error: `File too large. Maximum size is ${maxMB}MB.`,
    }
  }

  return { valid: true }
}

// ─── Client-Side Upload ───────────────────────────────────────────────────────

export interface UploadResult {
  publicId: string
  url: string
  format: string
  width?: number
  height?: number
  duration?: number // for video/audio
  bytes: number
}

export interface UploadOptions {
  folder?: string
  tags?: string[]
  onProgress?: (percent: number) => void
}

/**
 * Uploads a file to Cloudinary via the unsigned upload API.
 * Uses the configured upload preset (set in Cloudinary dashboard).
 *
 * @example
 * const result = await uploadToCloudinary(file, {
 *   folder: CLOUDINARY_FOLDERS.covers,
 *   onProgress: (pct) => setProgress(pct),
 * })
 */
export async function uploadToCloudinary(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const { cloudName, uploadPreset } = CLOUDINARY_CONFIG

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary is not configured. Check your environment variables.')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)

  if (options.folder) formData.append('folder', options.folder)
  if (options.tags?.length) formData.append('tags', options.tags.join(','))

  // Determine resource type
  const resourceType = file.type.startsWith('video/')
    ? 'video'
    : file.type.startsWith('audio/')
      ? 'video' // Cloudinary uses 'video' for audio too
      : 'image'

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && options.onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100)
        options.onProgress(percent)
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText)
        resolve({
          publicId: response.public_id,
          url: response.secure_url,
          format: response.format,
          width: response.width,
          height: response.height,
          duration: response.duration,
          bytes: response.bytes,
        })
      } else {
        const error = JSON.parse(xhr.responseText)
        reject(new Error(error.error?.message ?? 'Upload failed'))
      }
    })

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed. Please check your connection and try again.'))
    })

    xhr.open('POST', uploadUrl)
    xhr.send(formData)
  })
}
