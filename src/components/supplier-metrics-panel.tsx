import prisma from '@/lib/prisma'
import { Star, Award, TrendingUp, Package, Clock, CheckCircle2, BarChart3 } from 'lucide-react'

type SupplierMetrics = {
    totalBids: number
    wonBids: number
    activeBids: number
    avgBidAmount: number
    winRate: number
    avgRating: number
    ratingCount: number
    ratings: {
        quality: number
        punctuality: number
        communication: number
        professionalism: number
    }
}

async function getSupplierMetrics(companyId: string): Promise<SupplierMetrics> {
    const [bids, wonBids, reviews] = await Promise.all([
        prisma.bid.findMany({
            where: { companyId },
            select: { id: true, amount: true, status: true }
        }),
        prisma.bid.count({
            where: { companyId, status: 'ACCEPTED' }
        }),
        prisma.review.aggregate({
            where: { targetCompanyId: companyId },
            _avg: {
                ratingQuality: true,
                ratingPunctuality: true,
                ratingCommunication: true,
                ratingProfessionalism: true
            },
            _count: { id: true }
        })
    ])

    const totalBids = bids.length
    const activeBids = bids.filter(b => b.status === 'PENDING').length
    const avgBidAmount = totalBids > 0 ? bids.reduce((s, b) => s + Number(b.amount), 0) / totalBids : 0
    const winRate = totalBids > 0 ? (wonBids / totalBids) * 100 : 0

    const q = reviews._avg.ratingQuality || 0
    const p = reviews._avg.ratingPunctuality || 0
    const c = reviews._avg.ratingCommunication || 0
    const pr = reviews._avg.ratingProfessionalism || 0
    const avgRating = reviews._count.id > 0 ? (q + p + c + pr) / 4 : 0

    return {
        totalBids,
        wonBids,
        activeBids,
        avgBidAmount,
        winRate,
        avgRating,
        ratingCount: reviews._count.id,
        ratings: { quality: q, punctuality: p, communication: c, professionalism: pr }
    }
}

function RatingBar({ label, value, color }: { label: string, value: number, color: string }) {
    const percentage = (value / 5) * 100
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{label}</span>
                <span className="text-xs font-black text-slate-900 dark:text-white">{value.toFixed(1)}/5.0</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ${color}`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    )
}

export async function SupplierMetricsPanel({ companyId, className = '' }: { companyId: string, className?: string }) {
    const metrics = await getSupplierMetrics(companyId)

    return (
        <div className={`rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 overflow-hidden ${className}`}>
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Perfil de Rendimiento
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Métricas operativas históricas</p>
            </div>

            <div className="p-5 space-y-6">
                {/* KPI Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-3.5 rounded-xl border border-blue-100 dark:border-blue-800/30">
                        <div className="flex items-center gap-2 mb-1.5">
                            <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-[0.6rem] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Cotizaciones</span>
                        </div>
                        <p className="text-2xl font-black text-blue-800 dark:text-blue-200">{metrics.totalBids}</p>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                        <div className="flex items-center gap-2 mb-1.5">
                            <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-[0.6rem] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Adjudicadas</span>
                        </div>
                        <p className="text-2xl font-black text-emerald-800 dark:text-emerald-200">{metrics.wonBids}</p>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/10 p-3.5 rounded-xl border border-purple-100 dark:border-purple-800/30">
                        <div className="flex items-center gap-2 mb-1.5">
                            <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <span className="text-[0.6rem] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">Efectividad</span>
                        </div>
                        <p className="text-2xl font-black text-purple-800 dark:text-purple-200">{metrics.winRate.toFixed(0)}%</p>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/10 p-3.5 rounded-xl border border-amber-100 dark:border-amber-800/30">
                        <div className="flex items-center gap-2 mb-1.5">
                            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            <span className="text-[0.6rem] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">En Proceso</span>
                        </div>
                        <p className="text-2xl font-black text-amber-800 dark:text-amber-200">{metrics.activeBids}</p>
                    </div>
                </div>

                {/* Rating Breakdown */}
                {metrics.ratingCount > 0 ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[0.65rem] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Evaluación Detallada</h4>
                            <div className="flex items-center gap-1.5">
                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                <span className="text-sm font-black text-slate-900 dark:text-white">{metrics.avgRating.toFixed(1)}</span>
                                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">({metrics.ratingCount})</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <RatingBar label="Calidad del Producto" value={metrics.ratings.quality} color="bg-blue-500" />
                            <RatingBar label="Puntualidad de Entrega" value={metrics.ratings.punctuality} color="bg-emerald-500" />
                            <RatingBar label="Comunicación" value={metrics.ratings.communication} color="bg-purple-500" />
                            <RatingBar label="Profesionalismo" value={metrics.ratings.professionalism} color="bg-amber-500" />
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4 text-slate-400 dark:text-slate-500">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-xs font-bold">Sin evaluaciones registradas</p>
                    </div>
                )}
            </div>
        </div>
    )
}
