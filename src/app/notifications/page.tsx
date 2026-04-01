import { auth } from "@/auth"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { BellRing, ArrowLeft, CheckCircle2, AlertTriangle, Clock, Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { redirect } from "next/navigation"

export default async function NotificationsPage() {
    const session = await auth()
    if (!session?.user?.id || !session.user.companyId) redirect('/login')

    const isBuyer = session.user.role === 'BUYER'
    const companyId = session.user.companyId

    // Build real notifications from actual data
    const notifications: { id: string; title: string; description: string; time: string; type: 'info' | 'success' | 'warning' | 'danger'; read: boolean }[] = []

    if (isBuyer) {
        // Notify about bids received on their RFQs
        const recentBids = await prisma.bid.findMany({
            where: { rfq: { companyId }, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
            include: { company: true, rfq: { select: { title: true } } },
            orderBy: { createdAt: 'desc' },
            take: 10
        })
        recentBids.forEach(bid => {
            notifications.push({
                id: bid.id,
                title: `Nueva oferta recibida`,
                description: `${bid.company.name} envió una oferta de Q ${Number(bid.amount).toLocaleString()} para "${bid.rfq.title}"`,
                time: timeAgo(bid.createdAt),
                type: 'info',
                read: false
            })
        })

        // Notify about RFQs closing soon
        const closingRfqs = await prisma.rfq.findMany({
            where: { companyId, status: 'OPEN', deadline: { lte: new Date(Date.now() + 24 * 60 * 60 * 1000), gte: new Date() } },
            select: { id: true, title: true, deadline: true }
        })
        closingRfqs.forEach(rfq => {
            notifications.push({
                id: `closing-${rfq.id}`,
                title: `Licitación cierra pronto`,
                description: `"${rfq.title}" cierra el ${new Date(rfq.deadline).toLocaleDateString('es-GT', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
                time: 'Urgente',
                type: 'danger',
                read: false
            })
        })
    } else {
        // Notify about accepted bids
        const wonBids = await prisma.bid.findMany({
            where: { companyId, status: 'ACCEPTED', updatedAt: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) } },
            include: { rfq: { select: { title: true } } },
            orderBy: { updatedAt: 'desc' },
            take: 5
        })
        wonBids.forEach(bid => {
            notifications.push({
                id: bid.id,
                title: `¡Oferta aceptada!`,
                description: `Tu oferta de Q ${Number(bid.amount).toLocaleString()} fue aceptada para "${bid.rfq.title}"`,
                time: timeAgo(bid.updatedAt),
                type: 'success',
                read: false
            })
        })

        // Notify about new open RFQs
        const newRfqs = await prisma.rfq.findMany({
            where: { status: 'OPEN', deadline: { gt: new Date() }, createdAt: { gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) } },
            include: { company: true },
            orderBy: { createdAt: 'desc' },
            take: 8
        })
        newRfqs.forEach(rfq => {
            notifications.push({
                id: `new-${rfq.id}`,
                title: `Nueva oportunidad disponible`,
                description: `${rfq.company.name} publicó "${rfq.title}" — Presupuesto: Q ${Number(rfq.budget).toLocaleString()}`,
                time: timeAgo(rfq.createdAt),
                type: 'info',
                read: false
            })
        })
    }

    // Sort by most recent
    notifications.sort((a, b) => {
        if (a.type === 'danger') return -1
        if (b.type === 'danger') return 1
        return 0
    })

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#030712] p-4 sm:p-8 transition-colors duration-500">
            <div className="max-w-[800px] mx-auto">
                <header className="flex items-center gap-4 mb-8">
                    <Link href="/dashboard" className="p-2 hover:bg-slate-200 dark:hover:bg-white/5 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Centro de Notificaciones</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Alertas y actualizaciones de tus procesos de negocio</p>
                    </div>
                </header>

                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden transition-colors">
                    {notifications.length === 0 ? (
                        <div className="p-16 text-center flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-center mb-5">
                                <Inbox className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Estás al día</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium max-w-sm">
                                No tienes notificaciones pendientes. Aquí aparecerán tus alertas, mensajes y actualizaciones en tiempo real.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-white/5">
                            {notifications.map((notif) => (
                                <div key={notif.id} className="flex items-start gap-4 p-5 sm:p-6 hover:bg-slate-50 dark:hover:bg-white/5 transition-all group cursor-pointer">
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                                        notif.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' :
                                        notif.type === 'danger' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
                                        notif.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' :
                                        'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                    }`}>
                                        {notif.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                                        {notif.type === 'danger' && <AlertTriangle className="w-5 h-5" />}
                                        {notif.type === 'warning' && <Clock className="w-5 h-5" />}
                                        {notif.type === 'info' && <BellRing className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2 mb-1">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{notif.title}</p>
                                            <Badge variant="outline" className={`text-[0.6rem] px-2 py-0.5 font-black whitespace-nowrap shrink-0 ${
                                                notif.type === 'danger' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800' :
                                                'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10'
                                            }`}>
                                                {notif.time}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{notif.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function timeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'Ahora'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `Hace ${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `Hace ${hours}h`
    const days = Math.floor(hours / 24)
    if (days < 7) return `Hace ${days}d`
    return `Hace ${Math.floor(days / 7)}sem`
}
