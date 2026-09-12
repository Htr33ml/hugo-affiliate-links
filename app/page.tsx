const BOTOES = [
  { label: 'do Último Vídeo', href: '/ultimo-video' },
  { label: 'dos Comentários', href: '/comentarios' },
  { label: 'Todos os Produtos', href: '/todos' },
  { label: 'Chineses é aqui 🇨🇳', href: '/todos?c=china' },
]

const CATEGORIAS = [
  { label: 'Géis', href: '/todos?c=geis' },
  { label: 'Acessórios de corrida', href: '/todos?c=acessorios' },
  { label: 'Suplementos', href: '/todos?c=suplementos' },
  { label: 'Repositor de eletrólito', href: '/todos?c=eletrolitos' },
]

const estiloBotao =
  'block w-full border-2 border-black bg-white p-4 text-center font-display text-sm uppercase tracking-widest transition-colors hover:bg-black hover:text-white'

export default function Home() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-4">
      <header className="border-b-2 border-black py-8 text-center">
        <h1 className="font-display text-3xl uppercase">HUGO | CORRIDA</h1>
        <p className="mt-2 text-xs uppercase tracking-widest text-neutral-600">
          Produtos que eu recomendo
        </p>
      </header>

      <a
        href="https://strava.app.link/JshIIU3y22b"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 flex w-full items-center justify-center gap-3 border-2 border-black bg-black p-4 font-display text-base text-white transition-colors hover:bg-white hover:text-black"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 shrink-0 fill-current">
          <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
        </svg>
        meu Strava
      </a>

      <nav className="space-y-3 py-6">
        {BOTOES.map((b) => (
          <a key={b.href} href={b.href} className={estiloBotao}>
            {b.label}
          </a>
        ))}
      </nav>

      <nav className="space-y-3 border-t-2 border-black py-6">
        <h2 className="mb-1 text-center text-xs uppercase tracking-widest text-neutral-600">
          Por categoria
        </h2>
        {CATEGORIAS.map((b) => (
          <a key={b.href} href={b.href} className={estiloBotao}>
            {b.label}
          </a>
        ))}
      </nav>

      <footer className="border-t-2 border-black py-8 text-center">
        <p className="text-xs tracking-widest text-neutral-600">
          corrida TRU, sem MIMIMI, SIGA Hugo Tremmel
        </p>
      </footer>
    </main>
  )
}
