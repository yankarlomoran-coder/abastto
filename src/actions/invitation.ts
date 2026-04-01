'use server'

import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { v4 as uuidv4 } from 'uuid'
import { logActivity } from '@/lib/activity-log'

const InviteSchema = z.object({
    email: z.string().email({ message: 'Debe ser un correo electrónico válido.' }),
    role: z.enum(['ADMIN', 'MEMBER'], { message: 'El rol debe ser ADMIN o MEMBER.' })
})

export type InviteState = {
    errors?: {
        email?: string[]
        role?: string[]
    }
    message?: string | null
    successLink?: string | null
}

export async function createInvitation(prevState: InviteState, formData: FormData): Promise<InviteState> {
    try {
        const session = await auth()
        if (!session?.user || !session.user.companyId) {
            return { message: 'No autenticado.' }
        }

        if (session.user.companyRole !== 'OWNER' && session.user.companyRole !== 'ADMIN') {
            return { message: 'No tienes permisos para invitar.' }
        }

        const data = {
            email: formData.get('email'),
            role: formData.get('role')
        }

        const validatedFields = InviteSchema.safeParse(data)
        if (!validatedFields.success) {
            return {
                errors: validatedFields.error.flatten().fieldErrors,
                message: 'Error en los campos enviados.'
            }
        }

        const { email, role } = validatedFields.data

        // 1. Check if user already exists entirely
        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) {
            return { message: 'Este correo ya pertenece a una cuenta registrada de Abastto.' }
        }

        // 2. Check if active invitation for THIS company and THIS email already exists
        const existingInvite = await prisma.invitation.findUnique({
            where: {
                email_companyId: {
                    email,
                    companyId: session.user.companyId
                }
            }
        })

        if (existingInvite) {
            return { message: 'Ya existe una invitación pendiente para este correo en esta empresa.' }
        }

        // Generate Token
        const token = uuidv4()
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7) // expires in 7 days

        // 3. Create Invitation
        await prisma.invitation.create({
            data: {
                email,
                role: role as 'ADMIN' | 'MEMBER',
                companyId: session.user.companyId,
                token,
                expiresAt
            }
        })

        await logActivity({
            action: 'MEMBER_INVITED',
            description: `Invitación enviada a ${email} como ${role}`,
            userId: session.user.id,
            companyId: session.user.companyId,
            metadata: { email, role, token }
        })

        revalidatePath('/settings/team')

        // IMPORTANT: In production this would send an email. 
        // For Abastto MVP, we return the magic link back to the UI to be copied.
        const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const inviteLink = `${origin}/register?token=${token}`

        return {
            message: 'Invitación creada.',
            successLink: inviteLink
        }

    } catch (error) {
        console.error("Invite Error:", error)
        return { message: 'Ocurrió un error inesperado.' }
    }
}
