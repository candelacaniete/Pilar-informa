import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'

export default function SearchBar({
  placeholder = '¿Qué estás buscando en Pilar?',
  size = 'lg',
  initialValue = '',
  onSearch,
}) {
  const [query, setQuery] = useState(initialValue)
  const navigate = useNavigate()

  useEffect(() => {
    setQuery(initialValue)
  }, [initialValue])

  const submit = (event) => {
    event.preventDefault()
    const value = query.trim()
    if (onSearch) {
      onSearch(value)
      return
    }
    navigate(value ? `/guia?q=${encodeURIComponent(value)}` : '/guia')
  }

  const isLarge = size === 'lg'

  return (
    <form onSubmit={submit} className="w-full">
      <div
        className={`flex items-center gap-2 border border-line bg-white shadow-soft transition focus-within:border-teal/50 focus-within:shadow-lift ${
          isLarge ? 'rounded-2xl p-2 pl-4' : 'rounded-xl p-1.5 pl-3'
        }`}
      >
        <Search className={`shrink-0 text-muted ${isLarge ? 'h-5 w-5' : 'h-4 w-4'}`} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          className={`w-full bg-transparent text-ink outline-none placeholder:text-muted/80 ${
            isLarge ? 'py-3 text-base md:text-lg' : 'py-2 text-sm'
          }`}
        />
        <button
          type="submit"
          className={`shrink-0 rounded-xl bg-teal font-semibold text-white transition hover:bg-teal-dark ${
            isLarge ? 'px-5 py-3 text-sm md:px-6 md:text-base' : 'px-4 py-2 text-sm'
          }`}
        >
          Buscar
        </button>
      </div>
    </form>
  )
}
