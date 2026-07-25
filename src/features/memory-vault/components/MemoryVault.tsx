'use client'

import { useState, useTransition } from 'react'
import { addMemory, deleteMemory } from '../actions'
import { formatRelativeTime } from '@/utils/dates'

interface Memory {
  id: string
  type: string
  title: string | null
  description: string | null
  media_url: string | null
  unlock_date: string | null
  created_at: string
}

interface Props {
  experienceSlug: string
  memories: Memory[]
}

const MEMORY_TYPES = [
  { value: 'photo', label: 'Photo', icon: '📸' },
  { value: 'letter', label: 'Letter', icon: '💌' },
  { value: 'video', label: 'Video', icon: '🎥' },
  { value: 'voice_note', label: 'Voice Note', icon: '🎙️' },
  { value: 'drawing', label: 'Drawing', icon: '🎨' },
]

export function MemoryVault({ experienceSlug, memories: initial }: Props) {
  const [memories, setMemories] = useState<Memory[]>(initial)
  const [showForm, setShowForm] = useState(false)
  const [selectedType, setSelectedType] = useState('photo')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const formData = new FormData(event.currentTarget)
    formData.set('type', selectedType)
    const form = event.currentTarget

    startTransition(async () => {
      const result = await addMemory(experienceSlug, formData)
      if (result?.error) {
        setError(result.error)
      } else {
        form.reset()
        setShowForm(false)
        // Refresh memories list
        window.location.reload()
      }
    })
  }

  function handleDelete(memoryId: string) {
    startTransition(async () => {
      await deleteMemory(experienceSlug, memoryId)
      setMemories((prev) => prev.filter((m) => m.id !== memoryId))
    })
  }

  return (
    <div className="space-y-6">
      {/* Add memory button */}
      {!showForm && (
        <button
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-6 text-sm font-medium text-ink-muted transition-all hover:border-rose/40 hover:text-rose"
          onClick={() => setShowForm(true)}
          type="button"
        >
          + Add a memory
        </button>
      )}

      {/* Add memory form */}
      {showForm && (
        <div className="card rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-medium text-ink">New memory</h2>
            <button
              className="text-xs text-muted hover:text-ink"
              onClick={() => setShowForm(false)}
              type="button"
            >
              Cancel
            </button>
          </div>

          {error && (
            <div className="rounded-xl border border-error/20 bg-error-light px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}

          {/* Type selector */}
          <div className="flex flex-wrap gap-2">
            {MEMORY_TYPES.map((t) => (
              <button
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedType === t.value
                    ? 'bg-rose text-white'
                    : 'bg-surface text-ink-muted hover:bg-rose-light hover:text-rose'
                }`}
                key={t.value}
                onClick={() => setSelectedType(t.value)}
                type="button"
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <form className="space-y-4" onSubmit={handleAdd}>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink" htmlFor="title">
                Title <span className="font-normal text-muted">(optional)</span>
              </label>
              <input
                className="input-base"
                id="title"
                maxLength={100}
                name="title"
                placeholder="e.g. Our first date"
                type="text"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink" htmlFor="description">
                {selectedType === 'letter' ? 'Letter content' : 'Description'}
              </label>
              <textarea
                className="input-base resize-none"
                id="description"
                maxLength={1000}
                name="description"
                placeholder={
                  selectedType === 'letter'
                    ? 'Write your letter here…'
                    : 'Add a note about this memory…'
                }
                rows={selectedType === 'letter' ? 8 : 3}
              />
            </div>

            {selectedType !== 'letter' && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-ink" htmlFor="media_url">
                  Media URL <span className="font-normal text-muted">(Cloudinary URL)</span>
                </label>
                <input
                  className="input-base"
                  id="media_url"
                  name="media_url"
                  placeholder="https://res.cloudinary.com/..."
                  type="url"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink" htmlFor="unlock_date">
                Unlock date <span className="font-normal text-muted">(optional — locks until this date)</span>
              </label>
              <input
                className="input-base"
                id="unlock_date"
                name="unlock_date"
                type="date"
              />
            </div>

            <button
              className="flex w-full items-center justify-center gap-2 rounded-full bg-rose px-6 py-3 text-sm font-medium text-white shadow-rose shadow-sm transition-all hover:-translate-y-0.5 disabled:opacity-60"
              disabled={isPending}
              type="submit"
            >
              {isPending ? 'Saving…' : 'Save memory'}
            </button>
          </form>
        </div>
      )}

      {/* Memory list */}
      {memories.length === 0 && !showForm && (
        <div className="py-16 text-center">
          <p className="font-display text-xl text-ink-muted">No memories yet.</p>
          <p className="mt-1 text-sm text-muted">Your story is waiting to begin.</p>
        </div>
      )}

      <div className="space-y-4">
        {memories.map((memory) => (
          <div className="card rounded-2xl p-5" key={memory.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span className="text-xl shrink-0">
                  {MEMORY_TYPES.find((t) => t.value === memory.type)?.icon ?? '📝'}
                </span>
                <div className="min-w-0 flex-1">
                  {memory.title && (
                    <p className="font-medium text-ink truncate">{memory.title}</p>
                  )}
                  {memory.description && (
                    <p className="mt-1 text-sm text-ink-muted line-clamp-3">
                      {memory.description}
                    </p>
                  )}
                  {memory.media_url && (
                    <a
                      className="mt-2 block text-xs text-rose hover:underline truncate"
                      href={memory.media_url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      View media →
                    </a>
                  )}
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-xs text-muted capitalize">{memory.type.replace('_', ' ')}</span>
                    <span className="text-xs text-muted">·</span>
                    <span className="text-xs text-muted">{formatRelativeTime(memory.created_at)}</span>
                    {memory.unlock_date && (
                      <>
                        <span className="text-xs text-muted">·</span>
                        <span className="text-xs text-warning">🔒 Locked</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button
                className="shrink-0 text-xs text-muted hover:text-error transition-colors"
                onClick={() => handleDelete(memory.id)}
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
