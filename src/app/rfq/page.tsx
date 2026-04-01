import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { Plus, ArrowLeft, Clock, Inbox } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default async function RfqListPage() {
    const session = await auth()
    if (!session?.user?.id) return null

    const isBuyer = session.user.role === 'BUYER'
    const companyId = session.user.companyId as string
    if (!companyId) return null

    const rfqs = await prisma.rfq.findMany({
        where: isBuyer ? { companyId } : { 
            OR: [
                { status: 'OPEN', deadline: { gt: new Date() } },
                { bids: { some: { companyId } } }
            ]
        },
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { bids: true } } }
    })

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#030712] p-8 transition-colors duration-500">
            <div className="max-w-[1200px] mx-auto">
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 hover:bg-slate-200 dark:hover:bg-white/5 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{isBuyer ? 'Mis Licitaciones' : 'Oportunidades de Venta'}</h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">{isBuyer ? 'Historial completo de procesos de compras' : 'Lista completa de oportunidades en el mercado'}</p>
                        </div>
                    </div>
                    {isBuyer && (
                        <Link href="/rfq/create">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-blue-600/20">
                                <Plus className="w-4 h-4 mr-2" /> Crear Licitación
                            </Button>
                        </Link>
                    )}
                </header>

                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden">
                    {rfqs.length === 0 ? (
                        <div className="p-16 text-center flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-center mb-5">
                                <Inbox className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No hay licitaciones</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Aún no tienes registros disponibles.</p>
                        </div>
                    ) : (
                        <div className="w-full overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-8 py-4">Título</th>
                                        <th className="px-8 py-4">Fecha de Cierre</th>
                                        <th className="px-8 py-4">Estado</th>
                                        <th className="px-8 py-4 text-right">{isBuyer ? 'Ofertantes' : 'Presupuesto'}</th>
                                        <th className="px-8 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {rfqs.map(rfq => {
                                        const isPast = rfq.deadline && new Date() > new Date(rfq.deadline)
                                        const effStatus = (rfq.status === 'OPEN' && isPast) ? 'EVALUATING' : rfq.status

                                        return (
                                            <tr key={rfq.id} className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <p className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase text-xs tracking-tight">{rfq.title}</p>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <Clock className={`w-4 h-4 ${isPast ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}`} />
                                                        <div>
                                                            <p className={`font-bold ${isPast ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                                                                {new Date(rfq.deadline).toLocaleDateString('es-GT', { month: 'short', day: 'numeric' })}
                                                            </p>
                                                            <p className="text-[0.7rem] font-bold text-slate-400 dark:text-slate-500">{new Date(rfq.deadline).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    {effStatus === 'OPEN' && <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50 px-3 py-1 font-black text-[0.65rem]">ABIERTA</Badge>}
                                                    {effStatus === 'EVALUATING' && <Badge variant="outline" className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50 px-3 py-1 font-black text-[0.65rem]">EVALUANDO</Badge>}
                                                    {effStatus === 'CLOSED' && <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-transparent px-3 py-1 font-black text-[0.65rem]">CERRADA</Badge>}
                                                    {effStatus === 'DRAFT_PENDING_APPROVAL' && <Badge variant="outline" className="bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-900/50 px-3 py-1 font-black text-[0.65rem]">PENDIENTE</Badge>}
                                                </td>
                                                <td className="px-8 py-5 text-right font-black text-slate-900 dark:text-white tabular-nums">
                                                    {isBuyer ? rfq._count.bids : `Q ${Number(rfq.budget).toLocaleString()}`}
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <Link href={`/rfq/${rfq.id}`}>
                                                        <Button variant="ghost" className="text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">Ver Detalles</Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
