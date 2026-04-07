import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CalendarIcon, DollarSign, Clock, CalendarDays, FileText, CheckCircle2, User, Building2, PackageIcon, AlertCircle, ShieldCheck, Download, ChevronRight, Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import BidForm from "./bid-form"
import AcceptBidButton from "./accept-bid-button"
import OfferAnalysis from "./offer-analysis"
import QaSection from "./qa-section"
import BidComparator from "./bid-comparator"
import { PoDownloadButton } from "@/components/pdf/po-download-button"
import ReviewForm from "./review-form"
import { TrustScoreBadge } from "@/components/trust-score-badge"
import { SupplierMetricsPanel } from "@/components/supplier-metrics-panel"
import { ExportBidsButton } from "@/components/export-buttons"
import ApproveRfqButton from "./approve-rfq-button"
import { RfqTimeline } from "@/components/rfq/rfq-timeline"
import { DeliveryActions } from "@/components/rfq/delivery-actions"

export default async function RfqDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const { role, id: userId } = session.user

    const rfq = await prisma.rfq.findUnique({
        where: { id: resolvedParams.id },
        include: {
            company: { select: { name: true, nit: true } },
            items: true,
            bids: {
                include: {
                    company: { select: { name: true, nit: true } },
                    items: { include: { rfqItem: true } }
                },
                orderBy: { amount: 'asc' }
            },
            questions: {
                include: { company: { select: { name: true } } },
                orderBy: { createdAt: 'asc' }
            },
            reviews: {
                where: { authorCompanyId: session.user.companyId || '' }
            }
        }
    })

    if (!rfq) {
        notFound()
    }

    if (role === 'BUYER' && rfq.companyId !== session.user.companyId) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md text-center border-0 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-red-600">Acceso Denegado</CardTitle>
                    </CardHeader>
                    <CardContent className="text-slate-500">No tienes permisos para ver esta solicitud privada.</CardContent>
                </Card>
            </div>
        )
    }

    const hasSupplierBid = role === 'SUPPLIER' ? rfq.bids.some(b => b.companyId === session.user.companyId) : false
    const supplierBid = role === 'SUPPLIER' ? rfq.bids.find(b => b.companyId === session.user.companyId) : null

    const isPastDeadline = new Date() > rfq.deadline
    const effectiveStatus = rfq.status === 'OPEN' && isPastDeadline ? 'EVALUATING' : rfq.status
    const hasReviewed = rfq.reviews.length > 0
    const acceptedBid = rfq.bids.find(b => b.status === 'ACCEPTED')

    return (
        <div className="flex-1 p-6 md:p-10 xl:p-14 max-w-[1400px] w-full mx-auto">
                {/* Page Title */}
                <header className="mb-10">
                    <p className="text-[0.7rem] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-[0.1em] mb-0.5">Gestión Comercial</p>
                    <h2 className="text-slate-900 dark:text-white font-semibold flex items-center gap-2 text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Abastto Profesional</span> <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600" /> Ficha Técnica de Licitación
                    </h2>
                </header>

                {/* Timeline */}
                <div className="mb-8">
                    <RfqTimeline
                        rfqStatus={effectiveStatus}
                        createdAt={rfq.createdAt}
                        deadline={rfq.deadline}
                        deliveryConfirmedAt={rfq.deliveryConfirmedAt}
                        isBuyer={role === 'BUYER'}
                    />
                </div>

                {/* Delivery Actions */}
                {(effectiveStatus === 'PENDING_DELIVERY' || effectiveStatus === 'DELIVERED') && (
                    <div className="mb-8">
                        <DeliveryActions rfqId={rfq.id} status={effectiveStatus} isBuyer={role === 'BUYER'} />
                    </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 xl:gap-12 items-start">
                    
                    {/* LEFT COLUMN: Main Process Info & Actions */}
                    <div className="space-y-12">
                        
                        <section className="bg-white dark:bg-slate-900 rounded-[16px] p-8 lg:p-10 shadow-sm dark:shadow-2xl border border-slate-200 dark:border-white/5">
                            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 mb-8">
                                <div>
                                    <Badge variant="outline" className="mb-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 text-xs font-bold tracking-widest px-3 py-1 uppercase rounded-md">
                                        Solicitud de Cotización
                                    </Badge>
                                    <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white leading-[1.15] tracking-tight max-w-3xl">
                                        {rfq.title}
                                    </h1>
                                </div>
                                <div className="shrink-0 pt-2">
                                    {effectiveStatus === 'OPEN' && <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 text-sm font-bold tracking-wide rounded-md shadow-lg shadow-emerald-600/20">● BÚSQUEDA ACTIVA</Badge>}
                                    {effectiveStatus === 'EVALUATING' && <Badge className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 text-sm font-bold tracking-wide rounded-md shadow-lg shadow-amber-500/20">● EN EVALUACIÓN</Badge>}
                                    {effectiveStatus === 'PENDING_DELIVERY' && <Badge className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 text-sm font-bold tracking-wide rounded-md shadow-lg shadow-orange-500/20">● ENTREGA PENDIENTE</Badge>}
                                    {effectiveStatus === 'DELIVERED' && <Badge className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-1.5 text-sm font-bold tracking-wide rounded-md shadow-lg shadow-teal-500/20">✓ ENTREGADA</Badge>}
                                    {effectiveStatus === 'CLOSED' && <Badge className="bg-slate-800 dark:bg-slate-700 text-white px-4 py-1.5 text-sm font-bold tracking-wide rounded-md">CERRADA</Badge>}
                                    {effectiveStatus === 'DRAFT_PENDING_APPROVAL' && <Badge className="bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 px-4 py-1.5 text-sm font-bold tracking-wide rounded-md border border-slate-200 dark:border-white/10">ESPERANDO APROBACIÓN</Badge>}
                                </div>
                            </div>
                            
                            <div className="prose prose-slate max-w-none text-[#45464d] text-[1.05rem] leading-relaxed mb-10">
                                {rfq.description.split('\n').map((paragraph, index) => (
                                    <p key={index} className="mb-4">{paragraph}</p>
                                ))}
                            </div>

                            {rfq.items && rfq.items.length > 0 && (
                                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/10">
                                    <h3 className="text-[0.7rem] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                        <PackageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        Especificaciones del Requerimiento
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {rfq.items.map((item) => (
                                            <div key={item.id} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex items-start gap-4 hover:border-blue-300 dark:hover:border-blue-900/30 transition-all group">
                                                <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center shrink-0 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black group-hover:scale-110 transition-transform">
                                                    {item.quantity}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 dark:text-white text-[1rem] leading-snug">{item.name}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-bold uppercase tracking-wider">{item.unit}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* FORUM Q&A */}
                        <div className="bg-white dark:bg-slate-900 rounded-[24px] shadow-sm dark:shadow-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
                            <QaSection
                                rfqId={rfq.id}
                                questions={rfq.questions}
                                userRole={role}
                                userCompanyId={session.user.companyId || ''}
                                isOwner={role === 'BUYER' && rfq.companyId === session.user.companyId}
                                isActive={!isPastDeadline && rfq.status === 'OPEN'}
                            />
                        </div>

                        {/* --- BUYER VIEW: List of Bids --- */}
                        {role === 'BUYER' && (
                            <div className="space-y-10">
                                {effectiveStatus === 'DRAFT_PENDING_APPROVAL' && ((session.user as any).companyRole === 'OWNER' || (session.user as any).companyRole === 'ADMIN') && (
                                    <div className="bg-violet-50 dark:bg-violet-900/10 p-8 rounded-[24px] border-2 border-violet-200 dark:border-violet-800 shadow-sm flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-violet-200 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-xl">
                                                <ShieldCheck className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-violet-900 dark:text-violet-100 text-lg uppercase tracking-tight">Validación de Jerarquía Requerida</h3>
                                                <p className="text-violet-700 dark:text-violet-400/80 text-sm mt-1 font-medium italic">Esta solicitud debe ser aprobada por la dirección antes de publicarse internamente.</p>
                                            </div>
                                        </div>
                                        <ApproveRfqButton rfqId={rfq.id} />
                                    </div>
                                )}
                                
                                <div className="border-t-2 border-[#eceef0] pt-10">
                                    <h2 className="text-2xl font-black text-[#131b2e] mb-8 tracking-tight flex items-center gap-3">
                                        Evaluación de Ofertas <span className="bg-[#f2f4f6] text-[#45464d] text-sm px-3 py-1 rounded-full font-bold">{rfq.bids.length} RECIBIDAS</span>
                                    </h2>

                                    {/* AI Analysis (Glassmorphism) */}
                                    {rfq.bids.length > 0 && effectiveStatus === 'EVALUATING' && (
                                        <div className="mb-10 rounded-[16px] overflow-hidden bg-white/60 backdrop-blur-[24px] shadow-[0_8px_32px_rgba(19,27,46,0.04)] border border-white/40 ring-1 ring-[#dae2fd]">
                                            <OfferAnalysis rfqId={rfq.id} initialAnalysis={rfq.aiAnalysis} />
                                        </div>
                                    )}

                                    {/* Bid Cards Grid */}
                                    {rfq.bids.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 rounded-[24px] border border-dashed border-slate-200 dark:border-white/10 shadow-inner">
                                            <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-6">
                                                <Inbox className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Bandeja Vacía</h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">Las propuestas comerciales aparecerán automáticamente en esta sección.</p>
                                        </div>
                                    ) : !isPastDeadline ? (
                                        <div className="flex flex-col items-center justify-center py-24 bg-slate-100/50 dark:bg-white/5 rounded-[24px] border border-dashed border-blue-200 dark:border-blue-900/20 shadow-inner relative overflow-hidden backdrop-blur-sm">
                                            <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>
                                            <div className="relative">
                                                <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl shadow-xl flex items-center justify-center mb-8 relative z-10 border border-slate-200 dark:border-white/10">
                                                    <ShieldCheck className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div className="absolute top-0 right-0 w-6 h-6 bg-emerald-500 rounded-full animate-pulse ring-8 ring-emerald-500/10 z-20"></div>
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tighter">Sobres Electrónicos Blindados</h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-center max-w-lg mx-auto font-medium leading-relaxed px-8">
                                                Existen <strong className="text-blue-600 dark:text-blue-400 font-black">{rfq.bids.length} propuestas comerciales</strong> resguardadas bajo protocolo de confidencialidad. Los detalles económicos se revelarán al concluir el periodo de recepción.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                            {rfq.bids.map((bid) => (
                                                <div key={bid.id} className={`bg-white dark:bg-slate-900 rounded-[16px] border transition-all duration-300 hover:shadow-xl flex flex-col ${bid.status === 'ACCEPTED' ? 'border-emerald-600 dark:border-emerald-500 shadow-lg shadow-emerald-600/5' : 'border-slate-200 dark:border-white/5 hover:border-blue-300 dark:hover:border-blue-900/30'}`}>
                                                    
                                                    {/* Card Header */}
                                                    <div className={`p-6 border-b ${bid.status === 'ACCEPTED' ? 'border-emerald-600/20 bg-emerald-50/30 dark:bg-emerald-950/20' : 'border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5'} rounded-t-[16px]`}>
                                                        <div className="flex justify-between items-start gap-4">
                                                            <div>
                                                                <h3 className="text-[1.15rem] font-black text-slate-900 dark:text-white mb-1.5 leading-tight">{bid.company?.name || 'Proveedor Verificado'}</h3>
                                                                <TrustScoreBadge companyId={bid.companyId} className="scale-90 origin-left" />
                                                            </div>
                                                            <div className="text-right shrink-0">
                                                                <p className="text-[1.35rem] font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">Q {Number(bid.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                                <p className="text-[0.75rem] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest mt-1">Oferta de Adjudicación</p>
                                                            </div>
                                                        </div>
                                                        {bid.status === 'ACCEPTED' && (
                                                            <div className="mt-4 flex items-center justify-between bg-white rounded-lg p-3 border border-[#059669]/30">
                                                                <Badge className="bg-[#059669] hover:bg-[#059669] font-bold uppercase tracking-wider">ADJUDICADA ✓</Badge>
                                                                <PoDownloadButton rfq={rfq} bid={bid} />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Card Body */}
                                                    <div className="p-6 flex-1 flex flex-col space-y-6">
                                                        
                                                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                                            <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-slate-100 dark:border-white/5">
                                                                <p className="text-[0.65rem] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Tiempo de Entrega</p>
                                                                <p className="font-semibold text-slate-900 dark:text-slate-200">{bid.deliveryLeadTime || 'No especificado'}</p>
                                                            </div>
                                                            <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-slate-100 dark:border-white/5">
                                                                <p className="text-[0.65rem] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Garantía / Validez</p>
                                                                <p className="font-semibold text-slate-900 dark:text-slate-200">{bid.validityDays ? `${bid.validityDays} días` : 'No especificada'}</p>
                                                            </div>
                                                        </div>

                                                        {bid.items && bid.items.length > 0 && (
                                                            <div>
                                                                <p className="text-[0.7rem] font-bold text-[#131b2e] uppercase tracking-wider border-b border-[#eceef0] pb-2 mb-3">Desglose Técnico Financiero</p>
                                                                <div className="space-y-3">
                                                                    {bid.items.map((bItem: any) => (
                                                                        <div key={bItem.id} className="group relative">
                                                                            <div className="flex justify-between items-baseline text-sm">
                                                                                <p className="font-medium text-[#45464d] truncate pr-4">{bItem.rfqItem?.name}</p>
                                                                                <div className="text-right shrink-0">
                                                                                    <span className="font-bold text-[#191c1e]">Q {Number(bItem.unitPrice).toFixed(2)}</span>
                                                                                    <span className="text-[#c6c6cd] mx-1">×</span>
                                                                                    <span className="text-[#76777d]">{bItem.rfqItem?.quantity}</span>
                                                                                </div>
                                                                            </div>
                                                                            {bItem.remarks && <p className="text-[0.75rem] text-[#7c839b] italic mt-0.5 border-l-2 border-[#dae2fd] pl-2">{bItem.remarks}</p>}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {bid.coverLetter && (
                                                            <div>
                                                                <p className="text-[0.7rem] font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-white/5 pb-2 mb-3">Términos del Proveedor</p>
                                                                <p className="text-[0.85rem] text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-white/5 p-3 rounded-lg border border-slate-200 dark:border-white/10 font-medium">
                                                                    {bid.coverLetter}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {effectiveStatus === 'EVALUATING' && (
                                                            <div className="pt-4 mt-auto border-t border-[#eceef0] flex items-center justify-end gap-3">
                                                                <Link href={`/rfq/${rfq.id}/chat/${bid.companyId}`} className="w-full sm:w-auto">
                                                                    <Button variant="outline" className="w-full cursor-pointer bg-white text-[#131b2e] border-[#c6c6cd] hover:border-[#131b2e] hover:bg-[#f2f4f6] font-bold h-10 px-5 transition-all">
                                                                        Foro Privado
                                                                    </Button>
                                                                </Link>
                                                                <div className="w-full sm:w-auto">
                                                                    <AcceptBidButton bidId={bid.id} rfqId={rfq.id} amount={Number(bid.amount)} />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Bid Comparator Table */}
                                    {rfq.bids.length >= 2 && isPastDeadline && (
                                        <BidComparator bids={rfq.bids as any} budget={Number(rfq.budget)} />
                                    )}

                                    {/* Export Bids */}
                                    {rfq.bids.length > 0 && isPastDeadline && (
                                        <div className="mt-4 flex justify-end">
                                            <ExportBidsButton rfqId={rfq.id} rfqTitle={rfq.title} />
                                        </div>
                                    )}

                                    {['DELIVERED', 'CLOSED'].includes(effectiveStatus) && acceptedBid && !hasReviewed && (
                                        <div className="mt-12 bg-white dark:bg-slate-900 rounded-[16px] border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
                                            <ReviewForm 
                                                rfqId={rfq.id} 
                                                targetCompanyId={acceptedBid.companyId} 
                                                targetCompanyName={acceptedBid.company?.name || 'Proveedor'} 
                                            />
                                        </div>
                                    )}
                                    {['DELIVERED', 'CLOSED'].includes(effectiveStatus) && hasReviewed && (
                                        <div className="mt-10 p-6 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 rounded-[16px] border border-emerald-200 dark:border-emerald-800/30 text-center font-bold flex items-center justify-center gap-3 shadow-inner">
                                            <CheckCircle2 className="w-6 h-6" /> Proceso Auditado. Proveedor Calificado.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* --- SUPPLIER VIEW: Bid Form or Status --- */}
                        {role === 'SUPPLIER' && (
                            <div className="space-y-10 border-t-2 border-[#eceef0] pt-10">
                                <h2 className="text-2xl font-black text-[#131b2e] mb-6 tracking-tight flex items-center gap-3">
                                    Módulo de Licitación
                                </h2>

                                {effectiveStatus !== 'OPEN' && !hasSupplierBid ? (
                                    <div className="bg-slate-50 dark:bg-white/5 p-12 text-center rounded-[24px] border-2 border-dashed border-slate-200 dark:border-white/10">
                                        <Clock className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white">Ventana de recepción cerrada</h3>
                                        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">El comprador ya no acepta nuevas cotizaciones para este requerimiento.</p>
                                    </div>
                                ) : hasSupplierBid && supplierBid ? (
                                    <div className={`bg-white dark:bg-slate-900 rounded-[24px] border-2 shadow-xl relative overflow-hidden transition-all ${supplierBid.status === 'ACCEPTED' ? 'border-emerald-600 dark:border-emerald-500' : supplierBid.status === 'REJECTED' ? 'border-red-600 dark:border-red-500' : 'border-blue-100 dark:border-white/10'}`}>
                                        
                                        {/* Colored top thick bar */}
                                        <div className={`h-2 w-full ${supplierBid.status === 'ACCEPTED' ? 'bg-emerald-600' : supplierBid.status === 'REJECTED' ? 'bg-red-600' : 'bg-blue-600'}`}></div>

                                        <div className="p-8">
                                            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-10 pb-8 border-b border-slate-100 dark:border-white/5">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Comprobante de Emisión Profesional</p>
                                                    <div className="flex items-center gap-4">
                                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">Propuesta Económica</h3>
                                                        <Badge className={
                                                            supplierBid.status === 'ACCEPTED' ? 'bg-emerald-600 text-white hover:bg-emerald-600 px-4 py-1' :
                                                            supplierBid.status === 'REJECTED' ? 'bg-red-600 text-white hover:bg-red-600 px-4 py-1' :
                                                            'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 px-4 py-1'
                                                        }>
                                                            {supplierBid.status === 'PENDING' ? 'EN AUDITORÍA / EVALUACIÓN' : supplierBid.status === 'ACCEPTED' ? 'ADJUDICADA ✓' : 'NO SELECCIONADA'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                {supplierBid.status === 'ACCEPTED' && (
                                                    <PoDownloadButton rfq={rfq} bid={supplierBid} />
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                                <div>
                                                    <div className="mb-8">
                                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Monto Ofertado</p>
                                                        <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Q {Number(supplierBid.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-500 mt-2">Enviada el {new Date(supplierBid.createdAt).toLocaleDateString()}</p>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-6 bg-slate-50 dark:bg-white/5 p-5 rounded-[12px] border border-slate-100 dark:border-white/5">
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Plazo Entrega</p>
                                                            <p className="font-semibold text-slate-900 dark:text-white">{supplierBid.deliveryLeadTime || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Garantía / Validez</p>
                                                            <p className="font-semibold text-slate-900 dark:text-white">{supplierBid.validityDays ? `${supplierBid.validityDays} días` : 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    {supplierBid.items && supplierBid.items.length > 0 && (
                                                        <div className="mb-8">
                                                            <p className="text-xs font-bold text-[#7c839b] uppercase tracking-widest mb-3 border-b border-[#eceef0] pb-2">Desglose de Partidas</p>
                                                            <div className="space-y-3">
                                                                {supplierBid.items.map((bItem: any) => (
                                                                    <div key={bItem.id} className="flex justify-between items-baseline text-sm">
                                                                        <div className="max-w-[60%]">
                                                                            <p className="font-semibold text-[#191c1e] truncate">{bItem.rfqItem?.name}</p>
                                                                            {bItem.remarks && <p className="text-[0.7rem] text-[#7c839b] italic mt-0.5">{bItem.remarks}</p>}
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <p className="text-[#3c475a]">Q {Number(bItem.unitPrice).toFixed(2)} c/u</p>
                                                                            <p className="text-[0.75rem] font-bold text-[#131b2e] uppercase mt-0.5">Tot: Q {Number(bItem.totalPrice).toFixed(2)}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {supplierBid.coverLetter && (
                                                        <div>
                                                            <p className="text-xs font-bold text-[#7c839b] uppercase tracking-widest mb-3 border-b border-[#eceef0] pb-2">Pacto / Condiciones Generales</p>
                                                            <p className="text-[0.9rem] text-[#45464d] leading-relaxed">
                                                                {supplierBid.coverLetter}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {effectiveStatus === 'EVALUATING' && (
                                                <div className="pt-8 mt-10 border-t border-slate-100 dark:border-white/5 flex justify-end">
                                                    <Link href={`/rfq/${rfq.id}/chat/${session.user.companyId}`}>
                                                        <Button className="cursor-pointer bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white font-black h-12 px-8 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95">
                                                            Ingresar a Sala de Negociación Profesional
                                                        </Button>
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white p-8 rounded-[16px] shadow-[0_4px_40px_rgba(15,23,42,0.03)] border border-[#eceef0]">
                                        <BidForm rfqId={rfq.id} rfqItems={rfq.items} />
                                    </div>
                                )}

                                {['DELIVERED', 'CLOSED'].includes(effectiveStatus) && supplierBid?.status === 'ACCEPTED' && !hasReviewed && (
                                    <div className="mt-12 bg-white dark:bg-slate-900 rounded-[16px] border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden p-2">
                                        <ReviewForm 
                                            rfqId={rfq.id} 
                                            targetCompanyId={rfq.companyId} 
                                            targetCompanyName={rfq.company?.name || 'Comprador'} 
                                        />
                                    </div>
                                )}
                                {['DELIVERED', 'CLOSED'].includes(effectiveStatus) && supplierBid?.status === 'ACCEPTED' && hasReviewed && (
                                    <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 rounded-[16px] border border-emerald-200 dark:border-emerald-800/30 text-center font-bold flex items-center justify-center gap-3 shadow-inner">
                                        <CheckCircle2 className="w-6 h-6" /> Usted ya calificó al comprador en esta transacción.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* RIGHT COLUMN: Sidebar Metadata & Stats */}
                    <div className="hidden xl:block space-y-6 sticky top-8">
                        {/* Financial Block */}
                        <div className="bg-white dark:bg-slate-900 rounded-[24px] p-8 shadow-sm dark:shadow-2xl border border-slate-200 dark:border-white/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-[30px] -mr-10 -mt-10"></div>
                            <p className="text-[0.7rem] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] mb-2 relative z-10">Asignación Presupuestaria</p>
                            {role === 'BUYER' ? (
                                <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter relative z-10 flex items-center gap-2">
                                    <span className="text-2xl text-slate-400 dark:text-slate-600 font-medium">Q</span> {Number(rfq.budget).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            ) : (
                                <p className="text-sm font-bold text-slate-400 dark:text-slate-500 italic relative z-10">
                                    Información confidencial del comprador
                                </p>
                            )}
                        </div>

                        {/* Timing Block */}
                        <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-[40px] -mr-16 -mt-16"></div>
                            <div className="mb-8 flex items-start gap-4 relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0 border border-slate-200 dark:border-white/10 shadow-sm">
                                    <CalendarDays className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-[0.6rem] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Publicación Oficial</p>
                                    <p className="text-[0.9rem] font-bold text-slate-900 dark:text-white leading-snug">
                                        {new Date(rfq.createdAt).toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4 relative z-10">
                                <div className={`w-12 h-12 rounded-xl ${isPastDeadline ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'} flex items-center justify-center shrink-0 border shadow-sm`}>
                                    <Clock className={`w-6 h-6 ${isPastDeadline ? 'text-red-500' : 'text-blue-600 dark:text-blue-400'}`} />
                                </div>
                                <div>
                                    <p className="text-[0.6rem] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Cierre Perimetral</p>
                                    <p className={`text-[1.1rem] font-black tracking-tight ${isPastDeadline ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                                        {new Date(rfq.deadline).toLocaleString('es-GT', { dateStyle: 'short', timeStyle: 'short', hour12: true })}
                                    </p>
                                    {!isPastDeadline && <p className="text-[0.65rem] font-bold text-emerald-600 dark:text-emerald-400 uppercase mt-1 animate-pulse">Recepción Abierta</p>}
                                </div>
                            </div>
                        </div>

                        {/* Buyer Details Block */}
                        <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 border border-slate-200 dark:border-white/10 shadow-sm">
                            <p className="text-[0.65rem] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-5 border-b dark:border-white/5 pb-3">Entidad Emisora</p>
                            <div className="flex flex-col gap-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-slate-900 dark:text-white font-black text-2xl border border-slate-300 dark:border-slate-700 shadow-inner shrink-0 scale-90">
                                        {rfq.company?.name?.[0]?.toUpperCase() || 'E'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-black text-slate-900 dark:text-white text-base truncate tracking-tight">{rfq.company?.name || 'Identidad Oculta'}</p>
                                        {rfq.company?.nit && <p className="text-[0.7rem] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase">Identificación: {rfq.company.nit}</p>}
                                    </div>
                                </div>
                                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 border border-slate-200 dark:border-white/5 flex items-center justify-center">
                                    <TrustScoreBadge companyId={rfq.companyId} className="w-full flex justify-center text-sm" />
                                </div>
                            </div>
                        </div>

                        {/* Supplier Metrics - shown when a bid is accepted */}
                        {acceptedBid && (
                            <SupplierMetricsPanel companyId={acceptedBid.companyId} />
                        )}
                    </div>
                </div>
        </div>
    )
}
