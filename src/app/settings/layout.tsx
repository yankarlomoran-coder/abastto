import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { SettingsNav } from "./settings-nav"

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
                        <SettingsNav />
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
