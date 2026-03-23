import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CalendarIcon, DollarSign, Clock, CalendarDays, FileText, CheckCircle2, User, Building2, PackageIcon, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import BidForm from "./bid-form"
import AcceptBidButton from "./accept-bid-button"
import OfferAnalysis from "./offer-analysis"
import QaSection from "./qa-section"
import { PoDownloadButton } from "@/components/pdf/po-download-button"
import ReviewForm from "./review-form"
import { TrustScoreBadge } from "@/components/trust-score-badge"

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
                orderBy: { createdAt: 'asc' }
            },
            reviews: {
                where: { authorCompanyId: session.user.companyId || '' } // Solo traemos la del usuario actual
            }
        }
    })

    if (!rfq) {
        notFound()
    }

    // Security check: Only the owner Company or any Supplier can view this
    if (role === 'BUYER' && rfq.companyId !== session.user.companyId) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle className="text-red-600">Acceso Denegado</CardTitle>
                    </CardHeader>
                    <CardContent>No eres el creador de esta solicitud de cotización.</CardContent>
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
        <div className="min-h-screen bg-gray-50/50 p-6 sm:p-10">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header Navigation */}
                <div className="flex items-center justify-between">
                    <Link href="/dashboard" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                        ← Volver al Panel
                    </Link>
                </div>

                {/* RFQ Details Card */}
                <Card className="border-t-4 border-t-blue-600 shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                            <div>
                                <Badge variant="outline" className="mb-2 uppercase text-xs font-semibold tracking-wider text-slate-500 border-slate-200">
                                    Solicitud de Cotización
                                </Badge>
                                <CardTitle className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
                                    {rfq.title}
                                </CardTitle>
                            </div>
                            <Badge variant={effectiveStatus === 'OPEN' ? 'default' : effectiveStatus === 'EVALUATING' ? 'outline' : 'secondary'}
                                className={effectiveStatus === 'OPEN' ? 'bg-green-600' : effectiveStatus === 'EVALUATING' ? 'border-amber-500 text-amber-600' : ''}>
                                {effectiveStatus === 'OPEN' ? 'ABIERTA' : effectiveStatus === 'EVALUATING' ? 'EN EVALUACIÓN' : effectiveStatus === 'CLOSED' ? 'CERRADA' : rfq.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Main Info */}
                        <div className="col-span-1 md:col-span-2 space-y-6">
                            <div>
                                <h3 className="flex items-center gap-2 font-semibold text-slate-900 mb-2">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                    Descripción del Requerimiento
                                </h3>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 whitespace-pre-wrap leading-relaxed">
                                    {rfq.description}
                                </div>
                            </div>
                        </div>

                        {/* Metadata Sidebar */}
                        <div className="space-y-6 bg-slate-50 p-6 rounded-xl border border-slate-100 h-fit">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Presupuesto Estimado</p>
                                <p className="text-2xl font-bold text-slate-900 flex items-center gap-1">
                                    Q {Number(rfq.budget).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-slate-200">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Publicado el</p>
                                <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4 text-slate-400" />
                                    {new Date(rfq.createdAt).toLocaleDateString()}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-slate-200">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Fecha Límite (Cierre)</p>
                                <p className={`text-sm font-bold flex items-center gap-2 ${isPastDeadline ? 'text-red-600' : 'text-slate-900'}`}>
                                    <Clock className={`h-4 w-4 ${isPastDeadline ? 'text-red-500' : 'text-slate-400'}`} />
                                    {new Date(rfq.deadline).toLocaleString('es-GT', { dateStyle: 'short', timeStyle: 'short', hour12: true })}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-slate-200">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Empresa Compradora</p>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                                        {rfq.company?.name?.[0]?.toUpperCase() || 'E'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-900 truncate">{rfq.company?.name || 'Empresa Verificada'}</p>
                                        <div className="mt-1">
                                            <TrustScoreBadge companyId={rfq.companyId} className="w-fit" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* FORUM Q&A */}
                <QaSection
                    rfqId={rfq.id}
                    questions={rfq.questions}
                    userRole={role}
                    userCompanyId={session.user.companyId || ''}
                    isOwner={role === 'BUYER' && rfq.companyId === session.user.companyId}
                    isActive={!isPastDeadline && rfq.status === 'OPEN'}
                />

                {/* --- BUYER VIEW: List of Bids --- */}
                {role === 'BUYER' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <PackageIcon className="h-5 w-5 text-blue-600" />
                                Ofertas Recibidas ({rfq.bids.length})
                            </h2>
                        </div>

                        {rfq.bids.length > 0 && effectiveStatus === 'EVALUATING' && (
                            <OfferAnalysis rfqId={rfq.id} />
                        )}

                        {rfq.bids.length === 0 ? (
                            <Card className="bg-transparent border-dashed border-2">
                                <CardContent className="py-12 text-center">
                                    <p className="text-slate-500">Aún no hay ofertas para esta solicitud.</p>
                                </CardContent>
                            </Card>
                        ) : !isPastDeadline ? (
                            <Card className="bg-slate-50 border-dashed border-2">
                                <CardContent className="py-12 text-center">
                                    <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">Sobres Cerrados</h3>
                                    <p className="text-slate-500">
                                        Hay <strong>{rfq.bids.length} oferta(s)</strong> aseguradas.<br />
                                        Por transparencia, los detalles y precios exactos serán revelados cuando finalice el tiempo límite el {new Date(rfq.deadline).toLocaleString('es-GT', { dateStyle: 'medium', timeStyle: 'short', hour12: true })}.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {rfq.bids.map((bid) => (
                                    <Card key={bid.id} className={`border ${bid.status === 'ACCEPTED' ? 'border-green-500 ring-1 ring-green-500' : 'border-slate-200'} shadow-sm`}>
                                        <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <div className="flex flex-col gap-1 items-start">
                                                        <CardTitle className="text-lg font-bold text-slate-900 truncate w-full">
                                                            {bid.company?.name || 'Empresa Proveedora'}
                                                        </CardTitle>
                                                        <TrustScoreBadge companyId={bid.companyId} className="mb-1" />
                                                    </div>
                                                    <CardDescription>{new Date(bid.createdAt).toLocaleDateString()}</CardDescription>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-xl font-bold text-emerald-600">Q {Number(bid.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                    {bid.status === 'ACCEPTED' && (
                                                        <div className="flex items-center justify-end mt-2">
                                                            <Badge variant="default" className="bg-green-600">ACEPTADA</Badge>
                                                            <PoDownloadButton rfq={rfq} bid={bid} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-4 space-y-4">
                                            {bid.items && bid.items.length > 0 && (
                                                <div className="space-y-2">
                                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Desglose Económico</p>
                                                    <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                        {bid.items.map((bItem: any) => (
                                                            <div key={bItem.id} className="flex justify-between items-center text-sm">
                                                                <div>
                                                                    <p className="font-semibold text-slate-800">{bItem.rfqItem?.name}</p>
                                                                    {bItem.remarks && <p className="text-xs text-slate-500 italic">Nota: {bItem.remarks}</p>}
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="font-medium text-slate-900">Q {Number(bItem.unitPrice).toFixed(2)} c/u</p>
                                                                    <p className="text-xs text-slate-500">Subtotal: Q {Number(bItem.totalPrice).toFixed(2)}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Plazo de Entrega</p>
                                                    <p className="text-sm text-slate-800 font-medium">{bid.deliveryLeadTime || 'No especificado'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Validez Oferta</p>
                                                    <p className="text-sm text-slate-800 font-medium">{bid.validityDays ? `${bid.validityDays} días` : 'No especificada'}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Mensaje / Condiciones Generales</p>
                                                <p className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                    {bid.coverLetter}
                                                </p>
                                            </div>

                                            {effectiveStatus === 'EVALUATING' && (
                                                <div className="pt-4 flex justify-end">
                                                    <AcceptBidButton bidId={bid.id} rfqId={rfq.id} amount={Number(bid.amount)} />
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {effectiveStatus === 'CLOSED' && acceptedBid && !hasReviewed && (
                            <ReviewForm 
                                rfqId={rfq.id} 
                                targetCompanyId={acceptedBid.companyId} 
                                targetCompanyName={acceptedBid.company?.name || 'Proveedor'} 
                            />
                        )}
                        {effectiveStatus === 'CLOSED' && hasReviewed && (
                            <div className="mt-8 p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-center font-medium">
                                Ya has evaluado a {acceptedBid?.company?.name} por esta transacción.
                            </div>
                        )}
                    </div>
                )}

                {/* --- SUPPLIER VIEW: Bid Form or Status --- */}
                {role === 'SUPPLIER' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            Tu Interacción
                        </h2>

                        {effectiveStatus !== 'OPEN' && !hasSupplierBid ? (
                            <Card className="bg-slate-50">
                                <CardContent className="py-8 text-center">
                                    <p className="text-slate-500 font-medium">El tiempo de recepción de ofertas para esta solicitud ha expirado.</p>
                                </CardContent>
                            </Card>
                        ) : hasSupplierBid && supplierBid ? (
                            <Card className={`border-l-4 ${supplierBid.status === 'ACCEPTED' ? 'border-l-green-500' : supplierBid.status === 'REJECTED' ? 'border-l-red-500' : 'border-l-blue-500'} shadow-sm`}>
                                <CardHeader>
                                    <CardTitle className="flex justify-between items-center">
                                        <span>Oferta Enviada</span>
                                        <Badge variant={
                                            supplierBid.status === 'ACCEPTED' ? 'default' :
                                                supplierBid.status === 'REJECTED' ? 'destructive' :
                                                    'secondary'
                                        } className={supplierBid.status === 'ACCEPTED' ? 'bg-green-600' : ''}>
                                            {supplierBid.status === 'PENDING' ? 'EN REVISIÓN' : supplierBid.status === 'ACCEPTED' ? '✓ ACEPTADA' : 'RECHAZADA'}
                                        </Badge>
                                        {supplierBid.status === 'ACCEPTED' && (
                                            <PoDownloadButton rfq={rfq} bid={supplierBid} />
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-12">
                                        <div>
                                            <p className="text-sm text-slate-500 mb-1">Monto Ofertado</p>
                                            <p className="text-2xl font-bold text-slate-900">Q {Number(supplierBid.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 mb-1">Fecha</p>
                                            <p className="text-lg font-medium text-slate-900">{new Date(supplierBid.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    {supplierBid.items && supplierBid.items.length > 0 && (
                                        <div>
                                            <p className="text-sm text-slate-500 mb-2">Desglose Económico</p>
                                            <div className="space-y-2 bg-slate-50 border border-slate-100 p-4 rounded-xl">
                                                {supplierBid.items.map((bItem: any) => (
                                                    <div key={bItem.id} className="flex justify-between items-center text-sm border-b border-slate-200 last:border-0 pb-2 last:pb-0">
                                                        <div>
                                                            <p className="font-semibold text-slate-800">{bItem.rfqItem?.name}</p>
                                                            {bItem.remarks && <p className="text-xs text-slate-500 italic">Nota: {bItem.remarks}</p>}
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-medium text-slate-900">Q {Number(bItem.unitPrice).toFixed(2)} c/u</p>
                                                            <p className="text-xs text-emerald-600 font-semibold">Subtotal: Q {Number(bItem.totalPrice).toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-slate-500 mb-1">Plazo de Entrega</p>
                                            <p className="text-sm font-medium text-slate-900">{supplierBid.deliveryLeadTime || 'No especificado'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 mb-1">Días de Validez</p>
                                            <p className="text-sm font-medium text-slate-900">{supplierBid.validityDays || 'No especificada'}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm text-slate-500 mb-2">Condiciones Generales</p>
                                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm whitespace-pre-wrap">
                                            {supplierBid.coverLetter}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <BidForm rfqId={rfq.id} rfqItems={rfq.items} />
                        )}

                        {effectiveStatus === 'CLOSED' && supplierBid?.status === 'ACCEPTED' && !hasReviewed && (
                            <ReviewForm 
                                rfqId={rfq.id} 
                                targetCompanyId={rfq.companyId} 
                                targetCompanyName={rfq.company?.name || 'Comprador'} 
                            />
                        )}
                        {effectiveStatus === 'CLOSED' && supplierBid?.status === 'ACCEPTED' && hasReviewed && (
                            <div className="mt-8 p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-center font-medium">
                                Ya has evaluado a {rfq.company?.name} por esta transacción.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
