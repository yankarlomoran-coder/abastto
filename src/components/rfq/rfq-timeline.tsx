'use client'

import { CheckCircle2, Clock, Package, Star, X, Gavel, FileText, Truck, Archive } from 'lucide-react'

interface TimelineStep {
    label: string
    icon: React.ElementType
    status: 'completed' | 'current' | 'upcoming' | 'skipped'
    date?: string | null
}

interface RfqTimelineProps {
    rfqStatus: string
    createdAt: string | Date
    deadline: string | Date
    deliveryConfirmedAt?: string | Date | null
    isBuyer: boolean
}

const STATUS_ORDER = [
    'DRAFT_PENDING_APPROVAL',
    'OPEN',
    'EVALUATING',
    'PENDING_DELIVERY',
    'DELIVERED',
    'CLOSED',
]

function getStepStatus(stepIndex: number, currentIndex: number): TimelineStep['status'] {
    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'current'
    return 'upcoming'
}

export function RfqTimeline({ rfqStatus, createdAt, deadline, deliveryConfirmedAt, isBuyer }: RfqTimelineProps) {
    const currentIndex = STATUS_ORDER.indexOf(rfqStatus)
    const effectiveIndex = currentIndex === -1 ? 1 : currentIndex // Default to OPEN if unknown

    const steps: TimelineStep[] = [
        {
            label: 'Publicada',
            icon: FileText,
            status: getStepStatus(0, effectiveIndex),
            date: new Date(createdAt).toLocaleDateString('es-GT', { month: 'short', day: 'numeric' }),
        },
        {
            label: 'Recibiendo Ofertas',
            icon: Clock,
            status: getStepStatus(1, effectiveIndex),
            date: new Date(deadline).toLocaleDateString('es-GT', { month: 'short', day: 'numeric' }),
        },
        {
            label: 'En Evaluación',
            icon: Gavel,
            status: getStepStatus(2, effectiveIndex),
        },
        {
            label: 'Entrega Pendiente',
            icon: Truck,
            status: getStepStatus(3, effectiveIndex),
        },
        {
            label: 'Entregada',
            icon: Package,
            status: getStepStatus(4, effectiveIndex),
            date: deliveryConfirmedAt ? new Date(deliveryConfirmedAt).toLocaleDateString('es-GT', { month: 'short', day: 'numeric' }) : undefined,
        },
        {
            label: 'Finalizada',
            icon: Archive,
            status: getStepStatus(5, effectiveIndex),
        },
    ]

    // If DRAFT_PENDING_APPROVAL is not the current state and not passed, skip the first step
    // and start from OPEN for a cleaner view
    const visibleSteps = rfqStatus === 'DRAFT_PENDING_APPROVAL' ? steps : steps.slice(1)

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 p-6 md:p-8 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                Progreso de la Solicitud
            </h3>

            {/* Desktop horizontal */}
            <div className="hidden md:flex items-start justify-between relative">
                {/* Connecting line (background) */}
                <div className="absolute top-5 left-[40px] right-[40px] h-[2px] bg-slate-200 dark:bg-white/10" />
                {/* Connecting line (progress) */}
                <div
                    className="absolute top-5 left-[40px] h-[2px] bg-blue-600 dark:bg-blue-500 transition-all duration-700"
                    style={{
                        width: `${Math.max(0, (visibleSteps.findIndex(s => s.status === 'current') / (visibleSteps.length - 1)) * 100)}%`,
                        maxWidth: 'calc(100% - 80px)',
                    }}
                />

                {visibleSteps.map((step, idx) => (
                    <div key={idx} className="flex flex-col items-center relative z-10 flex-1">
                        <div
                            className={`
                                w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                                ${step.status === 'completed'
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : step.status === 'current'
                                    ? 'bg-white dark:bg-slate-900 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-600/10 animate-pulse'
                                    : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-600'
                                }
                            `}
                        >
                            {step.status === 'completed' ? (
                                <CheckCircle2 className="w-5 h-5" />
                            ) : (
                                <step.icon className="w-4 h-4" />
                            )}
                        </div>
                        <p className={`mt-3 text-[0.7rem] font-bold text-center leading-tight max-w-[90px] ${
                            step.status === 'current'
                                ? 'text-blue-600 dark:text-blue-400'
                                : step.status === 'completed'
                                ? 'text-slate-900 dark:text-white'
                                : 'text-slate-400 dark:text-slate-500'
                        }`}>
                            {step.label}
                        </p>
                        {step.date && (
                            <p className="text-[0.6rem] font-bold text-slate-400 dark:text-slate-500 mt-1">
                                {step.date}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {/* Mobile vertical */}
            <div className="md:hidden space-y-0">
                {visibleSteps.map((step, idx) => (
                    <div key={idx} className="flex gap-4">
                        {/* Indicator */}
                        <div className="flex flex-col items-center">
                            <div
                                className={`
                                    w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 transition-all
                                    ${step.status === 'completed'
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : step.status === 'current'
                                        ? 'bg-white dark:bg-slate-900 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 animate-pulse'
                                        : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-600'
                                    }
                                `}
                            >
                                {step.status === 'completed' ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                    <step.icon className="w-3.5 h-3.5" />
                                )}
                            </div>
                            {idx < visibleSteps.length - 1 && (
                                <div className={`w-0.5 h-8 ${
                                    step.status === 'completed' ? 'bg-blue-600 dark:bg-blue-500' : 'bg-slate-200 dark:bg-white/10'
                                }`} />
                            )}
                        </div>

                        {/* Label */}
                        <div className="pb-6">
                            <p className={`text-sm font-bold ${
                                step.status === 'current'
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : step.status === 'completed'
                                    ? 'text-slate-900 dark:text-white'
                                    : 'text-slate-400 dark:text-slate-500'
                            }`}>
                                {step.label}
                            </p>
                            {step.date && (
                                <p className="text-[0.7rem] font-bold text-slate-400 dark:text-slate-500 mt-0.5">
                                    {step.date}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
