'use server'

import { z } from 'zod'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const BidSchema = z.object({
    rfqId: z.string(),
    amount: z.coerce.number().positive({ message: 'La oferta debe ser un número positivo.' }),
    deliveryTime: z.string().min(2, { message: 'Especifica el tiempo de entrega (ej. 5 días).' }),
    proposal: z.string().min(10, { message: 'La propuesta debe tener al menos 10 caracteres.' }),
})

export type BidState = {
    errors?: {
        amount?: string[]
        deliveryTime?: string[]
        proposal?: string[]
        rfqId?: string[]
    }
    message?: string | null
}

export async function createBid(prevState: BidState | undefined, formData: FormData) {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== 'SUPPLIER') {
        return { message: 'Acceso denegado. Solo proveedores pueden enviar ofertas.' }
    }

    const validatedFields = BidSchema.safeParse({
        rfqId: formData.get('rfqId'),
        amount: formData.get('amount'),
        deliveryTime: formData.get('deliveryTime'),
        proposal: formData.get('proposal'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Faltan campos o son inválidos.',
        }
    }

    const { rfqId, amount, deliveryTime, proposal } = validatedFields.data
    const coverLetter = `Tiempo de entrega: ${deliveryTime}\n\nPropuesta: ${proposal}`

    try {
        // Check if supplier already bid on this RFQ
        const existingBid = await prisma.bid.findFirst({
            where: {
                rfqId: rfqId,
                supplierId: session.user.id
            }
        })

        if (existingBid) {
            return { message: 'Ya has enviado una oferta para esta solicitud.' }
        }

        await prisma.bid.create({
            data: {
                rfqId,
                supplierId: session.user.id,
                amount,
                coverLetter,
                status: 'PENDING',
            },
        })

    } catch (error) {
        console.error("Failed to create Bid:", error)
        return {
            message: 'Error de base de datos: No se pudo enviar la oferta.',
        }
    }

    revalidatePath(`/rfq/${rfqId}`)
    return { message: 'Oferta enviada con éxito.' }
}

export async function acceptBid(bidId: string, rfqId: string) {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== 'BUYER') {
        return { success: false, message: 'Acceso denegado.' }
    }

    try {
        // Verify RFQ belongs to the buyer
        const rfq = await prisma.rfq.findUnique({ where: { id: rfqId } })
        if (rfq?.buyerId !== session.user.id) {
            return { success: false, message: 'No eres el dueño de esta solicitud.' }
        }

        // Use transaction to ensure data consistency
        await prisma.$transaction([
            // Mark the winning bid as ACCEPTED
            prisma.bid.update({
                where: { id: bidId },
                data: { status: 'ACCEPTED' }
            }),
            // Mark all other bids for this RFQ as REJECTED
            prisma.bid.updateMany({
                where: { rfqId: rfqId, id: { not: bidId } },
                data: { status: 'REJECTED' }
            }),
            // Close the RFQ
            prisma.rfq.update({
                where: { id: rfqId },
                data: { status: 'CLOSED' }
            })
        ])

        revalidatePath(`/rfq/${rfqId}`)
        return { success: true, message: 'Oferta aceptada. Solicitud cerrada.' }
    } catch (error) {
        console.error("Failed to accept Bid:", error)
        return { success: false, message: 'Error al aceptar la oferta.' }
    }
}
