'use client'

import { useActionState } from 'react'
import { createRfq, State } from '@/actions/rfq'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function CreateRfqPage() {
    const initialState: State = { message: null, errors: {} }
    const [state, formAction, isPending] = useActionState(createRfq, initialState)

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Nueva Solicitud de Cotización (RFQ)</CardTitle>
                        <CardDescription>
                            Describe lo que necesitas y recibe ofertas de proveedores verificados.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={formAction} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Título de la Solicitud</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    placeholder="Ej: Lote de 500 Sillas de Oficina Ergonómicas"
                                    required
                                />
                                <div id="title-error" aria-live="polite" aria-atomic="true">
                                    {state.errors?.title &&
                                        state.errors.title.map((error: string) => (
                                            <p className="mt-2 text-sm text-red-500" key={error}>
                                                {error}
                                            </p>
                                        ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción Detallada</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Especificaciones técnicas, cantidad, plazos de entrega, etc."
                                    className="min-h-[150px]"
                                    required
                                />
                                <div id="description-error" aria-live="polite" aria-atomic="true">
                                    {state.errors?.description &&
                                        state.errors.description.map((error: string) => (
                                            <p className="mt-2 text-sm text-red-500" key={error}>
                                                {error}
                                            </p>
                                        ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="budget">Presupuesto Estimado (Quetzales)</Label>
                                <Input
                                    id="budget"
                                    name="budget"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    required
                                />
                                <div id="budget-error" aria-live="polite" aria-atomic="true">
                                    {state.errors?.budget &&
                                        state.errors.budget.map((error: string) => (
                                            <p className="mt-2 text-sm text-red-500" key={error}>
                                                {error}
                                            </p>
                                        ))}
                                </div>
                            </div>

                            {state.message && (
                                <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-md">
                                    <AlertCircle className="h-4 w-4" />
                                    <p>{state.message}</p>
                                </div>
                            )}

                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isPending}>
                                {isPending ? 'Creando...' : 'Publicar Solicitud'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
