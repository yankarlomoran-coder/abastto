import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import {
    ArrowLeft, Building2, MapPin, ShieldCheck, Shield, Star,
    Users, FileText, Calendar, ExternalLink, MessageSquare
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SupplierMetricsPanel } from "@/components/supplier-metrics-panel"

const INDUSTRY_LABELS: Record<string, string> = {
    AGRICULTURA: 'Agricultura', CONSTRUCCION: 'Construcción', ESTADO_GOBIERNO: 'Estado / Gobierno',
    MANUFACTURA: 'Manufactura', MEDICAL_SALUD: 'Salud', RETAIL_COMERCIO: 'Retail / Comercio',
    SERVICIOS_PROFESIONALES: 'Servicios Profesionales', TECNOLOGIA: 'Tecnología',
    TRANSPORTE_LOGISTICA: 'Transporte / Logística', OTRO: 'Otro',
}

const LOCATION_LABELS: Record<string, string> = {
    GUATEMALA: 'Guatemala', QUETZALTENANGO: 'Quetzaltenango', ESCUINTLA: 'Escuintla',
    SACATEPEQUEZ: 'Sacatepéquez', ALTA_VERAPAZ: 'Alta Verapaz', BAJA_VERAPAZ: 'Baja Verapaz',
    CHIMALTENANGO: 'Chimaltenango', CHIQUIMULA: 'Chiquimula', EL_PROGRESO: 'El Progreso',
    HUEHUETENANGO: 'Huehuetenango', IZABAL: 'Izabal', JALAPA: 'Jalapa', JUTIAPA: 'Jutiapa',
    PETEN: 'Petén', QUICHE: 'Quiché', RETALHULEU: 'Retalhuleu', SAN_MARCOS: 'San Marcos',
    SANTA_ROSA: 'Santa Rosa', SOLOLA: 'Sololá', SUCHITEPEQUEZ: 'Suchitepéquez',
    TOTONICAPAN: 'Totonicapán', ZACAPA: 'Zacapa',
}

export default async function CompanyProfilePage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const session = await auth()
    if (!session?.user?.id) redirect('/login')

    const { id } = await params

    const company = await prisma.company.findUnique({
        where: { id },
        include: {
            _count: { select: { rfqs: true, bids: true, users: true, receivedReviews: true } },
            receivedReviews: {
                include: {
                    authorCompany: { select: { name: true } },
                    rfq: { select: { title: true } }
                },
                orderBy: { createdAt: 'desc' },
                take: 10
            }
        }
    })

    if (!company) notFound()

    // Calculate trust score
    const reviews = company.receivedReviews
    let trustScore = 0
    const ratingBreakdown = { quality: 0, punctuality: 0, communication: 0, professionalism: 0 }
    if (reviews.length > 0) {
        ratingBreakdown.quality = reviews.reduce((s, r) => s + r.ratingQuality, 0) / reviews.length
        ratingBreakdown.punctuality = reviews.reduce((s, r) => s + r.ratingPunctuality, 0) / reviews.length
        ratingBreakdown.communication = reviews.reduce((s, r) => s + r.ratingCommunication, 0) / reviews.length
        ratingBreakdown.professionalism = reviews.reduce((s, r) => s + r.ratingProfessionalism, 0) / reviews.length
        trustScore = Math.round(((ratingBreakdown.quality + ratingBreakdown.punctuality + ratingBreakdown.communication + ratingBreakdown.professionalism) / 4) * 20)
    }

    // Recent completed RFQs (public activity)
    const isOwnCompany = session.user.companyId === company.id
    const completedRfqs = await prisma.rfq.findMany({
        where: {
            status: { in: ['CLOSED', 'AWARDED'] },
            OR: [
                { companyId: company.id },
                { bids: { some: { companyId: company.id, status: 'ACCEPTED' } } }
            ]
        },
        select: { id: true, title: true, category: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
    })

    const scoreColor = trustScore >= 80 ? 'text-emerald-600 dark:text-emerald-400' : trustScore >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#030712] p-4 sm:p-8 transition-colors duration-500">
            <div className="max-w-[900px] mx-auto">
                {/* Back link */}
                <Link href="/network" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Red de Proveedores
                </Link>

                {/* Company Header Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 p-8 mb-6">
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-3xl shrink-0 shadow-lg shadow-blue-600/10">
                            {company.name[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{company.name}</h1>
                                {company.isVerified && (
                                    <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                                        <ShieldCheck className="w-4 h-4" />
                                        <span className="text-xs font-black">Verificada</span>
                                    </div>
                                )}
                                {!company.isVerified && (
                                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-500 px-3 py-1 rounded-full border border-slate-200 dark:border-white/10">
                                        <Shield className="w-4 h-4" />
                                        <span className="text-xs font-bold">Sin verificar</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
                                    <Building2 className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                    {INDUSTRY_LABELS[company.industry] || company.industry}
                                </span>
                                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
                                    <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                    {LOCATION_LABELS[company.department] || company.department}
                                </span>
                                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
                                    <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                    Miembro desde {new Date(company.createdAt).toLocaleDateString('es-GT', { year: 'numeric', month: 'long' })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-white/5">
                        <div className="text-center">
                            <p className={`text-3xl font-black ${scoreColor}`}>{trustScore || '—'}</p>
                            <p className="text-[0.65rem] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Índice de Confianza</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-black text-slate-900 dark:text-white">{company._count.receivedReviews}</p>
                            <p className="text-[0.65rem] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Reseñas</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-black text-slate-900 dark:text-white">{company._count.rfqs + company._count.bids}</p>
                            <p className="text-[0.65rem] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Transacciones</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-black text-slate-900 dark:text-white">{company._count.users}</p>
                            <p className="text-[0.65rem] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Miembros</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                    {/* Left column */}
                    <div className="space-y-6">
                        {/* Rating Breakdown */}
                        {reviews.length > 0 && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 p-6">
                                <h2 className="text-lg font-black text-slate-900 dark:text-white mb-5">Desglose de Reputación</h2>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Calidad', value: ratingBreakdown.quality },
                                        { label: 'Puntualidad', value: ratingBreakdown.punctuality },
                                        { label: 'Comunicación', value: ratingBreakdown.communication },
                                        { label: 'Profesionalismo', value: ratingBreakdown.professionalism },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex items-center gap-4">
                                            <span className="text-sm font-bold text-slate-600 dark:text-slate-400 w-32 shrink-0">{label}</span>
                                            <div className="flex-1 h-2.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                                                    style={{ width: `${(value / 5) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-black text-slate-900 dark:text-white w-8 text-right">{value.toFixed(1)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reviews */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 p-6">
                            <h2 className="text-lg font-black text-slate-900 dark:text-white mb-5">
                                Reseñas Recibidas {reviews.length > 0 && <span className="text-slate-400 font-bold">({reviews.length})</span>}
                            </h2>
                            {reviews.length === 0 ? (
                                <div className="text-center py-8">
                                    <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Esta empresa aún no ha recibido reseñas.</p>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {reviews.map(review => {
                                        const avg = (review.ratingQuality + review.ratingPunctuality + review.ratingCommunication + review.ratingProfessionalism) / 4
                                        return (
                                            <div key={review.id} className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xs">
                                                            {review.authorCompany.name[0]?.toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{review.authorCompany.name}</p>
                                                            <p className="text-[0.6rem] text-slate-400 dark:text-slate-500 font-medium">{review.rfq.title}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                                        <span className="text-sm font-black text-slate-900 dark:text-white">{avg.toFixed(1)}</span>
                                                    </div>
                                                </div>
                                                {review.comment && (
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mt-2 leading-relaxed">{review.comment}</p>
                                                )}
                                                <p className="text-[0.6rem] text-slate-400 dark:text-slate-500 font-bold mt-2">
                                                    {new Date(review.createdAt).toLocaleDateString('es-GT', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </p>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right sidebar */}
                    <div className="space-y-6">
                        {/* Quick Info */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 p-6">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Actividad Reciente</h3>
                            {completedRfqs.length === 0 ? (
                                <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">Sin actividad pública reciente.</p>
                            ) : (
                                <div className="space-y-3">
                                    {completedRfqs.map(rfq => (
                                        <Link key={rfq.id} href={`/rfq/${rfq.id}`} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                            <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{rfq.title}</p>
                                                <p className="text-[0.6rem] text-slate-400 dark:text-slate-500 font-medium">
                                                    {new Date(rfq.createdAt).toLocaleDateString('es-GT', { month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* NIT Info */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 p-6">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3 uppercase tracking-wider">Información Fiscal</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">NIT</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{company.nit}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">Verificación</span>
                                    <Badge variant="outline" className={`text-[0.6rem] font-bold px-2 ${
                                        company.kycStatus === 'APPROVED'
                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                            : company.kycStatus === 'PENDING'
                                            ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                            : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                                    }`}>
                                        {company.kycStatus === 'APPROVED' ? 'Aprobado' : company.kycStatus === 'PENDING' ? 'Pendiente' : 'Rechazado'}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Supplier Performance Metrics */}
                        <SupplierMetricsPanel companyId={company.id} />
                    </div>
                </div>
            </div>
        </div>
    )
}
