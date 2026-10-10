'use client'

import { useEffect, useRef, useState } from 'react'
import { ChatHeader } from './chat-header'
import { ChatEmptyState } from './chat-empty-state'
import { ChatMessage, TypingIndicator } from './chat-message'
import { ChatComposer } from './chat-composer'
import { sendChat, type ChatMessage as ChatMessageType } from '@/lib/chat'

export function ChatApp() {
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isSending])

  const handleSubmit = async (text: string, images: File[]) => {
    const userMessage: ChatMessageType = {
      id: crypto.randomUUID(),
      role: 'user',
      text,
      imageUrls: images.map((image) => URL.createObjectURL(image)),
    }
    const history = messages
    setMessages((current) => [...current, userMessage])
    setDraft('')
    setIsSending(true)

    try {
      const reply = await sendChat(text, images, history)
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'model', text: reply }])
    } catch (error) {
      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: 'model', text: (error as Error).message, isError: true },
      ])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="batik-pattern flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
        <ChatHeader />

        <main className="flex flex-1 flex-col px-4 sm:px-6">
          {messages.length === 0 ? (
            <ChatEmptyState onPick={(text) => handleSubmit(text, [])} />
          ) : (
            <ol className="flex flex-col gap-5 py-6" aria-label="Percakapan" aria-live="polite">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isSending && <TypingIndicator />}
            </ol>
          )}
          <div ref={bottomRef} />
        </main>

        <div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-background/0 px-4 pt-4 pb-4 sm:px-6">
          <ChatComposer disabled={isSending} draft={draft} onDraftChange={setDraft} onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  )
}
