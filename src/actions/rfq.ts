'use server'

import { z } from 'zod'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const RfqSchema = z.object({
    title: z.string().min(5, { message: 'El título debe tener al menos 5 caracteres.' }),
    description: z.string().min(20, { message: 'La descripción debe ser más detallada (min 20 caracteres).' }),
    budget: z.coerce.number().positive({ message: 'El presupuesto debe ser un número positivo.' }),
})

export type State = {
    errors?: {
        title?: string[]
        description?: string[]
        budget?: string[]
    }
    message?: string | null
}

export async function createRfq(prevState: State | undefined, formData: FormData) {
    const session = await auth()

    if (!session?.user?.id) {
        return { message: 'Debes iniciar sesión para crear una solicitud.' }
    }

    const validatedFields = RfqSchema.safeParse({
        title: formData.get('title'),
        description: formData.get('description'),
        budget: formData.get('budget'),
    })

    console.log("Validating RFQ:", validatedFields)

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Faltan campos. No se pudo crear la solicitud.',
        }
    }

    const { title, description, budget } = validatedFields.data

    try {
        await prisma.rfq.create({
            data: {
                title,
                description,
                budget,
                buyerId: session.user.id,
                status: 'OPEN',
            },
        })
        console.log("RFQ Created successfully")
    } catch (error) {
        console.error("Failed to create RFQ:", error)
        return {
            message: 'Error de base de datos: No se pudo crear la solicitud.',
        }
    }

    revalidatePath('/dashboard')
    redirect('/dashboard')
}
