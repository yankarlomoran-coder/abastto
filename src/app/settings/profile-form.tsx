'use client'

import { useActionState } from 'react'
import { updateCompanyProfile, SettingsState } from '@/actions/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Save } from 'lucide-react'

// Using native enum matching from Prisma
const INDUSTRIES = [
    { value: 'AGRICULTURA', label: 'Agricultura' },
    { value: 'CONSTRUCCION', label: 'Construcción' },
    { value: 'ESTADO_GOBIERNO', label: 'Estado/Gobierno' },
    { value: 'MANUFACTURA', label: 'Manufactura' },
    { value: 'MEDICAL_SALUD', label: 'Médica y Salud' },
    { value: 'RETAIL_COMERCIO', label: 'Retail y Comercio' },
    { value: 'SERVICIOS_PROFESIONALES', label: 'Servicios Profesionales' },
    { value: 'TECNOLOGIA', label: 'Tecnología' },
    { value: 'TRANSPORTE_LOGISTICA', label: 'Transporte y Logística' },
    { value: 'OTRO', label: 'Otro' },
]

const DEPARTMENTS = [
    'ALTA_VERAPAZ', 'BAJA_VERAPAZ', 'CHIMALTENANGO', 'CHIQUIMULA',
    'EL_PROGRESO', 'ESCUINTLA', 'GUATEMALA', 'HUEHUETENANGO',
    'IZABAL', 'JALAPA', 'JUTIAPA', 'PETEN', 'QUETZALTENANGO',
    'QUICHE', 'RETALHULEU', 'SACATEPEQUEZ', 'SAN_MARCOS',
    'SANTA_ROSA', 'SOLOLA', 'SUCHITEPEQUEZ', 'TOTONICAPAN', 'ZACAPA'
]

export default function CompanyProfileForm({
    initialData,
    isReadOnly
}: {
    initialData: any,
    isReadOnly: boolean
}) {
    const initialState: SettingsState = { message: null, errors: {} }
    const [state, formAction, isPending] = useActionState(updateCompanyProfile, initialState)

    return (
        <form action={formAction} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="space-y-2">
                    <Label htmlFor="name">Razón Social o Nombre Comercial</Label>
                    <Input
                        id="name"
                        name="name"
                        defaultValue={initialData.name}
                        disabled={isReadOnly}
                        required
                    />
                    {state.errors?.name && (
                        <p className="mt-1 text-xs text-red-500">{state.errors.name[0]}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="nit">NIT (Número de Identificación Tributaria)</Label>
                    <Input
                        id="nit"
                        name="nit"
                        defaultValue={initialData.nit}
                        disabled={isReadOnly}
                        placeholder="Ej. 1234567-8"
                        required
                    />
                    {state.errors?.nit && (
                        <p className="mt-1 text-xs text-red-500">{state.errors.nit[0]}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="industry">Sector Industrial</Label>
                    <select
                        id="industry"
                        name="industry"
                        defaultValue={initialData.industry}
                        disabled={isReadOnly}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                    >
                        <option value="" disabled>Selecciona el sector</option>
                        {INDUSTRIES.map(ind => (
                            <option key={ind.value} value={ind.value}>{ind.label}</option>
                        ))}
                    </select>
                    {state.errors?.industry && (
                        <p className="mt-1 text-xs text-red-500">{state.errors.industry[0]}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="department">Departamento (Ubicación Principal)</Label>
                    <select
                        id="department"
                        name="department"
                        defaultValue={initialData.department}
                        disabled={isReadOnly}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                    >
                        <option value="" disabled>Selecciona el departamento</option>
                        {DEPARTMENTS.map(dep => (
                            <option key={dep} value={dep}>{dep.replace('_', ' ')}</option>
                        ))}
                    </select>
                    {state.errors?.department && (
                        <p className="mt-1 text-xs text-red-500">{state.errors.department[0]}</p>
                    )}
                </div>
            </div>

            {state.message && (
                <div className={`flex items-center gap-2 p-3 text-sm rounded-md ${state.message.includes('exitosamente')
                        ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                        : 'text-red-700 bg-red-50 border border-red-200'
                    }`}>
                    <AlertCircle className="h-4 w-4" />
                    <p>{state.message}</p>
                </div>
            )}

            {!isReadOnly && (
                <div className="pt-4 flex justify-end">
                    <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700">
                        {isPending ? 'Guardando cambios...' : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Guardar Perfil
                            </>
                        )}
                    </Button>
                </div>
            )}
        </form>
    )
}
