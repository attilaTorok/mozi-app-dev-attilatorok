import clsx from 'clsx'

const variants = {
  primary: 'bg-amber-500 text-black border-amber-300 hover:bg-amber-400',
  dark: 'bg-zinc-800 text-amber-200 border-zinc-600 hover:bg-zinc-700',
  danger: 'bg-red-600 text-white border-red-400 hover:bg-red-500',
  active: 'bg-yellow-300 text-black border-yellow-100',
}

/** Tapintható, 80-as évekbeli arcade gomb kemény árnyékkal. */
export default function ArcadeButton({
  variant = 'dark',
  className,
  children,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={clsx(
        'inline-flex items-center justify-center gap-1.5 border-2 px-3 py-2 font-mono font-bold text-xs uppercase tracking-wide',
        'shadow-[4px_4px_0px_0px_#000] transition-transform select-none',
        'active:translate-x-1 active:translate-y-1 active:shadow-none',
        'disabled:opacity-50 disabled:pointer-events-none min-h-[44px]',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

