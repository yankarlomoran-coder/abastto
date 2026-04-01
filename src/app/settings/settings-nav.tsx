'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Building, Users, ShieldCheck, Palette, ScrollText, ChevronRight } from "lucide-react"

const navItems = [
    {
        name: "Perfil de Empresa",
        href: "/settings",
        icon: Building,
    },
    {
        name: "Apariencia",
        href: "/settings/appearance",
        icon: Palette,
    },
    {
        name: "Directorio de Equipo",
        href: "/settings/team",
        icon: Users,
    },
    {
        name: "Verificación de Identidad",
        href: "/settings/verification",
        icon: ShieldCheck,
    },
    {
        name: "Historial de Actividad",
        href: "/settings/activity",
        icon: ScrollText,
    },
]

export function SettingsNav() {
    const pathname = usePathname()

    return (
        <nav className="space-y-2 sticky top-24">
            {navItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`group flex items-center justify-between px-4 py-3.5 text-sm font-bold rounded-xl transition-all duration-300 border ${
                            isActive
                                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-white/10 shadow-sm"
                                : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <Icon className={`w-4 h-4 transition-colors ${
                                isActive ? "text-blue-600" : "text-slate-400 dark:text-slate-500 group-hover:text-blue-600"
                            }`} />
                            {item.name}
                        </div>
                        {isActive && (
                            <ChevronRight className="w-4 h-4 text-blue-600 animate-in fade-in slide-in-from-left-1" />
                        )}
                    </Link>
                )
            })}
        </nav>
    )
}
