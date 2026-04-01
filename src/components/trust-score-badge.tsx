import prisma from '@/lib/prisma'
import { Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export async function TrustScoreBadge({ companyId, className = "" }: { companyId: string, className?: string }) {
    // Agregar las métricas agregadas directamente desde PostgreSQL
    const stats = await prisma.review.aggregate({
        where: { targetCompanyId: companyId },
        _avg: {
            ratingQuality: true,
            ratingPunctuality: true,
            ratingCommunication: true,
            ratingProfessionalism: true
        },
        _count: { id: true }
    })

    const count = stats._count.id

    if (count === 0) {
        return (
            <Badge variant="outline" className={`text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 px-3 py-1 rounded-full font-medium ${className}`}>
                Sin Calificaciones Comerciales
            </Badge>
        )
    }

    // Promedio global sumando los promedios de cada pilar
    const q = stats._avg.ratingQuality || 0
    const p = stats._avg.ratingPunctuality || 0
    const c = stats._avg.ratingCommunication || 0
    const pr = stats._avg.ratingProfessionalism || 0

    const globalScore = (q + p + c + pr) / 4

    // Determinar el color en base al score
    let colorClass = "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
    if (globalScore >= 4.5) colorClass = "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
    else if (globalScore <= 3.0) colorClass = "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"

    return (
        <Badge variant="outline" className={`flex items-center gap-1 font-semibold ${colorClass} ${className}`}>
            <Star className={`h-3 w-3 ${globalScore >= 4.5 ? 'fill-emerald-600' : 'fill-amber-500'}`} />
            {globalScore.toFixed(1)} <span className="text-xs font-normal opacity-70 ml-1">({count})</span>
        </Badge>
    )
}
