import { auth } from "@/auth"
import Link from "next/link"
import { BellRing, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"

export default async function NotificationsPage() {
    const session = await auth()
    if (!session?.user?.id) redirect('/login')

    return (
        <div className="min-h-screen bg-[#f7f9fb] p-8 flex flex-col items-center justify-center">
            <div className="max-w-[600px] w-full bg-white rounded-2xl shadow-[0_8px_30px_rgba(42,52,57,0.04)] border border-slate-200 p-12 text-center flex flex-col items-center">
                <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-8 shadow-inner border border-blue-100">
                    <BellRing className="w-12 h-12" />
                </div>
                <h1 className="text-[2rem] font-black text-slate-900 tracking-tight leading-none mb-4">Centro de Notificaciones</h1>
                <p className="text-slate-500 font-medium mb-8 leading-relaxed max-w-sm">
                    Estás al día. Aquí aparecerán tus alertas críticas, mensajes de negociación y actualizaciones de procesos B2B en tiempo real.
                </p>
                <Link href="/dashboard">
                    <Button className="bg-[#0053db] hover:bg-[#003798] text-white font-bold h-12 px-8 rounded-lg shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Inicio
                    </Button>
                </Link>
            </div>
        </div>
    )
}
