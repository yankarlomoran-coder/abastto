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
            case 'OWNER': return 'bg-purple-100 text-purple-800 border-purple-200'
            case 'ADMIN': return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'MEMBER': return 'bg-slate-100 text-slate-800 border-slate-200'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="max-w-4xl">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-xl font-semibold text-slate-900">Directorio de Equipo</h2>
                {isOwnerOrAdmin && (
                    <InviteMemberModal />
                )}
            </div>

            <div className="space-y-8">
                {/* Active Members */}
                <div>
                    <h3 className="text-lg font-medium text-slate-900 mb-4">Miembros Activos</h3>
                    <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium">
                                <tr>
                                    <th className="px-4 py-3 border-b">Nombre</th>
                                    <th className="px-4 py-3 border-b">Correo Electrónico</th>
                                    <th className="px-4 py-3 border-b">Rol B2B</th>
                                    <th className="px-4 py-3 border-b">Poder Interno</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-50/50">
                                        <td className="px-4 py-3 font-medium text-slate-900">
                                            {user.name || 'Sin nombre'}
                                            {user.id === session.user?.id && <span className="ml-2 text-xs text-blue-600 font-semibold">(Tú)</span>}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{user.email}</td>
                                        <td className="px-4 py-3 text-slate-600 capitalize">{user.role.toLowerCase()}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant="outline" className={roleBadgeColor(user.companyRole)}>
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
                        <h3 className="text-lg font-medium text-slate-900 mb-4">Invitaciones Pendientes</h3>
                        <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-medium">
                                    <tr>
                                        <th className="px-4 py-3 border-b">Correo Invitado</th>
                                        <th className="px-4 py-3 border-b">Rol Asignado</th>
                                        <th className="px-4 py-3 border-b">F. Expiración</th>
                                        <th className="px-4 py-3 border-b">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {invitations.map(inv => (
                                        <tr key={inv.id} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-3 text-slate-600">{inv.email}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant="outline" className={roleBadgeColor(inv.role)}>
                                                    {inv.role}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">
                                                {new Date(inv.expiresAt).toLocaleDateString()}
                                                {new Date(inv.expiresAt) < new Date() && <span className="ml-2 text-xs text-red-600 font-semibold">(Expirada)</span>}
                                            </td>
                                            <td className="px-4 py-3">
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
