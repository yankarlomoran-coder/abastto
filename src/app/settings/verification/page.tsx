import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { ShieldCheck, AlertTriangle, FileText, UploadCloud, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { uploadKycDocument, requestKycReview } from "@/actions/kyc"

export default async function VerificationPage() {
    const session = await auth()
    if (!session?.user?.companyId) redirect("/login")

    const company = await prisma.company.findUnique({
        where: { id: session.user.companyId },
        include: { documents: true }
    })

    if (!company) redirect("/login")

    const hasRtu = company.documents.some(d => d.type === 'RTU')
    const hasPatente = company.documents.some(d => d.type === 'PATENTE')
    const hasRep = company.documents.some(d => d.type === 'REPRESENTACION_LEGAL')
    
    const canRequestReview = hasRtu && hasPatente && hasRep && company.kycStatus === 'PENDING'

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-blue-500" /> Verificación Legal (KYC)
                </h2>
                <p className="text-slate-500 text-sm mt-1">Sube la documentación legal de tu empresa para habilitar las negociaciones B2B formales.</p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-sm font-bold text-blue-900">¿Por qué de esto?</h4>
                    <p className="text-sm text-blue-800/80 mt-1">Abastto es una plataforma de alta confianza. Para poder crear licitaciones o aceptar ofertas grandes, las empresas deben estar homologadas para evitar fraude.</p>
                </div>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Estado de Cuenta</CardTitle>
                            <CardDescription>Resumen de tu homologación corporativa</CardDescription>
                        </div>
                        {company.isVerified ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200">💎 Homologada</Badge>
                        ) : company.kycStatus === 'REVIEW_REQUESTED' ? (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200"><Clock className="w-3 h-3 mr-1"/> En Revisión</Badge>
                        ) : (
                            <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200">Restringida</Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!company.isVerified && company.kycStatus !== 'REVIEW_REQUESTED' && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Documentos Requeridos</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <DocUploadCard type="RTU" title="Registro Tributario (RTU)" isUploaded={hasRtu} />
                                <DocUploadCard type="PATENTE" title="Patente de Comercio" isUploaded={hasPatente} />
                                <DocUploadCard type="REPRESENTACION_LEGAL" title="Representación Legal" isUploaded={hasRep} />
                            </div>

                            {canRequestReview && (
                                <div className="pt-6 border-t mt-6">
                                    <form action={requestKycReview}>
                                        <Button type="submit" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                                            Solicitar Verificación Oficial
                                        </Button>
                                    </form>
                                    <p className="text-xs text-slate-500 mt-2">Al solicitar verificación, nuestro equipo legal revisará los documentos en un margen de 24 horas.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {company.isVerified && (
                        <div className="text-center py-8">
                            <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-900">¡Tu empresa ha sido verificada con éxito!</h3>
                            <p className="text-slate-500 max-w-sm mx-auto mt-2">Ahora tienes acceso total e ilimitado para crear RFQs, aceptar pujas y manejar transacciones seguras.</p>
                        </div>
                    )}
                    
                    {company.kycStatus === 'REVIEW_REQUESTED' && !company.isVerified && (
                        <div className="text-center py-8 border-2 border-dashed border-amber-100 rounded-xl bg-amber-50/30">
                            <Clock className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-amber-900">Tus documentos están en revisión</h3>
                            <p className="text-amber-800/80 max-w-md mx-auto mt-2">Hemos recibido tu papelería. Nuestro equipo legal la validará en un período no mayor a 24 horas hábiles. Te notificaremos por correo cuando tu cuenta sea Homologada.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function DocUploadCard({ type, title, isUploaded }: { type: string, title: string, isUploaded: boolean }) {
    return (
        <div className={`p-4 rounded-xl border ${isUploaded ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${isUploaded ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                    <FileText className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
            </div>
            
            {isUploaded ? (
                <div className="flex items-center gap-1.5 text-xs font-medium text-green-700">
                    <ShieldCheck className="w-4 h-4" /> Entregado y Seguro
                </div>
            ) : (
                <form action={uploadKycDocument} className="flex flex-col gap-2">
                    <input type="hidden" name="type" value={type} />
                    <input 
                        type="url" 
                        name="url" 
                        required 
                        placeholder="Link a Drive / Dropbox" 
                        className="w-full text-xs px-3 py-2 border rounded-md outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <Button type="submit" variant="secondary" size="sm" className="w-full text-xs font-semibold h-8 bg-slate-100 hover:bg-slate-200">
                        <UploadCloud className="w-3 h-3 mr-1" /> Adjuntar Link
                    </Button>
                </form>
            )}
        </div>
    )
}
