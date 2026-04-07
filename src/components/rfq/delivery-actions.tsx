'use client'

import { useState, useTransition } from 'react'
import { confirmDelivery, closeRfq } from '@/actions/delivery'
import { Truck, Package, CheckCircle2, Loader2, Archive } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DeliveryActionsProps {
    rfqId: string
    status: string
    isBuyer: boolean
}

export function DeliveryActions({ rfqId, status, isBuyer }: DeliveryActionsProps) {
    const [isPending, startTransition] = useTransition()
    const [message, setMessage] = useState<string | null>(null)
    const [messageType, setMessageType] = useState<'success' | 'error'>('success')

    const handleConfirmDelivery = () => {
        if (!confirm('¿Confirmas que recibiste los productos/servicios de esta solicitud?')) return
        startTransition(async () => {
            const result = await confirmDelivery(rfqId)
            setMessage(result.message)
            setMessageType(result.success ? 'success' : 'error')
        })
    }

    const handleCloseRfq = () => {
        if (!confirm('¿Deseas cerrar definitivamente esta solicitud? Esta acción no se puede deshacer.')) return
        startTransition(async () => {
            const result = await closeRfq(rfqId)
            setMessage(result.message)
            setMessageType(result.success ? 'success' : 'error')
        })
    }

    if (!isBuyer) {
        // Suppliers see status indicators only
        if (status === 'PENDING_DELIVERY') {
            return (
                <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/30 rounded-xl">
                    <Truck className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-orange-700 dark:text-orange-300">Entrega pendiente</p>
                        <p className="text-xs text-orange-600/80 dark:text-orange-400/60 font-medium">
                            El comprador confirmará la recepción una vez entregado.
                        </p>
                    </div>
                </div>
            )
        }

        if (status === 'DELIVERED') {
            return (
                <div className="flex items-center gap-3 p-4 bg-teal-50 dark:bg-teal-900/10 border border-teal-200 dark:border-teal-800/30 rounded-xl">
                    <Package className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-teal-700 dark:text-teal-300">Entrega confirmada</p>
                        <p className="text-xs text-teal-600/80 dark:text-teal-400/60 font-medium">
                            El comprador confirmó la recepción. Puedes calificar esta transacción.
                        </p>
                    </div>
                </div>
            )
        }

        return null
    }

    // Buyer actions
    return (
        <div className="space-y-3">
            {status === 'PENDING_DELIVERY' && (
                <div className="p-5 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/30 rounded-xl space-y-3">
                    <div className="flex items-center gap-3">
                        <Truck className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-orange-700 dark:text-orange-300">Entrega pendiente de confirmación</p>
                            <p className="text-xs text-orange-600/80 dark:text-orange-400/60 font-medium">
                                Una vez recibidos los productos o servicios, confirma la entrega para continuar con la evaluación.
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={handleConfirmDelivery}
                        disabled={isPending}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-10 px-5 rounded-xl shadow-lg shadow-orange-600/20 w-full sm:w-auto"
                    >
                        {isPending ? (
                            <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Procesando...</>
                        ) : (
                            <><CheckCircle2 className="w-4 h-4 mr-2" /> Confirmar Recepción</>
                        )}
                    </Button>
                </div>
            )}

            {status === 'DELIVERED' && (
                <div className="p-5 bg-teal-50 dark:bg-teal-900/10 border border-teal-200 dark:border-teal-800/30 rounded-xl space-y-3">
                    <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-teal-700 dark:text-teal-300">Entrega confirmada ✓</p>
                            <p className="text-xs text-teal-600/80 dark:text-teal-400/60 font-medium">
                                Ya puedes evaluar al proveedor. Cuando termines, cierra la solicitud.
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={handleCloseRfq}
                        disabled={isPending}
                        variant="outline"
                        className="font-bold h-10 px-5 rounded-xl border-teal-300 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/20 w-full sm:w-auto"
                    >
                        {isPending ? (
                            <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Procesando...</>
                        ) : (
                            <><Archive className="w-4 h-4 mr-2" /> Cerrar Solicitud</>
                        )}
                    </Button>
                </div>
            )}

            {/* Feedback message */}
            {message && (
                <div className={`p-3 rounded-xl text-sm font-bold text-center ${
                    messageType === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30'
                        : 'bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/30'
                }`}>
                    {message}
                </div>
            )}
        </div>
    )
}
