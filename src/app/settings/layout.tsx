import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { User, Building, Users, ShieldCheck, Palette } from "lucide-react"

export default async function SettingsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    if (!session?.user) {
        redirect("/login")
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#030712] transition-colors duration-500">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Header */}
                <div className="mb-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                            Configuración
                        </h1>
                        <p className="text-base text-slate-500 dark:text-slate-400 mt-2 font-medium">
                            Gestiona tu identidad corporativa y preferencias de la plataforma.
                        </p>
                    </div>
                    <Link href="/dashboard" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-6 py-2.5 rounded-xl border border-blue-100 dark:border-blue-900/50 shadow-sm transition-all hover:scale-[1.02]">
                        Volver al Panel
                    </Link>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar SidebarNavigation */}
                    <aside className="w-full lg:w-72 flex-shrink-0">
                        <nav className="space-y-2 sticky top-24">
                            <Link href="/settings" className="flex items-center gap-3 px-4 py-3.5 text-sm font-bold rounded-xl text-slate-900 dark:text-white bg-white dark:bg-slate-900 border dark:border-white/5 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group">
                                <Building className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                                Perfil de Empresa
                            </Link>

                            <Link href="/settings/appearance" className="flex items-center gap-3 px-4 py-3.5 text-sm font-bold rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-white dark:hover:bg-slate-900 hover:border dark:hover:border-white/5 hover:shadow-sm transition-all border border-transparent group">
                                <Palette className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                                Apariencia
                            </Link>

                            <Link href="/settings/team" className="flex items-center gap-3 px-4 py-3.5 text-sm font-bold rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-white dark:hover:bg-slate-900 hover:border dark:hover:border-white/5 hover:shadow-sm transition-all border border-transparent group">
                                <Users className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                                Directorio de Equipo
                            </Link>

                            <Link href="/settings/verification" className="flex items-center gap-3 px-4 py-3.5 text-sm font-bold rounded-xl text-slate-600 dark:text-slate-400 hover:text-blue-900 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-900 hover:border dark:hover:border-blue-900/20 hover:shadow-sm transition-all border border-transparent group">
                                <ShieldCheck className="w-4 h-4 text-blue-500" />
                                Verificación KYC
                            </Link>
                        </nav>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm p-8 md:p-12 min-h-[600px] transition-colors">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    )
}
