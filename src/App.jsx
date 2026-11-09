import { useCallback, useEffect, useRef, useState } from 'react'
import { Dices, Film } from 'lucide-react'
import clsx from 'clsx'
import PinLock from './components/PinLock.jsx'
import AddByImdb from './components/AddByImdb.jsx'
import FilterBar from './components/FilterBar.jsx'
import TicketCard from './components/TicketCard.jsx'
import RouletteModal from './components/RouletteModal.jsx'
import ArcadeButton from './components/ArcadeButton.jsx'
import { useMovies } from './hooks/useMovies.js'
import { useFilters } from './hooks/useFilters.js'
import { isSupabaseConfigured, isTmdbConfigured } from './lib/config.js'

export default function App() {
  const [authed, setAuthed] = useState(() => localStorage.getItem('app_authenticated') === 'true')
  if (!authed) return <PinLock onUnlock={() => setAuthed(true)} />
  return <Main />
}

function Main() {
  const { movies, loading, error, addMovie, toggleWatched, rate, removeMovie } = useMovies(true)
  const filters = useFilters(movies)
  const [showRoulette, setShowRoulette] = useState(false)
  const [toast, setToast] = useState(null)
  const timer = useRef()

  const notify = useCallback((text, kind = 'info') => {
    setToast({ text, kind })
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setToast(null), 3500)
  }, [])
  useEffect(() => () => clearTimeout(timer.current), [])

  const safe = (fn) => async (...args) => {
    try {
      await fn(...args)
    } catch (e) {
      notify(e.message, 'error')
    }
  }

  return (
    <div className="min-h-screen font-mono">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-5 space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-amber-400 inline-flex items-center gap-2 tracking-widest">
            <Film /> KUPON MOZI
          </h1>
          <ArcadeButton variant="primary" onClick={() => setShowRoulette(true)}>
            <Dices size={16} /> Jegyhúzás / Sorsolás
          </ArcadeButton>
        </header>

        {(!isSupabaseConfigured || !isTmdbConfigured) && (
          <div className="border border-yellow-500/50 bg-yellow-500/10 text-yellow-200 text-xs p-3">
            Hiányzó beállítás: töltsd ki a .env.local fájlban a Supabase és TMDB értékeket, majd indítsd újra a fejlesztői szervert.
          </div>
        )}

        <AddByImdb onAdd={addMovie} notify={notify} />
        <FilterBar filters={filters} />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {loading ? (
          <p className="text-zinc-500 text-sm">Jegyek betöltése…</p>
        ) : filters.filtered.length === 0 ? (
          <p className="text-zinc-500 text-sm border border-dashed border-zinc-700 p-6 text-center">
            Nincs találat. Adj hozzá egy filmet az IMDb linkjével!
          </p>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 2xl:grid-cols-3">
            {filters.filtered.map((m) => (
              <TicketCard
                key={m.id}
                movie={m}
                onToggleWatched={safe(toggleWatched)}
                onRate={safe(rate)}
                onDelete={safe(async (movie) => {
                  await removeMovie(movie.id)
                  notify('Jegy törölve.', 'success')
                })}
              />
            ))}
          </div>
        )}
      </div>

      {showRoulette && (
        <RouletteModal
          movies={movies}
          onAdd={addMovie}
          notify={notify}
          onClose={() => setShowRoulette(false)}
        />
      )}

      {toast && (
        <div
          role="status"
          className={clsx(
            'fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] max-w-[90vw] px-4 py-2 border-2 text-sm font-bold shadow-[4px_4px_0px_0px_#000]',
            toast.kind === 'error' && 'bg-red-600 border-red-300 text-white',
            toast.kind === 'success' && 'bg-green-500 border-green-200 text-black',
            toast.kind === 'info' && 'bg-amber-500 border-amber-200 text-black',
          )}
        >
          {toast.text}
        </div>
      )}
    </div>
  )
}

