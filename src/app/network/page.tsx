import { auth } from "@/auth"
import Link from "next/link"
import { Network, ArrowLeft, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"

export default async function NetworkPage() {
    const session = await auth()
    if (!session?.user?.id) redirect('/login')

    return (
        <div className="min-h-screen bg-[#f7f9fb] p-8 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-blue-50 to-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

            <div className="max-w-[600px] w-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_40px_rgba(42,52,57,0.06)] border border-slate-200 p-12 text-center flex flex-col items-center relative z-10">
                <div className="w-24 h-24 bg-gradient-to-br from-[#0053db] to-indigo-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-500/30 rotate-3 hover:rotate-6 transition-transform">
                    <Network className="w-12 h-12" />
                </div>
                <h1 className="text-[2rem] font-black text-slate-900 tracking-tight leading-none mb-4">Red de Proveedores B2B</h1>
                <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                    Estamos construyendo el motor de descubrimiento empresarial más potente de la región. Pronto podrás buscar, invitar y conectar con miles de empresas verificadas.
                </p>
                <div className="flex gap-4">
                    <Link href="/dashboard">
                        <Button variant="outline" className="font-bold h-12 px-6 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Inicio
                        </Button>
                    </Link>
                    <Link href="/rfq/create">
                        <Button className="bg-[#0053db] hover:bg-[#003798] text-white font-bold h-12 px-6 rounded-lg shadow-lg shadow-blue-500/20">
                            <Users className="w-4 h-4 mr-2" /> Invitar Empresas via Email
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
