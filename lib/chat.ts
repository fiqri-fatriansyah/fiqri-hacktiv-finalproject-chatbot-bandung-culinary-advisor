import { compressImage } from './compress-image'

export const MAX_IMAGES = 3
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024
export const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/png,image/webp,image/heic,image/heif'

export interface ChatMessage {
  id: string
  role: 'user' | 'model'
  text: string
  imageUrls?: string[]
  isError?: boolean
}

export async function sendChat(message: string, images: File[], history: ChatMessage[]): Promise<string> {
  const formData = new FormData()
  formData.append('message', message)
  formData.append(
    'history',
    JSON.stringify(
      history.filter((m) => !m.isError && m.text).map((m) => ({ role: m.role, text: m.text })),
    ),
  )
  const compressed = await Promise.all(images.map(compressImage))
  compressed.forEach((image) => formData.append('images', image))

  const response = await fetch('/api/chat', { method: 'POST', body: formData })
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const detail = data?.message
    throw new Error(
      Array.isArray(detail) ? detail.join(', ') : detail || 'Server sedang tidak bisa dihubungi. Coba lagi ya.',
    )
  }
  return data.reply as string
}
