"use client"

import React from 'react'
import { useTheme } from "next-themes"
import { Sun, Moon, Monitor, Check } from "lucide-react"

export default function AppearanceSettingsPage() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const themes = [
        {
            id: 'light',
            name: 'Claro',
            icon: Sun,
            description: 'Interfaz limpia y brillante, ideal para entornos con mucha luz.',
            preview: 'bg-white border-slate-200'
        },
        {
            id: 'dark',
            name: 'Oscuro',
            icon: Moon,
            description: 'Reduce la fatiga visual y ahorra batería en pantallas OLED.',
            preview: 'bg-slate-900 border-slate-800'
        },
        {
            id: 'system',
            name: 'Sistema',
            icon: Monitor,
            description: 'Se adapta automáticamente a la configuración de tu dispositivo.',
            preview: 'bg-gradient-to-br from-white via-slate-400 to-slate-900 border-slate-300'
        }
    ]

    return (
        <div className="max-w-4xl">
            <div className="mb-8 border-b dark:border-slate-800 pb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Apariencia</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Personaliza cómo se ve Abastto en tu dispositivo.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {themes.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`group relative flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left ${
                            theme === t.id 
                            ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/10' 
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                        }`}
                    >
                        <div className={`w-full aspect-video rounded-lg mb-4 border shadow-sm ${t.preview} relative overflow-hidden`}>
                            {theme === t.id && (
                                <div className="absolute inset-0 flex items-center justify-center bg-blue-600/10 backdrop-blur-[1px]">
                                    <div className="bg-blue-600 text-white p-1.5 rounded-full shadow-lg">
                                        <Check className="w-5 h-5 stroke-[3]" />
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2 mb-1">
                            <t.icon className={`w-4 h-4 ${theme === t.id ? 'text-blue-600' : 'text-slate-500'}`} />
                            <span className={`font-bold ${theme === t.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-slate-100'}`}>
                                {t.name}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                            {t.description}
                        </p>
                    </button>
                ))}
            </div>

            <div className="mt-12 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">💡 Tip pro</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    El modo oscuro de Abastto está diseñado con un contraste balanceado (Slate & Deep Sea) para mejorar la lectura de datos complejos en el dashboard.
                </p>
            </div>
        </div>
    )
}
