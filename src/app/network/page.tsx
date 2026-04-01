import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft, Search, Building2, MapPin, Shield, ShieldCheck, Star, Users, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"

const INDUSTRY_LABELS: Record<string, string> = {
    AGRICULTURA: 'Agricultura',
    CONSTRUCCION: 'Construcción',
    ESTADO_GOBIERNO: 'Estado / Gobierno',
    MANUFACTURA: 'Manufactura',
    MEDICAL_SALUD: 'Salud',
    RETAIL_COMERCIO: 'Retail / Comercio',
    SERVICIOS_PROFESIONALES: 'Servicios Profesionales',
    TECNOLOGIA: 'Tecnología',
    TRANSPORTE_LOGISTICA: 'Transporte / Logística',
    OTRO: 'Otro',
}

const LOCATION_LABELS: Record<string, string> = {
    GUATEMALA: 'Guatemala',
    QUETZALTENANGO: 'Quetzaltenango',
    ESCUINTLA: 'Escuintla',
    SACATEPEQUEZ: 'Sacatepéquez',
    ALTA_VERAPAZ: 'Alta Verapaz',
    BAJA_VERAPAZ: 'Baja Verapaz',
    CHIMALTENANGO: 'Chimaltenango',
    CHIQUIMULA: 'Chiquimula',
    EL_PROGRESO: 'El Progreso',
    HUEHUETENANGO: 'Huehuetenango',
    IZABAL: 'Izabal',
    JALAPA: 'Jalapa',
    JUTIAPA: 'Jutiapa',
    PETEN: 'Petén',
    QUICHE: 'Quiché',
    RETALHULEU: 'Retalhuleu',
    SAN_MARCOS: 'San Marcos',
    SANTA_ROSA: 'Santa Rosa',
    SOLOLA: 'Sololá',
    SUCHITEPEQUEZ: 'Suchitepéquez',
    TOTONICAPAN: 'Totonicapán',
    ZACAPA: 'Zacapa',
}

export default async function NetworkPage({
    searchParams
}: {
    searchParams: Promise<{ q?: string; industry?: string; verified?: string }>
}) {
    const session = await auth()
    if (!session?.user?.id) redirect('/login')

    const params = await searchParams
    const searchQuery = params.q || ''
    const industryFilter = params.industry || 'ALL'
    const verifiedFilter = params.verified || 'ALL'
    const myCompanyId = session.user.companyId

    // Build where clause
    const where: any = {
        id: { not: myCompanyId }, // Don't show own company
    }
    if (searchQuery) {
        where.name = { contains: searchQuery, mode: 'insensitive' }
    }
    if (industryFilter !== 'ALL') {
        where.industry = industryFilter
    }
    if (verifiedFilter === 'VERIFIED') {
        where.isVerified = true
    }

    const companies = await prisma.company.findMany({
        where,
        include: {
            _count: { select: { rfqs: true, bids: true, receivedReviews: true, users: true } },
            receivedReviews: {
                select: { ratingQuality: true, ratingPunctuality: true, ratingCommunication: true, ratingProfessionalism: true }
            }
        },
        orderBy: [{ isVerified: 'desc' }, { name: 'asc' }],
        take: 50,
    })

    // Calculate trust scores
    const companiesWithScores = companies.map(company => {
        const reviews = company.receivedReviews
        let trustScore = 0
        if (reviews.length > 0) {
            const avg = reviews.reduce((sum, r) =>
                sum + (r.ratingQuality + r.ratingPunctuality + r.ratingCommunication + r.ratingProfessionalism) / 4
            , 0) / reviews.length
            trustScore = Math.round(avg * 20) // 0-100
        }
        return { ...company, trustScore, reviewCount: reviews.length }
    })

    function buildUrl(overrides: Record<string, string>) {
        const p = new URLSearchParams()
        const merged = { q: searchQuery, industry: industryFilter, verified: verifiedFilter, ...overrides }
        Object.entries(merged).forEach(([k, v]) => { if (v && v !== 'ALL' && v !== '') p.set(k, v) })
        const qs = p.toString()
        return `/network${qs ? `?${qs}` : ''}`
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
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Red de Proveedores</h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Descubre y conecta con empresas verificadas en la plataforma</p>
                        </div>
                    </div>
                </header>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
                    <div className="relative flex-1 max-w-sm">
                        <form>
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                            <input
                                type="text"
                                name="q"
                                defaultValue={searchQuery}
                                placeholder="Buscar empresa por nombre..."
                                className="w-full bg-white dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 outline-none border border-slate-200 dark:border-white/10 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all"
                            />
                        </form>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 hidden sm:block" />
                        <Link href={buildUrl({ verified: verifiedFilter === 'VERIFIED' ? 'ALL' : 'VERIFIED' })}>
                            <button className={`flex items-center gap-1.5 px-3 py-1.5 text-[0.7rem] font-bold rounded-lg border transition-all cursor-pointer ${
                                verifiedFilter === 'VERIFIED'
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-emerald-800'
                            }`}>
                                <ShieldCheck className="w-3.5 h-3.5" /> Solo Verificadas
                            </button>
                        </Link>

                        <div className="flex items-center gap-1 flex-wrap">
                            <Link href={buildUrl({ industry: 'ALL' })}>
                                <button className={`px-3 py-1.5 text-[0.7rem] font-bold rounded-lg border transition-all cursor-pointer ${
                                    industryFilter === 'ALL'
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-800'
                                }`}>
                                    Todas
                                </button>
                            </Link>
                            {Object.entries(INDUSTRY_LABELS).slice(0, 5).map(([value, label]) => (
                                <Link key={value} href={buildUrl({ industry: value })}>
                                    <button className={`px-3 py-1.5 text-[0.7rem] font-bold rounded-lg border transition-all cursor-pointer ${
                                        industryFilter === value
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-800'
                                    }`}>
                                        {label}
                                    </button>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Company cards grid */}
                {companiesWithScores.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 p-16 text-center">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-center mb-5 mx-auto">
                            <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">No se encontraron empresas</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Intenta ajustar los filtros de búsqueda.</p>
                        {(searchQuery || industryFilter !== 'ALL' || verifiedFilter !== 'ALL') && (
                            <Link href="/network" className="mt-4 inline-block">
                                <Button variant="outline" className="font-bold rounded-xl border-slate-200 dark:border-white/10">Limpiar filtros</Button>
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {companiesWithScores.map(company => (
                            <Link
                                key={company.id}
                                href={`/company/${company.id}`}
                                className="group bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 p-6 hover:border-blue-200 dark:hover:border-blue-900/50 hover:shadow-md transition-all"
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-lg shadow-blue-600/10 group-hover:scale-105 transition-transform">
                                        {company.name[0]?.toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-black text-slate-900 dark:text-white text-sm tracking-tight truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{company.name}</h3>
                                            {company.isVerified && (
                                                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{INDUSTRY_LABELS[company.industry] || company.industry}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mb-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                                    <span>{LOCATION_LABELS[company.department] || company.department}</span>
                                </div>

                                {/* Stats row */}
                                <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
                                    {company.trustScore > 0 && (
                                        <div className="flex items-center gap-1.5">
                                            <Star className="w-3.5 h-3.5 text-amber-500" />
                                            <span className="text-xs font-black text-slate-900 dark:text-white">{company.trustScore}</span>
                                            <span className="text-[0.6rem] font-bold text-slate-400 dark:text-slate-500">/ 100</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{company._count.users}</span>
                                    </div>
                                    {company.reviewCount > 0 && (
                                        <Badge variant="outline" className="text-[0.6rem] font-bold px-2 py-0.5 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10">
                                            {company.reviewCount} reseña{company.reviewCount !== 1 ? 's' : ''}
                                        </Badge>
                                    )}
                                    {company.isVerified && (
                                        <Badge variant="outline" className="text-[0.6rem] font-bold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 ml-auto">
                                            Verificada
                                        </Badge>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
