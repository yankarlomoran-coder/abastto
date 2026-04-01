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
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" /> Verificación de Identidad y Empresa
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Sube la documentación legal de tu organización para habilitar las gestiones comerciales protegidas.</p>
            </div>

            <div className="p-5 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-2xl flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-sm font-black text-blue-900 dark:text-blue-200 uppercase tracking-widest">Protocolo de Confianza Superior</h4>
                    <p className="text-sm text-blue-800/80 dark:text-blue-300/80 mt-1 font-medium leading-relaxed">Abastto es una infraestructura de alta integridad. Para realizar licitaciones de gran escala, las entidades deben estar homologadas para garantizar la seguridad jurídica de todas las partes.</p>
                </div>
            </div>

            <Card className="border-slate-200 dark:border-white/10 shadow-sm bg-white dark:bg-slate-900 overflow-hidden rounded-3xl transition-colors">
                <CardHeader className="border-b dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-slate-900 dark:text-white font-black">Estado de Homologación</CardTitle>
                            <CardDescription className="dark:text-slate-400 font-medium italic">Resumen de su validación corporativa</CardDescription>
                        </div>
                        {company.isVerified ? (
                            <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 font-black px-4 py-1.5 rounded-full">💎 Organización Homologada</Badge>
                        ) : company.kycStatus === 'REVIEW_REQUESTED' ? (
                            <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-800 font-black px-4 py-1.5 rounded-full"><Clock className="w-4 h-4 mr-2"/> Auditoría en Proceso</Badge>
                        ) : (
                            <Badge variant="outline" className="bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 font-black px-4 py-1.5 rounded-full uppercase tracking-tighter">Acceso Restringido</Badge>
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
        <div className={`p-6 rounded-2xl border transition-all duration-300 ${isUploaded ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50' : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 shadow-sm'}`}>
            <div className="flex items-center gap-4 mb-5">
                <div className={`p-3 rounded-xl transition-colors ${isUploaded ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                    <FileText className="w-6 h-6" />
                </div>
                <h4 className="text-[0.95rem] font-black text-slate-900 dark:text-white leading-tight">{title}</h4>
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
                        className="w-full text-xs px-4 py-3 border dark:border-white/10 rounded-xl bg-slate-50 dark:bg-white/5 outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all"
                    />
                    <Button type="submit" variant="secondary" size="sm" className="w-full text-xs font-black h-10 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 rounded-xl transition-all">
                        <UploadCloud className="w-4 h-4 mr-2" /> Vincular Expediente
                    </Button>
                </form>
            )}
        </div>
    )
}
