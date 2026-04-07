'use client'

import { useState, useActionState, useEffect } from "react"
import { createInvitation, InviteState } from "@/actions/invitation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, UserPlus, Copy, Check } from "lucide-react"

export default function InviteMemberModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [copied, setCopied] = useState(false)

    // Using Action State
    const initialState: InviteState = { message: null, errors: {}, successLink: null }
    const [state, formAction, isPending] = useActionState(createInvitation, initialState)

    // Reset copy state when link changes
    useEffect(() => {
        if (state.successLink) {
            setCopied(false)
        }
    }, [state.successLink])

    const handleCopy = async () => {
        if (state.successLink) {
            await navigator.clipboard.writeText(state.successLink)
            setCopied(true)
            setTimeout(() => setCopied(false), 3000)
        }
    }

    return (
        <>
            <Button onClick={() => setIsOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Invitar Miembro
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                            <h3 className="font-semibold text-slate-900">Invitar al Equipo</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6">
                            {state.successLink ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
                                        <div className="flex gap-3">
                                            <Check className="h-5 w-5 text-emerald-600 shrink-0" />
                                            <div>
                                                <p className="font-semibold text-sm">¡Invitación Creada!</p>
                                                <p className="text-xs mt-1">Comparte este enlace único con tu colega para que pueda registrarse unido a tu empresa.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Enlace de Invitación</Label>
                                        <div className="flex gap-2">
                                            <Input readOnly value={state.successLink} className="bg-slate-50 text-slate-500 font-mono text-xs" />
                                            <Button onClick={handleCopy} variant="outline" className="shrink-0 w-10 p-0">
                                                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-slate-600" />}
                                            </Button>
                                        </div>
                                    </div>

                                    <Button onClick={() => setIsOpen(false)} className="w-full mt-4 bg-slate-900 hover:bg-slate-800">
                                        Cerrar
                                    </Button>
                                </div>
                            ) : (
                                <form action={formAction} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Correo Electrónico del Colega</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="ej. juan@miempresa.com"
                                            required
                                        />
                                        {state.errors?.email && (
                                            <p className="mt-1 text-xs text-red-500">{state.errors.email[0]}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="role">Rol en la Plataforma</Label>
                                        <select
                                            id="role"
                                            name="role"
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            required
                                            defaultValue="MEMBER"
                                        >
                                            <option value="MEMBER">👤 Miembro (Solo crear cotizaciones/ofertas)</option>
                                            <option value="ADMIN">🛡️ Administrador (Puede invitar y editar perfil)</option>
                                        </select>
                                        {state.errors?.role && (
                                            <p className="mt-1 text-xs text-red-500">{state.errors.role[0]}</p>
                                        )}
                                    </div>

                                    {state.message && !state.successLink && (
                                        <div className="flex items-center gap-2 p-3 text-sm rounded-md text-red-700 bg-red-50 border border-red-200">
                                            <AlertCircle className="h-4 w-4" />
                                            <p>{state.message}</p>
                                        </div>
                                    )}

                                    <div className="pt-4 flex justify-end gap-3">
                                        <Button
                                            type="button"
                                            onClick={() => setIsOpen(false)}
                                            variant="outline"
                                            className="text-slate-600"
                                        >
                                            Cancelar
                                        </Button>
                                        <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700">
                                            {isPending ? 'Generando enlace...' : 'Generar Invitación'}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
