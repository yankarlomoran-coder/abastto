import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CalendarIcon, DollarSign, Clock, CalendarDays, FileText, CheckCircle2, User, Building2, PackageIcon, AlertCircle, ArrowLeft, ShieldCheck, Download, ChevronRight, Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import BidForm from "./bid-form"
import AcceptBidButton from "./accept-bid-button"
import OfferAnalysis from "./offer-analysis"
import QaSection from "./qa-section"
import { PoDownloadButton } from "@/components/pdf/po-download-button"
import ReviewForm from "./review-form"
import { TrustScoreBadge } from "@/components/trust-score-badge"
import ApproveRfqButton from "./approve-rfq-button"

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
        <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] selection:bg-[#dae2fd] relative overflow-hidden font-sans">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-gradient-to-bl from-[#dae2fd]/40 to-transparent rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute top-[40%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-[#eceef0]/60 to-transparent rounded-full blur-[90px] pointer-events-none"></div>

            <div className="max-w-[1400px] mx-auto p-6 lg:p-12 relative z-10">
                {/* Header / Navigation */}
                <header className="flex items-center gap-4 mb-10">
                    <Link href="/dashboard" className="group flex items-center justify-center w-11 h-11 rounded-full bg-white border border-[#e0e3e5] shadow-sm hover:shadow-md hover:border-[#c6c6cd] transition-all">
                        <ArrowLeft className="w-5 h-5 text-[#545f73] group-hover:text-[#131b2e] transition-colors" />
                    </Link>
                    <div>
                        <p className="text-[0.7rem] font-bold text-[#586377] uppercase tracking-[0.1em] mb-0.5">Visor de Adquisiciones</p>
                        <h2 className="text-[#191c1e] font-semibold flex items-center gap-2 text-sm">
                            <span className="text-[#7c839b]">Abastto B2B</span> <ChevronRight className="w-3 h-3 text-[#c6c6cd]" /> Ficha Técnica
                        </h2>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 xl:gap-12 items-start">
                    
                    {/* LEFT COLUMN: Main Process Info & Actions */}
                    <div className="space-y-12">
                        
                        {/* RFQ Hero Section */}
                        <section className="bg-white rounded-[16px] p-8 lg:p-10 shadow-[0_4px_40px_rgba(15,23,42,0.03)] border border-[#eceef0]">
                            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 mb-8">
                                <div>
                                    <Badge variant="outline" className="mb-4 bg-[#f2f4f6] text-[#45464d] border-[#e0e3e5] text-xs font-bold tracking-widest px-3 py-1 uppercase rounded-md">
                                        Solicitud de Cotización
                                    </Badge>
                                    <h1 className="text-3xl lg:text-4xl font-extrabold text-[#131b2e] leading-[1.15] tracking-tight max-w-3xl">
                                        {rfq.title}
                                    </h1>
                                </div>
                                <div className="shrink-0 pt-2">
                                    {effectiveStatus === 'OPEN' && <Badge className="bg-[#059669] hover:bg-[#047857] text-white px-4 py-1.5 text-sm font-bold tracking-wide rounded-md shadow-[0_2px_12px_rgba(5,150,105,0.2)]">● BÚSQUEDA ACTIVA</Badge>}
                                    {effectiveStatus === 'EVALUATING' && <Badge className="bg-[#f59e0b] hover:bg-[#d97706] text-white px-4 py-1.5 text-sm font-bold tracking-wide rounded-md shadow-[0_2px_12px_rgba(245,158,11,0.2)]">● EN EVALUACIÓN</Badge>}
                                    {effectiveStatus === 'CLOSED' && <Badge className="bg-[#1e293b] text-white px-4 py-1.5 text-sm font-bold tracking-wide rounded-md">CERRADA</Badge>}
                                    {effectiveStatus === 'DRAFT_PENDING_APPROVAL' && <Badge className="bg-[#e2e8f0] text-[#475569] px-4 py-1.5 text-sm font-bold tracking-wide rounded-md border border-[#cbd5e1]">ESPERANDO APROBACIÓN</Badge>}
                                </div>
                            </div>
                            
                            <div className="prose prose-slate max-w-none text-[#45464d] text-[1.05rem] leading-relaxed mb-10">
                                {rfq.description.split('\n').map((paragraph, index) => (
                                    <p key={index} className="mb-4">{paragraph}</p>
                                ))}
                            </div>

                            {rfq.items && rfq.items.length > 0 && (
                                <div className="mt-8 pt-8 border-t border-[#f2f4f6]">
                                    <h3 className="text-sm font-bold text-[#131b2e] uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <PackageIcon className="w-4 h-4 text-[#7c839b]" />
                                        Requerimiento Técnico
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {rfq.items.map((item) => (
                                            <div key={item.id} className="bg-[#f7f9fb] border border-[#eceef0] rounded-xl p-5 flex items-start gap-4 hover:border-[#dae2fd] transition-colors">
                                                <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0 border border-[#e0e3e5] text-[#3f465c] font-black">
                                                    {item.quantity}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#191c1e] text-[0.95rem] leading-snug">{item.name}</p>
                                                    <p className="text-sm text-[#586377] mt-1">{item.unit}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* FORUM Q&A */}
                        <div className="bg-white rounded-[16px] shadow-[0_4px_40px_rgba(15,23,42,0.02)] border border-[#eceef0] overflow-hidden">
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
                                    <div className="bg-[#ffffff] p-6 rounded-[16px] border-2 border-[#dae2fd] shadow-sm flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-[#131b2e] text-lg">Aprobación Pendiente</h3>
                                            <p className="text-[#586377] text-sm mt-1">Esta solicitud requiere revisión de jerarquía antes de publicarse.</p>
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
                                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[16px] border border-dashed border-[#c6c6cd]">
                                            <div className="w-16 h-16 bg-[#f2f4f6] rounded-full flex items-center justify-center mb-4">
                                                <Inbox className="w-8 h-8 text-[#7c839b]" />
                                            </div>
                                            <h3 className="text-lg font-bold text-[#131b2e]">Sin ofertas por el momento</h3>
                                            <p className="text-[#586377] text-sm mt-2">Los proveedores enviarán sus propuestas antes de la fecha límite.</p>
                                        </div>
                                    ) : !isPastDeadline ? (
                                        <div className="flex flex-col items-center justify-center py-20 bg-[#f7f9fb] rounded-[16px] border border-dashed border-[#bec6e0] shadow-inner">
                                            <div className="relative">
                                                <ShieldCheck className="w-16 h-16 text-[#3c475a] mb-6 opacity-80" />
                                                <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full animate-pulse ring-4 ring-green-100"></div>
                                            </div>
                                            <h3 className="text-xl font-bold text-[#131b2e] mb-2">Sobres Electrónicos Sellados</h3>
                                            <p className="text-[#586377] text-center max-w-md mx-auto">
                                                Hay <strong className="text-[#131b2e]">{rfq.bids.length} propuesta(s)</strong> resguardadas en bóveda. Por protocolo de transparencia B2B, los precios y detalles comerciales se revelarán cuando el reloj llegue a cero.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                            {rfq.bids.map((bid) => (
                                                <div key={bid.id} className={`bg-white rounded-[16px] border transition-all duration-300 hover:shadow-[0_12px_40px_rgba(15,23,42,0.06)] flex flex-col ${bid.status === 'ACCEPTED' ? 'border-[#059669] shadow-[0_0_0_2px_rgba(5,150,105,0.1)]' : 'border-[#e0e3e5] hover:border-[#bec6e0]'}`}>
                                                    
                                                    {/* Card Header */}
                                                    <div className={`p-6 border-b ${bid.status === 'ACCEPTED' ? 'border-[#059669]/20 bg-[#f0fdf4]' : 'border-[#eceef0] bg-[#fcfdff]'} rounded-t-[16px]`}>
                                                        <div className="flex justify-between items-start gap-4">
                                                            <div>
                                                                <h3 className="text-[1.15rem] font-black text-[#131b2e] mb-1.5 leading-tight">{bid.company?.name || 'Proveedor Verificado'}</h3>
                                                                <TrustScoreBadge companyId={bid.companyId} className="scale-90 origin-left" />
                                                            </div>
                                                            <div className="text-right shrink-0">
                                                                <p className="text-[1.35rem] font-bold text-[#059669] tracking-tight">Q {Number(bid.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                                <p className="text-[0.75rem] text-[#7c839b] font-medium uppercase tracking-widest mt-1">Oferta Total</p>
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
                                                            <div className="bg-[#f7f9fb] p-3 rounded-lg border border-[#f2f4f6]">
                                                                <p className="text-[0.65rem] font-bold text-[#7c839b] uppercase tracking-widest mb-1">Tiempo de Entrega</p>
                                                                <p className="font-semibold text-[#191c1e]">{bid.deliveryLeadTime || 'No especificado'}</p>
                                                            </div>
                                                            <div className="bg-[#f7f9fb] p-3 rounded-lg border border-[#f2f4f6]">
                                                                <p className="text-[0.65rem] font-bold text-[#7c839b] uppercase tracking-widest mb-1">Garantía / Validez</p>
                                                                <p className="font-semibold text-[#191c1e]">{bid.validityDays ? `${bid.validityDays} días` : 'No especificada'}</p>
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
                                                                <p className="text-[0.7rem] font-bold text-[#131b2e] uppercase tracking-wider border-b border-[#eceef0] pb-2 mb-3">Términos del Proveedor</p>
                                                                <p className="text-[0.85rem] text-[#586377] leading-relaxed bg-[#fcfdff] p-3 rounded-lg border border-[#e0e3e5]">
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

                                    {effectiveStatus === 'CLOSED' && acceptedBid && !hasReviewed && (
                                        <div className="mt-12 bg-white rounded-[16px] border border-[#eceef0] shadow-sm overflow-hidden">
                                            <ReviewForm 
                                                rfqId={rfq.id} 
                                                targetCompanyId={acceptedBid.companyId} 
                                                targetCompanyName={acceptedBid.company?.name || 'Proveedor'} 
                                            />
                                        </div>
                                    )}
                                    {effectiveStatus === 'CLOSED' && hasReviewed && (
                                        <div className="mt-10 p-6 bg-[#f0fdf4] text-[#059669] rounded-[16px] border border-[#bbf7d0] text-center font-bold flex items-center justify-center gap-3 shadow-inner">
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
                                    <div className="bg-[#f7f9fb] p-12 text-center rounded-[16px] border border-dashed border-[#c6c6cd]">
                                        <Clock className="w-12 h-12 text-[#76777d] mx-auto mb-4" />
                                        <h3 className="text-lg font-bold text-[#191c1e]">Ventana de recepción cerrada</h3>
                                        <p className="text-[#586377] mt-2">El comprador ya no acepta nuevas cotizaciones para este requerimiento.</p>
                                    </div>
                                ) : hasSupplierBid && supplierBid ? (
                                    <div className={`bg-white rounded-[16px] border-2 shadow-sm relative overflow-hidden ${supplierBid.status === 'ACCEPTED' ? 'border-[#059669]' : supplierBid.status === 'REJECTED' ? 'border-[#ba1a1a]' : 'border-[#dae2fd]'}`}>
                                        
                                        {/* Colored top thick bar */}
                                        <div className={`h-2 w-full ${supplierBid.status === 'ACCEPTED' ? 'bg-[#059669]' : supplierBid.status === 'REJECTED' ? 'bg-[#ba1a1a]' : 'bg-[#131b2e]'}`}></div>

                                        <div className="p-8">
                                            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-10 pb-8 border-b border-[#eceef0]">
                                                <div>
                                                    <p className="text-sm font-bold text-[#7c839b] uppercase tracking-widest mb-2">Comprobante de Emisión</p>
                                                    <div className="flex items-center gap-4">
                                                        <h3 className="text-2xl font-black text-[#131b2e]">Propuesta Económica</h3>
                                                        <Badge className={
                                                            supplierBid.status === 'ACCEPTED' ? 'bg-[#059669] text-white hover:bg-[#059669] px-4 py-1' :
                                                            supplierBid.status === 'REJECTED' ? 'bg-[#ba1a1a] text-white hover:bg-[#ba1a1a] px-4 py-1' :
                                                            'bg-[#f2f4f6] text-[#3c475a] border-[#e0e3e5] px-4 py-1'
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
                                                        <p className="text-xs font-bold text-[#7c839b] uppercase tracking-widest mb-2">Monto Ofertado</p>
                                                        <p className="text-4xl font-black text-[#191c1e] tracking-tighter">Q {Number(supplierBid.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                        <p className="text-sm font-medium text-[#586377] mt-2">Enviada el {new Date(supplierBid.createdAt).toLocaleDateString()}</p>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-6 bg-[#f7f9fb] p-5 rounded-[12px] border border-[#e0e3e5]">
                                                        <div>
                                                            <p className="text-xs font-bold text-[#7c839b] uppercase tracking-widest mb-1.5">Plazo Entrega</p>
                                                            <p className="font-semibold text-[#131b2e]">{supplierBid.deliveryLeadTime || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-[#7c839b] uppercase tracking-widest mb-1.5">Garantía / Validez</p>
                                                            <p className="font-semibold text-[#131b2e]">{supplierBid.validityDays ? `${supplierBid.validityDays} días` : 'N/A'}</p>
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
                                                <div className="pt-8 mt-10 border-t border-[#eceef0] flex justify-end">
                                                    <Link href={`/rfq/${rfq.id}/chat/${session.user.companyId}`}>
                                                        <Button className="cursor-pointer bg-[#131b2e] hover:bg-[#3f465c] text-white font-bold h-12 px-8 rounded-lg shadow-[0_4px_14px_rgba(19,27,46,0.25)] transition-all">
                                                            Acceder a Sala G-Chat B2B
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

                                {effectiveStatus === 'CLOSED' && supplierBid?.status === 'ACCEPTED' && !hasReviewed && (
                                    <div className="mt-12 bg-white rounded-[16px] border border-[#eceef0] shadow-sm overflow-hidden p-2">
                                        <ReviewForm 
                                            rfqId={rfq.id} 
                                            targetCompanyId={rfq.companyId} 
                                            targetCompanyName={rfq.company?.name || 'Comprador'} 
                                        />
                                    </div>
                                )}
                                {effectiveStatus === 'CLOSED' && supplierBid?.status === 'ACCEPTED' && hasReviewed && (
                                    <div className="p-6 bg-[#f0fdf4] text-[#059669] rounded-[16px] border border-[#bbf7d0] text-center font-bold flex items-center justify-center gap-3 shadow-inner">
                                        <CheckCircle2 className="w-6 h-6" /> Usted ya calificó al comprador en esta transacción.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* RIGHT COLUMN: Sidebar Metadata & Stats */}
                    <div className="hidden xl:block space-y-6 sticky top-8">
                        {/* Financial Block */}
                        <div className="bg-white rounded-[16px] p-8 shadow-[0_4px_40px_rgba(15,23,42,0.03)] border border-[#eceef0] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#dae2fd]/50 rounded-full blur-[30px] -mr-10 -mt-10"></div>
                            <p className="text-[0.7rem] font-bold text-[#7c839b] uppercase tracking-[0.15em] mb-2 relative z-10">Asignación Presupuestaria</p>
                            <p className="text-4xl font-black text-[#131b2e] tracking-tighter relative z-10 flex items-center gap-2">
                                <span className="text-2xl text-[#586377] font-medium">Q</span> {Number(rfq.budget).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>

                        {/* Timing Block */}
                        <div className="bg-white rounded-[16px] p-6 border border-[#eceef0] shadow-sm">
                            <div className="mb-6 flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-[#f7f9fb] flex items-center justify-center shrink-0 border border-[#e0e3e5]">
                                    <CalendarDays className="w-5 h-5 text-[#545f73]" />
                                </div>
                                <div>
                                    <p className="text-[0.65rem] font-bold text-[#7c839b] uppercase tracking-widest mb-1">Dossier Publicado</p>
                                    <p className="text-[0.95rem] font-semibold text-[#191c1e]">{new Date(rfq.createdAt).toLocaleDateString('es-GT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-lg ${isPastDeadline ? 'bg-[#ffdad6] border-[#ba1a1a]/20' : 'bg-[#e0e7ff] border-[#dae2fd]'} flex items-center justify-center shrink-0 border`}>
                                    <Clock className={`w-5 h-5 ${isPastDeadline ? 'text-[#ba1a1a]' : 'text-[#3730a3]'}`} />
                                </div>
                                <div>
                                    <p className="text-[0.65rem] font-bold text-[#7c839b] uppercase tracking-widest mb-1">Cierre Perimetral</p>
                                    <p className={`text-[0.95rem] font-bold ${isPastDeadline ? 'text-[#ba1a1a]' : 'text-[#191c1e]'}`}>
                                        {new Date(rfq.deadline).toLocaleString('es-GT', { dateStyle: 'short', timeStyle: 'short', hour12: true })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Buyer Details Block */}
                        <div className="bg-white rounded-[16px] p-6 border border-[#eceef0] shadow-sm">
                            <p className="text-[0.65rem] font-bold text-[#7c839b] uppercase tracking-widest mb-4 border-b border-[#eceef0] pb-2">Entidad Emisora</p>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#eceef0] to-[#f7f9fb] flex items-center justify-center text-[#131b2e] font-black text-xl border border-[#c6c6cd] shadow-inner shrink-0">
                                        {rfq.company?.name?.[0]?.toUpperCase() || 'E'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-[#131b2e] text-base truncate">{rfq.company?.name || 'Identidad Oculta'}</p>
                                        {rfq.company?.nit && <p className="text-xs font-medium text-[#76777d] mt-0.5">TIN/NIT: {rfq.company.nit}</p>}
                                    </div>
                                </div>
                                <div className="bg-[#f7f9fb] rounded-lg p-3 border border-[#eceef0] flex items-center justify-center">
                                    <TrustScoreBadge companyId={rfq.companyId} className="w-full flex justify-center" />
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats (Only Buyer) */}
                        {role === 'BUYER' && (
                            <div className="bg-white rounded-[16px] p-6 border border-[#eceef0] shadow-[0_4px_20px_rgba(15,23,42,0.02)]">
                                <div className="flex justify-between items-center mb-4">
                                    <p className="text-[0.65rem] font-bold text-[#7c839b] uppercase tracking-widest">Actividad de Red</p>
                                    <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-3xl font-black text-[#131b2e]">{rfq.bids.length}</div>
                                    <div className="text-sm font-medium text-[#586377] leading-tight">Proveedores<br/>Han ofertado</div>
                                </div>
                                {rfq.bids.length > 0 && rfq.budget && (
                                    <div className="mt-4 pt-4 border-t border-[#f2f4f6]">
                                        <p className="text-[0.7rem] text-[#76777d] mb-1">Ahorro proyectado VS Presupuesto:</p>
                                        <p className="text-sm font-bold text-[#059669]">
                                            {(() => {
                                                const lowest = Math.min(...rfq.bids.map(b => Number(b.amount)));
                                                const diff = Number(rfq.budget) - lowest;
                                                return diff > 0 ? `Q ${diff.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${((diff / Number(rfq.budget)) * 100).toFixed(1)}%)` : 'Ninguno (Sobre presupuesto)';
                                            })()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                        
                    </div>
                </div>
            </div>
        </div>
    )
}
