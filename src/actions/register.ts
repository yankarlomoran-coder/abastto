'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'

const RegisterUserSchema = z.object({
    name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
    email: z.string().email({ message: 'Por favor ingresa un correo válido.' }),
    password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
    role: z.enum(['BUYER', 'SUPPLIER', 'ADMIN', 'MEMBER']), // ADMIN and MEMBER allowed initially for invitations
})

const RegisterCompanySchema = z.object({
    nit: z.string().min(5, { message: 'El NIT debe ser válido.' }),
    companyName: z.string().min(2, { message: 'El nombre de la empresa es obligatorio.' }),
    industry: z.enum(['AGRICULTURA', 'CONSTRUCCION', 'ESTADO_GOBIERNO', 'MANUFACTURA', 'MEDICAL_SALUD', 'RETAIL_COMERCIO', 'SERVICIOS_PROFESIONALES', 'TECNOLOGIA', 'TRANSPORTE_LOGISTICA', 'OTRO']),
    department: z.enum(['ALTA_VERAPAZ', 'BAJA_VERAPAZ', 'CHIMALTENANGO', 'CHIQUIMULA', 'EL_PROGRESO', 'ESCUINTLA', 'GUATEMALA', 'HUEHUETENANGO', 'IZABAL', 'JALAPA', 'JUTIAPA', 'PETEN', 'QUETZALTENANGO', 'QUICHE', 'RETALHULEU', 'SACATEPEQUEZ', 'SAN_MARCOS', 'SANTA_ROSA', 'SOLOLA', 'SUCHITEPEQUEZ', 'TOTONICAPAN', 'ZACAPA']),
})


export type State = {
    errors?: {
        name?: string[]
        email?: string[]
        password?: string[]
        role?: string[]
        nit?: string[]
        companyName?: string[]
        industry?: string[]
        department?: string[]
    }
    message?: string | null
}

export async function registerUser(prevState: State, formData: FormData): Promise<State> {
    const inviteToken = formData.get('inviteToken') as string | null

    const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role'),
    }

    const userFields = RegisterUserSchema.safeParse(userData)
    if (!userFields.success) {
        return {
            errors: userFields.error.flatten().fieldErrors,
            message: 'Errores en los datos personales.',
        }
    }

    const { name, email, password, role } = userFields.data
    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) {
            return { errors: { email: ['El correo ya está en uso.'] }, message: 'Error al registrarse.' } as State
        }

        if (inviteToken) {
            // INVITATION FLOW -> Join existing company
            const invitation = await prisma.invitation.findUnique({ where: { token: inviteToken } })

            if (!invitation || new Date(invitation.expiresAt) < new Date()) {
                return { message: 'La invitación es inválida o expiró. Solicita a tu administrador una nueva.' }
            }

            // Transaction: Create user, link to company, delete invitation
            await prisma.$transaction(async (tx) => {
                await tx.user.create({
                    data: {
                        name,
                        email,
                        password: hashedPassword,
                        companyRole: invitation.role, // from invitation
                        companyId: invitation.companyId,
                        role: 'BUYER' // Defaulting to BUYER for invited members
                    }
                })

                await tx.invitation.delete({ where: { id: invitation.id } })
            })

            redirect('/login')
            return {} // Never reached

        } else {
            // REGULAR FLOW -> Create new company AND User as OWNER
            const companyData = {
                nit: formData.get('nit'),
                companyName: formData.get('companyName'),
                industry: formData.get('industry'),
                department: formData.get('department'),
            }

            const companyFields = RegisterCompanySchema.safeParse(companyData)
            if (!companyFields.success) {
                return {
                    errors: companyFields.error.flatten().fieldErrors,
                    message: 'Errores en los datos de la empresa.',
                }
            }

            const { nit, companyName, industry, department } = companyFields.data

            const existingCompany = await prisma.company.findUnique({ where: { nit } })
            if (existingCompany) {
                return { errors: { nit: ['El NIT ya está registrado.'] }, message: 'Error al registrarse.' } as State
            }

            await prisma.$transaction(async (tx) => {
                const company = await tx.company.create({
                    data: {
                        nit,
                        name: companyName,
                        industry,
                        department,
                    },
                })

                await tx.user.create({
                    data: {
                        name,
                        email,
                        password: hashedPassword,
                        role: role as 'BUYER' | 'SUPPLIER', // Safe cast from Zod Enum
                        companyRole: 'OWNER',
                        companyId: company.id,
                    },
                })
            })

            redirect('/login')
            return {} // Never reached
        }

    } catch (error) {
        console.error(error)
        // Check if it's a redirect error (Next.js throws redirect as an error)
        if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
            throw error; // Rethrow redirect
        }
        return {
            message: 'Error de base de datos: No se pudo procesar tu registro.',
        }
    }
}
