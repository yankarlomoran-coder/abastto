'use server'

import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function uploadKycDocument(formData: FormData) {
    const session = await auth()
    
    // Solo permitimos a miembros de la empresa subir documentos
    if (!session?.user?.companyId) {
        throw new Error("No tienes una empresa vinculada.")
    }

    const type = formData.get('type') as string
    const url = formData.get('url') as string

    if (!type || !url) {
        throw new Error("Faltan campos obligatorios.")
    }

    try {
        // Verificar si ya existe un documento de este tipo, y si es así, actualizarlo
        const existingDoc = await (prisma as any).companyDocument.findFirst({
            where: {
                companyId: session.user.companyId,
                type: type
            }
        })

        if (existingDoc) {
            await (prisma as any).companyDocument.update({
                where: { id: existingDoc.id },
                data: { url, status: 'PENDING' }
            })
        } else {
            await (prisma as any).companyDocument.create({
                data: {
                    type,
                    url,
                    companyId: session.user.companyId,
                    status: 'PENDING'
                }
            })
        }

        revalidatePath('/settings/verification')
        return;
    } catch (error) {
        console.error("Error al subir documento KYC:", error)
        throw new Error("Ocurrió un error guardando el link del documento.")
    }
}

export async function requestKycReview(formData: FormData) {
    const session = await auth()

    if (!session?.user?.companyId) {
        throw new Error("No tienes una empresa vinculada.")
    }

    try {
        // Check if they have all 3 required documents
        const docs = await (prisma as any).companyDocument.findMany({
            where: { companyId: session.user.companyId }
        })

        const hasRtu = docs.some((d: any) => d.type === 'RTU')
        const hasPatente = docs.some((d: any) => d.type === 'PATENTE')
        const hasRep = docs.some((d: any) => d.type === 'REPRESENTACION_LEGAL')

        if (!hasRtu || !hasPatente || !hasRep) {
            throw new Error("Faltan documentos obligatorios para solicitar revisión.")
        }

        // Auto-Approving for Testing Purposes (Simulating Admin Approval)
        await (prisma as any).company.update({
            where: { id: session.user.companyId },
            data: { 
                kycStatus: 'APPROVED',
                isVerified: true
            }
        })

        revalidatePath('/settings/verification')
        return;
    } catch (error) {
        console.error("Error al solicitar revisión KYC:", error)
        throw new Error("Ocurrió un error procesando tu solicitud.")
    }
}
