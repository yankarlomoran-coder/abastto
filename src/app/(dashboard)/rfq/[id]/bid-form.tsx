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
import { AlertCircle, Send, Package, CheckCircle, DollarSign, Clock, FileText, Loader2 } from 'lucide-react'

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
                form.reset()
            }
        }

        setIsPending(false)
    }

    if (serverMessage?.type === 'success') {
        return (
            <div className="rounded-2xl border-2 border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-900/10 overflow-hidden">
                <div className="h-1.5 w-full bg-emerald-500" />
                <div className="py-16 px-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mb-6">
                        <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-black text-emerald-900 dark:text-emerald-100 mb-2">¡Oferta Enviada Exitosamente!</h3>
                    <p className="text-emerald-700 dark:text-emerald-300 text-sm font-medium max-w-md">
                        Tu propuesta cotizada fue registrada en un &quot;sobre cerrado&quot; y será evaluada por el comprador al cierre de la licitación.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            {/* Top accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 to-emerald-500" />
            
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-slate-100 dark:border-white/5">
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                    </div>
                    Armar Cotización
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1 ml-[46px]">
                    Ingresa tus precios unitarios y condiciones para esta solicitud.
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit as any)} className="p-6 md:p-8 space-y-8">
                {/* SECTION 1: Economic Detail */}
                <div className="space-y-4">
                    <h3 className="text-[0.7rem] font-black text-slate-900 dark:text-white uppercase tracking-[0.15em] flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        Detalle Económico
                    </h3>

                    <div className="space-y-3">
                        {fields.map((field, index) => {
                            const rfqItem = rfqItems[index]
                            const unitPrice = watchItems[index]?.unitPrice || 0
                            const subtotal = unitPrice * (rfqItem?.quantity || 0)
                            return (
                                <div key={field.id} className="group bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-3 hover:border-blue-200 dark:hover:border-blue-900/30 transition-all">
                                    {/* Item header */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-black text-slate-900 dark:text-white text-sm">{rfqItem.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Solicitado: {rfqItem.quantity} {rfqItem.unit}</p>
                                        </div>
                                        {unitPrice > 0 && (
                                            <div className="text-right">
                                                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">Subtotal</p>
                                                <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">Q {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-slate-500 dark:text-slate-400">Precio Unitario (Q)</Label>
                                            <Input 
                                                type="number" 
                                                step="0.01" 
                                                className="h-11 rounded-xl dark:bg-slate-950 dark:border-white/10"
                                                {...form.register(`items.${index}.unitPrice` as const)} 
                                            />
                                            {form.formState.errors.items?.[index]?.unitPrice && (
                                                <p className="text-xs text-red-500 font-medium">{form.formState.errors.items[index].unitPrice.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-slate-500 dark:text-slate-400">Aclaraciones (Opcional)</Label>
                                            <Input 
                                                placeholder="Ej. Incluye estuche, garantía 1 año..." 
                                                className="h-11 rounded-xl dark:bg-slate-950 dark:border-white/10"
                                                {...form.register(`items.${index}.remarks` as const)} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center p-5 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/10 dark:to-blue-900/10 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/30">
                        <span className="font-black text-emerald-900 dark:text-emerald-100 uppercase text-sm tracking-wider">Total Ofertado</span>
                        <span className="text-3xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight">
                            Q {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                {/* SECTION 2: Terms */}
                <div className="space-y-4">
                    <h3 className="text-[0.7rem] font-black text-slate-900 dark:text-white uppercase tracking-[0.15em] flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        Condiciones de Entrega
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="deliveryLeadTime" className="text-sm font-bold text-slate-700 dark:text-slate-300">Plazo de Entrega <span className="text-red-500">*</span></Label>
                            <Input 
                                id="deliveryLeadTime" 
                                placeholder="Ej: 5 a 7 días hábiles" 
                                className="h-11 rounded-xl dark:bg-slate-950 dark:border-white/10"
                                {...form.register('deliveryLeadTime')} 
                            />
                            {form.formState.errors.deliveryLeadTime && <p className="text-sm text-red-500 font-medium">{form.formState.errors.deliveryLeadTime.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="validityDays" className="text-sm font-bold text-slate-700 dark:text-slate-300">Validez de la Oferta (días) <span className="text-red-500">*</span></Label>
                            <Input 
                                id="validityDays" 
                                type="number" 
                                className="h-11 rounded-xl dark:bg-slate-950 dark:border-white/10"
                                {...form.register('validityDays')} 
                            />
                            {form.formState.errors.validityDays && <p className="text-sm text-red-500 font-medium">{form.formState.errors.validityDays.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="proposal" className="text-sm font-bold text-slate-700 dark:text-slate-300">Términos Generales y Carta de Presentación <span className="text-red-500">*</span></Label>
                        <Textarea
                            id="proposal"
                            placeholder="Garantías, métodos de envío, detalles técnicos adicionales, condiciones especiales..."
                            className="min-h-[140px] rounded-xl dark:bg-slate-950 dark:border-white/10 resize-none"
                            {...form.register('proposal')}
                        />
                        {form.formState.errors.proposal && <p className="text-sm text-red-500 font-medium">{form.formState.errors.proposal.message}</p>}
                    </div>
                </div>

                {/* Error display */}
                {serverMessage && serverMessage.type === 'error' && (
                    <div className="flex items-center gap-2 p-4 text-sm rounded-xl text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <p className="font-medium">{serverMessage.text}</p>
                    </div>
                )}

                {/* Submit */}
                <Button 
                    type="submit" 
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]" 
                    disabled={isPending}
                >
                    {isPending ? (
                        <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Enviando Cotización...</>
                    ) : (
                        <><Send className="mr-2 h-4 w-4" /> Enviar Oferta Económica</>
                    )}
                </Button>
            </form>
        </div>
    )
}
