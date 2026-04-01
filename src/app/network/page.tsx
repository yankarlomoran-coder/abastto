import { auth } from "@/auth"
import Link from "next/link"
import { Network, ArrowLeft, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"

export default async function NetworkPage() {
    const session = await auth()
    if (!session?.user?.id) redirect('/login')

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#030712] p-8 flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-500">
            {/* Background design elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

            <div className="max-w-[600px] w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-sm dark:shadow-2xl border border-slate-200 dark:border-white/5 p-12 text-center flex flex-col items-center relative z-10">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-500/30 rotate-3 hover:rotate-6 transition-transform">
                    <Network className="w-12 h-12" />
                </div>
                <h1 className="text-[2rem] font-black text-slate-900 dark:text-white tracking-tight leading-none mb-4">Red de Proveedores Profesionales</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">
                    Estamos construyendo el motor de descubrimiento empresarial más potente de la región. Pronto podrá buscar, invitar y conectar con miles de empresas verificadas.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <Link href="/dashboard">
                        <Button variant="outline" className="w-full sm:w-auto font-bold h-12 px-8 rounded-xl border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Inicio
                        </Button>
                    </Link>
                    <Link href="/rfq/create">
                        <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-blue-500/20">
                            <Users className="w-4 h-4 mr-2" /> Invitar Empresas
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
