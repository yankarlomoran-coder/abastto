'use server'

import { z } from 'zod'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { logActivity } from '@/lib/activity-log'

const ReviewSchema = z.object({
    rfqId: z.string(),
    targetCompanyId: z.string(),
    ratingQuality: z.coerce.number().min(1).max(5),
    ratingPunctuality: z.coerce.number().min(1).max(5),
    ratingCommunication: z.coerce.number().min(1).max(5),
    ratingProfessionalism: z.coerce.number().min(1).max(5),
    comment: z.string().optional()
})

export async function createReview(prevState: any, data: any) {
    const session = await auth()

    if (!session?.user?.companyId) {
        return { success: false, message: 'No estás autenticado o no perteneces a una empresa.' }
    }

    const validatedFields = ReviewSchema.safeParse(data)

    if (!validatedFields.success) {
        return { success: false, message: 'Valores inválidos en las calificaciones.' }
    }

    const { rfqId, targetCompanyId, ratingQuality, ratingPunctuality, ratingCommunication, ratingProfessionalism, comment } = validatedFields.data
    const authorCompanyId = session.user.companyId

    try {
        // Validation: Verify if RFQ is closed
        const rfq = await prisma.rfq.findUnique({
            where: { id: rfqId },
            include: { bids: true }
        })

        if (!rfq || !['DELIVERED', 'CLOSED'].includes(rfq.status)) {
            return { success: false, message: 'La entrega debe estar confirmada antes de poder evaluar.' }
        }

        // Check if there is already a review
        const existingReview = await prisma.review.findUnique({
            where: {
                authorCompanyId_rfqId: {
                    authorCompanyId,
                    rfqId
                }
            }
        })

        if (existingReview) {
            return { success: false, message: 'Ya has calificado esta transacción.' }
        }

        // Logic check: Only the buyer and the accepted supplier can give a review
        const isBuyer = rfq.companyId === authorCompanyId
        const acceptedBid = rfq.bids.find(b => b.status === 'ACCEPTED')
        
        if (!acceptedBid) {
            return { success: false, message: 'No hay proveedor adjudicado para evaluar.' }
        }

        const isSupplier = acceptedBid.companyId === authorCompanyId

        if (!isBuyer && !isSupplier) {
            return { success: false, message: 'No tienes la autoridad para calificar esta licitación.' }
        }

        // Save Review
        await prisma.review.create({
            data: {
                authorCompanyId,
                targetCompanyId,
                rfqId,
                ratingQuality,
                ratingPunctuality,
                ratingCommunication,
                ratingProfessionalism,
                comment,
            }
        })

        await logActivity({
            action: 'REVIEW_SUBMITTED',
            description: `Reseña enviada con promedio ${((ratingQuality + ratingPunctuality + ratingCommunication + ratingProfessionalism) / 4).toFixed(1)}/5`,
            userId: session.user.id,
            companyId: authorCompanyId,
            metadata: { rfqId, targetCompanyId, avgRating: (ratingQuality + ratingPunctuality + ratingCommunication + ratingProfessionalism) / 4 }
        })

    } catch (error) {
        console.error("Error saving review:", error)
        return { success: false, message: 'Error de base de datos al guardar la reseña.' }
    }

    revalidatePath(`/rfq/${rfqId}`)
    return { success: true, message: '¡Gracias por compartir tu experiencia! Tu evaluación fortalece a la comunidad Abastto.' }
}
