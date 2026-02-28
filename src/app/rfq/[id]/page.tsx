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
            buyer: { select: { name: true, email: true } },
            bids: {
                include: { supplier: { select: { name: true, email: true } } },
                orderBy: { amount: 'asc' }
            }
        }
    })

    if (!rfq) {
        notFound()
    }

    // Security check: Only the owner Buyer or any Supplier can view this
    if (role === 'BUYER' && rfq.buyerId !== userId) {
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

    const hasSupplierBid = role === 'SUPPLIER' ? rfq.bids.some(b => b.supplierId === userId) : false
    const supplierBid = role === 'SUPPLIER' ? rfq.bids.find(b => b.supplierId === userId) : null

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
                            <Badge variant={rfq.status === 'OPEN' ? 'default' : rfq.status === 'CLOSED' ? 'secondary' : 'default'}
                                className={rfq.status === 'OPEN' ? 'bg-green-600' : ''}>
                                {rfq.status === 'OPEN' ? 'ABIERTA' : rfq.status === 'CLOSED' ? 'CERRADA' : rfq.status}
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
                                    <DollarSign className="h-6 w-6 text-emerald-500" />
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
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Comprador</p>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                                        {rfq.buyer.name?.[0]?.toUpperCase() || 'C'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 line-clamp-1">{rfq.buyer.name || 'Cliente Verificado'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* --- BUYER VIEW: List of Bids --- */}
                {role === 'BUYER' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <PackageIcon className="h-5 w-5 text-blue-600" />
                                Ofertas Recibidas ({rfq.bids.length})
                            </h2>
                        </div>

                        {rfq.bids.length > 0 && rfq.status === 'OPEN' && (
                            <OfferAnalysis rfqId={rfq.id} />
                        )}

                        {rfq.bids.length === 0 ? (
                            <Card className="bg-transparent border-dashed border-2">
                                <CardContent className="py-12 text-center">
                                    <p className="text-slate-500">Aún no hay ofertas para esta solicitud.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {rfq.bids.map((bid) => (
                                    <Card key={bid.id} className={`border ${bid.status === 'ACCEPTED' ? 'border-green-500 ring-1 ring-green-500' : 'border-slate-200'} shadow-sm`}>
                                        <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-lg font-bold text-slate-900">
                                                        {bid.supplier.name || 'Proveedor Anónimo'}
                                                    </CardTitle>
                                                    <CardDescription>{new Date(bid.createdAt).toLocaleDateString()}</CardDescription>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-bold text-emerald-600">Q {Number(bid.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                    {bid.status === 'ACCEPTED' && (
                                                        <Badge variant="default" className="bg-green-600 mt-1">ACEPTADA</Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-4 space-y-4">
                                            <div>
                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Mensaje / Condiciones</p>
                                                <p className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                    {bid.coverLetter}
                                                </p>
                                            </div>

                                            {rfq.status === 'OPEN' && (
                                                <div className="pt-4 flex justify-end">
                                                    <AcceptBidButton bidId={bid.id} rfqId={rfq.id} amount={Number(bid.amount)} />
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
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

                        {rfq.status !== 'OPEN' && !hasSupplierBid ? (
                            <Card className="bg-slate-50">
                                <CardContent className="py-8 text-center">
                                    <p className="text-slate-500 font-medium">Esta solicitud ya ha sido cerrada por el comprador.</p>
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
                                    <div>
                                        <p className="text-sm text-slate-500 mb-2">Mensaje / Propuesta</p>
                                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm whitespace-pre-wrap">
                                            {supplierBid.coverLetter}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <BidForm rfqId={rfq.id} />
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
