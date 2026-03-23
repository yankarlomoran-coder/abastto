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
        <div className="max-w-2xl">
            <div className="mb-6 flex items-center justify-between border-b pb-4">
                <h2 className="text-xl font-semibold text-slate-900">Perfil de la Empresa</h2>
                <TrustScoreBadge companyId={session.user.companyId} />
            </div>

            {isReadOnly && (
                <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md text-sm">
                    Estás viendo este perfil en modo <strong>Solo Lectura</strong>. Solo los Administradores o Propietarios pueden modificar la información general de la empresa.
                </div>
            )}

            <CompanyProfileForm initialData={company} isReadOnly={isReadOnly} />
        </div>
    )
}
