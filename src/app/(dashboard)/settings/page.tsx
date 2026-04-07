import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import CompanyProfileForm from "./profile-form"
import { TrustScoreBadge } from "@/components/trust-score-badge"

export default async function SettingsProfilePage() {
    const session = await auth()

    if (!session?.user || !session.user.companyId) {
        redirect("/login")
    }

    const company = await prisma.company.findUnique({
        where: { id: session.user.companyId }
    })

    if (!company) {
        return <div>Error: Empresa no encontrada.</div>
    }

    const isReadOnly = session.user.companyRole !== 'OWNER' && session.user.companyRole !== 'ADMIN'

    return (
        <div className="max-w-4xl">
            <div className="mb-10 flex items-center justify-between border-b dark:border-white/5 pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Perfil de la Empresa</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Actualiza la información pública y operativa de tu negocio.</p>
                </div>
                <TrustScoreBadge companyId={session.user.companyId} />
            </div>

            {isReadOnly && (
                <div className="mb-10 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/50 text-amber-800 dark:text-amber-400 px-6 py-4 rounded-2xl text-sm font-medium flex items-start gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                    <p>Estás viendo este perfil en modo <strong>Solo Lectura</strong>. Solo los Administradores o Propietarios pueden modificar la información general de la empresa.</p>
                </div>
            )}

            <CompanyProfileForm initialData={company} isReadOnly={isReadOnly} />
        </div>
    )
}
