const SUGGESTIONS = [
  'Batagor paling enak di Bandung di mana?',
  'Rekomendasi sarapan khas Sunda dekat Dago',
  'Kafe dengan pemandangan bagus di Lembang',
  'Kuliner malam murah di sekitar Braga',
]

export function ChatEmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="flex flex-col items-center gap-6 py-10 text-center">
      <div className="flex flex-col gap-2">
        <h2 className="font-serif text-2xl font-semibold text-balance">Mau jajan apa hari ini, Kang/Teh?</h2>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-pretty text-muted-foreground">
          Tanyakan rekomendasi kuliner di Bandung, atau kirim hingga 3 foto makanan untuk dicarikan tempat
          makan yang cocok.
        </p>
      </div>
      <ul className="grid w-full max-w-xl gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((suggestion) => (
          <li key={suggestion}>
            <button
              type="button"
              onClick={() => onPick(suggestion)}
              className="h-full w-full rounded-xl border border-border bg-card px-4 py-3 text-left text-sm leading-snug transition-colors hover:border-secondary hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              {suggestion}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
