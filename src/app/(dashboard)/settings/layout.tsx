import { auth } from "@/auth"
import { redirect } from "next/navigation"
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
        <div className="flex-1 p-6 md:p-10 xl:p-14 max-w-[1200px] w-full mx-auto">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                    Configuración
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
                    Gestiona tu identidad corporativa y preferencias de la plataforma.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Settings Sub-Navigation */}
                <aside className="w-full lg:w-64 flex-shrink-0">
                    <SettingsNav />
                </aside>

                {/* Content Area */}
                <main className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm p-7 md:p-10 min-h-[500px] transition-colors">
                    {children}
                </main>
            </div>
        </div>
    )
}
