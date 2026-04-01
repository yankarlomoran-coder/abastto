import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import InviteMemberModal from "./invite-modal"
import { CopyLinkButton } from "./copy-link-button"

export default async function TeamSettingsPage() {
    const session = await auth()

    if (!session?.user || !session.user.companyId) {
        redirect("/login")
    }

    const isOwnerOrAdmin = session.user.companyRole === 'OWNER' || session.user.companyRole === 'ADMIN'

    // Fetch existing users in the company
    const users = await prisma.user.findMany({
        where: { companyId: session.user.companyId },
        select: { id: true, name: true, email: true, companyRole: true, role: true, createdAt: true },
        orderBy: { createdAt: 'asc' }
    })

    // Fetch pending invitations
    const invitations = await prisma.invitation.findMany({
        where: { companyId: session.user.companyId },
        select: { id: true, email: true, role: true, createdAt: true, expiresAt: true, token: true },
        orderBy: { createdAt: 'desc' }
    })

    const roleBadgeColor = (role: string) => {
        switch (role) {
            case 'OWNER': return 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800'
            case 'ADMIN': return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
            case 'MEMBER': return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            default: return 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-400'
        }
    }

    return (
        <div className="max-w-4xl">
            <div className="flex justify-between items-center mb-6 border-b dark:border-white/5 pb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Directorio de Equipo</h2>
                {isOwnerOrAdmin && (
                    <InviteMemberModal />
                )}
            </div>

            <div className="space-y-8">
                {/* Active Members */}
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Miembros Activos</h3>
                    <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-slate-900/50 shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[0.65rem]">
                                <tr>
                                    <th className="px-6 py-4 border-b dark:border-white/5">Nombre</th>
                                    <th className="px-6 py-4 border-b dark:border-white/5">Correo Electrónico</th>
                                    <th className="px-6 py-4 border-b dark:border-white/5">Rol en la Plataforma</th>
                                    <th className="px-6 py-4 border-b dark:border-white/5">Jerarquía</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-white/5">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                            {user.name || 'Sin nombre'}
                                            {user.id === session.user?.id && <span className="ml-2 text-xs text-blue-600 dark:text-blue-400 font-black tracking-tight">(Tú)</span>}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">{user.email}</td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-500 capitalize font-medium">{user.role.toLowerCase()}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className={`font-bold px-3 py-1 rounded-lg ${roleBadgeColor(user.companyRole)}`}>
                                                {user.companyRole}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pending Invitations */}
                {isOwnerOrAdmin && invitations.length > 0 && (
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Invitaciones Pendientes</h3>
                        <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-slate-900/50 shadow-sm">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[0.65rem]">
                                    <tr>
                                        <th className="px-6 py-4 border-b dark:border-white/5">Correo Invitado</th>
                                        <th className="px-6 py-4 border-b dark:border-white/5">Rol Asignado</th>
                                        <th className="px-6 py-4 border-b dark:border-white/5">F. Expiración</th>
                                        <th className="px-6 py-4 border-b dark:border-white/5">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-white/5">
                                    {invitations.map(inv => (
                                        <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">{inv.email}</td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className={`font-bold px-3 py-1 rounded-lg ${roleBadgeColor(inv.role)}`}>
                                                    {inv.role}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">
                                                {new Date(inv.expiresAt).toLocaleDateString()}
                                                {new Date(inv.expiresAt) < new Date() && <span className="ml-2 text-xs text-red-600 dark:text-red-400 font-bold">(Expirada)</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <CopyLinkButton token={inv.token} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
