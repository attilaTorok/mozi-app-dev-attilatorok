import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import ArcadeButton from './ArcadeButton.jsx'
import { extractImdbId, fetchByImdbId } from '../lib/tmdb.js'

/** IMDb URL vagy azonosító alapján hozzáad egy filmet/sorozatot. */
export default function AddByImdb({ onAdd, notify }) {
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    const id = extractImdbId(value)
    if (!id) return notify('Érvénytelen IMDb link vagy azonosító (pl. tt0816692).', 'error')
    setBusy(true)
    try {
      const row = await fetchByImdbId(id)
      await onAdd(row)
      notify(`„${row.title}” hozzáadva a gyűjteményhez!`, 'success')
      setValue('')
    } catch (err) {
      notify(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="IMDb link vagy azonosító (tt0816692)"
        className="flex-1 min-w-0 bg-zinc-900 border border-amber-500/40 px-3 py-2 font-mono text-sm text-amber-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
      />
      <ArcadeButton type="submit" variant="primary" disabled={busy || !value.trim()}>
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
        Hozzáad
      </ArcadeButton>
    </form>
  )
}

