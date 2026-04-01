'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createRfq } from '@/actions/rfq'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Plus, Trash2 } from 'lucide-react'
import { PaymentTerms, RfqCategory } from '@prisma/client'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const RfqItemSchema = z.object({
    name: z.string().min(2, { message: 'El nombre del producto es obligatorio.' }),
    quantity: z.coerce.number().positive({ message: 'La cantidad debe ser mayor a 0.' }),
    unit: z.string().min(1, { message: 'Especifica la unidad (ej. piezas, cajas).' })
})

const RfqFormSchema = z.object({
    title: z.string().min(5, { message: 'El título debe tener al menos 5 caracteres.' }),
    description: z.string().min(20, { message: 'La descripción debe ser más detallada (min 20 caracteres).' }),
    budget: z.coerce.number().positive({ message: 'El presupuesto debe ser un número positivo.' }),
    deadline: z.string().min(1, { message: 'La fecha límite es obligatoria.' }).refine((val) => new Date(val) > new Date(), { message: 'La fecha límite debe ser en el futuro.' }),
    deliveryLocation: z.string().optional(),
    paymentTerms: z.nativeEnum(PaymentTerms).optional(),
    category: z.nativeEnum(RfqCategory).optional(),
    items: z.array(RfqItemSchema).min(1, { message: 'Debes incluir al menos un producto a cotizar.' })
})

type RfqFormValues = z.infer<typeof RfqFormSchema>

export default function CreateRfqPage() {
    const [isPending, setIsPending] = useState(false)
    const [serverError, setServerError] = useState<string | null>(null)

    const form = useForm<RfqFormValues>({
        resolver: zodResolver(RfqFormSchema) as any,
        defaultValues: {
            title: '',
            description: '',
            budget: 0,
            deadline: '',
            deliveryLocation: '',
            items: [{ name: '', quantity: 1, unit: 'Piezas' }]
        }
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control as any,
        name: "items"
    })

    async function onSubmit(data: RfqFormValues) {
        setIsPending(true)
        setServerError(null)

        const parsedData = {
            ...data,
            deadline: new Date(data.deadline) // Server expects standard Date input for zod parser
        }

        const result = await createRfq(undefined, parsedData)

        if (result?.message) {
            setServerError(result.message)
        }

        setIsPending(false)
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#030712] py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
            <div className="max-w-4xl mx-auto">
                <Card className="dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-sm rounded-3xl overflow-hidden">
                    <CardHeader className="border-b border-slate-100 dark:border-white/5 bg-white/50 dark:bg-white/5">
                        <CardTitle className="text-2xl font-black text-slate-900 dark:text-white">Nueva Solicitud de Cotización</CardTitle>
                        <CardDescription className="text-slate-500 dark:text-slate-400 font-medium">
                            Describe detalladamente los productos y condiciones para recibir ofertas de proveedores verificados.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8">

                            {/* Información General */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium border-b pb-2">1. Información General</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="title">Título de la Solicitud</Label>
                                        <Input id="title" placeholder="Ej: Lote de 500 Sillas de Oficina Ergonómicas" {...form.register('title')} />
                                        {form.formState.errors.title && <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>}
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="description">Descripción Adicional (Opcional)</Label>
                                        <Textarea id="description" placeholder="Instrucciones especiales, contexto del proyecto, etc." className="min-h-[100px]" {...form.register('description')} />
                                        {form.formState.errors.description && <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="category">Categoría</Label>
                                        <Select onValueChange={(val) => form.setValue('category', val as RfqCategory)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona una categoría" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="TECH">Tecnología y Equipo</SelectItem>
                                                <SelectItem value="OFFICE">Suministros de Oficina</SelectItem>
                                                <SelectItem value="CONSTRUCTION">Construcción y Materiales</SelectItem>
                                                <SelectItem value="SERVICES">Servicios Profesionales</SelectItem>
                                                <SelectItem value="OTHER">Otro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {form.formState.errors.category && <p className="text-sm text-red-500">{form.formState.errors.category.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="budget">Presupuesto Estimado Máximo (Q)</Label>
                                        <Input id="budget" type="number" step="0.01" {...form.register('budget')} />
                                        {form.formState.errors.budget && <p className="text-sm text-red-500">{form.formState.errors.budget.message}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Condiciones Logistics */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium border-b pb-2">2. Condiciones Comerciales</h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="deadline">Fecha y Hora de Cierre</Label>
                                        <Input id="deadline" type="datetime-local" {...form.register('deadline')} />
                                        {form.formState.errors.deadline && <p className="text-sm text-red-500">{form.formState.errors.deadline.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="deliveryLocation">Ubicación de Entrega</Label>
                                        <Input id="deliveryLocation" placeholder="Ej: Bodega Central Zona 12" {...form.register('deliveryLocation')} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="paymentTerms">Condiciones de Pago Requeridas</Label>
                                        <Select onValueChange={(val) => form.setValue('paymentTerms', val as PaymentTerms)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="CASH">Al Contado / Contra Entrega</SelectItem>
                                                <SelectItem value="NET_30">Crédito a 30 Días</SelectItem>
                                                <SelectItem value="NET_60">Crédito a 60 Días</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm">3</div>
                                        Productos y Cantidades Requeridas
                                    </h3>
                                    <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', quantity: 1, unit: 'Piezas' })} className="rounded-xl border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 font-bold">
                                        <Plus className="h-4 w-4 mr-1" /> Agregar Ítem
                                    </Button>
                                </div>
                                {form.formState.errors.items?.message && (
                                    <p className="text-sm text-red-500">{form.formState.errors.items.message as string}</p>
                                )}

                                <div className="space-y-4">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex items-start gap-4 p-6 bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl transition-all hover:border-blue-200 dark:hover:border-blue-900/30">
                                            <div className="flex-1 space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nombre del Producto / Descripción</Label>
                                                <Input className="dark:bg-slate-950 dark:border-white/10 rounded-xl" placeholder="Ej: Mouse Inalámbrico Logitech M280" {...form.register(`items.${index}.name` as const)} />
                                                {form.formState.errors.items?.[index]?.name && <p className="text-xs text-red-500">{form.formState.errors.items[index].name.message}</p>}
                                            </div>
                                            <div className="w-24 space-y-2">
                                                <Label>Cantidad</Label>
                                                <Input type="number" {...form.register(`items.${index}.quantity` as const)} />
                                                {form.formState.errors.items?.[index]?.quantity && <p className="text-xs text-red-500">{form.formState.errors.items[index].quantity.message}</p>}
                                            </div>
                                            <div className="w-32 space-y-2">
                                                <Label>Unidad</Label>
                                                <Input placeholder="Cajas, pares..." {...form.register(`items.${index}.unit` as const)} />
                                                {form.formState.errors.items?.[index]?.unit && <p className="text-xs text-red-500">{form.formState.errors.items[index].unit.message}</p>}
                                            </div>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="mt-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => remove(index)}
                                                disabled={fields.length === 1}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {serverError && (
                                <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-md">
                                    <AlertCircle className="h-4 w-4" />
                                    <p>{serverError}</p>
                                </div>
                            )}

                            <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]" disabled={isPending}>
                                {isPending ? 'Procesando...' : 'Publicar Solicitud de Cotización'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
