'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, FileText, Building2, X, Loader2 } from 'lucide-react'

interface SearchResult {
    id: string
    title: string
    subtitle: string
    type: 'rfq' | 'company'
    href: string
}

export function SearchCommand() {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [activeIndex, setActiveIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    // Keyboard shortcut to open (Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setIsOpen(true)
            }
            if (e.key === 'Escape') {
                setIsOpen(false)
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100)
        } else {
            setQuery('')
            setResults([])
            setActiveIndex(0)
        }
    }, [isOpen])

    // Debounced search
    const searchTimeout = useRef<NodeJS.Timeout | null>(null)

    const performSearch = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setResults([])
            return
        }
        setLoading(true)
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
            if (res.ok) {
                const data = await res.json()
                setResults(data.results || [])
            }
        } catch {
            setResults([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current)
        searchTimeout.current = setTimeout(() => performSearch(query), 300)
        return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current) }
    }, [query, performSearch])

    const handleSelect = (result: SearchResult) => {
        setIsOpen(false)
        router.push(result.href)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveIndex(i => Math.min(i + 1, results.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveIndex(i => Math.max(i - 1, 0))
        } else if (e.key === 'Enter' && results[activeIndex]) {
            handleSelect(results[activeIndex])
        }
    }

    return (
        <>
            {/* Trigger input */}
            <button
                onClick={() => setIsOpen(true)}
                className="relative w-full group cursor-pointer hidden sm:flex items-center"
            >
                <Search className="absolute left-4 w-[18px] h-[18px] text-slate-400 dark:text-slate-500 transition-colors" />
                <div className="w-full bg-slate-100 dark:bg-white/5 text-sm font-semibold text-slate-400 dark:text-slate-500 rounded-xl pl-12 pr-5 py-3 text-left hover:bg-slate-200 dark:hover:bg-white/10 border-2 border-transparent transition-all shadow-inner">
                    Búsqueda rápida...
                    <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center gap-0.5 px-2 py-1 text-[0.6rem] font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-white/10 rounded-md border border-slate-200 dark:border-white/10">
                        Ctrl K
                    </kbd>
                </div>
            </button>

            {/* Modal overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

                    {/* Dialog */}
                    <div className="relative w-full max-w-[560px] mx-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        {/* Search input */}
                        <div className="flex items-center gap-3 px-5 border-b border-slate-200 dark:border-white/5">
                            <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => { setQuery(e.target.value); setActiveIndex(0) }}
                                onKeyDown={handleKeyDown}
                                placeholder="Buscar licitaciones, empresas..."
                                className="flex-1 bg-transparent text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 py-4 outline-none"
                            />
                            {loading && <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />}
                            <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Results */}
                        <div className="max-h-[320px] overflow-y-auto">
                            {query.length < 2 ? (
                                <div className="px-5 py-8 text-center text-sm text-slate-400 dark:text-slate-500 font-medium">
                                    Escribe al menos 2 caracteres para buscar
                                </div>
                            ) : results.length === 0 && !loading ? (
                                <div className="px-5 py-8 text-center text-sm text-slate-400 dark:text-slate-500 font-medium">
                                    No se encontraron resultados para &quot;{query}&quot;
                                </div>
                            ) : (
                                <div className="py-2">
                                    {results.map((result, idx) => (
                                        <button
                                            key={result.id}
                                            onClick={() => handleSelect(result)}
                                            className={`w-full flex items-center gap-4 px-5 py-3 text-left transition-colors cursor-pointer ${
                                                idx === activeIndex
                                                    ? 'bg-blue-50 dark:bg-blue-900/20'
                                                    : 'hover:bg-slate-50 dark:hover:bg-white/5'
                                            }`}
                                            onMouseEnter={() => setActiveIndex(idx)}
                                        >
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                                result.type === 'rfq'
                                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                                    : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                            }`}>
                                                {result.type === 'rfq' ? <FileText className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{result.title}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{result.subtitle}</p>
                                            </div>
                                            <span className="text-[0.6rem] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0">
                                                {result.type === 'rfq' ? 'Licitación' : 'Empresa'}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-2.5 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-[0.65rem] text-slate-400 dark:text-slate-500 font-bold">
                            <span>↑↓ para navegar · Enter para seleccionar</span>
                            <span>ESC para cerrar</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
