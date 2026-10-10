'use client'

import { useEffect, useRef, useState } from 'react'
import { ImagePlus, SendHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGES, MAX_IMAGE_BYTES } from '@/lib/chat'

interface ChatComposerProps {
  disabled: boolean
  draft: string
  onDraftChange: (value: string) => void
  onSubmit: (text: string, images: File[]) => void
}

interface Attachment {
  file: File
  previewUrl: string
}

export function ChatComposer({ disabled, draft, onDraftChange, onSubmit }: ChatComposerProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [notice, setNotice] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`
  }, [draft])

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return
    const incoming = Array.from(fileList)
    const tooLarge = incoming.filter((file) => file.size > MAX_IMAGE_BYTES)
    const valid = incoming.filter((file) => file.size <= MAX_IMAGE_BYTES && file.type.startsWith('image/'))
    const slots = MAX_IMAGES - attachments.length
    const accepted = valid.slice(0, slots)

    const problems: string[] = []
    if (tooLarge.length > 0) problems.push(`${tooLarge.length} gambar melebihi 10 MB`)
    if (valid.length > slots) problems.push(`maksimal ${MAX_IMAGES} gambar`)
    setNotice(problems.length > 0 ? `Tidak bisa ditambahkan: ${problems.join(' dan ')}.` : null)

    setAttachments((current) => [
      ...current,
      ...accepted.map((file) => ({ file, previewUrl: URL.createObjectURL(file) })),
    ])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeAttachment = (index: number) => {
    setAttachments((current) => {
      URL.revokeObjectURL(current[index].previewUrl)
      return current.filter((_, i) => i !== index)
    })
    setNotice(null)
  }

  const canSend = !disabled && (draft.trim().length > 0 || attachments.length > 0)

  const submit = () => {
    if (!canSend) return
    onSubmit(
      draft.trim(),
      attachments.map((a) => a.file),
    )
    setAttachments([])
    setNotice(null)
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
      className="flex flex-col gap-2 rounded-2xl border-2 border-border bg-card p-2 shadow-sm focus-within:border-secondary"
    >
      {attachments.length > 0 && (
        <ul className="flex gap-2 px-1 pt-1" aria-label="Gambar terlampir">
          {attachments.map((attachment, index) => (
            <li key={attachment.previewUrl} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview URLs */}
              <img
                src={attachment.previewUrl}
                alt={`Pratinjau ${attachment.file.name}`}
                className="size-16 rounded-lg border border-border object-cover"
              />
              <button
                type="button"
                onClick={() => removeAttachment(index)}
                className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                aria-label={`Hapus ${attachment.file.name}`}
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES}
          multiple
          className="sr-only"
          id="image-upload"
          onChange={(event) => handleFiles(event.target.files)}
          disabled={disabled || attachments.length >= MAX_IMAGES}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          className="shrink-0 rounded-xl text-secondary hover:bg-accent hover:text-secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || attachments.length >= MAX_IMAGES}
          aria-label={`Lampirkan gambar (${attachments.length}/${MAX_IMAGES})`}
        >
          <ImagePlus className="size-5" aria-hidden="true" />
        </Button>

        <label htmlFor="chat-input" className="sr-only">
          Tulis pertanyaan kuliner Bandung
        </label>
        <textarea
          ref={textareaRef}
          id="chat-input"
          rows={1}
          value={draft}
          maxLength={2000}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              if (event.nativeEvent.isComposing || event.keyCode === 229) return
              event.preventDefault()
              submit()
            }
          }}
          placeholder="Tanya kuliner Bandung, mis. 'mie kocok enak di mana?'"
          className="min-h-9 flex-1 resize-none bg-transparent px-1 py-2 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none"
        />

        <Button
          type="submit"
          size="icon-lg"
          className="shrink-0 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90"
          disabled={!canSend}
          aria-label="Kirim pesan"
        >
          <SendHorizontal className="size-5" aria-hidden="true" />
        </Button>
      </div>

      <p className="px-2 pb-1 text-xs text-muted-foreground" aria-live="polite">
        {notice ? (
          <span className="text-destructive">{notice}</span>
        ) : (
          `Maks. ${MAX_IMAGES} gambar, masing-masing 10 MB. Enter untuk kirim, Shift+Enter untuk baris baru.`
        )}
      </p>
    </form>
  )
}
