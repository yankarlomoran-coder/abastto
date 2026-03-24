'use server'

import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function sendMessage(formData: FormData) {
    const session = await auth()
    if (!session?.user?.companyId) {
        throw new Error("No autenticado")
    }

    const rfqId = formData.get('rfqId') as string
    const receiverId = formData.get('receiverId') as string
    const content = formData.get('content') as string

    if (!rfqId || !receiverId || !content || content.trim().length === 0) {
        throw new Error("Datos inválidos")
    }

    try {
        await (prisma as any).message.create({
            data: {
                content: content.trim(),
                senderId: session.user.companyId,
                receiverId,
                rfqId
            }
        })
        
        // No redirigimos ni revalidamos rígidamente si usamos SWR o si mandamos la ruta en el formulario
        const pathname = formData.get('pathname') as string
        if (pathname) {
            revalidatePath(pathname)
        }
        
    } catch (error) {
        console.error("Error al enviar mensaje:", error)
        throw new Error("No se pudo enviar el mensaje")
    }
}

// Para Fetching Client-Side via SWR o Polling
export async function getMessages(rfqId: string, companyAId: string, companyBId: string) {
    const session = await auth()
    if (!session?.user?.id) return []

    // Security check: Either user works for companyA or companyB
    if (session.user.companyId !== companyAId && session.user.companyId !== companyBId) {
        return []
    }

    try {
        const messages = await (prisma as any).message.findMany({
            where: {
                rfqId,
                OR: [
                    { senderId: companyAId, receiverId: companyBId },
                    { senderId: companyBId, receiverId: companyAId }
                ]
            },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: { select: { name: true } }
            }
        })
        return messages
    } catch (error) {
        console.error("Error fetching messages:", error)
        return []
    }
}
