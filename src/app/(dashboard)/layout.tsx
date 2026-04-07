import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { AppHeader } from "@/components/layout/app-header"
import { OnboardingWizard } from "@/components/onboarding-wizard"
import prisma from "@/lib/prisma"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    if (!session?.user || !session.user.companyId) {
        redirect("/login")
    }

    const { role, name, id: userId } = session.user
    const isBuyer = role === 'BUYER'

    // Check onboarding
    const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { onboardingComplete: true }
    })
    const showOnboarding = !currentUser?.onboardingComplete

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-500">
            {/* Global Sidebar */}
            <AppSidebar
                userName={name ?? 'Usuario'}
                userRole={role}
                isBuyer={isBuyer}
            />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative">
                {/* Shared Header */}
                <AppHeader
                    userName={name ?? 'Usuario'}
                    userRole={role}
                />

                {/* Page Content */}
                <div className="flex-1">
                    {children}
                </div>
            </main>

            {/* Onboarding Wizard */}
            {showOnboarding && <OnboardingWizard userName={name || 'Usuario'} userRole={isBuyer ? 'BUYER' : 'SUPPLIER'} />}
        </div>
    )
}
