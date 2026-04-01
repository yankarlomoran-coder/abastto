'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { completeOnboarding } from '@/actions/onboarding'
import {
    FileText, Users, ShieldCheck, BarChart3,
    ChevronRight, ChevronLeft, Sparkles, CheckCircle2, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface OnboardingWizardProps {
    userName: string
    userRole: 'BUYER' | 'SUPPLIER'
}

const BUYER_STEPS = [
    {
        icon: FileText,
        title: 'Crea tu primera licitación',
        description: 'Publica una solicitud de cotización (RFQ) para recibir ofertas de proveedores verificados. Define tus productos, cantidades y plazos.',
        tip: 'Cuanto más detallada sea tu licitación, mejores ofertas recibirás.',
        color: 'blue',
    },
    {
        icon: BarChart3,
        title: 'Evalúa ofertas con inteligencia',
        description: 'Compara ofertas lado a lado con nuestro análisis asistido por IA. Recibe recomendaciones basadas en precio, calidad y reputación del proveedor.',
        tip: 'Usa el módulo de Analíticas para visualizar tus ahorros.',
        color: 'indigo',
    },
    {
        icon: ShieldCheck,
        title: 'Verifica tu empresa',
        description: 'Sube tus documentos legales (RTU, Patente Comercial, Representación Legal) para obtener el sello de empresa verificada y ganar confianza.',
        tip: 'Las empresas verificadas reciben un 40% más de ofertas.',
        color: 'emerald',
    },
    {
        icon: Users,
        title: 'Invita a tu equipo',
        description: 'Agrega miembros de tu equipo de compras para colaborar en las licitaciones. Asigna roles de Administrador, Miembro o Visor.',
        tip: 'Ve a Ajustes → Directorio de Equipo para enviar invitaciones.',
        color: 'violet',
    },
]

const SUPPLIER_STEPS = [
    {
        icon: ShieldCheck,
        title: 'Verifica tu empresa primero',
        description: 'Los compradores prefieren proveedores verificados. Sube tu RTU, Patente Comercial y Representación Legal para obtener el sello verde.',
        tip: 'Las empresas verificadas aparecen primero en los resultados.',
        color: 'emerald',
    },
    {
        icon: FileText,
        title: 'Explora oportunidades',
        description: 'Navega las licitaciones publicadas por compradores. Filtra por categoría, presupuesto y ubicación para encontrar oportunidades relevantes.',
        tip: 'Las mejores ofertas incluyen carta de presentación y desglose detallado.',
        color: 'blue',
    },
    {
        icon: BarChart3,
        title: 'Envía ofertas competitivas',
        description: 'Cotiza directamente en la plataforma con precio unitario, plazo de entrega y condiciones de pago. Tu oferta llega al comprador al instante.',
        tip: 'Una oferta bien documentada tiene 3x más probabilidad de ganar.',
        color: 'indigo',
    },
    {
        icon: Users,
        title: 'Construye tu reputación',
        description: 'Cada transacción completada te genera reseñas y mejora tu Trust Score. Una mejor reputación significa más oportunidades de negocio.',
        tip: 'Revisa tu perfil público en Red de Proveedores.',
        color: 'violet',
    },
]

const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', icon: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
    indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', icon: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
    violet: { bg: 'bg-violet-50 dark:bg-violet-900/20', icon: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800' },
}

export function OnboardingWizard({ userName, userRole }: OnboardingWizardProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [isVisible, setIsVisible] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const steps = userRole === 'BUYER' ? BUYER_STEPS : SUPPLIER_STEPS
    const step = steps[currentStep]
    const colors = colorMap[step.color]
    const isLast = currentStep === steps.length - 1

    const handleComplete = async () => {
        setIsLoading(true)
        await completeOnboarding()
        setIsVisible(false)
        router.refresh()
    }

    const handleDismiss = async () => {
        setIsLoading(true)
        await completeOnboarding()
        setIsVisible(false)
    }

    if (!isVisible) return null

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden relative">
            {/* Dismiss button */}
            <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer z-10"
                aria-label="Cerrar"
            >
                <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="px-8 pt-8 pb-0">
                <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">Guía de inicio</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Bienvenido, {userName?.split(' ')[0] || 'Usuario'} 👋
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                    {userRole === 'BUYER' ? 'Tu plataforma de compras inteligentes está lista.' : 'Tu perfil de proveedor está activo.'} Sigue estos pasos para sacar el máximo provecho.
                </p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 px-8 mt-5 mb-6">
                {steps.map((_, idx) => (
                    <div
                        key={idx}
                        className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${
                            idx <= currentStep
                                ? 'bg-blue-600 dark:bg-blue-500'
                                : 'bg-slate-200 dark:bg-white/10'
                        }`}
                    />
                ))}
            </div>

            {/* Step content */}
            <div className="px-8 pb-6">
                <div className={`flex items-start gap-5 p-5 rounded-xl border ${colors.bg} ${colors.border} transition-all`}>
                    <div className={`w-12 h-12 rounded-xl ${colors.bg} ${colors.icon} flex items-center justify-center shrink-0`}>
                        <step.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-black text-slate-900 dark:text-white text-sm mb-1.5">{step.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-3">{step.description}</p>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{step.tip}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between px-8 pb-6">
                <Button
                    variant="ghost"
                    onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
                    disabled={currentStep === 0}
                    className="font-bold text-sm text-slate-500 dark:text-slate-400 h-10 rounded-xl"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                </Button>

                {isLast ? (
                    <Button
                        onClick={handleComplete}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-6 rounded-xl shadow-lg shadow-blue-600/20"
                    >
                        {isLoading ? 'Guardando...' : '¡Empezar!'} <Sparkles className="w-4 h-4 ml-1.5" />
                    </Button>
                ) : (
                    <Button
                        onClick={() => setCurrentStep(s => Math.min(steps.length - 1, s + 1))}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-6 rounded-xl shadow-lg shadow-blue-600/20"
                    >
                        Siguiente <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                )}
            </div>
        </div>
    )
}
