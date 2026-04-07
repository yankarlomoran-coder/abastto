'use server'

import { auth } from '@/auth'
import prisma from '@/lib/prisma'

export async function exportRfqsToCSV(): Promise<{ success: boolean, csv?: string, message?: string }> {
    const session = await auth()

    if (!session?.user?.companyId) {
        return { success: false, message: 'Acceso denegado. Debes pertenecer a una empresa.' }
    }

    try {
        const rfqs = await prisma.rfq.findMany({
            where: { companyId: session.user.companyId },
            include: {
                items: true,
                bids: {
                    where: { status: 'ACCEPTED' },
                    include: { company: { select: { name: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        if (rfqs.length === 0) {
            return { success: false, message: 'No se encontraron solicitudes para exportar.' }
        }

        // Build CSV rows
        const headers = [
            'ID Solicitud',
            'Título',
            'Categoría',
            'Presupuesto (Q)',
            'Estado',
            'Fecha de Creación',
            'Fecha de Cierre',
            'Productos',
            'Proveedor Adjudicado',
            'Monto Adjudicado (Q)',
            'Ubicación de Entrega',
            'Condiciones de Pago'
        ]

        const statusLabels: Record<string, string> = {
            'DRAFT_PENDING_APPROVAL': 'Pendiente de Aprobación',
            'OPEN': 'Abierta',
            'EVALUATING': 'En Evaluación',
            'AWARDED': 'Adjudicada',
            'PENDING_DELIVERY': 'Pendiente de Entrega',
            'DELIVERED': 'Entregada',
            'CLOSED': 'Cerrada',
            'CANCELLED': 'Cancelada'
        }

        const categoryLabels: Record<string, string> = {
            'TECH': 'Tecnología',
            'OFFICE': 'Oficina',
            'CONSTRUCTION': 'Construcción',
            'SERVICES': 'Servicios',
            'OTHER': 'Otro'
        }

        const paymentLabels: Record<string, string> = {
            'CASH': 'Al Contado',
            'NET_30': 'Crédito 30 Días',
            'NET_60': 'Crédito 60 Días'
        }

        const rows = rfqs.map(rfq => {
            const acceptedBid = rfq.bids[0]
            const itemsList = rfq.items.map(i => `${i.name} (${i.quantity} ${i.unit})`).join('; ')
            
            return [
                rfq.id.slice(0, 8),
                `"${rfq.title.replace(/"/g, '""')}"`,
                categoryLabels[rfq.category || ''] || 'No especificada',
                rfq.budget.toString(),
                statusLabels[rfq.status] || rfq.status,
                new Date(rfq.createdAt).toLocaleDateString('es-GT'),
                new Date(rfq.deadline).toLocaleDateString('es-GT'),
                `"${itemsList}"`,
                acceptedBid?.company?.name || 'No adjudicada',
                acceptedBid ? Number(acceptedBid.amount).toFixed(2) : '—',
                rfq.deliveryLocation || 'No especificada',
                paymentLabels[rfq.paymentTerms || ''] || 'No especificada'
            ].join(',')
        })

        const csv = [headers.join(','), ...rows].join('\n')

        return { success: true, csv }
    } catch (error) {
        console.error('Export error:', error)
        return { success: false, message: 'Error al generar la exportación.' }
    }
}

export async function exportBidsToCSV(rfqId: string): Promise<{ success: boolean, csv?: string, message?: string }> {
    const session = await auth()

    if (!session?.user?.companyId) {
        return { success: false, message: 'Acceso denegado.' }
    }

    try {
        const rfq = await prisma.rfq.findUnique({
            where: { id: rfqId },
            include: {
                bids: {
                    include: {
                        company: { select: { name: true } },
                        items: { include: { rfqItem: true } }
                    },
                    orderBy: { amount: 'asc' }
                }
            }
        })

        if (!rfq || rfq.companyId !== session.user.companyId) {
            return { success: false, message: 'Solicitud no encontrada o sin permisos.' }
        }

        if (rfq.bids.length === 0) {
            return { success: false, message: 'No hay ofertas para exportar.' }
        }

        const headers = [
            'Proveedor',
            'Monto Total (Q)',
            'Plazo de Entrega',
            'Validez (días)',
            'Estado',
            'Fecha de Envío',
            'Desglose de Productos'
        ]

        const rows = rfq.bids.map(bid => {
            const itemsBreakdown = bid.items.map(i => 
                `${i.rfqItem?.name}: Q${Number(i.unitPrice).toFixed(2)} x ${i.rfqItem?.quantity}`
            ).join('; ')

            return [
                `"${(bid.company?.name || 'Proveedor').replace(/"/g, '""')}"`,
                Number(bid.amount).toFixed(2),
                bid.deliveryLeadTime || 'No especificado',
                bid.validityDays?.toString() || '—',
                bid.status === 'ACCEPTED' ? 'Adjudicada' : bid.status === 'REJECTED' ? 'No seleccionada' : 'En evaluación',
                new Date(bid.createdAt).toLocaleDateString('es-GT'),
                `"${itemsBreakdown}"`
            ].join(',')
        })

        const csv = [headers.join(','), ...rows].join('\n')

        return { success: true, csv }
    } catch (error) {
        console.error('Export error:', error)
        return { success: false, message: 'Error al generar la exportación.' }
    }
}
