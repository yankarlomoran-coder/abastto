'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'

const RegisterSchema = z.object({
    name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
    email: z.string().email({ message: 'Por favor ingresa un correo válido.' }),
    password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
    role: z.enum(['BUYER', 'SUPPLIER']),
})

export type State = {
    errors?: {
        name?: string[]
        email?: string[]
        password?: string[]
        role?: string[]
    }
    message?: string | null
}

export async function registerUser(prevState: State, formData: FormData) {
    // Validate form fields
    const validatedFields = RegisterSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role'),
    })

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Campos faltantes. Error en el registro.',
        }
    }

    const { name, email, password, role } = validatedFields.data

    // Prepare data for insertion
    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return {
                errors: { email: ['El correo ya está en uso.'] },
                message: 'Error al registrarse.',
            }
        }

        // Insert data into the database
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role as 'BUYER' | 'SUPPLIER', // Cast safe due to Zod validation
            },
        })
    } catch (error) {
        return {
            message: 'Error de base de datos: No se pudo crear el usuario.',
        }
    }

    // Redirect to login page
    redirect('/login')
}
