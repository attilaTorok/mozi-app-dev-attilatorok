import { useState } from 'react'
import { ChevronDown, ChevronUp, Check, Play, ThumbsDown, ThumbsUp, Trash2, Undo2 } from 'lucide-react'
import clsx from 'clsx'
import { TMDB_IMG } from '../lib/config.js'

const BARCODE = '||| | |||| || ||| | |||'

function seatFor(id) {
  const s = String(id)
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return `A-${String((h % 40) + 1).padStart(2, '0')}`
}

const chip = 'font-mono text-[9px] px-1.5 py-0.5 bg-zinc-800 text-amber-200/90 border border-zinc-700'
const iconBtn =
  'inline-flex items-center justify-center min-w-[40px] min-h-[40px] px-2 border-2 shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none'

/**
 * Kétrészes perforált jegy. `movie` lehet mentett sor vagy felfedezési elem;
 * ha nincs `actions`, a lábléc helyett az átadott `footer` jelenik meg.
 */
export default function TicketCard({ movie, onToggleWatched, onRate, onDelete, footer }) {
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)

  return (
    <article className="relative ticket-notch flex border border-amber-500/30 bg-zinc-900 shadow-[4px_4px_0px_0px_#78350f] font-mono">
      {/* Bal oldal: szelvény */}
      <div className="w-26 shrink-0 border-r border-dashed border-amber-500/40 p-2 flex flex-col items-center gap-1.5 bg-zinc-950/40">
        <span
          className={clsx(
            'text-[9px] font-bold px-1.5 py-0.5 border',
            movie.media_type === 'tv'
              ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/50'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/50',
          )}
        >
          {movie.media_type === 'tv' ? 'SOROZAT' : 'FILM'}
        </span>
        {movie.poster_path ? (
          <img
            src={`${TMDB_IMG}${movie.poster_path}`}
            alt={movie.title}
            loading="lazy"
            className="w-full aspect-[2/3] object-cover border border-zinc-700"
          />
        ) : (
          <div className="w-full aspect-[2/3] bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-500">
            NINCS KÉP
          </div>
        )}
        <span className="text-[9px] text-amber-400/80">SEAT: {seatFor(movie.id ?? movie.tmdb_id)}</span>
        <span className="text-[10px] text-zinc-500 tracking-tighter overflow-hidden whitespace-nowrap max-w-full" aria-hidden>
          {BARCODE}
        </span>
      </div>

      {/* Jobb oldal: jegy törzs */}
      <div className="flex-1 min-w-0 flex flex-col p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-amber-100 text-sm leading-tight break-words">{movie.title}</h3>
          {movie.vote_average > 0 && (
            <span className="shrink-0 text-[11px] font-bold text-black bg-yellow-300 px-1.5 py-0.5">
              ★ {Number(movie.vote_average).toFixed(1)}
            </span>
          )}
        </div>

        <div className="mt-1 text-[10px] text-zinc-500 flex flex-wrap gap-x-3">
          {movie.release_year && <span>{movie.release_year}</span>}
          {movie.imdb_id && <span>TÉKA: {movie.imdb_id}</span>}
        </div>

        {movie.genres?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {movie.genres.map((g) => (
              <span key={g} className={chip}>
                {g}
              </span>
            ))}
          </div>
        )}

        {movie.overview && (
          <div className="mt-2">
            <p className={clsx('font-sans text-xs text-zinc-400', !open && 'line-clamp-2')}>{movie.overview}</p>
            <button
              onClick={() => setOpen((o) => !o)}
              className="mt-1 text-[10px] text-amber-400 inline-flex items-center gap-0.5"
            >
              {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {open ? 'Kevesebb' : 'Tovább'}
            </button>
          </div>
        )}

        <div className="mt-auto pt-3">
          <div className="border-t border-dashed border-amber-500/40 pt-2 flex flex-wrap items-center gap-2">
            {footer ?? (
              <>
                {movie.trailer_url && (
                  <a
                    href={movie.trailer_url}
                    target="_blank"
                    rel="noreferrer"
                    className={clsx(iconBtn, 'bg-zinc-800 border-zinc-600 text-amber-200 gap-1 text-[10px] font-bold')}
                  >
                    <Play size={14} /> ELŐZETES
                  </a>
                )}
                <button
                  onClick={() => onToggleWatched(movie)}
                  className={clsx(
                    iconBtn,
                    'gap-1 text-[10px] font-bold',
                    movie.watched
                      ? 'bg-green-500 border-green-300 text-black'
                      : 'bg-amber-500 border-amber-300 text-black',
                  )}
                >
                  {movie.watched ? <Undo2 size={14} /> : <Check size={14} />}
                  {movie.watched ? 'MEGNÉZTÜK' : 'ÉRVÉNYESÍTVE?'}
                </button>

                {movie.watched && (
                  <>
                    <button
                      aria-label="Tetszett"
                      onClick={() => onRate(movie, true)}
                      className={clsx(
                        iconBtn,
                        movie.liked === true
                          ? 'bg-green-500 border-green-300 text-black'
                          : 'bg-zinc-800 border-zinc-600 text-zinc-300',
                      )}
                    >
                      <ThumbsUp size={16} />
                    </button>
                    <button
                      aria-label="Nem tetszett"
                      onClick={() => onRate(movie, false)}
                      className={clsx(
                        iconBtn,
                        movie.liked === false
                          ? 'bg-red-500 border-red-300 text-black'
                          : 'bg-zinc-800 border-zinc-600 text-zinc-300',
                      )}
                    >
                      <ThumbsDown size={16} />
                    </button>
                  </>
                )}

                <div className="ml-auto">
                  {confirming ? (
                    <div className="flex gap-1 items-center">
                      <button
                        onClick={() => onDelete(movie)}
                        className={clsx(iconBtn, 'bg-red-600 border-red-400 text-white text-[10px] font-bold')}
                      >
                        IGEN
                      </button>
                      <button
                        onClick={() => setConfirming(false)}
                        className={clsx(iconBtn, 'bg-zinc-800 border-zinc-600 text-zinc-300 text-[10px] font-bold')}
                      >
                        MÉGSEM
                      </button>
                    </div>
                  ) : (
                    <button
                      aria-label="Törlés"
                      onClick={() => setConfirming(true)}
                      className={clsx(iconBtn, 'bg-zinc-800 border-zinc-600 text-red-400')}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

