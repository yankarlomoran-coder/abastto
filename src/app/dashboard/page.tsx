import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
    LayoutDashboard, 
    FileText, 
    Users, 
    Activity, 
    Settings, 
    Search, 
    Bell, 
    LogOut, 
    DollarSign, 
    CheckCircle2, 
    Star, 
    Clock, 
    Inbox, 
    ChevronRight, 
    BoxIcon,
    Plus
} from 'lucide-react'
import { TrustScoreBadge } from "@/components/trust-score-badge"

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
    let alerts: {text: string, time: string, type: string}[] = []

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
            id: r.id,
            title: r.title,
            deadline: r.deadline,
            status: r.status,
            metric: `${r._count.bids} ofertas`,
            link: `/rfq/${r.id}`
        }))
        const pendingEval = await prisma.rfq.count({ where: { companyId, status: 'EVALUATING', bids: { some: {} } } })
        if (pendingEval > 0) alerts.push({ text: `Tienes ${pendingEval} licitación(es) en evaluación`, time: "Pendiente", type: "warn" })
        
        const closingRfqs = await prisma.rfq.findMany({
            where: { companyId, status: 'OPEN', deadline: { lte: new Date(Date.now() + 24 * 60 * 60 * 1000), gte: new Date() } },
            select: { title: true }
        })
        closingRfqs.forEach(rfq => {
            alerts.push({ text: `La licitación ${rfq.title} cierra pronto`, time: "Hoy", type: "danger" })
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
            id: r.id,
            title: r.title,
            deadline: r.deadline,
            status: r.status,
            metric: `Q ${Number(r.budget).toLocaleString()}`,
            link: `/rfq/${r.id}`,
            companyName: r.company?.name || 'Múltiples'
        }))
        const wonBidsAlert = await prisma.bid.count({ where: { companyId, status: 'ACCEPTED', updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } })
        if (wonBidsAlert > 0) alerts.push({ text: `¡Se aceptó tu oferta en ${wonBidsAlert} licitación(es)!`, time: "Reciente", type: "success" })
    }

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-500">
            {/* Sidebar */}
            <aside className="w-[280px] bg-white/70 dark:bg-[#0a0f1c]/70 backdrop-blur-xl border-r border-slate-200 dark:border-white/5 flex-shrink-0 hidden md:flex flex-col z-30">
                <div className="p-8 pb-10">
                    <Link href="/" className="flex items-center gap-3 text-blue-600 dark:text-blue-500 font-black text-2xl tracking-tighter cursor-pointer hover:opacity-80 transition-all hover:scale-[1.02]">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <BoxIcon className="w-6 h-6 text-white" />
                        </div>
                        ABASTTO
                    </Link>
                </div>
                
                <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
                    <SidebarItem icon={LayoutDashboard} label="Inicio" active href="/dashboard" />
                    <SidebarItem icon={FileText} label={isBuyer ? "Mis Licitaciones" : "Oportunidades"} href="/rfq" />
                    {isBuyer && <SidebarItem icon={Activity} label="Analíticas Generales" href="/analytics" />}
                    <SidebarItem icon={Users} label="Red de Proveedores" href="/network" />
                    
                    <div className="pt-10 pb-4 px-4 text-[0.65rem] font-bold tracking-[0.15em] text-slate-400 dark:text-slate-500 uppercase">
                        Administración
                    </div>
                    <SidebarItem icon={Settings} label="Ajustes de Plataforma" href="/settings" />
                    <SidebarItem icon={Users} label="Directorio de Equipo" href="/settings/team" />
                </nav>

                <div className="p-6 mt-auto border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                    <form action={async () => { "use server"; await signOut({ redirectTo: '/login' }) }}>
                        <button className="cursor-pointer flex items-center w-full gap-3 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-100 dark:hover:border-red-800 transition-all group">
                            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Cerrar Sesión
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content Arena */}
            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-slate-50 dark:bg-[#030712] relative">
                {/* Search Header */}
                <header className="h-[80px] bg-white/50 dark:bg-[#0a0f1c]/50 backdrop-blur-md border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-10 sticky top-0 z-20 shrink-0 transition-all">
                    <div className="flex items-center w-[450px]">
                        <div className="relative w-full group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 dark:text-slate-500 group-focus-within:text-blue-600 transition-colors" />
                            <input 
                                type="text" 
                                placeholder="🔍 Búsqueda rápida de empresas o RFQs..." 
                                className="w-full bg-slate-100 dark:bg-white/5 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl pl-12 pr-5 py-3 outline-none hover:bg-slate-200 dark:hover:bg-white/10 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/20 border-2 border-transparent focus:border-blue-600 transition-all shadow-inner"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <Link href="/notifications">
                                <button className="cursor-pointer relative text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-500 transition-all p-2.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl">
                                    <Bell className="w-[22px] h-[22px]" />
                                    <span className="absolute top-2.5 right-2.5 w-3 h-3 bg-red-500 border-2 border-white dark:border-[#0a0f1c] rounded-full shadow-sm animate-pulse"></span>
                                </button>
                            </Link>
                        </div>
                        <div className="w-px h-8 bg-slate-200 dark:bg-white/10"></div>
                        <Link href="/settings">
                            <div className="flex items-center gap-4 cursor-pointer group">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{name}</p>
                                    <p className="text-[0.65rem] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-[0.1em]">{role === 'BUYER' ? 'Comprador' : 'Proveedor'}</p>
                                </div>
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-lg border-2 border-blue-100 dark:border-blue-900/50 shadow-lg shadow-blue-600/10 transition-transform group-hover:scale-110">
                                    {name?.[0]?.toUpperCase()}
                                </div>
                            </div>
                        </Link>
                    </div>
                </header>

                <div className="flex-1 p-10 xl:p-14 max-w-[1600px] w-full mx-auto space-y-12 bg-slate-50 dark:bg-[#030712]">
                    {/* Editorial Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-8 pb-2">
                        <div className="space-y-3">
                            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-none">Resumen Operativo</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed max-w-2xl">Gestiona tus KPIs financieros y visualiza el estado de tus procesos en tiempo real.</p>
                        </div>
                        {isBuyer && (
                            <Link href="/rfq/create">
                                <Button className="cursor-pointer bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-xl shadow-blue-600/20 border-0 h-12 px-8 rounded-xl font-bold text-sm tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98]">
                                    <Plus className="w-[18px] h-[18px] mr-2" /> Nueva Licitación
                                </Button>
                            </Link>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <MetricCard 
                            title={isBuyer ? "Total Adjudicado" : "Pipeline Ganado"} 
                            value={`Q ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                            icon={DollarSign} 
                            trend={totalValue > 0 ? "+12.4% este trimestre" : undefined}
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
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">B2B Trust Score</h3>
                                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl shadow-inner"><Star className="w-5 h-5" /></div>
                            </div>
                            <div className="flex-1 max-w-full overflow-hidden flex items-end">
                                <TrustScoreBadge companyId={companyId} className="w-full text-base py-2 px-4 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5" />
                            </div>
                        </div>
                    </div>

                    {/* Information Rail Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-10 leading-relaxed">
                        {/* THE MAIN STAGE: Active Solicitations */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col transition-all">
                            <div className="px-8 py-6 flex justify-between items-center bg-slate-50/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5">
                                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{isBuyer ? 'Licitaciones Recientes' : 'Mercado: Oportunidades'}</h2>
                                <Link href="/rfq">
                                    <Button variant="ghost" className="cursor-pointer text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm font-bold h-10 px-5 rounded-xl transition-all">
                                        Ver historial completo
                                    </Button>
                                </Link>
                            </div>
                            
                            {tableData.length === 0 ? (
                                <div className="p-20 text-center flex flex-col items-center justify-center bg-slate-50/30 dark:bg-transparent">
                                    <div className="w-24 h-24 bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-white/5 rounded-3xl flex items-center justify-center mb-6">
                                        <Inbox className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                                    </div>
                                    <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Bandeja Limpia</h3>
                                    <p className="text-base text-slate-500 dark:text-slate-400 mt-2 max-w-sm font-medium leading-relaxed">No hay transacciones activas en este momento. {isBuyer ? 'Inicia un nuevo proceso para cotizar.' : 'Revisa más tarde para nuevas oportunidades.'}</p>
                                </div>
                            ) : (
                                <div className="w-full overflow-x-auto custom-scrollbar bg-white dark:bg-slate-900">
                                    <table className="w-full text-left border-collapse bg-white dark:bg-slate-900">
                                        <thead>
                                            <tr className="bg-slate-50/50 dark:bg-white/5 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                                                <th className="px-8 py-4 border-b border-slate-200 dark:border-white/5">Referencia Comercial</th>
                                                <th className="px-8 py-4 border-b border-slate-200 dark:border-white/5">Fecha Límite</th>
                                                <th className="px-8 py-4 border-b border-slate-200 dark:border-white/5">Estado</th>
                                                <th className="px-8 py-4 border-b border-slate-200 dark:border-white/5 text-right">{isBuyer ? 'Volumen' : 'Presupuesto'}</th>
                                                <th className="px-8 py-4 border-b border-slate-200 dark:border-white/5"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm divide-y divide-slate-100 dark:divide-white/5">
                                            {tableData.map((row) => {
                                                const isPastDeadline = row.deadline && new Date() > new Date(row.deadline)
                                                const effectiveStatus = row.status === 'OPEN' && isPastDeadline ? 'EVALUATING' : row.status
                                                return (
                                                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
                                                    <td className="px-8 py-5">
                                                        <p className="font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase text-xs">{row.title}</p>
                                                        {!isBuyer && <p className="text-[0.7rem] font-bold text-slate-500 dark:text-slate-500 mt-1 uppercase">{row.companyName}</p>}
                                                    </td>
                                                    <td className="px-8 py-5 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-lg ${isPastDeadline ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                                                <Clock className="w-4 h-4" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className={`font-bold ${isPastDeadline ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>{new Date(row.deadline).toLocaleDateString('es-GT', { month: 'short', day: 'numeric' })}</span>
                                                                <span className="text-[0.7rem] font-bold text-slate-400 dark:text-slate-500">{new Date(row.deadline).toLocaleTimeString('es-GT', {hour: '2-digit', minute:'2-digit'})}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 whitespace-nowrap">
                                                        {effectiveStatus === 'OPEN' && <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50 px-3 py-1 font-black text-[0.65rem]">ABIERTA</Badge>}
                                                        {effectiveStatus === 'EVALUATING' && <Badge variant="outline" className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50 px-3 py-1 font-black text-[0.65rem]">EVALUANDO</Badge>}
                                                        {effectiveStatus === 'CLOSED' && <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-transparent px-3 py-1 font-black text-[0.65rem]">CERRADA</Badge>}
                                                        {effectiveStatus === 'DRAFT_PENDING_APPROVAL' && <Badge variant="outline" className="bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-900/50 px-3 py-1 font-black text-[0.65rem]"><Clock className="w-3 h-3 inline mr-1"/> PENDIENTE</Badge>}
                                                    </td>
                                                    <td className="px-8 py-5 text-right font-black text-slate-900 dark:text-white whitespace-nowrap tabular-nums">
                                                        {row.metric}
                                                    </td>
                                                    <td className="px-8 py-5 text-right whitespace-nowrap">
                                                        <Link href={row.link}>
                                                            <Button variant="ghost" size="sm" className="cursor-pointer h-9 px-4 font-bold tracking-tight text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform hover:scale-105">
                                                                Abrir Panel
                                                            </Button>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            )})}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex flex-col gap-8">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 p-8 flex flex-col">
                                <h2 className="text-sm font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-blue-600" /> Métricas
                                </h2>
                                <div className="flex-1 min-h-[140px] bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50/50 dark:from-blue-900/10 via-transparent to-transparent">
                                    <div className="flex items-end gap-3 h-24 mb-6">
                                        <div className="w-8 bg-blue-200 dark:bg-blue-900/40 rounded-lg h-[40%] transition-all hover:h-[45%]"></div>
                                        <div className="w-8 bg-blue-300 dark:bg-blue-900/60 rounded-lg h-[60%] transition-all hover:h-[65%]"></div>
                                        <div className="w-8 bg-blue-400 dark:bg-blue-800/80 rounded-lg h-[100%] transition-all hover:h-[105%]"></div>
                                        <div className="w-8 bg-blue-600 dark:bg-blue-600 rounded-lg h-[80%] shadow-lg shadow-blue-600/20 transition-all hover:h-[85%]"></div>
                                    </div>
                                    <p className="text-[0.65rem] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] animate-pulse">Tendencia Alcista</p>
                                </div>
                            </div>

                            <div className="bg-slate-900 dark:bg-[#0a0f1c] rounded-2xl border border-white/5 p-8 flex flex-col shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                                <h2 className="text-sm font-black text-white mb-6 flex items-center gap-2 uppercase tracking-widest relative z-10">
                                    <Bell className="w-4 h-4 text-blue-500" /> Tareas Hoy
                                </h2>
                                <div className="space-y-4 relative z-10">
                                    {alerts.length > 0 ? (
                                        alerts.map((alert, i) => (
                                            <AlertItem key={i} title={alert.text} vendor={alert.time} status={alert.type === 'danger' ? 'NEW' : 'READ'} date={alert.time} />
                                        ))
                                    ) : (
                                        <div className="text-center p-8 bg-white/5 border border-white/5 rounded-xl backdrop-blur-sm">
                                            <p className="text-sm text-slate-400 font-medium leading-relaxed">No tienes tareas pendientes críticas.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

function MetricCard({ title, value, icon: Icon, trend, color = "blue" }: { title: string, value: string, icon: any, trend?: string, color?: string }) {
    const colorVariants: any = {
        blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
        emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20",
        indigo: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20",
        amber: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20",
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-7 shadow-sm border border-slate-200 dark:border-white/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-6">
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">{title}</p>
                <div className={`p-3.5 rounded-xl shadow-inner transition-colors ${colorVariants[color] || colorVariants.blue}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <div className="space-y-1">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</h3>
                {trend && (
                    <p className="text-[0.75rem] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 pt-1">
                        <Activity className="w-3.5 h-3.5" /> {trend}
                    </p>
                )}
            </div>
        </div>
    )
}

function SidebarItem({ icon: Icon, label, active = false, href }: { icon: any, label: string, active?: boolean, href: string }) {
    return (
        <Link href={href} className={`
            flex items-center gap-3.5 px-4 py-3.5 text-sm font-bold min-w-0 transition-all rounded-xl relative overflow-hidden group
            ${active 
                ? 'text-blue-600 dark:text-white bg-blue-50/80 dark:bg-blue-600 shadow-sm border border-blue-100/50 dark:border-blue-500/50' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'}
        `}>
            {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-white" />}
            <Icon className={`w-[1.125rem] h-[1.125rem] shrink-0 transition-transform group-hover:scale-110 ${active ? 'text-blue-600 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`} />
            <span className="truncate tracking-tight">{label}</span>
        </Link>
    )
}

function AlertItem({ title, vendor, status, date }: { title: string, vendor: string, status: string, date: string }) {
    const isNew = status === 'NEW'
    return (
        <div className="flex items-center gap-4 p-5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/5 transition-all group cursor-pointer">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:rotate-6 ${isNew ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                {isNew ? <Bell className="w-5 h-5 animate-pulse" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                    <p className="text-sm font-black text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase text-xs">{title}</p>
                    <span className="text-[0.65rem] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">{date}</span>
                </div>
                <p className="text-[0.7rem] font-bold text-slate-500 dark:text-slate-500 truncate uppercase mt-0.5">{vendor}</p>
            </div>
        </div>
    )
}
