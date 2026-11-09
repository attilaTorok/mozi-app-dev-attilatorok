import { TMDB_API_KEY } from './config.js'

const BASE = 'https://api.themoviedb.org/3'

async function getJson(url) {
  let res
  try {
    res = await fetch(url)
  } catch {
    throw new Error('Nem sikerült elérni a TMDB-t. Ellenőrizd a hálózatot.')
  }
  if (!res.ok) {
    if (res.status === 401) throw new Error('Érvénytelen TMDB API kulcs.')
    throw new Error(`TMDB hiba (${res.status}).`)
  }
  return res.json()
}

/** IMDb URL-ből vagy szövegből kivonja a tt1234567 azonosítót. */
export function extractImdbId(input) {
  const m = String(input || '').match(/tt\d+/)
  return m ? m[0] : null
}

function buildTrailerUrl(videos, title, type) {
  const trailer = videos?.results?.find((v) => v.site === 'YouTube' && v.type === 'Trailer')
  if (trailer) return `https://www.youtube.com/watch?v=${trailer.key}`
  const q = `${title} ${type === 'tv' ? 'sorozat' : 'film'} előzetes`
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`
}

/** Részletek lekérése és a Supabase `movies` sorrá alakítása. */
export async function fetchDetails(type, tmdbId, imdbId = null) {
  const data = await getJson(
    `${BASE}/${type}/${tmdbId}?api_key=${TMDB_API_KEY}&language=hu-HU&append_to_response=videos,external_ids`,
  )
  let overview = data.overview
  let videos = data.videos
  if (!overview || !videos?.results?.length) {
    try {
      const en = await getJson(
        `${BASE}/${type}/${tmdbId}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=videos`,
      )
      if (!overview) overview = en.overview
      if (!videos?.results?.length) videos = en.videos
    } catch {
      /* az angol fallback opcionális */
    }
  }
  const title = data.title || data.name || 'Ismeretlen'
  const date = data.release_date || data.first_air_date || ''
  return {
    imdb_id: imdbId || data.external_ids?.imdb_id || data.imdb_id || null,
    tmdb_id: data.id,
    title,
    media_type: type,
    poster_path: data.poster_path || null,
    overview: overview || '',
    vote_average: data.vote_average ? Math.round(data.vote_average * 10) / 10 : null,
    release_year: date ? parseInt(date.slice(0, 4), 10) : null,
    genres: (data.genres || []).map((g) => g.name),
    trailer_url: buildTrailerUrl(videos, title, type),
    watched: false,
    liked: null,
  }
}

/** IMDb azonosító alapján film/sorozat adatainak lekérése. */
export async function fetchByImdbId(imdbId) {
  const found = await getJson(
    `${BASE}/find/${imdbId}?api_key=${TMDB_API_KEY}&external_source=imdb_id`,
  )
  const movie = found.movie_results?.[0]
  const tv = found.tv_results?.[0]
  if (!movie && !tv) throw new Error('Nem található ilyen azonosítójú film vagy sorozat.')
  const type = movie ? 'movie' : 'tv'
  return fetchDetails(type, (movie || tv).id, imdbId)
}

/** Véletlen népszerű találatok felfedezéshez (nyers TMDB elemek). */
export async function discover(type) {
  const page = Math.floor(Math.random() * 20) + 1
  const data = await getJson(
    `${BASE}/discover/${type}?api_key=${TMDB_API_KEY}&language=hu-HU&sort_by=popularity.desc&vote_count.gte=300&page=${page}`,
  )
  return (data.results || []).map((r) => ({ ...r, media_type: type }))
}

let genreCache = {}
export async function fetchGenreMap(type) {
  if (genreCache[type]) return genreCache[type]
  const data = await getJson(`${BASE}/genre/${type}/list?api_key=${TMDB_API_KEY}&language=hu-HU`)
  genreCache[type] = Object.fromEntries((data.genres || []).map((g) => [g.id, g.name]))
  return genreCache[type]
}

