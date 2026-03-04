import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { User, Building, Users } from "lucide-react"

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
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Configuración
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Administra el perfil de tu empresa y el acceso de tu equipo.
                        </p>
                    </div>
                    <Link href="/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                        Volver al Panel
                    </Link>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar SidebarNavigation */}
                    <aside className="w-full md:w-64 flex-shrink-0">
                        <nav className="space-y-1">
                            <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-slate-900 bg-white border shadow-sm hover:bg-slate-50 transition-colors">
                                <Building className="w-4 h-4 text-slate-500" />
                                Perfil de Empresa
                            </Link>

                            <Link href="/settings/team" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white hover:border hover:shadow-sm transition-all border border-transparent">
                                <Users className="w-4 h-4 text-slate-400" />
                                Directorio de Equipo
                            </Link>
                        </nav>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 bg-white rounded-xl border shadow-sm p-6 md:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    )
}
