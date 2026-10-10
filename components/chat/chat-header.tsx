import Image from 'next/image'

export function ChatHeader() {
  return (
    <header className="relative overflow-hidden rounded-b-3xl border-b-4 border-secondary">
      <Image
        src="/images/bandung-hero.png"
        alt="Ilustrasi Gedung Sate, Jalan Braga, gerobak jajanan, dan pegunungan Parahyangan"
        width={1584}
        height={672}
        priority
        className="h-40 w-full object-cover object-center sm:h-48"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-5 pb-4 sm:px-8">
        <div>
          <p className="text-xs font-semibold tracking-[0.25em] text-gold uppercase">Wilujeng Sumping</p>
          <h1 className="font-serif text-3xl font-semibold text-balance text-primary-foreground sm:text-4xl">
            Akang Kuliner Bandung
          </h1>
        </div>
        <p className="hidden max-w-56 text-right text-sm leading-snug text-primary-foreground/85 sm:block">
          Penasihat jajan &amp; makan enak di Kota Kembang
        </p>
      </div>
    </header>
  )
}
