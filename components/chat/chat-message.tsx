import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'
import type { ChatMessage as ChatMessageType } from '@/lib/chat'

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === 'user'

  return (
    <li className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div
          aria-hidden="true"
          className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-gold bg-primary font-serif text-sm font-semibold text-primary-foreground"
        >
          AK
        </div>
      )}
      <div className={cn('flex max-w-[85%] flex-col gap-2 sm:max-w-[75%]', isUser && 'items-end')}>
        <span className="sr-only">{isUser ? 'Anda:' : 'Akang Kuliner:'}</span>
        {message.imageUrls && message.imageUrls.length > 0 && (
          <div className="flex flex-wrap justify-end gap-2">
            {message.imageUrls.map((url, index) => (
              // eslint-disable-next-line @next/next/no-img-element -- local blob preview URLs
              <img
                key={url}
                src={url}
                alt={`Gambar lampiran ${index + 1}`}
                className="size-24 rounded-xl border-2 border-card object-cover shadow-sm sm:size-28"
              />
            ))}
          </div>
        )}
        {message.text && (
          <div
            className={cn(
              'rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm',
              isUser && 'rounded-br-sm bg-secondary text-secondary-foreground',
              !isUser && !message.isError && 'rounded-tl-sm border border-border bg-card text-card-foreground',
              message.isError && 'rounded-tl-sm border border-destructive/30 bg-destructive/10 text-destructive',
            )}
          >
            {isUser || message.isError ? (
              <p className="whitespace-pre-wrap">{message.text}</p>
            ) : (
              <div className="flex flex-col gap-2 [&_li]:ml-4 [&_ol]:list-decimal [&_ol]:space-y-1 [&_strong]:font-semibold [&_strong]:text-primary [&_ul]:list-disc [&_ul]:space-y-1">
                <ReactMarkdown>{message.text}</ReactMarkdown>
              </div>
            )}
          </div>
        )}
      </div>
    </li>
  )
}

export function TypingIndicator() {
  return (
    <li className="flex gap-3" aria-live="polite">
      <div
        aria-hidden="true"
        className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-gold bg-primary font-serif text-sm font-semibold text-primary-foreground"
      >
        AK
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3">
        <span className="sr-only">Akang Kuliner sedang mengetik</span>
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            aria-hidden="true"
            className="size-2 animate-bounce rounded-full bg-secondary"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </li>
  )
}
