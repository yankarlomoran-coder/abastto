'use server'

import { z } from 'zod'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const BidItemSchema = z.object({
    rfqItemId: z.string(),
    unitPrice: z.coerce.number().min(0, { message: 'El precio unitario no puede ser negativo.' }),
    remarks: z.string().optional()
})

const BidSchema = z.object({
    rfqId: z.string(),
    validityDays: z.coerce.number().positive({ message: 'Días de validez requeridos.' }),
    deliveryLeadTime: z.string().min(2, { message: 'Especifica el tiempo de entrega (ej. 5 días).' }),
    proposal: z.string().min(10, { message: 'La propuesta debe tener al menos 10 caracteres.' }),
    items: z.array(BidItemSchema).min(1, { message: 'Debes cotizar al menos un producto.' })
})

export type BidState = {
    errors?: {
        validityDays?: string[]
        deliveryLeadTime?: string[]
        proposal?: string[]
        rfqId?: string[]
        items?: string[]
    }
    message?: string | null
}

export async function createBid(prevState: BidState | undefined, data: any) {
    const session = await auth()

    if (!session?.user?.companyId || session.user.role !== 'SUPPLIER') {
        return { message: 'Acceso denegado. Solo proveedores verificados pueden enviar ofertas.' }
    }

    const company = await prisma.company.findUnique({
        where: { id: session.user.companyId },
        select: { isVerified: true }
    })

    if (!company?.isVerified) {
        return { message: 'Acceso corporativo restringido: Debes homologar a tu empresa subiendo la documentación legal requerida en Ajustes -> Verificación.' }
    }

    const validatedFields = BidSchema.safeParse(data)

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Faltan campos o son inválidos en la cotización.',
        }
    }

    const { rfqId, validityDays, deliveryLeadTime, proposal, items } = validatedFields.data
    const coverLetter = proposal // Simplify as the other fields are now native

    // Find the original RFQ to cross-reference items and quantities
    const rfq = await prisma.rfq.findUnique({
        where: { id: rfqId },
        include: { items: true }
    })

    if (!rfq) return { message: 'Solicitud no encontrada.' }
    if (new Date() > rfq.deadline) return { message: 'La fecha límite de esta solicitud ya expiró.' }

    // Calculate total amounts based on verified RFQ quantities
    let totalAmount = 0
    const processedBidItems = items.map(bidItem => {
        const rfqItem = rfq.items.find(i => i.id === bidItem.rfqItemId)
        const quantity = rfqItem ? rfqItem.quantity : 1
        const totalPrice = bidItem.unitPrice * quantity
        totalAmount += totalPrice

        return {
            rfqItemId: bidItem.rfqItemId,
            unitPrice: bidItem.unitPrice,
            totalPrice,
            remarks: bidItem.remarks
        }
    })

    try {
        const rfq = await prisma.rfq.findUnique({ where: { id: rfqId } })
        if (!rfq) return { message: 'Solicitud no encontrada.' }
        if (new Date() > rfq.deadline) return { message: 'La fecha límite de esta solicitud ya expiró.' }

        // Check if supplier's company already bid on this RFQ
        const existingBid = await prisma.bid.findFirst({
            where: {
                rfqId: rfqId,
                companyId: session.user.companyId
            }
        })

        if (existingBid) {
            return { message: 'Ya has enviado una oferta para esta solicitud.' }
        }

        await prisma.bid.create({
            data: {
                rfqId,
                companyId: session.user.companyId,
                amount: totalAmount,
                validityDays,
                deliveryLeadTime,
                coverLetter,
                status: 'PENDING',
                items: {
                    create: processedBidItems
                }
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
        // Verify RFQ belongs to the buyer's company and deadline has passed
        const rfq = await prisma.rfq.findUnique({ where: { id: rfqId } })
        if (rfq?.companyId !== session.user.companyId) {
            return { success: false, message: 'Tu empresa no es dueña de esta solicitud.' }
        }
        if (new Date() < rfq.deadline!) {
            return { success: false, message: 'No puedes aceptar ofertas antes de la fecha límite.' }
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
