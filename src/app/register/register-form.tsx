"use client"

import React, { useActionState, useState, useEffect } from 'react'
import { registerUser } from '@/actions/register'
import { Building2, User, Mail, Lock, CheckCircle2, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export default function RegisterForm({ invitation }: { invitation?: any | null }) {
    const initialState = { message: '', errors: {} }
    const [state, dispatch] = useActionState(registerUser, initialState)
    const [showPassword, setShowPassword] = useState(false)
    const [step, setStep] = useState(invitation ? 2 : 1)

    // Si hay errores de validación en el estado, asegurar que estemos en el paso correcto para verlos
    useEffect(() => {
        if (Object.keys(state.errors || {}).length > 0) {
            const hasStep1Errors = state.errors?.nit || state.errors?.industry || state.errors?.companyName || state.errors?.department
            if (hasStep1Errors && !invitation) {
                setStep(1)
            } else {
                setStep(2)
            }
        }
    }, [state.errors, invitation])

    const nextStep = () => setStep(2)
    const prevStep = () => setStep(1)

    return (
        <div className="bg-white dark:bg-[#111827] py-8 px-6 shadow-xl shadow-slate-200/50 dark:shadow-none sm:rounded-2xl sm:px-10 border border-slate-100 dark:border-white/5 transition-colors overflow-hidden">
            {/* Indicador de pasos */}
            {!invitation && (
                <div className="flex items-center justify-between mb-8 px-2">
                    <div className="flex flex-col items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${step === 1 ? 'bg-blue-600 text-white ring-4 ring-blue-600/20' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'}`}>1</div>
                        <span className={`text-[10px] uppercase tracking-wider font-bold ${step === 1 ? 'text-blue-600' : 'text-slate-400'}`}>Empresa</span>
                    </div>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800 mx-4 mt-[-18px]"></div>
                    <div className="flex flex-col items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${step === 2 ? 'bg-blue-600 text-white ring-4 ring-blue-600/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>2</div>
                        <span className={`text-[10px] uppercase tracking-wider font-bold ${step === 2 ? 'text-blue-600' : 'text-slate-400'}`}>Usuario</span>
                    </div>
                </div>
            )}
            {invitation && (
                <div className="mb-6 bg-blue-50/80 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 p-4 rounded-xl backdrop-blur-sm">
                    <div className="flex gap-3">
                        <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Has recibido una invitación corporativa</p>
                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                Tu perfil se asociará automáticamente a la empresa <span className="font-bold">{invitation.company.name}</span> como {invitation.role === 'ADMIN' ? 'Administrador' : 'Miembro'}.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <form action={dispatch} className="relative">
                {/* Token Oculto Si Fue Invitado */}
                {invitation && (
                    <input type="hidden" name="inviteToken" value={invitation.token} />
                )}

                <AnimatePresence mode="wait">
                    {step === 1 && !invitation && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            <div className="pt-2">
                                <h3 className="text-lg font-bold leading-6 text-slate-900 dark:text-white flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    Información Comercial
                                </h3>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Datos principales para identificar a su organización en la red.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* NIT Field */}
                                <div>
                                    <label htmlFor="nit" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        NIT (Identificación Tributaria)
                                    </label>
                                    <div className="mt-1.5">
                                        <input
                                            type="text"
                                            name="nit"
                                            id="nit"
                                            required={!invitation}
                                            className="focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 block w-full sm:text-sm border-slate-200 dark:border-white/10 rounded-xl dark:bg-slate-900 dark:text-white py-2.5 px-4 transition-all"
                                            placeholder="Ej. 1234567-8"
                                        />
                                    </div>
                                    {state.errors?.nit && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{state.errors.nit.join(', ')}</p>
                                    )}
                                </div>

                                {/* Industry Field */}
                                <div>
                                    <label htmlFor="industry" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Sector Industrial
                                    </label>
                                    <div className="mt-1.5">
                                        <select
                                            id="industry"
                                            name="industry"
                                            required={!invitation}
                                            className="focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 block w-full sm:text-sm border-slate-200 dark:border-white/10 rounded-xl dark:bg-slate-900 dark:text-white py-2.5 px-4 transition-all"
                                        >
                                            <option value="">Seleccione el sector...</option>
                                            <option value="AGRICULTURA">Agricultura</option>
                                            <option value="CONSTRUCCION">Construcción</option>
                                            <option value="ESTADO_GOBIERNO">Entidad Gubernamental</option>
                                            <option value="MANUFACTURA">Manufactura y Producción</option>
                                            <option value="MEDICAL_SALUD">Salud y Servicios Médicos</option>
                                            <option value="RETAIL_COMERCIO">Comercio Minorista / Mayorista</option>
                                            <option value="SERVICIOS_PROFESIONALES">Servicios Profesionales</option>
                                            <option value="TECNOLOGIA">Tecnología de la Información</option>
                                            <option value="TRANSPORTE_LOGISTICA">Transporte y Logística</option>
                                            <option value="OTRO">Otro sector corporativo</option>
                                        </select>
                                    </div>
                                    {state.errors?.industry && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{state.errors.industry.join(', ')}</p>
                                    )}
                                </div>

                                {/* Company Name Field */}
                                <div>
                                    <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Razón Social
                                    </label>
                                    <div className="mt-1.5">
                                        <input
                                            type="text"
                                            name="companyName"
                                            id="companyName"
                                            required={!invitation}
                                            className="focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 block w-full sm:text-sm border-slate-200 dark:border-white/10 rounded-xl dark:bg-slate-900 dark:text-white py-2.5 px-4 transition-all"
                                            placeholder="Ej. Constructora Los Andes"
                                        />
                                    </div>
                                    {state.errors?.companyName && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{state.errors.companyName.join(', ')}</p>
                                    )}
                                </div>

                                {/* Department Field */}
                                <div>
                                    <label htmlFor="department" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Ubicación (Sede)
                                    </label>
                                    <div className="mt-1.5">
                                        <select
                                            id="department"
                                            name="department"
                                            required={!invitation}
                                            className="focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 block w-full sm:text-sm border-slate-200 dark:border-white/10 rounded-xl dark:bg-slate-900 dark:text-white py-2.5 px-4 transition-all"
                                        >
                                            <option value="">Seleccione...</option>
                                            <option value="GUATEMALA">Guatemala</option>
                                            <option value="ALTA_VERAPAZ">Alta Verapaz</option>
                                            <option value="BAJA_VERAPAZ">Baja Verapaz</option>
                                            <option value="CHIMALTENANGO">Chimaltenango</option>
                                            <option value="CHIQUIMULA">Chiquimula</option>
                                            <option value="EL_PROGRESO">El Progreso</option>
                                            <option value="ESCUINTLA">Escuintla</option>
                                            <option value="HUEHUETENANGO">Huehuetenango</option>
                                            <option value="IZABAL">Izabal</option>
                                            <option value="JALAPA">Jalapa</option>
                                            <option value="JUTIAPA">Jutiapa</option>
                                            <option value="PETEN">Petén</option>
                                            <option value="QUETZALTENANGO">Quetzaltenango</option>
                                            <option value="QUICHE">Quiché</option>
                                            <option value="RETALHULEU">Retalhuleu</option>
                                            <option value="SACATEPEQUEZ">Sacatepéquez</option>
                                            <option value="SAN_MARCOS">San Marcos</option>
                                            <option value="SANTA_ROSA">Santa Rosa</option>
                                            <option value="SOLOLA">Sololá</option>
                                            <option value="SUCHITEPEQUEZ">Suchitepéquez</option>
                                            <option value="TOTONICAPAN">Totonicapán</option>
                                            <option value="ZACAPA">Zacapa</option>
                                        </select>
                                    </div>
                                    {state.errors?.department && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{state.errors.department.join(', ')}</p>
                                    )}
                                </div>
                            </div>

                            {/* Selección del Rol Primario */}
                            <div className="pt-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2.5">
                                    Objetivo principal en la plataforma
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className="cursor-pointer group">
                                        <input type="radio" name="role" value="BUYER" className="peer sr-only" defaultChecked />
                                        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 px-3 py-4 hover:border-blue-500/50 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20 peer-checked:border-blue-600 peer-checked:ring-1 peer-checked:ring-blue-600 transition-all text-center">
                                            <span className="block text-sm font-bold text-slate-900 dark:text-white">Comprador Corporativo</span>
                                            <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">Solicitar cotizaciones</span>
                                        </div>
                                    </label>

                                    <label className="cursor-pointer group">
                                        <input type="radio" name="role" value="SUPPLIER" className="peer sr-only" />
                                        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 px-3 py-4 hover:border-blue-500/50 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20 peer-checked:border-blue-600 peer-checked:ring-1 peer-checked:ring-blue-600 transition-all text-center">
                                            <span className="block text-sm font-bold text-slate-900 dark:text-white">Proveedor</span>
                                            <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">Atender cotizaciones</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button
                                    type="button"
                                    onClick={nextStep}
                                    className="w-full flex justify-center py-6 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-blue-600 hover:bg-blue-500 hover:-translate-y-0.5 transition-all group"
                                >
                                    Siguiente Paso
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            {invitation && (
                                <div className="mb-6 bg-blue-50/80 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 p-4 rounded-xl backdrop-blur-sm">
                                    <div className="flex gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Invitación confirmada</p>
                                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                                Completando acceso para <span className="font-bold">{invitation.company.name}</span>.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-2">
                                <h3 className="text-lg font-bold leading-6 text-slate-900 dark:text-white flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    Información del Administrador
                                </h3>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Credenciales formales de acceso a la entidad.</p>
                            </div>
                            
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Nombre del representante
                                </label>
                                <div className="mt-1.5 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-slate-400" aria-hidden="true" />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        autoComplete="name"
                                        required
                                        className="focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 block w-full pl-11 sm:text-sm border-slate-200 dark:border-white/10 rounded-xl dark:bg-slate-900 dark:text-white py-2.5 transition-all"
                                        placeholder="Nombre completo"
                                    />
                                </div>
                                {state.errors?.name && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400" id="name-error">
                                        {state.errors.name.join(', ')}
                                    </p>
                                )}
                            </div>

                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Dirección de correo electrónico
                                </label>
                                <div className="mt-1.5 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-400" aria-hidden="true" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        autoComplete="email"
                                        defaultValue={invitation?.email || ''}
                                        readOnly={!!invitation}
                                        required
                                        className={`focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 block w-full pl-11 sm:text-sm border-slate-200 dark:border-white/10 rounded-xl dark:bg-slate-900 dark:text-white py-2.5 transition-all ${invitation ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed opacity-70' : ''}`}
                                        placeholder="correo@empresa.com"
                                    />
                                </div>
                                {state.errors?.email && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400" id="email-error">
                                        {state.errors.email.join(', ')}
                                    </p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Contraseña de seguridad
                                </label>
                                <div className="mt-1.5 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400" aria-hidden="true" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        id="password"
                                        required
                                        className="focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 block w-full pl-11 pr-11 sm:text-sm border-slate-200 dark:border-white/10 rounded-xl dark:bg-slate-900 dark:text-white py-2.5 transition-all"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-blue-500 transition-colors"
                                        onMouseDown={() => setShowPassword(true)}
                                        onMouseUp={() => setShowPassword(false)}
                                        onMouseLeave={() => setShowPassword(false)}
                                        onTouchStart={() => setShowPassword(true)}
                                        onTouchEnd={() => setShowPassword(false)}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {state.errors?.password && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400" id="password-error">
                                        {state.errors.password.join(', ')}
                                    </p>
                                )}
                            </div>

                            {/* Hidden role inherited from company if invited */}
                            {invitation && (
                                <input type="hidden" name="role" value={invitation.role === 'ADMIN' ? 'ADMIN' : 'MEMBER'} />
                            )}

                            {state.message && (
                                <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4">
                                    <div className="flex">
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                                                {state.message}
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                {!invitation && (
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="flex-none px-6 border border-slate-200 dark:border-white/10 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all outline-none"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                )}
                                <Button
                                    type="submit"
                                    className="flex-1 py-6 border border-transparent rounded-xl shadow-[0_10px_20px_rgba(37,99,235,0.2)] text-base font-semibold text-white bg-blue-600 hover:bg-blue-500 hover:-translate-y-0.5 transition-all"
                                >
                                    Comenzar ahora
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>

            <div className="mt-8 border-t border-slate-100 dark:border-white/5 pt-8">
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white dark:bg-[#111827] text-slate-500 dark:text-slate-400">
                        ¿Ya tienes acceso corporativo?
                    </span>
                </div>

                <div className="mt-6 flex justify-center">
                    <Link href="/login" className="text-sm font-bold text-blue-600 hover:text-blue-500 flex items-center gap-1 group transition-colors">
                        Iniciar Sesión
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    )
}
