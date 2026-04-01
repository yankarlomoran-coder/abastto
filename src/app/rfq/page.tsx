import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { Plus, ArrowLeft, Clock, Inbox, ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const ITEMS_PER_PAGE = 10

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
    OPEN: { label: 'ABIERTA', class: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50' },
    EVALUATING: { label: 'EVALUANDO', class: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50' },
    CLOSED: { label: 'CERRADA', class: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-transparent' },
    AWARDED: { label: 'ADJUDICADA', class: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50' },
    DRAFT_PENDING_APPROVAL: { label: 'PENDIENTE', class: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-900/50' },
}

const CATEGORY_LABELS: Record<string, string> = {
    TECH: 'Tecnología y Equipo',
    OFFICE: 'Suministros de Oficina',
    CONSTRUCTION: 'Construcción y Materiales',
    SERVICES: 'Servicios Profesionales',
    OTHER: 'Otro',
}

export default async function RfqListPage({
    searchParams
}: {
    searchParams: Promise<{ page?: string; status?: string; category?: string; q?: string }>
}) {
    const session = await auth()
    if (!session?.user?.id) return null

    const isBuyer = session.user.role === 'BUYER'
    const companyId = session.user.companyId as string
    if (!companyId) return null

    const params = await searchParams
    const currentPage = Math.max(1, parseInt(params.page || '1'))
    const statusFilter = params.status || 'ALL'
    const categoryFilter = params.category || 'ALL'
    const searchQuery = params.q || ''

    // Build where clause
    const baseWhere = isBuyer
        ? { companyId }
        : {
            OR: [
                { status: 'OPEN' as const, deadline: { gt: new Date() } },
                { bids: { some: { companyId } } }
            ]
        }

    const statusWhere = statusFilter !== 'ALL' ? { status: statusFilter as any } : {}
    const categoryWhere = categoryFilter !== 'ALL' ? { category: categoryFilter as any } : {}
    const searchWhere = searchQuery ? { title: { contains: searchQuery, mode: 'insensitive' as const } } : {}

    const where = { AND: [baseWhere, statusWhere, categoryWhere, searchWhere] }

    const [rfqs, totalCount] = await Promise.all([
        prisma.rfq.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { bids: true } }, company: { select: { name: true } } },
            skip: (currentPage - 1) * ITEMS_PER_PAGE,
            take: ITEMS_PER_PAGE,
        }),
        prisma.rfq.count({ where })
    ])

    const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE))

    // Build query string helper
    function buildUrl(overrides: Record<string, string>) {
        const p = new URLSearchParams()
        const merged = { page: currentPage.toString(), status: statusFilter, category: categoryFilter, q: searchQuery, ...overrides }
        Object.entries(merged).forEach(([k, v]) => {
            if (v && v !== 'ALL' && v !== '1' && v !== '') p.set(k, v)
            else if (k === 'page' && v !== '1') p.set(k, v)
        })
        const qs = p.toString()
        return `/rfq${qs ? `?${qs}` : ''}`
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#030712] p-4 sm:p-8 transition-colors duration-500">
            <div className="max-w-[1200px] mx-auto">
                <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 hover:bg-slate-200 dark:hover:bg-white/5 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </Link>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{isBuyer ? 'Mis Licitaciones' : 'Oportunidades de Venta'}</h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{totalCount} registro{totalCount !== 1 ? 's' : ''} encontrado{totalCount !== 1 ? 's' : ''}</p>
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

                {/* Filters bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
                    {/* Search */}
                    <div className="relative flex-1 max-w-sm">
                        <form>
                            <input
                                type="text"
                                name="q"
                                defaultValue={searchQuery}
                                placeholder="Filtrar por título..."
                                className="w-full bg-white dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl pl-4 pr-4 py-2.5 outline-none border border-slate-200 dark:border-white/10 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all"
                            />
                        </form>
                    </div>

                    {/* Status filter */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 hidden sm:block" />
                        {['ALL', 'OPEN', 'EVALUATING', 'CLOSED', ...(isBuyer ? ['DRAFT_PENDING_APPROVAL'] : [])].map(status => (
                            <Link key={status} href={buildUrl({ status, page: '1' })}>
                                <button className={`px-3 py-1.5 text-[0.7rem] font-bold rounded-lg border transition-all cursor-pointer ${
                                    statusFilter === status
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-800'
                                }`}>
                                    {status === 'ALL' ? 'Todas' : STATUS_LABELS[status]?.label || status}
                                </button>
                            </Link>
                        ))}
                    </div>

                    {/* Category filter - uses link-based navigation */}
                    {isBuyer && (
                        <div className="flex items-center gap-1 flex-wrap">
                            {['ALL', 'TECH', 'OFFICE', 'CONSTRUCTION', 'SERVICES', 'OTHER'].map(cat => (
                                <Link key={cat} href={buildUrl({ category: cat, page: '1' })}>
                                    <button className={`px-3 py-1.5 text-[0.7rem] font-bold rounded-lg border transition-all cursor-pointer ${
                                        categoryFilter === cat
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-800'
                                    }`}>
                                        {cat === 'ALL' ? 'Todas' : CATEGORY_LABELS[cat] || cat}
                                    </button>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden">
                    {rfqs.length === 0 ? (
                        <div className="p-16 text-center flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-center mb-5">
                                <Inbox className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No hay licitaciones</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                                {searchQuery || statusFilter !== 'ALL'
                                    ? 'No se encontraron resultados con los filtros seleccionados.'
                                    : 'Aún no tienes registros disponibles.'}
                            </p>
                            {(searchQuery || statusFilter !== 'ALL') && (
                                <Link href="/rfq" className="mt-4">
                                    <Button variant="outline" className="font-bold rounded-xl border-slate-200 dark:border-white/10">
                                        Limpiar filtros
                                    </Button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="w-full overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 sm:px-8 py-4">Título</th>
                                        <th className="px-6 sm:px-8 py-4">Fecha de Cierre</th>
                                        <th className="px-6 sm:px-8 py-4">Estado</th>
                                        <th className="px-6 sm:px-8 py-4 text-right">{isBuyer ? 'Ofertantes' : 'Presupuesto'}</th>
                                        <th className="px-6 sm:px-8 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {rfqs.map(rfq => {
                                        const isPast = rfq.deadline && new Date() > new Date(rfq.deadline)
                                        const effStatus = (rfq.status === 'OPEN' && isPast) ? 'EVALUATING' : rfq.status
                                        const statusInfo = STATUS_LABELS[effStatus] || { label: effStatus, class: '' }

                                        return (
                                            <tr key={rfq.id} className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors group">
                                                <td className="px-6 sm:px-8 py-5">
                                                    <p className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm tracking-tight">{rfq.title}</p>
                                                    {!isBuyer && <p className="text-[0.7rem] font-bold text-slate-500 dark:text-slate-500 mt-0.5">{rfq.company?.name}</p>}
                                                    {rfq.category && <span className="text-[0.6rem] font-bold text-slate-400 dark:text-slate-500 uppercase">{CATEGORY_LABELS[rfq.category] || rfq.category}</span>}
                                                </td>
                                                <td className="px-6 sm:px-8 py-5">
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
                                                <td className="px-6 sm:px-8 py-5">
                                                    <Badge variant="outline" className={`px-3 py-1 font-black text-[0.65rem] ${statusInfo.class}`}>
                                                        {statusInfo.label}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 sm:px-8 py-5 text-right font-black text-slate-900 dark:text-white tabular-nums">
                                                    {isBuyer ? `${rfq._count.bids} oferta${rfq._count.bids !== 1 ? 's' : ''}` : `Q ${Number(rfq.budget).toLocaleString()}`}
                                                </td>
                                                <td className="px-6 sm:px-8 py-5 text-right">
                                                    <Link href={`/rfq/${rfq.id}`}>
                                                        <Button variant="ghost" className="text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-sm">Ver Detalles</Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 sm:px-8 py-4 border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                Página {currentPage} de {totalPages}
                            </p>
                            <div className="flex items-center gap-2">
                                {currentPage > 1 ? (
                                    <Link href={buildUrl({ page: (currentPage - 1).toString() })}>
                                        <Button variant="outline" size="sm" className="h-9 px-3 rounded-lg border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 font-bold">
                                            <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                                        </Button>
                                    </Link>
                                ) : (
                                    <Button variant="outline" size="sm" disabled className="h-9 px-3 rounded-lg border-slate-200 dark:border-white/10 text-slate-400 font-bold">
                                        <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                                    </Button>
                                )}
                                
                                {/* Page numbers */}
                                <div className="hidden sm:flex items-center gap-1">
                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                        let pageNum: number
                                        if (totalPages <= 5) {
                                            pageNum = i + 1
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i
                                        } else {
                                            pageNum = currentPage - 2 + i
                                        }
                                        return (
                                            <Link key={pageNum} href={buildUrl({ page: pageNum.toString() })}>
                                                <button className={`w-9 h-9 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                    pageNum === currentPage
                                                        ? 'bg-blue-600 text-white shadow-sm'
                                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                                                }`}>
                                                    {pageNum}
                                                </button>
                                            </Link>
                                        )
                                    })}
                                </div>

                                {currentPage < totalPages ? (
                                    <Link href={buildUrl({ page: (currentPage + 1).toString() })}>
                                        <Button variant="outline" size="sm" className="h-9 px-3 rounded-lg border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 font-bold">
                                            Siguiente <ChevronRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </Link>
                                ) : (
                                    <Button variant="outline" size="sm" disabled className="h-9 px-3 rounded-lg border-slate-200 dark:border-white/10 text-slate-400 font-bold">
                                        Siguiente <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
