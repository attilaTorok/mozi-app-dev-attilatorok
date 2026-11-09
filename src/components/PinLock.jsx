import { useState } from 'react'
import { Delete, Lock } from 'lucide-react'
import { APP_PIN } from '../lib/config.js'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫']

/** Retro billentyűzetes PIN zár. Adatbázis-hívás csak sikeres belépés után történik. */
export default function PinLock({ onUnlock }) {
  const [pin, setPin] = useState('')
  const [shake, setShake] = useState(false)

  const press = (k) => {
    if (k === 'C') return setPin('')
    if (k === '⌫') return setPin((p) => p.slice(0, -1))
    if (pin.length >= 4) return
    const next = pin + k
    setPin(next)
    if (next.length === 4) {
      if (next === APP_PIN) {
        localStorage.setItem('app_authenticated', 'true')
        onUnlock()
      } else {
        setShake(true)
        setTimeout(() => {
          setShake(false)
          setPin('')
        }, 500)
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-mono">
      <div
        className={`w-full max-w-xs border border-amber-500/40 bg-zinc-900 p-6 shadow-[4px_4px_0px_0px_#78350f] ${
          shake ? 'animate-pulse border-red-500' : ''
        }`}
      >
        <div className="flex items-center justify-center gap-2 text-amber-400 mb-1">
          <Lock size={18} />
          <h1 className="text-xl font-bold tracking-widest">KUPON MOZI</h1>
        </div>
        <p className="text-center text-[11px] text-zinc-500 mb-5">
          {shake ? 'HIBÁS KÓD' : 'ADD MEG A 4 JEGYŰ KÓDOT'}
        </p>

        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-10 h-12 border-2 border-dashed border-amber-500/50 flex items-center justify-center text-2xl text-amber-300"
            >
              {pin[i] ? '●' : ''}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {KEYS.map((k) => (
            <button
              key={k}
              onClick={() => press(k)}
              aria-label={k === '⌫' ? 'Törlés' : k}
              className="h-14 border-2 border-zinc-600 bg-zinc-800 text-amber-200 text-xl font-bold shadow-[4px_4px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              {k === '⌫' ? <Delete className="mx-auto" size={20} /> : k}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

