import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

/** Betölti a teljes `movies` táblát, valós időben szinkronizál, és CRUD műveleteket ad. */
export function useMovies(enabled) {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled) return
    let active = true

    ;(async () => {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false })
      if (!active) return
      if (error) setError('Nem sikerült betölteni a listát: ' + error.message)
      else setMovies(data)
      setLoading(false)
    })()

    const channel = supabase
      .channel('movies-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'movies' }, (payload) => {
        setMovies((prev) => {
          if (payload.eventType === 'INSERT') {
            return prev.some((m) => m.id === payload.new.id) ? prev : [payload.new, ...prev]
          }
          if (payload.eventType === 'UPDATE') {
            return prev.map((m) => (m.id === payload.new.id ? payload.new : m))
          }
          if (payload.eventType === 'DELETE') {
            return prev.filter((m) => m.id !== payload.old.id)
          }
          return prev
        })
      })
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [enabled])

  const addMovie = useCallback(async (row) => {
    const { data, error } = await supabase.from('movies').insert(row).select().single()
    if (error) {
      if (error.code === '23505') throw new Error('Ez már szerepel a gyűjteményben.')
      throw new Error('Mentési hiba: ' + error.message)
    }
    setMovies((prev) => (prev.some((m) => m.id === data.id) ? prev : [data, ...prev]))
    return data
  }, [])

  const updateMovie = useCallback(async (id, patch) => {
    let previous
    setMovies((prev) =>
      prev.map((m) => {
        if (m.id === id) previous = m
        return m.id === id ? { ...m, ...patch } : m
      }),
    )
    const { error } = await supabase.from('movies').update(patch).eq('id', id)
    if (error) {
      setMovies((prev) => prev.map((m) => (m.id === id && previous ? previous : m)))
      throw new Error('Frissítési hiba: ' + error.message)
    }
  }, [])

  const toggleWatched = useCallback(
    (movie) =>
      updateMovie(movie.id, movie.watched ? { watched: false, liked: null } : { watched: true }),
    [updateMovie],
  )

  const rate = useCallback(
    (movie, value) => updateMovie(movie.id, { liked: movie.liked === value ? null : value }),
    [updateMovie],
  )

  const removeMovie = useCallback(async (id) => {
    const { error } = await supabase.from('movies').delete().eq('id', id)
    if (error) throw new Error('Törlési hiba: ' + error.message)
    setMovies((prev) => prev.filter((m) => m.id !== id))
  }, [])

  return { movies, loading, error, addMovie, toggleWatched, rate, removeMovie }
}

