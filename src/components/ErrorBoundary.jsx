import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Alkalmazáshiba:', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="min-h-screen flex items-center justify-center p-6 font-mono">
        <div className="max-w-md border border-red-500/50 bg-zinc-900 p-6 shadow-[4px_4px_0px_0px_#7f1d1d]">
          <h1 className="text-xl font-bold text-red-400 mb-2">HIBA A VETÍTÉSBEN</h1>
          <p className="text-sm text-zinc-400 mb-4 break-words">{String(this.state.error.message)}</p>
          <button
            onClick={() => location.reload()}
            className="border border-amber-500 bg-amber-500 text-black px-4 py-2 font-bold shadow-[4px_4px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            ÚJRATÖLTÉS
          </button>
        </div>
      </div>
    )
  }
}

