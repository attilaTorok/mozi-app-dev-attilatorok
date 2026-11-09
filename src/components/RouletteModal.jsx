import { useCallback, useEffect, useState } from 'react'
import { Dices, Loader2, Plus, Play, X } from 'lucide-react'
import clsx from 'clsx'
import confetti from 'canvas-confetti'
import ArcadeButton from './ArcadeButton.jsx'
import TicketCard from './TicketCard.jsx'
import { discover, fetchDetails, fetchGenreMap } from '../lib/tmdb.js'

const pickRandom = (arr, n) => [...arr].sort(() => Math.random() - 0.5).slice(0, n)

/** "Mit nézzünk ma?" – jegyhúzás saját listából vagy TMDB felfedezés. */
export default function RouletteModal({ movies, onClose, onAdd, notify }) {
  const [mode, setMode] = useState('own') // own | explore
  const [type, setType] = useState('all') // own: all|movie|tv ; explore: movie|tv
  const [genre, setGenre] = useState(null)
  const [picks, setPicks] = useState([])
  const [loading, setLoading] = useState(false)
  const [addingId, setAddingId] = useState(null)

  const unwatched = movies.filter((m) => !m.watched)
  const ownPool = unwatched.filter(
    (m) => (type === 'all' || m.media_type === type) && (!genre || (m.genres || []).includes(genre)),
  )
  const genres = [
    ...new Set(
      unwatched.filter((m) => type === 'all' || m.media_type === type).flatMap((m) => m.genres || []),
    ),
  ].sort((a, b) => a.localeCompare(b, 'hu'))

  const spin = useCallback(async () => {
    if (mode === 'own') {
      setPicks(pickRandom(ownPool, 3))
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.4 } })
      return
    }
    setLoading(true)
    try {
      const t = type === 'tv' ? 'tv' : 'movie'
      const [items, gmap] = await Promise.all([discover(t), fetchGenreMap(t)])
      const known = new Set(movies.filter((m) => m.media_type === t).map((m) => m.tmdb_id))
      const fresh = items.filter((i) => !known.has(i.id) && i.poster_path)
      setPicks(
        pickRandom(fresh, 3).map((i) => ({
          id: `d-${i.id}`,
          tmdb_id: i.id,
          media_type: t,
          title: i.title || i.name,
          poster_path: i.poster_path,
          overview: i.overview,
          vote_average: i.vote_average,
          release_year: parseInt((i.release_date || i.first_air_date || '0').slice(0, 4), 10) || null,
          genres: (i.genre_ids || []).map((g) => gmap[g]).filter(Boolean),
        })),
      )
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.4 } })
    } catch (err) {
      notify(err.message, 'error')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, type, genre, movies])

  // Mód/szűrő váltáskor töröljük az eredményt
  useEffect(() => setPicks([]), [mode, type, genre])

  const addDiscovered = async (item) => {
    setAddingId(item.id)
    try {
      const row = await fetchDetails(item.media_type, item.tmdb_id)
      await onAdd(row)
      notify(`„${row.title}” hozzáadva a gyűjteményhez!`, 'success')
      setPicks((p) => p.filter((x) => x.id !== item.id))
    } catch (err) {
      notify(err.message, 'error')
    } finally {
      setAddingId(null)
    }
  }

  const switchMode = (m) => {
    setMode(m)
    setGenre(null)
    if (m === 'explore' && type === 'all') setType('movie')
  }

  const typeOptions =
    mode === 'own'
      ? [['all', 'Mind'], ['movie', 'Film'], ['tv', 'Sorozat']]
      : [['movie', 'Film'], ['tv', 'Sorozat']]

  return (
    <div className="fixed inset-0 z-50 bg-black/80 overflow-y-auto p-3" onClick={onClose}>
      <div
        className="relative mx-auto my-4 max-w-6xl border border-amber-500/40 bg-zinc-950 p-4 shadow-[4px_4px_0px_0px_#78350f] font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-amber-400 inline-flex items-center gap-2">
            <Dices size={20} /> MIT NÉZZÜNK MA?
          </h2>
          <button onClick={onClose} aria-label="Bezárás" className="p-2 text-zinc-400 hover:text-amber-300">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <ArcadeButton variant={mode === 'own' ? 'active' : 'dark'} onClick={() => switchMode('own')}>
            Saját gyűjteményből
          </ArcadeButton>
          <ArcadeButton variant={mode === 'explore' ? 'active' : 'dark'} onClick={() => switchMode('explore')}>
            Nyitott felfedezés
          </ArcadeButton>
        </div>

        <div className="flex flex-wrap gap-2 mb-2">
          {typeOptions.map(([v, l]) => (
            <button
              key={v}
              onClick={() => setType(v)}
              className={clsx(
                'text-[11px] px-2.5 py-1 border',
                type === v ? 'bg-amber-400 text-black border-amber-200' : 'bg-zinc-800 text-amber-200 border-zinc-700',
              )}
            >
              {l}
            </button>
          ))}
        </div>

        {mode === 'own' && genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {[null, ...genres].map((g) => (
              <button
                key={g ?? 'all'}
                onClick={() => setGenre(g)}
                className={clsx(
                  'text-[10px] px-2 py-0.5 border',
                  genre === g ? 'bg-amber-400 text-black border-amber-200' : 'bg-zinc-800 text-amber-200/90 border-zinc-700',
                )}
              >
                {g ?? 'Minden műfaj'}
              </button>
            ))}
          </div>
        )}

        <ArcadeButton variant="primary" onClick={spin} disabled={loading || (mode === 'own' && ownPool.length === 0)}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Dices size={16} />}
          {picks.length ? 'Újrapörgetés' : 'Jegyhúzás'}
        </ArcadeButton>

        {mode === 'own' && ownPool.length === 0 && (
          <p className="mt-3 text-xs text-zinc-500">Nincs megnézetlen tétel ezzel a szűréssel.</p>
        )}

        {picks.length > 0 && (
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {picks.map((m) => (
              <TicketCard
                key={m.id}
                movie={m}
                footer={
                  <>
                    {m.trailer_url && (
                      <a
                        href={m.trailer_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 min-h-[40px] px-2 border-2 border-zinc-600 bg-zinc-800 text-amber-200 text-[10px] font-bold shadow-[3px_3px_0px_0px_#000]"
                      >
                        <Play size={14} /> ELŐZETES
                      </a>
                    )}
                    {mode === 'explore' && (
                      <ArcadeButton
                        variant="primary"
                        className="text-[10px]"
                        disabled={addingId === m.id}
                        onClick={() => addDiscovered(m)}
                      >
                        {addingId === m.id ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                        Hozzáadás a gyűjteményhez
                      </ArcadeButton>
                    )}
                  </>
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

