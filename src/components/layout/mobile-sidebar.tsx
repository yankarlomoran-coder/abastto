'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Menu, X, LayoutDashboard, FileText, Activity,
    Users, Settings, BoxIcon, LogOut
} from 'lucide-react'

interface MobileSidebarProps {
    isBuyer: boolean
    userName?: string
    userRole?: string
}

export function MobileSidebar({ isBuyer, userName, userRole }: MobileSidebarProps) {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()

    // Close sidebar on route change
    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    // Prevent body scroll when sidebar is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    const navItems = [
        { icon: LayoutDashboard, label: 'Inicio', href: '/dashboard', active: pathname === '/dashboard' },
        { icon: FileText, label: isBuyer ? 'Mis Licitaciones' : 'Oportunidades', href: '/rfq', active: pathname.startsWith('/rfq') },
        ...(isBuyer ? [{ icon: Activity, label: 'Analíticas Generales', href: '/analytics', active: pathname.startsWith('/analytics') }] : []),
        { icon: Users, label: 'Red de Proveedores', href: '/network', active: pathname.startsWith('/network') },
        { icon: Settings, label: 'Ajustes de Plataforma', href: '/settings', active: pathname.startsWith('/settings') },
        { icon: Users, label: 'Directorio de Equipo', href: '/settings/team', active: pathname === '/settings/team' },
    ]

    return (
        <>
            {/* Hamburger button — visible only on mobile */}
            <button
                onClick={() => setIsOpen(true)}
                className="md:hidden p-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Abrir menú"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Slide-out sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 bottom-0 w-[300px] z-50 md:hidden
                    bg-white/95 dark:bg-[#0a0f1c]/95 backdrop-blur-xl
                    border-r border-slate-200 dark:border-white/5
                    flex flex-col shadow-2xl
                    transition-transform duration-300 ease-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                {/* Header */}
                <div className="p-6 flex items-center justify-between border-b border-slate-200 dark:border-white/5">
                    <Link href="/" className="flex items-center gap-3 text-blue-600 dark:text-blue-500 font-black text-xl tracking-tighter">
                        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <BoxIcon className="w-5 h-5 text-white" />
                        </div>
                        ABASTTO
                    </Link>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                        aria-label="Cerrar menú"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* User Info */}
                {userName && (
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-sm">
                                {userName?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{userName}</p>
                                <p className="text-[0.65rem] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-[0.1em]">
                                    {userRole === 'BUYER' ? 'Comprador' : 'Proveedor'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                                flex items-center gap-3 px-4 py-3.5 text-sm font-bold rounded-xl transition-all relative overflow-hidden
                                ${item.active
                                    ? 'text-blue-600 dark:text-white bg-blue-50/80 dark:bg-blue-600 shadow-sm border border-blue-100/50 dark:border-blue-500/50'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
                                }
                            `}
                        >
                            {item.active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-white" />}
                            <item.icon className={`w-[1.125rem] h-[1.125rem] shrink-0 ${item.active ? 'text-blue-600 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                            <span className="truncate tracking-tight">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-4 mt-auto border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                    <form action="/api/auth/signout" method="POST">
                        <button className="cursor-pointer flex items-center w-full gap-3 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-100 dark:hover:border-red-800 transition-all group">
                            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Cerrar Sesión
                        </button>
                    </form>
                </div>
            </aside>
        </>
    )
}
