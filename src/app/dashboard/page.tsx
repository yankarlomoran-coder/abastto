import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Package, Clock, DollarSign } from "lucide-react"

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const { role, id, name } = session.user

    let rfqs: any[] = []

    if (role === 'BUYER') {
        rfqs = await prisma.rfq.findMany({
            where: { companyId: session.user.companyId as string },
            orderBy: { createdAt: 'desc' }
        })
    } else {
        rfqs = await prisma.rfq.findMany({
            where: { status: 'OPEN' },
            include: { company: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        })
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Panel de Control
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Bienvenido, <span className="font-semibold text-gray-900">{name}</span>
                            <Badge variant="outline" className="ml-2 capitalize">
                                {role === 'BUYER' ? 'Comprador' : 'Proveedor'}
                            </Badge>
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {role === 'BUYER' && (
                            <Link href="/rfq/create">
                                <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Nueva Solicitud
                                </Button>
                            </Link>
                        )}
                        <form
                            action={async () => {
                                "use server"
                                await signOut({ redirectTo: '/login' })
                            }}
                        >
                            <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                                Cerrar Sesión
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        {role === 'BUYER' ? 'Mis Solicitudes Recientes' : 'Oportunidades de Negocio'}
                        <Badge variant="secondary" className="rounded-full px-2.5">
                            {rfqs.length}
                        </Badge>
                    </h2>

                    {rfqs.length === 0 ? (
                        <Card className="bg-white border-dashed shadow-sm">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <Package className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No hay solicitudes disponibles</h3>
                                <p className="text-gray-500 max-w-sm">
                                    {role === 'BUYER'
                                        ? 'Comienza creando tu primera solicitud de cotización para recibir ofertas de proveedores.'
                                        : 'Actualmente no hay solicitudes abiertas en el mercado. Vuelve a consultar pronto.'}
                                </p>
                                {role === 'BUYER' && (
                                    <Link href="/rfq/create" className="mt-6">
                                        <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
                                            Crear mi primera solicitud
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {rfqs.map((rfq) => {
                                const isPastDeadline = rfq.deadline ? new Date() > rfq.deadline : false;
                                const effectiveStatus = rfq.status === 'OPEN' && isPastDeadline ? 'EVALUATING' : rfq.status;

                                return (
                                    <Link key={rfq.id} href={`/rfq/${rfq.id}`} className="block">
                                        <Card className="h-full hover:shadow-md transition-shadow duration-200 group cursor-pointer hover:border-blue-200">
                                            <CardHeader className="pb-3">
                                                <div className="flex justify-between items-start gap-4">
                                                    <CardTitle className="text-lg font-bold leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                        {rfq.title}
                                                    </CardTitle>
                                                    <Badge variant={effectiveStatus === 'OPEN' ? 'default' : effectiveStatus === 'EVALUATING' ? 'outline' : 'secondary'} className={effectiveStatus === 'OPEN' ? 'bg-green-600 hover:bg-green-700' : effectiveStatus === 'EVALUATING' ? 'border-amber-500 text-amber-600' : ''}>
                                                        {effectiveStatus === 'OPEN' ? 'ABIERTA' : effectiveStatus === 'EVALUATING' ? 'EN EVALUACIÓN' : effectiveStatus === 'CLOSED' ? 'CERRADA' : rfq.status}
                                                    </Badge>
                                                </div>
                                                <CardDescription className="line-clamp-2 pt-1">
                                                    {rfq.description}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3 pt-2 text-sm text-gray-600">
                                                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold px-1 text-gray-400">Q</span>
                                                            <span>Presupuesto</span>
                                                        </div>
                                                        <span className="font-bold text-gray-900">Q {Number(rfq.budget).toFixed(2)}</span>
                                                    </div>

                                                    <div className="flex items-center justify-between px-2">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-gray-400" />
                                                            <span>Publicado</span>
                                                        </div>
                                                        <span>{new Date(rfq.createdAt).toLocaleDateString()}</span>
                                                    </div>

                                                    {rfq.deadline && (
                                                        <div className="flex items-center justify-between px-2">
                                                            <div className="flex items-center gap-2">
                                                                <Clock className={`h-4 w-4 ${isPastDeadline ? 'text-red-400' : 'text-blue-400'}`} />
                                                                <span className={isPastDeadline ? 'text-red-600 font-medium' : ''}>Cierre</span>
                                                            </div>
                                                            <span className={isPastDeadline ? 'text-red-600 font-medium' : ''}>
                                                                {new Date(rfq.deadline).toLocaleString('es-GT', { dateStyle: 'short', timeStyle: 'short', hour12: true })}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {role === 'SUPPLIER' && (
                                                        <div className="flex items-center justify-between px-2 pt-2 border-t border-gray-100 mt-2">
                                                            <span className="text-xs text-gray-500 uppercase font-medium tracking-wide">Empresa Compradora</span>
                                                            <span className="font-medium text-blue-900 truncate max-w-[120px]">
                                                                {(rfq as any).company?.name || 'Empresa Verificada'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="mt-5">
                                                    <Button variant="outline" className="w-full group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200 transition-all">
                                                        Ver Detalles
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
