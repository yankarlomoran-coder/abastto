'use client'

import { useActionState } from 'react'
import { createBid, BidState } from '@/actions/bid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AlertCircle, Send } from 'lucide-react'

export default function BidForm({ rfqId }: { rfqId: string }) {
    const initialState: BidState = { message: null, errors: {} }
    const [state, formAction, isPending] = useActionState(createBid, initialState)

    return (
        <Card className="border-t-4 border-t-emerald-500 shadow-sm">
            <CardHeader>
                <CardTitle className="text-xl">Enviar Oferta</CardTitle>
                <CardDescription>
                    Presenta tu mejor propuesta para esta solicitud.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-5">
                    <input type="hidden" name="rfqId" value={rfqId} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Monto Total Ofertado (Quetzales)</Label>
                            <Input
                                id="amount"
                                name="amount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                required
                            />
                            <div id="amount-error" aria-live="polite" aria-atomic="true">
                                {state.errors?.amount &&
                                    state.errors.amount.map((error: string) => (
                                        <p className="mt-1 text-xs text-red-500" key={error}>
                                            {error}
                                        </p>
                                    ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="deliveryTime">Tiempo de Entrega</Label>
                            <Input
                                id="deliveryTime"
                                name="deliveryTime"
                                placeholder="Ej: 5 a 7 días hábiles"
                                required
                            />
                            <div id="deliveryTime-error" aria-live="polite" aria-atomic="true">
                                {state.errors?.deliveryTime &&
                                    state.errors.deliveryTime.map((error: string) => (
                                        <p className="mt-1 text-xs text-red-500" key={error}>
                                            {error}
                                        </p>
                                    ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="proposal">Detalles de la Propuesta / Condiciones</Label>
                        <Textarea
                            id="proposal"
                            name="proposal"
                            placeholder="Garantías, métodos de envío, detalles técnicos..."
                            className="min-h-[120px]"
                            required
                        />
                        <div id="proposal-error" aria-live="polite" aria-atomic="true">
                            {state.errors?.proposal &&
                                state.errors.proposal.map((error: string) => (
                                    <p className="mt-1 text-xs text-red-500" key={error}>
                                        {error}
                                    </p>
                                ))}
                        </div>
                    </div>

                    {state.message && (
                        <div className={`flex items-center gap-2 p-3 text-sm rounded-md ${state.message.includes('éxito')
                            ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                            : 'text-red-700 bg-red-50 border border-red-200'
                            }`}>
                            <AlertCircle className="h-4 w-4" />
                            <p>{state.message}</p>
                        </div>
                    )}

                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 font-semibold" disabled={isPending}>
                        {isPending ? 'Enviando...' : (
                            <>
                                <Send className="mr-2 h-4 w-4" /> Enviar Oferta
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
