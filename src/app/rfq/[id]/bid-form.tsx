'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createBid } from '@/actions/bid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AlertCircle, Send, Package, CheckCircle } from 'lucide-react'

// Zod schema strictly identical to the server action requirements
const BidItemSchema = z.object({
    rfqItemId: z.string(),
    unitPrice: z.coerce.number().min(0, { message: 'El precio debe ser 0 o mayor.' }),
    remarks: z.string().optional()
})

const BidFormSchema = z.object({
    rfqId: z.string(),
    validityDays: z.coerce.number().positive({ message: 'Indica los días de validez.' }),
    deliveryLeadTime: z.string().min(2, { message: 'Especifica el tiempo de entrega (ej. 5 días).' }),
    proposal: z.string().min(10, { message: 'La propuesta debe tener al menos 10 caracteres.' }),
    items: z.array(BidItemSchema)
})

type BidFormValues = z.infer<typeof BidFormSchema>

export default function BidForm({ rfqId, rfqItems }: { rfqId: string, rfqItems: any[] }) {
    const [isPending, setIsPending] = useState(false)
    const [serverMessage, setServerMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)

    const form = useForm<BidFormValues>({
        resolver: zodResolver(BidFormSchema) as any,
        defaultValues: {
            rfqId,
            validityDays: 30,
            deliveryLeadTime: '',
            proposal: '',
            items: rfqItems.map(item => ({ rfqItemId: item.id, unitPrice: 0, remarks: '' }))
        }
    })

    const { fields } = useFieldArray({
        control: form.control as any,
        name: "items"
    })

    // Calculate total on the fly
    const watchItems = form.watch("items")
    const totalAmount = watchItems.reduce((acc, curr, index) => {
        const qty = rfqItems[index]?.quantity || 0
        return acc + (curr.unitPrice * qty)
    }, 0)

    async function onSubmit(data: BidFormValues) {
        setIsPending(true)
        setServerMessage(null)

        const result = await createBid(undefined, data)

        if (result?.message) {
            setServerMessage({
                type: result.message.includes('éxito') ? 'success' : 'error',
                text: result.message
            })
            if (result.message.includes('éxito')) {
                form.reset() // Optional: Clear the form on success
            }
        }

        setIsPending(false)
    }

    // Hide form if submission was totally successful (page auto revalidates but just in case for smooth UI)
    if (serverMessage?.type === 'success') {
        return (
            <Card className="border-t-4 border-t-emerald-500 shadow-sm bg-emerald-50">
                <CardContent className="py-12 flex flex-col items-center text-center">
                    <CheckCircle className="h-16 w-16 text-emerald-500 mb-4" />
                    <h3 className="text-xl font-bold text-emerald-900 mb-2">¡Oferta Enviada Exitosamente!</h3>
                    <p className="text-emerald-700">Tu propuesta cotizada está ahora en un "sobre cerrado" a la espera de ser evaluada.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-t-4 border-t-emerald-500 shadow-sm">
            <CardHeader>
                <CardTitle className="text-xl">Armar Cotización</CardTitle>
                <CardDescription>
                    Ingresa tus precios por unidad para los ítems solicitados y las condiciones de la propuesta.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8">

                    {/* Items table equivalent */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                            <Package className="w-4 h-4" /> Detalle Económico
                        </h3>

                        <div className="space-y-4">
                            {fields.map((field, index) => {
                                const rfqItem = rfqItems[index]
                                return (
                                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50 border rounded-lg p-4">
                                        <div className="md:col-span-5">
                                            <p className="font-bold text-slate-900">{rfqItem.name}</p>
                                            <p className="text-xs text-slate-500">Solicitado: {rfqItem.quantity} {rfqItem.unit}</p>
                                        </div>

                                        <div className="md:col-span-3">
                                            <Label className="text-xs mb-1 block">Precio Unitario (Q)</Label>
                                            <Input type="number" step="0.01" {...form.register(`items.${index}.unitPrice` as const)} />
                                            {form.formState.errors.items?.[index]?.unitPrice && <p className="text-xs text-red-500 mt-1">{form.formState.errors.items[index].unitPrice.message}</p>}
                                        </div>

                                        <div className="md:col-span-4">
                                            <Label className="text-xs mb-1 block">Aclaraciones (Opcional)</Label>
                                            <Input placeholder="Ej. Incluye estuche..." {...form.register(`items.${index}.remarks` as const)} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Auto-computed Total */}
                        <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                            <span className="font-semibold text-emerald-900">Total Ofertado Estimado:</span>
                            <span className="text-2xl font-black text-emerald-700">
                                Q {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>

                    {/* Proposal Details */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider border-b pb-2">
                            Condiciones Propias
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="deliveryLeadTime">Plazo de Entrega</Label>
                                <Input id="deliveryLeadTime" placeholder="Ej: 5 a 7 días hábiles" {...form.register('deliveryLeadTime')} />
                                {form.formState.errors.deliveryLeadTime && <p className="text-sm text-red-500">{form.formState.errors.deliveryLeadTime.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="validityDays">Días de Validez de la Oferta</Label>
                                <Input id="validityDays" type="number" {...form.register('validityDays')} />
                                {form.formState.errors.validityDays && <p className="text-sm text-red-500">{form.formState.errors.validityDays.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="proposal">Carta de Presentación / Condiciones Generales</Label>
                            <Textarea
                                id="proposal"
                                placeholder="Garantías, métodos de envío, detalles técnicos adicionales..."
                                className="min-h-[120px]"
                                {...form.register('proposal')}
                            />
                            {form.formState.errors.proposal && <p className="text-sm text-red-500">{form.formState.errors.proposal.message}</p>}
                        </div>
                    </div>

                    {serverMessage && (
                        <div className="flex items-center gap-2 p-3 text-sm rounded-md text-red-700 bg-red-50 border border-red-200">
                            <AlertCircle className="h-4 w-4" />
                            <p>{serverMessage.text}</p>
                        </div>
                    )}

                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 font-semibold" disabled={isPending}>
                        {isPending ? 'Enviando Cotización...' : (
                            <>
                                <Send className="mr-2 h-4 w-4" /> Enviar Oferta Económica
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
