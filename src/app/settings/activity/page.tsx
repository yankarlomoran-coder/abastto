import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getActivityLog } from "@/lib/activity-log"
import {
    FileText, Gavel, ShieldCheck, UserPlus, Star, Upload, LogIn, Settings, ScrollText
} from "lucide-react"

const ACTION_CONFIG: Record<string, { icon: typeof FileText; color: string; label: string }> = {
    RFQ_CREATED: { icon: FileText, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20', label: 'Licitación Creada' },
    RFQ_UPDATED: { icon: FileText, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20', label: 'Licitación Actualizada' },
    RFQ_CLOSED: { icon: FileText, color: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-white/5', label: 'Licitación Cerrada' },
    BID_SUBMITTED: { icon: Gavel, color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20', label: 'Oferta Enviada' },
    BID_ACCEPTED: { icon: Gavel, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20', label: 'Oferta Aceptada' },
    BID_REJECTED: { icon: Gavel, color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20', label: 'Oferta Rechazada' },
    KYC_SUBMITTED: { icon: ShieldCheck, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20', label: 'KYC Enviado' },
    DOCUMENT_UPLOADED: { icon: Upload, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20', label: 'Documento Subido' },
    MEMBER_INVITED: { icon: UserPlus, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20', label: 'Miembro Invitado' },
    MEMBER_JOINED: { icon: UserPlus, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20', label: 'Miembro Unido' },
    REVIEW_SUBMITTED: { icon: Star, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20', label: 'Reseña Enviada' },
    LOGIN: { icon: LogIn, color: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-white/5', label: 'Inicio de Sesión' },
    SETTINGS_UPDATED: { icon: Settings, color: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-white/5', label: 'Ajustes Actualizados' },
}

function timeAgo(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Ahora mismo'
    if (diffMins < 60) return `Hace ${diffMins} min`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `Hace ${diffHours}h`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `Hace ${diffDays}d`
    return date.toLocaleDateString('es-GT', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function ActivityLogPage() {
    const session = await auth()
    if (!session?.user?.companyId) redirect('/login')

    const logs = await getActivityLog({ companyId: session.user.companyId, limit: 50 })

    return (
        <div className="max-w-4xl">
            <div className="mb-10 border-b dark:border-white/5 pb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Historial de Actividad</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Registro completo de todas las acciones realizadas en tu empresa.
                </p>
            </div>

            {logs.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 p-16 text-center">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <ScrollText className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sin actividad registrada</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        Las acciones de tu equipo aparecerán aquí automáticamente.
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                        {logs.map((log) => {
                            const config = ACTION_CONFIG[log.action] || {
                                icon: FileText,
                                color: 'text-slate-500 bg-slate-50 dark:bg-white/5',
                                label: log.action
                            }
                            const Icon = config.icon

                            return (
                                <div key={log.id} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.color}`}>
                                        <Icon className="w-4.5 h-4.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-[0.65rem] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                {config.label}
                                            </span>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                                            {log.description}
                                        </p>
                                    </div>
                                    <span className="text-[0.7rem] font-bold text-slate-400 dark:text-slate-500 shrink-0 mt-1">
                                        {timeAgo(new Date(log.createdAt))}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
