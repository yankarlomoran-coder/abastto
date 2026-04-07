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
import { AlertCircle, Plus, Trash2, ArrowRight, ArrowLeft, FileText, ShoppingCart, Settings2, CheckCircle2, Loader2 } from 'lucide-react'
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

const STEPS = [
    { id: 1, title: 'Información General', icon: FileText, description: 'Descripción y presupuesto' },
    { id: 2, title: 'Productos Requeridos', icon: ShoppingCart, description: 'Ítems y cantidades' },
    { id: 3, title: 'Condiciones Comerciales', icon: Settings2, description: 'Plazos y términos de pago' },
]

export default function CreateRfqPage() {
    const [isPending, setIsPending] = useState(false)
    const [serverError, setServerError] = useState<string | null>(null)
    const [currentStep, setCurrentStep] = useState(1)

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
            deadline: new Date(data.deadline)
        }

        const result = await createRfq(undefined, parsedData)

        if (result?.message) {
            setServerError(result.message)
        }

        setIsPending(false)
    }

    // Validate current step before advancing
    const validateAndNext = async () => {
        let fieldsToValidate: (keyof RfqFormValues)[] = []
        
        if (currentStep === 1) {
            fieldsToValidate = ['title', 'description', 'budget', 'category']
        } else if (currentStep === 2) {
            fieldsToValidate = ['items']
        }

        const isValid = await form.trigger(fieldsToValidate as any)
        if (isValid) {
            setCurrentStep(prev => Math.min(prev + 1, 3))
        }
    }

    return (
        <div className="flex-1 p-6 md:p-10 xl:p-14 max-w-5xl w-full mx-auto">
            {/* Page Header */}
            <header className="mb-10">
                <p className="text-[0.7rem] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-[0.1em] mb-0.5">Gestión de Compras</p>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Nueva Solicitud de Cotización
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                    Describe detalladamente tus requerimientos para recibir ofertas de proveedores verificados.
                </p>
            </header>

            {/* Step Indicator */}
            <div className="mb-10">
                <div className="flex items-center justify-between max-w-2xl">
                    {STEPS.map((step, idx) => (
                        <div key={step.id} className="flex items-center flex-1">
                            <div className="flex flex-col items-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (step.id < currentStep) setCurrentStep(step.id)
                                    }}
                                    className={`
                                        w-11 h-11 rounded-2xl flex items-center justify-center border-2 transition-all cursor-default
                                        ${currentStep === step.id
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20'
                                            : currentStep > step.id
                                            ? 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-400 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/30'
                                            : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-600'
                                        }
                                    `}
                                >
                                    {currentStep > step.id ? (
                                        <CheckCircle2 className="w-5 h-5" />
                                    ) : (
                                        <step.icon className="w-5 h-5" />
                                    )}
                                </button>
                                <p className={`mt-2 text-[0.65rem] font-bold text-center max-w-[100px] ${
                                    currentStep === step.id ? 'text-blue-600 dark:text-blue-400' : 
                                    currentStep > step.id ? 'text-slate-700 dark:text-slate-300' :
                                    'text-slate-400 dark:text-slate-500'
                                }`}>
                                    {step.title}
                                </p>
                            </div>
                            {idx < STEPS.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-4 mt-[-20px] transition-colors ${
                                    currentStep > step.id ? 'bg-blue-400 dark:bg-blue-600' : 'bg-slate-200 dark:bg-white/10'
                                }`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Form */}
            <form onSubmit={form.handleSubmit(onSubmit as any)}>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
                    
                    {/* STEP 1: General Info */}
                    {currentStep === 1 && (
                        <div className="p-8 md:p-10 space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                            <div>
                                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-black">1</div>
                                    Información General
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-[42px]">Datos básicos de tu solicitud.</p>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-sm font-bold text-slate-700 dark:text-slate-300">Título de la Solicitud <span className="text-red-500">*</span></Label>
                                    <Input 
                                        id="title" 
                                        placeholder="Ej: Lote de 500 Sillas de Oficina Ergonómicas" 
                                        className="h-12 rounded-xl border-slate-200 dark:border-white/10 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        {...form.register('title')} 
                                    />
                                    {form.formState.errors.title && <p className="text-sm text-red-500 font-medium">{form.formState.errors.title.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-sm font-bold text-slate-700 dark:text-slate-300">Descripción Detallada <span className="text-red-500">*</span></Label>
                                    <Textarea 
                                        id="description" 
                                        placeholder="Incluye especificaciones técnicas, contexto del proyecto, requisitos de calidad, etc." 
                                        className="min-h-[140px] rounded-xl border-slate-200 dark:border-white/10 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                                        {...form.register('description')} 
                                    />
                                    {form.formState.errors.description && <p className="text-sm text-red-500 font-medium">{form.formState.errors.description.message}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="category" className="text-sm font-bold text-slate-700 dark:text-slate-300">Categoría</Label>
                                        <Select onValueChange={(val) => form.setValue('category', val as RfqCategory)}>
                                            <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-white/10">
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
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="budget" className="text-sm font-bold text-slate-700 dark:text-slate-300">Presupuesto Máximo (Q) <span className="text-red-500">*</span></Label>
                                        <Input 
                                            id="budget" 
                                            type="number" 
                                            step="0.01" 
                                            className="h-12 rounded-xl border-slate-200 dark:border-white/10 dark:bg-slate-950"
                                            {...form.register('budget')} 
                                        />
                                        {form.formState.errors.budget && <p className="text-sm text-red-500 font-medium">{form.formState.errors.budget.message}</p>}
                                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Este dato es confidencial y no será visible para los proveedores.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Items */}
                    {currentStep === 2 && (
                        <div className="p-8 md:p-10 space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-black">2</div>
                                        Productos y Cantidades
                                    </h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-[42px]">Agrega los ítems que necesitas cotizar.</p>
                                </div>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => append({ name: '', quantity: 1, unit: 'Piezas' })} 
                                    className="rounded-xl border-slate-200 dark:border-white/10 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-200 dark:hover:border-blue-800 font-bold text-blue-600 dark:text-blue-400 transition-all"
                                >
                                    <Plus className="h-4 w-4 mr-1.5" /> Agregar
                                </Button>
                            </div>

                            {form.formState.errors.items?.message && (
                                <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800/30">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <p className="font-medium">{form.formState.errors.items.message as string}</p>
                                </div>
                            )}

                            <div className="space-y-4">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="group relative bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl p-5 transition-all hover:border-blue-200 dark:hover:border-blue-900/30 hover:shadow-sm">
                                        {/* Item Number Badge */}
                                        <div className="absolute -top-2.5 left-4 px-2.5 py-0.5 bg-blue-600 text-white text-[0.6rem] font-black rounded-md uppercase tracking-wider">
                                            Ítem {index + 1}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start pt-2">
                                            <div className="md:col-span-5 space-y-1.5">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Producto / Servicio</Label>
                                                <Input 
                                                    className="h-11 rounded-xl dark:bg-slate-950 dark:border-white/10" 
                                                    placeholder="Ej: Mouse Inalámbrico Logitech" 
                                                    {...form.register(`items.${index}.name` as const)} 
                                                />
                                                {form.formState.errors.items?.[index]?.name && (
                                                    <p className="text-xs text-red-500 font-medium">{form.formState.errors.items[index].name.message}</p>
                                                )}
                                            </div>
                                            <div className="md:col-span-3 space-y-1.5">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Cantidad</Label>
                                                <Input 
                                                    type="number" 
                                                    className="h-11 rounded-xl dark:bg-slate-950 dark:border-white/10" 
                                                    {...form.register(`items.${index}.quantity` as const)} 
                                                />
                                                {form.formState.errors.items?.[index]?.quantity && (
                                                    <p className="text-xs text-red-500 font-medium">{form.formState.errors.items[index].quantity.message}</p>
                                                )}
                                            </div>
                                            <div className="md:col-span-3 space-y-1.5">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Unidad</Label>
                                                <Input 
                                                    placeholder="Cajas, pares..." 
                                                    className="h-11 rounded-xl dark:bg-slate-950 dark:border-white/10" 
                                                    {...form.register(`items.${index}.unit` as const)} 
                                                />
                                                {form.formState.errors.items?.[index]?.unit && (
                                                    <p className="text-xs text-red-500 font-medium">{form.formState.errors.items[index].unit.message}</p>
                                                )}
                                            </div>
                                            <div className="md:col-span-1 flex items-end justify-center md:pt-6">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                                                    onClick={() => remove(index)}
                                                    disabled={fields.length === 1}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Items Summary */}
                            <div className="flex items-center justify-between p-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-xl">
                                <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{fields.length} {fields.length === 1 ? 'producto' : 'productos'} en la solicitud</span>
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => append({ name: '', quantity: 1, unit: 'Piezas' })}
                                    className="text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 font-bold rounded-lg text-xs"
                                >
                                    <Plus className="h-3.5 w-3.5 mr-1" /> Agregar otro
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Commercial Terms */}
                    {currentStep === 3 && (
                        <div className="p-8 md:p-10 space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                            <div>
                                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-black">3</div>
                                    Condiciones Comerciales
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-[42px]">Plazos de recepción y condiciones de pago.</p>
                            </div>

                            <div className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="deadline" className="text-sm font-bold text-slate-700 dark:text-slate-300">Fecha y Hora de Cierre <span className="text-red-500">*</span></Label>
                                        <Input 
                                            id="deadline" 
                                            type="datetime-local" 
                                            className="h-12 rounded-xl border-slate-200 dark:border-white/10 dark:bg-slate-950"
                                            {...form.register('deadline')} 
                                        />
                                        {form.formState.errors.deadline && <p className="text-sm text-red-500 font-medium">{form.formState.errors.deadline.message}</p>}
                                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Después de esta fecha, no se aceptarán más ofertas.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="paymentTerms" className="text-sm font-bold text-slate-700 dark:text-slate-300">Condiciones de Pago</Label>
                                        <Select onValueChange={(val) => form.setValue('paymentTerms', val as PaymentTerms)}>
                                            <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-white/10">
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

                                <div className="space-y-2">
                                    <Label htmlFor="deliveryLocation" className="text-sm font-bold text-slate-700 dark:text-slate-300">Ubicación de Entrega</Label>
                                    <Input 
                                        id="deliveryLocation" 
                                        placeholder="Ej: Bodega Central Zona 12, Ciudad de Guatemala" 
                                        className="h-12 rounded-xl border-slate-200 dark:border-white/10 dark:bg-slate-950"
                                        {...form.register('deliveryLocation')} 
                                    />
                                </div>
                            </div>

                            {/* Review Summary */}
                            <div className="mt-8 p-6 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl space-y-4">
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Resumen de tu solicitud</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-[0.65rem] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Título</p>
                                        <p className="font-bold text-slate-900 dark:text-white mt-0.5 truncate">{form.watch('title') || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[0.65rem] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Presupuesto</p>
                                        <p className="font-bold text-slate-900 dark:text-white mt-0.5">Q {Number(form.watch('budget') || 0).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[0.65rem] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Productos</p>
                                        <p className="font-bold text-slate-900 dark:text-white mt-0.5">{fields.length} ítems</p>
                                    </div>
                                    <div>
                                        <p className="text-[0.65rem] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Cierre</p>
                                        <p className="font-bold text-slate-900 dark:text-white mt-0.5">{form.watch('deadline') ? new Date(form.watch('deadline')).toLocaleDateString('es-GT') : '—'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Footer */}
                    <div className="px-8 md:px-10 py-6 bg-slate-50/80 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/5 flex items-center justify-between">
                        {currentStep > 1 ? (
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setCurrentStep(prev => prev - 1)}
                                className="h-11 px-6 rounded-xl border-slate-200 dark:border-white/10 font-bold hover:bg-slate-100 dark:hover:bg-white/5"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" /> Anterior
                            </Button>
                        ) : (
                            <div />
                        )}

                        {currentStep < 3 ? (
                            <Button 
                                type="button" 
                                onClick={validateAndNext}
                                className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                            >
                                Siguiente <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button 
                                type="submit" 
                                disabled={isPending}
                                className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                            >
                                {isPending ? (
                                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Procesando...</>
                                ) : (
                                    <><CheckCircle2 className="w-4 h-4 mr-2" /> Publicar Solicitud</>
                                )}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Server Error */}
                {serverError && (
                    <div className="mt-4 flex items-center gap-2 p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800/30">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <p className="font-medium">{serverError}</p>
                    </div>
                )}
            </form>
        </div>
    )
}
