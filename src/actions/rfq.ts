'use server'

import { z } from 'zod'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { logActivity } from '@/lib/activity-log'

import { PaymentTerms, RfqCategory } from '@prisma/client'

const RfqItemSchema = z.object({
    name: z.string().min(2, { message: 'El nombre del producto es obligatorio.' }),
    quantity: z.coerce.number().positive({ message: 'La cantidad debe ser mayor a 0.' }),
    unit: z.string().min(1, { message: 'Especifica la unidad (ej. piezas, cajas).' })
})

const RfqSchema = z.object({
    title: z.string().min(5, { message: 'El título debe tener al menos 5 caracteres.' }),
    description: z.string().min(20, { message: 'La descripción debe ser más detallada (min 20 caracteres).' }),
    budget: z.coerce.number().positive({ message: 'El presupuesto debe ser un número positivo.' }),
    deadline: z.coerce.date().min(new Date(), { message: 'La fecha límite debe ser en el futuro.' }),
    deliveryLocation: z.string().optional(),
    paymentTerms: z.nativeEnum(PaymentTerms).optional(),
    category: z.nativeEnum(RfqCategory).optional(),
    items: z.array(RfqItemSchema).min(1, { message: 'Debes incluir al menos un producto a cotizar.' })
})

export type State = {
    errors?: {
        title?: string[]
        description?: string[]
        budget?: string[]
        deadline?: string[]
        items?: string[]
    }
    message?: string | null
}

export async function createRfq(prevState: State | undefined, data: any) {
    const session = await auth()

    if (!session?.user?.companyId) {
        return { message: 'Debes pertenecer a una empresa para crear una solicitud.' }
    }

    const company = await prisma.company.findUnique({
        where: { id: session.user.companyId },
        select: { isVerified: true }
    })

    if (!company?.isVerified) {
        return { message: 'Acceso corporativo denegado: Tu empresa aún no está verificada. Sube la documentación legal requerida en Ajustes → Verificación.' }
    }

    const validatedFields = RfqSchema.safeParse(data)

    console.log("Validating RFQ (Structured):", validatedFields.success ? "Success" : "Failed")

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Revisa los campos del formulario. Asegúrate de incluir al menos un producto.',
        }
    }

    const { title, description, budget, deadline, deliveryLocation, paymentTerms, category, items } = validatedFields.data

    // Auto-aprobación: OWNER y ADMIN publican directamente. MEMBER y VIEWER requieren aprobación jerárquica.
    const companyRole = (session.user as any).companyRole || 'MEMBER'
    const requiresApproval = companyRole !== 'OWNER' && companyRole !== 'ADMIN'
    const initialStatus = requiresApproval ? 'DRAFT_PENDING_APPROVAL' : 'OPEN'
    
    try {
        const rfq = await (prisma as any).rfq.create({
            data: {
                title,
                description,
                budget,
                deadline,
                deliveryLocation,
                paymentTerms,
                category,
                companyId: session.user.companyId,
                status: initialStatus,
                needsApproval: requiresApproval,
                approvedById: requiresApproval ? null : session.user.id,
                items: {
                    create: items.map(item => ({
                        name: item.name,
                        quantity: item.quantity,
                        unit: item.unit
                    }))
                }
            },
        })

        await logActivity({
            action: 'RFQ_CREATED',
            description: `Licitación "${title}" creada por Q ${budget.toLocaleString()}`,
            userId: session.user.id,
            companyId: session.user.companyId,
            metadata: { rfqId: rfq.id, title, budget }
        })
    } catch (error) {
        console.error("Failed to create RFQ:", error)
        return {
            message: 'Error de base de datos: No se pudo crear la solicitud.',
        }
    }

    revalidatePath('/dashboard')
    redirect('/dashboard')
}

export async function approveRfq(rfqId: string) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, message: 'No autenticado' }
    
    const rfq = await prisma.rfq.findUnique({ where: { id: rfqId } })
    if (!rfq || rfq.companyId !== session.user.companyId) return { success: false, message: 'Acceso denegado' }

    const role = (session.user as any).companyRole
    if (role !== 'OWNER' && role !== 'ADMIN') {
        return { success: false, message: 'Solo los administradores pueden aprobar compras.' }
    }

    try {
        await (prisma as any).rfq.update({
            where: { id: rfqId },
            data: {
                status: 'OPEN',
                needsApproval: false,
                approvedById: session.user.id
            }
        })

        await logActivity({
            action: 'RFQ_UPDATED',
            description: `Licitación "${rfq.title}" aprobada y publicada`,
            userId: session.user.id,
            companyId: session.user.companyId,
            metadata: { rfqId, action: 'approved' }
        })

        revalidatePath('/dashboard')
        revalidatePath(`/rfq/${rfqId}`)
        return { success: true }
    } catch (error) {
        return { success: false, message: 'Error de base de datos.' }
    }
}
