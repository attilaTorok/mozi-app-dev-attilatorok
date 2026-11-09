import { Search } from 'lucide-react'
import clsx from 'clsx'
import ArcadeButton from './ArcadeButton.jsx'

function Segment({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <ArcadeButton
          key={String(o.value)}
          variant={value === o.value ? 'active' : 'dark'}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </ArcadeButton>
      ))}
    </div>
  )
}

export default function FilterBar({ filters }) {
  const { type, setType, watched, setWatched, genre, setGenre, search, setSearch, genres } = filters
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <Segment
          value={type}
          onChange={setType}
          options={[
            { value: 'all', label: 'Mind' },
            { value: 'movie', label: 'Filmek' },
            { value: 'tv', label: 'Sorozatok' },
          ]}
        />
        <Segment
          value={watched}
          onChange={setWatched}
          options={[
            { value: false, label: 'Megnézendő' },
            { value: true, label: 'Már láttuk' },
          ]}
        />
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Keresés cím szerint…"
          className="w-full bg-zinc-900 border border-zinc-700 pl-9 pr-3 py-2 font-mono text-sm text-amber-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
        />
      </div>

      {genres.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {[null, ...genres].map((g) => (
            <button
              key={g ?? 'all'}
              onClick={() => setGenre(g)}
              className={clsx(
                'font-mono text-[11px] px-2.5 py-1 border',
                genre === g
                  ? 'bg-amber-400 text-black border-amber-200'
                  : 'bg-zinc-800 text-amber-200/90 border-zinc-700 hover:border-amber-500/60',
              )}
            >
              {g ?? 'Minden műfaj'}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

