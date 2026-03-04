import React from 'react'
import prisma from '@/lib/prisma'
import RegisterForm from './register-form'
import { AlertCircle } from 'lucide-react'

export default async function RegisterPage({
    searchParams
}: {
    searchParams: Promise<{ token?: string }>
}) {
    const params = await searchParams
    const token = params.token

    let invitation = null
    let error = null

    if (token) {
        invitation = await prisma.invitation.findUnique({
            where: { token },
            include: { company: true }
        })

        if (!invitation || new Date(invitation.expiresAt) < new Date()) {
            error = "El enlace de invitación es inválido o ha expirado."
            invitation = null
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center">
                        <span className="font-bold text-2xl text-white">A</span>
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    Crea tu cuenta
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    Únete al mercado B2B líder
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-lg border border-red-200 flex gap-3 items-center">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}
                <RegisterForm invitation={invitation} />
            </div>
        </div>
    )
}
