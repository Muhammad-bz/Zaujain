'use client'

import { useState } from 'react'
import { formatDate } from '@/utils/dates'

interface Memory {
  id: string
  type: string
  title: string | null
  description: string | null
  media_url: string | null
  unlock_date: string | null
  created_at: string
}

const MEMORY_ICONS: Record<string, string> = {
  photo: '📸', letter: '💌', video: '🎥',
  voice_note: '🎙️', drawing: '🎨', wallpaper: '🖼️',
}

export function MemoryCard({ memory }: { memory: Memory }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="card rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 active:scale-[0.99]"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-3 p-5">
        <span className="text-2xl shrink-0">
          {MEMORY_ICONS[memory.type] ?? '📝'}
        </span>
        <div className="flex-1 min-w-0">
          {memory.title && (
            <p className="font-medium text-ink">{memory.title}</p>
          )}
          <p className="text-xs text-muted capitalize mt-0.5">
            {memory.type.replace('_', ' ')} · {formatDate(memory.created_at)}
          </p>
        </div>
        <svg
          className={`h-4 w-4 shrink-0 text-muted transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {expanded && (
        <div className="border-t border-border px-5 pb-5 pt-4 space-y-4">
          {memory.description && (
            <p className="text-sm leading-relaxed text-ink-muted whitespace-pre-wrap">
              {memory.description}
            </p>
          )}
          {memory.media_url && memory.type === 'photo' && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={memory.title ?? 'Memory'}
              className="w-full rounded-xl border border-border object-cover"
              src={memory.media_url}
            />
          )}
          {memory.media_url && memory.type === 'video' && (
            <video className="w-full rounded-xl border border-border" controls src={memory.media_url} />
          )}
          {memory.media_url && memory.type === 'voice_note' && (
            <audio className="w-full" controls src={memory.media_url} />
          )}
        </div>
      )}
    </div>
  )
}
