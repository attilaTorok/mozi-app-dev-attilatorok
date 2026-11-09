import { useMemo, useState } from 'react'

/** Memóriában futó szűrés: típus, megnézettség, műfaj, keresés. */
export function useFilters(movies) {
  const [type, setType] = useState('all') // all | movie | tv
  const [watched, setWatched] = useState(false) // false = megnézendő
  const [genre, setGenre] = useState(null)
  const [search, setSearch] = useState('')

  // Műfajok az aktuális (típus + megnézettség) listából
  const base = useMemo(
    () =>
      movies.filter(
        (m) => (type === 'all' || m.media_type === type) && m.watched === watched,
      ),
    [movies, type, watched],
  )

  const genres = useMemo(
    () => [...new Set(base.flatMap((m) => m.genres || []))].sort((a, b) => a.localeCompare(b, 'hu')),
    [base],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return base.filter(
      (m) =>
        (!genre || (m.genres || []).includes(genre)) &&
        (!q || m.title.toLowerCase().includes(q)),
    )
  }, [base, genre, search])

  return {
    type,
    setType: (t) => {
      setType(t)
      setGenre(null)
    },
    watched,
    setWatched: (w) => {
      setWatched(w)
      setGenre(null)
    },
    genre,
    setGenre,
    search,
    setSearch,
    genres,
    filtered,
  }
}

