import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Clock, DollarSign, Search, Bell, BarChart3, Users, Settings, Inbox, LayoutDashboard, FileText, Activity, AlertCircle, LogOut } from "lucide-react"
import { TrustScoreBadge } from "@/components/trust-score-badge"
import Footer from "@/components/layout/footer"

export default async function DashboardPage() {
    const session = await auth()
    if (!session?.user || !session.user.companyId) {
        redirect("/login")
    }

    const { role, name, companyId } = session.user
    
    // Server Component best practice: Parallel data fetching
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
        <div className="flex min-h-screen bg-[#f7f9fb] text-[#2a3439] font-sans">
            {/* Sidebar */}
            <aside className="w-[260px] bg-[#f0f4f7] border-r border-[#e8eff3] flex-shrink-0 hidden md:flex flex-col">
                <div className="p-6 pb-8">
                    <Link href="/" className="flex items-center gap-3 text-[#0053db] font-black text-2xl tracking-tighter cursor-pointer hover:opacity-80 transition-opacity">
                        <BoxIcon className="w-8 h-8" /> ABASTTO
                    </Link>
                </div>
                
                <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
                    <SidebarItem icon={LayoutDashboard} label="Inicio" active href="/dashboard" />
                    <SidebarItem icon={FileText} label={isBuyer ? "Mis Licitaciones" : "Oportunidades"} href="/rfq" />
                    {isBuyer && <SidebarItem icon={Activity} label="Analíticas Generales" href="/analytics" />}
                    <SidebarItem icon={Users} label="Red de Proveedores" href="/network" />
                    
                    <div className="pt-8 pb-3 px-3 text-[0.6875rem] font-bold tracking-[0.05em] text-[#566166] uppercase">
                        Administración
                    </div>
                    <SidebarItem icon={Settings} label="Ajustes de Plataforma" href="/settings" />
                    <SidebarItem icon={Users} label="Directorio de Equipo" href="/settings/team" />
                </nav>

                <div className="p-4 mt-auto border-t border-[#e8eff3] bg-[#f0f4f7]">
                    <form action={async () => { "use server"; await signOut({ redirectTo: '/login' }) }}>
                        <button className="cursor-pointer flex items-center w-full gap-3 px-3 py-2.5 text-sm font-semibold text-[#752121] rounded-lg hover:bg-[#fff7f6] hover:border hover:border-[#fe8983] border border-transparent transition-all">
                            <LogOut className="w-4 h-4" /> Cerrar Sesión
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content Arena */}
            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-[#f7f9fb]">
                {/* Search Header */}
                <header className="h-[72px] bg-[#ffffff] border-b border-[#e8eff3] flex items-center justify-between px-8 sticky top-0 z-20 shrink-0">
                    <div className="flex items-center w-[400px]">
                        <div className="relative w-full">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#a9b4b9]" />
                            <input 
                                type="text" 
                                placeholder="🔍 Búsqueda rápida de empresas o RFQs..." 
                                className="w-full bg-[#f0f4f7] text-sm font-medium text-[#2a3439] placeholder-[#a9b4b9] rounded-md pl-11 pr-4 py-2.5 outline-none hover:bg-[#e8eff3] focus:bg-[#ffffff] focus:ring-1 focus:ring-[#0053db] border border-transparent focus:border-[#0053db] transition-all shadow-inner"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link href="/notifications">
                            <button className="cursor-pointer relative text-[#566166] hover:text-[#0053db] transition-colors p-2 hover:bg-[#f0f4f7] rounded-full">
                                <Bell className="w-[22px] h-[22px]" />
                                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#fe8983] border-2 border-[#ffffff] rounded-full"></span>
                            </button>
                        </Link>
                        <div className="w-px h-6 bg-[#e8eff3]"></div>
                        <Link href="/settings">
                            <div className="flex items-center gap-3 cursor-pointer group">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-[#2a3439] group-hover:text-[#0053db] transition-colors">{name}</p>
                                    <p className="text-[0.6875rem] font-semibold text-[#717c82] uppercase tracking-wide">{role === 'BUYER' ? 'Comprador' : 'Proveedor'}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#dbe1ff] to-[#c7d3ff] text-[#003798] flex items-center justify-center font-bold border border-[#c5d6f0] shadow-sm">
                                    {name?.[0]?.toUpperCase()}
                                </div>
                            </div>
                        </Link>
                    </div>
                </header>

                <div className="flex-1 p-8 xl:p-12 max-w-[1400px] w-full mx-auto space-y-10">
                    
                    {/* Editorial Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-[#e8eff3] pb-6">
                        <div className="space-y-1">
                            <h1 className="text-[2rem] font-black tracking-[-0.02em] text-[#0b0f10] leading-none">Resumen Operativo</h1>
                            <p className="text-[#566166] text-[0.875rem] font-medium leading-relaxed max-w-xl">Monitorea tus KPIs financieros y visualiza el estado en tiempo real de todas tus licitaciones.</p>
                        </div>
                        {isBuyer && (
                            <Link href="/rfq/create">
                                <Button className="cursor-pointer bg-gradient-to-br from-[#0053db] to-[#0048c1] hover:from-[#0048c1] hover:to-[#003798] text-[#ffffff] shadow-[0_8px_20px_-6px_rgba(0,83,219,0.5)] border-0 h-11 px-8 rounded-[0.375rem] font-bold text-[0.875rem] tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98]">
                                    <Plus className="w-[18px] h-[18px] mr-2" /> Nueva Licitación
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* KPI Cards (Minimalist Tonal Depth) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <MetricCard 
                            title={isBuyer ? "Total Adjudicado" : "Pipeline Ganado"} 
                            value={`Q ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                            icon={DollarSign} 
                            trend={totalValue > 0 ? "+12.4% este trimestre" : undefined}
                        />
                        <MetricCard 
                            title={isBuyer ? "Licitaciones Abiertas" : "Ofertas Enviadas"} 
                            value={activeCount.toString()} 
                            icon={Activity} 
                        />
                        <MetricCard 
                            title={isBuyer ? "Acuerdos Cerrados" : "Contratos Ganados"} 
                            value={successCount.toString()} 
                            icon={CheckCircle2} 
                        />
                        <div className="bg-[#ffffff] rounded-xl p-6 shadow-[0_4px_24px_rgba(42,52,57,0.03)] border border-[#e1e9ee] flex flex-col justify-between hover:shadow-[0_8px_30px_rgba(42,52,57,0.06)] transition-shadow">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-[0.6875rem] font-bold uppercase tracking-[0.05em] text-[#566166]">B2B Trust Score</h3>
                                <div className="p-2.5 bg-[#e3dbfd] text-[#3e3a54] rounded-lg shadow-inner"><Star className="w-[18px] h-[18px]" /></div>
                            </div>
                            <div className="flex-1 max-w-full overflow-hidden flex items-end">
                                <TrustScoreBadge companyId={companyId} className="w-fit text-[0.875rem] py-1 px-3 bg-[#f7f9fb] border-[#e8eff3] max-w-full truncate" />
                            </div>
                        </div>
                    </div>

                    {/* Information Rail Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8">
                        {/* THE MAIN STAGE: Active Solicitations */}
                        <div className="bg-[#ffffff] rounded-xl shadow-[0_6px_32px_rgba(42,52,57,0.03)] border border-[#e1e9ee] overflow-hidden flex flex-col">
                            <div className="px-6 py-5 flex justify-between items-center bg-[#fcfdff] border-b border-[#e8eff3]">
                                <h2 className="text-[1.125rem] font-black text-[#0b0f10] tracking-tight">{isBuyer ? 'Licitaciones Recientes' : 'Mercado: Oportunidades'}</h2>
                                <Link href="/rfq">
                                    <Button variant="ghost" className="cursor-pointer text-[#003798] hover:bg-[#dbe1ff] hover:text-[#003798] text-[0.875rem] font-bold h-9 px-4 rounded-md transition-colors">
                                        Ver historial completo
                                    </Button>
                                </Link>
                            </div>
                            
                            {tableData.length === 0 ? (
                                <div className="p-16 text-center flex flex-col items-center justify-center bg-[#f7f9fb]/50">
                                    <div className="w-20 h-20 bg-[#ffffff] shadow-sm border border-[#e8eff3] rounded-full flex items-center justify-center mb-5">
                                        <Inbox className="w-10 h-10 text-[#a9b4b9]" />
                                    </div>
                                    <h3 className="text-[1.125rem] font-black tracking-tight text-[#2a3439]">Bandeja Limpia</h3>
                                    <p className="text-[0.875rem] text-[#566166] mt-2 max-w-sm font-medium leading-relaxed">No hay transacciones activas en este momento. {isBuyer ? 'Inicia un nuevo proceso para cotizar.' : 'Revisa más tarde para nuevas oportunidades.'}</p>
                                </div>
                            ) : (
                                <div className="w-full overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-[#f0f4f7] text-[0.6875rem] font-bold uppercase tracking-[0.05em] text-[#566166]">
                                                <th className="px-6 py-3.5 border-b border-[#e1e9ee]">Referencia Comercial</th>
                                                <th className="px-6 py-3.5 border-b border-[#e1e9ee]">Fecha Límite</th>
                                                <th className="px-6 py-3.5 border-b border-[#e1e9ee]">Estado</th>
                                                <th className="px-6 py-3.5 border-b border-[#e1e9ee] text-right">{isBuyer ? 'Volumen' : 'Presupuesto'}</th>
                                                <th className="px-6 py-3.5 border-b border-[#e1e9ee]"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-[0.875rem] divide-y divide-[#f0f4f7]">
                                            {tableData.map((row) => {
                                                const isPastDeadline = row.deadline && new Date() > new Date(row.deadline)
                                                const effectiveStatus = row.status === 'OPEN' && isPastDeadline ? 'EVALUATING' : row.status
                                                return (
                                                <tr key={row.id} className="hover:bg-[#f7f9fb] transition-colors group">
                                                    <td className="px-6 py-4.5">
                                                        <p className="font-bold text-[#0b0f10] tracking-tight">{row.title}</p>
                                                        {!isBuyer && <p className="text-[0.75rem] font-semibold text-[#717c82] mt-1">{row.companyName}</p>}
                                                    </td>
                                                    <td className="px-6 py-4.5 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className={`w-4 h-4 ${isPastDeadline ? 'text-[#9f403d]' : 'text-[#a9b4b9]'}`} />
                                                            <div className="flex flex-col">
                                                                <span className={`font-semibold ${isPastDeadline ? 'text-[#9f403d]' : 'text-[#2a3439]'}`}>{new Date(row.deadline).toLocaleDateString('es-GT', { month: 'short', day: 'numeric' })}</span>
                                                                <span className="text-[0.6875rem] font-bold text-[#717c82]">{new Date(row.deadline).toLocaleTimeString('es-GT', {hour: '2-digit', minute:'2-digit'})}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4.5 whitespace-nowrap">
                                                        {effectiveStatus === 'OPEN' && <Badge variant="outline" className="bg-[#f0f4f7] text-[#003798] border-[#c5d6f0] px-3 py-1 font-bold text-[0.6875rem]">ABIERTA</Badge>}
                                                        {effectiveStatus === 'EVALUATING' && <Badge variant="outline" className="bg-[#fff7f6] text-[#9f403d] border-[#fe8983] px-3 py-1 font-bold text-[0.6875rem]">EVALUANDO</Badge>}
                                                        {effectiveStatus === 'CLOSED' && <Badge variant="outline" className="bg-[#f7f9fb] text-[#566166] border-[#e8eff3] shadow-none px-3 py-1 font-bold text-[0.6875rem]">CERRADA</Badge>}
                                                        {effectiveStatus === 'DRAFT_PENDING_APPROVAL' && <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1 font-bold text-[0.6875rem]"><Clock className="w-3 h-3 inline mr-1"/> ESPERANDO APROBACIÓN</Badge>}
                                                    </td>
                                                    <td className="px-6 py-4.5 text-right font-bold text-[#2a3439] whitespace-nowrap">
                                                        {row.metric}
                                                    </td>
                                                    <td className="px-6 py-4.5 text-right whitespace-nowrap">
                                                        <Link href={row.link}>
                                                            <Button variant="ghost" size="sm" className="cursor-pointer h-9 font-bold tracking-wide text-[#0053db] hover:bg-[#dbe1ff] opacity-0 group-hover:opacity-100 transition-opacity">
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
                        
                        {/* THE RAIL: Secondary Activity */}
                        <div className="flex flex-col gap-6">
                            {/* Monthly Activity Mini Chart */}
                            <div className="bg-[#ffffff] rounded-xl shadow-[0_4px_20px_rgba(42,52,57,0.02)] border border-[#e1e9ee] p-6 flex flex-col">
                                <h2 className="text-[0.875rem] font-bold text-[#0b0f10] mb-4">Métricas de Actividad</h2>
                                <div className="flex-1 min-h-[140px] bg-[#f7f9fb] rounded-lg border border-[#e8eff3] flex flex-col items-center justify-center p-4">
                                    <div className="flex items-end gap-2 h-16 mb-3">
                                        <div className="w-6 bg-[#dbe1ff] rounded-t-sm h-[40%]"></div>
                                        <div className="w-6 bg-[#dbe1ff] rounded-t-sm h-[60%]"></div>
                                        <div className="w-6 bg-[#dbe1ff] rounded-t-sm h-[100%]"></div>
                                        <div className="w-6 bg-[#0053db] rounded-t-sm h-[80%] shadow-[0_0_10px_rgba(0,83,219,0.3)]"></div>
                                    </div>
                                    <p className="text-[0.75rem] font-semibold text-[#566166] uppercase tracking-wide">Tendencia Alcista</p>
                                </div>
                            </div>

                            {/* Alert Inbox */}
                            <div className="bg-[#f0f4f7] rounded-xl border border-[#e8eff3] p-6 flex flex-col shadow-inner">
                                <h2 className="text-[0.875rem] font-bold text-[#0b0f10] mb-5 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#0053db]"></div> Tareas Pendientes
                                </h2>
                                <div className="space-y-3">
                                    {alerts.length > 0 ? (
                                        alerts.map((alert, i) => (
                                            <AlertItem key={i} text={alert.text} time={alert.time} type={alert.type} />
                                        ))
                                    ) : (
                                        <div className="text-center p-4 bg-[#ffffff] border border-[#e1e9ee] rounded-lg shadow-sm">
                                            <p className="text-[0.875rem] text-[#566166] font-medium">No tienes tareas pendientes urgentes en este momento.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </main>
        </div>
    )
}

function MetricCard({ title, value, icon: Icon, trend }: any) {
    return (
        <div className="bg-[#ffffff] rounded-xl p-6 shadow-[0_4px_24px_rgba(42,52,57,0.03)] border border-[#e1e9ee] flex flex-col justify-between hover:shadow-[0_8px_30px_rgba(42,52,57,0.06)] transition-shadow">
            <div className="flex justify-between items-start mb-6">
                <h3 className="text-[0.6875rem] font-bold uppercase tracking-[0.05em] text-[#566166] leading-snug break-words pr-4">{title}</h3>
                <div className="p-2.5 bg-[#dbe1ff] text-[#003798] rounded-lg shrink-0 shadow-inner"><Icon className="w-[18px] h-[18px]" /></div>
            </div>
            <div>
                <p className="text-[2rem] font-black text-[#0b0f10] tabular-nums tracking-tighter leading-none mb-1.5">{value}</p>
                {trend && <p className="text-[0.75rem] text-[#0053db] font-bold tracking-wide">{trend}</p>}
            </div>
        </div>
    )
}

function SidebarItem({ icon: Icon, label, active, href = "#" }: any) {
    return (
        <Link href={href} className={`cursor-pointer flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[0.875rem] font-semibold transition-all ${active ? 'bg-[#ffffff] text-[#003798] shadow-[0_2px_8px_rgba(42,52,57,0.04)] border border-[#e8eff3]' : 'text-[#435368] hover:bg-[#e1e9ee] hover:text-[#0b0f10]'}`}>
            <Icon className="w-[18px] h-[18px]" /> {label}
        </Link>
    )
}

function AlertItem({ text, time, type }: any) {
    const tokens = {
        warn: { bg: 'bg-[#fff7f6]', border: 'border-[#fe8983]', text: 'text-[#9f403d]', dot: 'bg-[#fe8983]' },
        danger: { bg: 'bg-[#4e0309]', border: 'border-[#9f403d]', text: 'text-[#fff7f6]', dot: 'bg-[#9f403d]' },
        info: { bg: 'bg-[#ffffff]', border: 'border-[#e1e9ee]', text: 'text-[#2a3439]', dot: 'bg-[#0053db]' },
        success: { bg: 'bg-[#d3e4fe]', border: 'border-[#c5d6f0]', text: 'text-[#314055]', dot: 'bg-[#618bff]' },
    }[type as string] || { bg: 'bg-[#ffffff]', border: 'border-[#e8eff3]', text: 'text-[#2a3439]', dot: 'bg-[#a9b4b9]' }

    return (
        <div className={`p-3.5 rounded-lg border ${tokens.bg} ${tokens.border} shadow-[0_2px_8px_rgba(42,52,57,0.02)] flex flex-col gap-1.5 hover:scale-[1.01] transition-transform cursor-pointer`}>
            <div className="flex justify-between items-start">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${tokens.dot} shadow-sm`}></div>
                <p className={`text-[0.875rem] font-bold ml-3 flex-1 leading-snug tracking-tight ${tokens.text}`}>{text}</p>
            </div>
            <p className="text-[0.6875rem] text-[#717c82] ml-5 font-bold tracking-wide uppercase">{time}</p>
        </div>
    )
}

function CheckCircle2(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
}
function Star(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
}
function BoxIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
}
