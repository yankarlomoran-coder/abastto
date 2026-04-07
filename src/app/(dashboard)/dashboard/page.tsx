import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Activity, DollarSign, CheckCircle2, Star, Clock,
    Inbox, Plus, Bell
} from 'lucide-react'
import { TrustScoreBadge } from "@/components/trust-score-badge"
import { STATUS_LABELS } from "@/lib/constants"

export default async function DashboardPage() {
    const session = await auth()
    if (!session?.user || !session.user.companyId) {
        redirect("/login")
    }

    const { role, name, companyId } = session.user
    const isBuyer = role === 'BUYER'
    const now = new Date()

    let totalValue = 0
    let activeCount = 0
    let successCount = 0
    let tableData: any[] = []
    let alerts: { text: string, time: string, type: string }[] = []

    if (isBuyer) {
        const [spentAgg, activeRfqs, closedRfqs, recentRfqs] = await Promise.all([
            prisma.bid.aggregate({ where: { status: 'ACCEPTED', rfq: { companyId } }, _sum: { amount: true } }),
            prisma.rfq.count({ where: { companyId, status: { in: ['OPEN', 'EVALUATING', 'DRAFT_PENDING_APPROVAL' as any] } } }),
            prisma.rfq.count({ where: { companyId, status: 'CLOSED' } }),
            prisma.rfq.findMany({
                where: { companyId },
                orderBy: { createdAt: 'desc' },
                take: 8,
                include: { _count: { select: { bids: true } } }
            })
        ])
        totalValue = Number(spentAgg._sum.amount || 0)
        activeCount = activeRfqs
        successCount = closedRfqs
        tableData = recentRfqs.map(r => ({
            id: r.id, title: r.title, deadline: r.deadline, status: r.status,
            metric: `${r._count.bids} ofertas`, link: `/rfq/${r.id}`
        }))
        const pendingEval = await prisma.rfq.count({ where: { companyId, status: 'EVALUATING', bids: { some: {} } } })
        if (pendingEval > 0) alerts.push({ text: `Tienes ${pendingEval} licitación(es) en evaluación`, time: "Pendiente", type: "warn" })

        const closingRfqs = await prisma.rfq.findMany({
            where: { companyId, status: 'OPEN', deadline: { lte: new Date(Date.now() + 24 * 60 * 60 * 1000), gte: new Date() } },
            select: { title: true }
        })
        closingRfqs.forEach(rfq => {
            alerts.push({ text: `La licitación "${rfq.title}" cierra pronto`, time: "Hoy", type: "danger" })
        })
    } else {
        const [earnedAgg, submittedBids, wonBids, availableRfqs] = await Promise.all([
            prisma.bid.aggregate({ where: { status: 'ACCEPTED', companyId }, _sum: { amount: true } }),
            prisma.bid.count({ where: { companyId } }),
            prisma.bid.count({ where: { status: 'ACCEPTED', companyId } }),
            prisma.rfq.findMany({
                where: { status: 'OPEN', deadline: { gt: now } },
                include: { company: true },
                orderBy: { createdAt: 'desc' },
                take: 8
            })
        ])
        totalValue = Number(earnedAgg._sum.amount || 0)
        activeCount = submittedBids
        successCount = wonBids
        tableData = availableRfqs.map(r => ({
            id: r.id, title: r.title, deadline: r.deadline, status: r.status,
            metric: 'Ver detalles', link: `/rfq/${r.id}`,
            companyName: r.company?.name || 'Múltiples'
        }))
        const wonBidsAlert = await prisma.bid.count({ where: { companyId, status: 'ACCEPTED', updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } })
        if (wonBidsAlert > 0) alerts.push({ text: `¡Se aceptó tu oferta en ${wonBidsAlert} licitación(es)!`, time: "Reciente", type: "success" })
    }

    return (
        <div className="flex-1 p-6 md:p-10 xl:p-14 max-w-[1600px] w-full mx-auto space-y-10">
            {/* Editorial Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pb-2">
                <div className="space-y-2">
                    <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-none">Resumen Operativo</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base font-medium leading-relaxed max-w-2xl">Gestiona tus indicadores estratégicos y visualiza el estado de tus procesos en tiempo real.</p>
                </div>
                {isBuyer && (
                    <Link href="/rfq/create">
                        <Button className="cursor-pointer bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-xl shadow-blue-600/20 border-0 h-11 px-7 rounded-xl font-bold text-sm tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98]">
                            <Plus className="w-[18px] h-[18px] mr-2" /> Nueva Licitación
                        </Button>
                    </Link>
                )}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <MetricCard
                    title={isBuyer ? "Total Adjudicado" : "Pipeline Ganado"}
                    value={`Q ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    icon={DollarSign}
                    color="blue"
                />
                <MetricCard
                    title={isBuyer ? "Licitaciones Abiertas" : "Ofertas Enviadas"}
                    value={activeCount.toString()}
                    icon={Activity}
                    color="indigo"
                />
                <MetricCard
                    title={isBuyer ? "Acuerdos Cerrados" : "Contratos Ganados"}
                    value={successCount.toString()}
                    icon={CheckCircle2}
                    color="emerald"
                />
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/5 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex justify-between items-start mb-5">
                        <h3 className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">Índice de Confianza</h3>
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl shadow-inner"><Star className="w-5 h-5" /></div>
                    </div>
                    <div className="flex-1 max-w-full overflow-hidden flex items-end">
                        <TrustScoreBadge companyId={companyId} className="w-full text-base py-2 px-4 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5" />
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 leading-relaxed">
                {/* Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col transition-all">
                    <div className="px-7 py-5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5">
                        <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{isBuyer ? 'Licitaciones Recientes' : 'Mercado: Oportunidades'}</h2>
                        <Link href="/rfq">
                            <Button variant="ghost" className="cursor-pointer text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm font-bold h-9 px-4 rounded-xl transition-all">
                                Ver todo
                            </Button>
                        </Link>
                    </div>

                    {tableData.length === 0 ? (
                        <div className="p-16 text-center flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-white/5 rounded-3xl flex items-center justify-center mb-5">
                                <Inbox className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                            </div>
                            <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Sin actividad</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm font-medium leading-relaxed">
                                {isBuyer ? 'Inicia un nuevo proceso para cotizar.' : 'Revisa más tarde para nuevas oportunidades.'}
                            </p>
                        </div>
                    ) : (
                        <div className="w-full overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-white/5 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                                        <th className="px-7 py-3.5 border-b border-slate-200 dark:border-white/5">Referencia</th>
                                        <th className="px-7 py-3.5 border-b border-slate-200 dark:border-white/5">Fecha Límite</th>
                                        <th className="px-7 py-3.5 border-b border-slate-200 dark:border-white/5">Estado</th>
                                        <th className="px-7 py-3.5 border-b border-slate-200 dark:border-white/5 text-right">{isBuyer ? 'Ofertas' : ''}</th>
                                        <th className="px-7 py-3.5 border-b border-slate-200 dark:border-white/5"></th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-slate-100 dark:divide-white/5">
                                    {tableData.map((row) => {
                                        const isPastDeadline = row.deadline && new Date() > new Date(row.deadline)
                                        const effectiveStatus = row.status === 'OPEN' && isPastDeadline ? 'EVALUATING' : row.status
                                        const statusInfo = STATUS_LABELS[effectiveStatus] || { label: effectiveStatus, class: '' }
                                        return (
                                            <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
                                                <td className="px-7 py-4">
                                                    <p className="font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm">{row.title}</p>
                                                    {!isBuyer && <p className="text-[0.7rem] font-bold text-slate-500 dark:text-slate-500 mt-0.5">{row.companyName}</p>}
                                                </td>
                                                <td className="px-7 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className={`p-1.5 rounded-lg ${isPastDeadline ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                                            <Clock className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className={`font-bold text-sm ${isPastDeadline ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                                                                {new Date(row.deadline).toLocaleDateString('es-GT', { month: 'short', day: 'numeric' })}
                                                            </span>
                                                            <span className="text-[0.65rem] font-bold text-slate-400 dark:text-slate-500">
                                                                {new Date(row.deadline).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-7 py-4 whitespace-nowrap">
                                                    <Badge variant="outline" className={`px-3 py-1 font-black text-[0.65rem] ${statusInfo.class}`}>
                                                        {statusInfo.label}
                                                    </Badge>
                                                </td>
                                                <td className="px-7 py-4 text-right font-black text-slate-900 dark:text-white whitespace-nowrap tabular-nums text-sm">
                                                    {row.metric}
                                                </td>
                                                <td className="px-7 py-4 text-right whitespace-nowrap">
                                                    <Link href={row.link}>
                                                        <Button variant="ghost" size="sm" className="cursor-pointer h-8 px-3 font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-xs">
                                                            Ver
                                                        </Button>
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

                {/* Right column */}
                <div className="flex flex-col gap-6">
                    {/* Metrics mini */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 p-7 flex flex-col">
                        <h2 className="text-sm font-black text-slate-900 dark:text-white mb-5 uppercase tracking-widest flex items-center gap-2">
                            <Activity className="w-4 h-4 text-blue-600" /> Métricas
                        </h2>
                        <div className="flex-1 min-h-[130px] bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center p-5">
                            <div className="flex items-end gap-3 h-20 mb-4">
                                <div className="w-7 bg-blue-200 dark:bg-blue-900/40 rounded-lg h-[40%] transition-all hover:h-[45%]"></div>
                                <div className="w-7 bg-blue-300 dark:bg-blue-900/60 rounded-lg h-[60%] transition-all hover:h-[65%]"></div>
                                <div className="w-7 bg-blue-400 dark:bg-blue-800/80 rounded-lg h-[100%] transition-all hover:h-[105%]"></div>
                                <div className="w-7 bg-blue-600 dark:bg-blue-600 rounded-lg h-[80%] shadow-lg shadow-blue-600/20 transition-all hover:h-[85%]"></div>
                            </div>
                            <p className="text-[0.6rem] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.15em]">Tendencia Alcista</p>
                        </div>
                    </div>

                    {/* Alerts */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 p-7 flex flex-col shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-28 h-28 bg-blue-600/10 rounded-full blur-3xl -mr-8 -mt-8"></div>
                        <h2 className="text-sm font-black text-slate-900 dark:text-white mb-5 flex items-center gap-2 uppercase tracking-widest relative z-10">
                            <Bell className="w-4 h-4 text-blue-500" /> Tareas Hoy
                        </h2>
                        <div className="space-y-3 relative z-10">
                            {alerts.length > 0 ? (
                                alerts.map((alert, i) => (
                                    <AlertItem key={i} title={alert.text} time={alert.time} type={alert.type} />
                                ))
                            ) : (
                                <div className="text-center p-6 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl">
                                    <p className="text-sm text-slate-400 font-medium">No tienes tareas pendientes.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function MetricCard({ title, value, icon: Icon, color = "blue" }: { title: string, value: string, icon: any, color?: string }) {
    const colorVariants: any = {
        blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
        emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20",
        indigo: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20",
    }
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-5">
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">{title}</p>
                <div className={`p-3 rounded-xl shadow-inner ${colorVariants[color] || colorVariants.blue}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</h3>
        </div>
    )
}

function AlertItem({ title, time, type }: { title: string, time: string, type: string }) {
    const isNew = type === 'danger'
    return (
        <div className="flex items-center gap-3 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/5 transition-all group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${isNew ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                {isNew ? <Bell className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{title}</p>
                <p className="text-[0.65rem] font-bold text-slate-400 dark:text-slate-500 uppercase">{time}</p>
            </div>
        </div>
    )
}
