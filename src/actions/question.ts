'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function createQuestion(rfqId: string, content: string) {
    const session = await auth()

    if (!session?.user || !session.user.companyId) {
        return { error: 'No autorizado' }
    }

    // Only Suppliers can ask questions
    if (session.user.role !== 'SUPPLIER') {
        return { error: 'Solo los proveedores pueden realizar preguntas.' }
    }

    if (!content || content.trim().length === 0) {
        return { error: 'La pregunta no puede estar vacía.' }
    }

    try {
        const rfq = await prisma.rfq.findUnique({
            where: { id: rfqId },
            select: { deadline: true, status: true }
        })

        if (!rfq || new Date() > rfq.deadline || rfq.status !== 'OPEN') {
            return { error: 'La licitación ha cerrado. No se permiten más preguntas.' }
        }

        await prisma.question.create({
            data: {
                content: content.trim(),
                rfqId,
                companyId: session.user.companyId,
            }
        })

        revalidatePath(`/rfq/${rfqId}`)
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: 'Error al enviar la pregunta.' }
    }
}

export async function answerQuestion(questionId: string, answer: string, rfqId: string) {
    const session = await auth()

    if (!session?.user || !session.user.companyId) {
        return { error: 'No autorizado' }
    }

    // Only Buyers can answer
    if (session.user.role !== 'BUYER') {
        return { error: 'Solo los compradores pueden responder.' }
    }

    if (!answer || answer.trim().length === 0) {
        return { error: 'La respuesta no puede estar vacía.' }
    }

    try {
        // Verify ownership and deadline
        const rfq = await prisma.rfq.findUnique({
            where: { id: rfqId },
            select: { companyId: true, deadline: true, status: true }
        })

        if (!rfq || rfq.companyId !== session.user.companyId) {
            return { error: 'No tienes permiso para responder en esta licitación.' }
        }

        if (new Date() > rfq.deadline || rfq.status !== 'OPEN') {
            return { error: 'La licitación ha cerrado. No se pueden publicar más respuestas.' }
        }

        await prisma.question.update({
            where: { id: questionId },
            data: {
                answer: answer.trim()
            }
        })

        revalidatePath(`/rfq/${rfqId}`)
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: 'Error al enviar la respuesta.' }
    }
}
