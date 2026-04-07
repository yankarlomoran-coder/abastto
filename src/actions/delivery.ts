'use server'

import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { logActivity } from '@/lib/activity-log'

/**
 * Confirms delivery of an RFQ. Only the buyer who owns the RFQ can confirm.
 * Transitions: PENDING_DELIVERY → DELIVERED
 * After delivery is confirmed, both parties can leave reviews.
 */
export async function confirmDelivery(rfqId: string) {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== 'BUYER') {
        return { success: false, message: 'Solo el comprador puede confirmar la entrega.' }
    }

    try {
        const rfq = await prisma.rfq.findUnique({
            where: { id: rfqId },
            include: {
                bids: {
                    where: { status: 'ACCEPTED' },
                    include: { company: { select: { name: true } } }
                }
            }
        })

        if (!rfq) {
            return { success: false, message: 'Solicitud no encontrada.' }
        }

        if (rfq.companyId !== session.user.companyId) {
            return { success: false, message: 'No tienes permisos para confirmar esta entrega.' }
        }

        if (rfq.status !== 'PENDING_DELIVERY') {
            return { success: false, message: 'La solicitud no está en estado de entrega pendiente.' }
        }

        const winningBid = rfq.bids[0]
        if (!winningBid) {
            return { success: false, message: 'No se encontró la oferta ganadora.' }
        }

        await prisma.rfq.update({
            where: { id: rfqId },
            data: {
                status: 'DELIVERED',
                deliveryConfirmedAt: new Date(),
                deliveryConfirmedBy: session.user.id,
            }
        })

        await logActivity({
            action: 'DELIVERY_CONFIRMED',
            description: `Entrega confirmada para "${rfq.title}" - Proveedor: ${winningBid.company.name}`,
            userId: session.user.id,
            companyId: session.user.companyId,
            metadata: { rfqId, supplierCompany: winningBid.company.name }
        })

        revalidatePath(`/rfq/${rfqId}`)
        return { success: true, message: 'Entrega confirmada. Ahora ambas partes pueden calificarse mutuamente.' }
    } catch (error) {
        console.error("Failed to confirm delivery:", error)
        return { success: false, message: 'Error al confirmar la entrega.' }
    }
}

/**
 * Closes an RFQ after delivery has been confirmed and (optionally) reviews submitted.
 * Transitions: DELIVERED → CLOSED
 */
export async function closeRfq(rfqId: string) {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== 'BUYER') {
        return { success: false, message: 'Solo el comprador puede cerrar la solicitud.' }
    }

    try {
        const rfq = await prisma.rfq.findUnique({ where: { id: rfqId } })

        if (!rfq) return { success: false, message: 'Solicitud no encontrada.' }
        if (rfq.companyId !== session.user.companyId) return { success: false, message: 'No tienes permisos.' }
        if (rfq.status !== 'DELIVERED') return { success: false, message: 'La solicitud debe estar en estado "Entregada" para poder cerrarla.' }

        await prisma.rfq.update({
            where: { id: rfqId },
            data: { status: 'CLOSED' }
        })

        await logActivity({
            action: 'RFQ_CLOSED',
            description: `Solicitud "${rfq.title}" cerrada oficialmente.`,
            userId: session.user.id,
            companyId: session.user.companyId,
            metadata: { rfqId }
        })

        revalidatePath(`/rfq/${rfqId}`)
        return { success: true, message: 'Solicitud cerrada exitosamente.' }
    } catch (error) {
        console.error("Failed to close RFQ:", error)
        return { success: false, message: 'Error al cerrar la solicitud.' }
    }
}
