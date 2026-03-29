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
        where: isBuyer ? { companyId } : { status: 'OPEN', deadline: { gt: new Date() } },
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { bids: true } } }
    })

    return (
        <div className="min-h-screen bg-[#f7f9fb] p-8">
            <div className="max-w-[1200px] mx-auto">
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-[#0b0f10] tracking-tight">{isBuyer ? 'Mis Licitaciones' : 'Oportunidades de Venta'}</h1>
                            <p className="text-slate-500 font-medium">{isBuyer ? 'Historial completo de procesos de compras' : 'Lista completa de oportunidades en el mercado'}</p>
                        </div>
                    </div>
                    {isBuyer && (
                        <Link href="/rfq/create">
                            <Button className="bg-[#0053db] hover:bg-[#003798] text-white">
                                <Plus className="w-4 h-4 mr-2" /> Crear RFQ
                            </Button>
                        </Link>
                    )}
                </header>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {rfqs.length === 0 ? (
                        <div className="p-16 text-center flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-[#f7f9fb] border border-[#e8eff3] rounded-full flex items-center justify-center mb-5">
                                <Inbox className="w-10 h-10 text-[#a9b4b9]" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">No hay licitaciones</h3>
                            <p className="text-slate-500 mt-2">Aún no tienes historiales disponibles.</p>
                        </div>
                    ) : (
                        <div className="w-full overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#f0f4f7] border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                                    <tr>
                                        <th className="px-6 py-4">Título</th>
                                        <th className="px-6 py-4">Fecha de Cierre</th>
                                        <th className="px-6 py-4">Estado</th>
                                        <th className="px-6 py-4 text-right">{isBuyer ? 'Ofertantes' : 'Presupuesto'}</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {rfqs.map(rfq => {
                                        const isPast = rfq.deadline && new Date() > new Date(rfq.deadline)
                                        const effStatus = (rfq.status === 'OPEN' && isPast) ? 'EVALUATING' : rfq.status

                                        return (
                                            <tr key={rfq.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-slate-900">{rfq.title}</td>
                                                <td className="px-6 py-4 flex items-center gap-2">
                                                    <Clock className={`w-4 h-4 ${isPast ? 'text-red-500' : 'text-slate-400'}`} />
                                                    <div>
                                                        <p className={`font-semibold ${isPast ? 'text-red-600' : 'text-slate-800'}`}>
                                                            {new Date(rfq.deadline).toLocaleDateString()}
                                                        </p>
                                                        <p className="text-xs font-bold text-slate-400">{new Date(rfq.deadline).toLocaleTimeString()}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {effStatus === 'OPEN' && <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200">ABIERTA</Badge>}
                                                    {effStatus === 'EVALUATING' && <Badge variant="outline" className="text-red-700 bg-red-50 border-red-200">EVALUANDO</Badge>}
                                                    {effStatus === 'CLOSED' && <Badge variant="outline" className="text-slate-600 bg-slate-50 border-slate-200">CERRADA</Badge>}
                                                    {effStatus === 'DRAFT_PENDING_APPROVAL' && <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200">ESPERANDO APROB. </Badge>}
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-slate-700">
                                                    {isBuyer ? rfq._count.bids : `Q ${Number(rfq.budget).toLocaleString()}`}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link href={`/rfq/${rfq.id}`}>
                                                        <Button variant="ghost" className="text-blue-600 font-bold">Ver Detalles</Button>
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
