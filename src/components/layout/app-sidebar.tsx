'use client'

import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard, FileText, Activity, Users, Settings,
    LogOut, BoxIcon, Menu, X, ChevronDown
} from 'lucide-react'

interface AppSidebarProps {
    userName: string
    userRole: string
    isBuyer: boolean
}

const NAV_ITEMS = (isBuyer: boolean) => [
    { icon: LayoutDashboard, label: 'Inicio', href: '/dashboard' },
    { icon: FileText, label: isBuyer ? 'Mis Licitaciones' : 'Oportunidades', href: '/rfq' },
    ...(isBuyer ? [{ icon: Activity, label: 'Analíticas', href: '/analytics' }] : []),
    { icon: Users, label: 'Red de Empresas', href: '/network' },
]

const ADMIN_ITEMS = [
    { icon: Settings, label: 'Configuración', href: '/settings' },
    { icon: Users, label: 'Equipo', href: '/settings/team' },
]

export function AppSidebar({ userName, userRole, isBuyer }: AppSidebarProps) {
    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = useState(false)

    // Close on route change
    useEffect(() => { setMobileOpen(false) }, [pathname])

    // Prevent body scroll when mobile sidebar is open
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [mobileOpen])

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard'
        if (href === '/settings/team') return pathname === '/settings/team'
        if (href === '/settings') return pathname.startsWith('/settings') && pathname !== '/settings/team'
        return pathname.startsWith(href)
    }

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 pb-8 border-b border-slate-100 dark:border-white/5">
                <Link href="/dashboard" className="flex items-center gap-3 text-blue-600 dark:text-blue-500 font-black text-xl tracking-tighter hover:opacity-80 transition-all">
                    <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <BoxIcon className="w-5 h-5 text-white" />
                    </div>
                    ABASTTO
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                {NAV_ITEMS(isBuyer).map((item) => {
                    const active = isActive(item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                                group flex items-center gap-3 px-4 py-3 text-[0.8125rem] font-bold rounded-xl transition-all relative
                                ${active
                                    ? 'text-blue-600 dark:text-white bg-blue-50/80 dark:bg-blue-600/15 border border-blue-100/60 dark:border-blue-500/20'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent'
                                }
                            `}
                        >
                            {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-600 dark:bg-blue-400 rounded-r-full" />}
                            <item.icon className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400'} transition-colors`} />
                            <span className="truncate">{item.label}</span>
                        </Link>
                    )
                })}

                {/* Admin Section */}
                <div className="pt-8 pb-2 px-4">
                    <p className="text-[0.6rem] font-bold tracking-[0.15em] text-slate-400 dark:text-slate-600 uppercase">
                        Administración
                    </p>
                </div>
                {ADMIN_ITEMS.map((item) => {
                    const active = isActive(item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                                group flex items-center gap-3 px-4 py-3 text-[0.8125rem] font-bold rounded-xl transition-all relative
                                ${active
                                    ? 'text-blue-600 dark:text-white bg-blue-50/80 dark:bg-blue-600/15 border border-blue-100/60 dark:border-blue-500/20'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent'
                                }
                            `}
                        >
                            {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-600 dark:bg-blue-400 rounded-r-full" />}
                            <item.icon className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400'} transition-colors`} />
                            <span className="truncate">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* User Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-white/5">
                <Link href="/settings" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-blue-600/10 shrink-0">
                        {userName?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{userName}</p>
                        <p className="text-[0.6rem] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-[0.1em]">
                            {userRole === 'BUYER' ? 'Comprador' : 'Proveedor'}
                        </p>
                    </div>
                </Link>
                <button onClick={() => signOut({ callbackUrl: '/login' })} className="cursor-pointer flex items-center w-full gap-3 px-4 py-2.5 text-sm font-bold text-red-500 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-all group">
                    <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Cerrar Sesión
                </button>
            </div>
        </div>
    )

    return (
        <>
            {/* Mobile toggle */}
            <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden fixed top-4 left-4 z-40 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Abrir menú"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Desktop sidebar */}
            <aside className="w-[260px] bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-xl border-r border-slate-200 dark:border-white/5 flex-shrink-0 hidden md:flex flex-col h-screen sticky top-0 z-30 transition-colors">
                {sidebarContent}
            </aside>

            {/* Mobile backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 bottom-0 w-[280px] z-50 md:hidden
                    bg-white/95 dark:bg-[#0a0f1c]/95 backdrop-blur-xl
                    border-r border-slate-200 dark:border-white/5 shadow-2xl
                    transition-transform duration-300 ease-out
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                {/* Close button */}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="absolute top-4 right-4 p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer z-10"
                    aria-label="Cerrar menú"
                >
                    <X className="w-5 h-5" />
                </button>
                {sidebarContent}
            </aside>
        </>
    )
}
