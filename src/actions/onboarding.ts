'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/auth'

export async function completeOnboarding() {
    const session = await auth()
    if (!session?.user?.id) return { error: 'No autenticado' }

    await prisma.user.update({
        where: { id: session.user.id },
        data: { onboardingComplete: true }
    })

    return { success: true }
}
