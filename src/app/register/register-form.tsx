'use client'

import React, { useActionState } from 'react'
import { registerUser } from '@/actions/register'
import { Building2, User, Mail, Lock, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function RegisterForm({ invitation }: { invitation?: any | null }) {
    const initialState = { message: '', errors: {} }
    const [state, dispatch] = useActionState(registerUser, initialState)

    return (
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100 dark:border-gray-700">
            {invitation && (
                <div className="mb-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <div className="flex gap-3">
                        <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-blue-900">Has sido invitado a unirte a {invitation.company.name}</p>
                            <p className="text-xs text-blue-700 mt-1">Tu cuenta será asociada automáticamente a esta empresa bajo el rol de {invitation.role}.</p>
                        </div>
                    </div>
                </div>
            )}

            <form action={dispatch} className="space-y-6">

                {/* Hidden Token if invited */}
                {invitation && (
                    <input type="hidden" name="inviteToken" value={invitation.token} />
                )}

                {/* --- DATOS DE LA EMPRESA (Only if NOT invited) --- */}
                {!invitation && (
                    <>
                        <div className="pt-2 mt-4 pb-2">
                            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-blue-600" />
                                Datos de la Empresa
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Información comercial para operar en Abastto.</p>
                        </div>

                        {/* NIT Field */}
                        <div>
                            <label htmlFor="nit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                NIT
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="nit"
                                    id="nit"
                                    required={!invitation}
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white py-2 px-3"
                                    placeholder="Ej. 1234567-8"
                                />
                            </div>
                            {state.errors?.nit && (
                                <p className="mt-2 text-sm text-red-600">{state.errors.nit.join(', ')}</p>
                            )}
                        </div>

                        {/* Company Name Field */}
                        <div>
                            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Razón Social / Nombre Comercial
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="companyName"
                                    id="companyName"
                                    required={!invitation}
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white py-2 px-3"
                                    placeholder="Ej. Constructora Los Patos S.A."
                                />
                            </div>
                            {state.errors?.companyName && (
                                <p className="mt-2 text-sm text-red-600">{state.errors.companyName.join(', ')}</p>
                            )}
                        </div>

                        {/* Industry Field */}
                        <div>
                            <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Sector Industrial
                            </label>
                            <div className="mt-1">
                                <select
                                    id="industry"
                                    name="industry"
                                    required={!invitation}
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white py-2 px-3"
                                >
                                    <option value="">Selecciona un sector...</option>
                                    <option value="AGRICULTURA">Agricultura</option>
                                    <option value="CONSTRUCCION">Construcción</option>
                                    <option value="ESTADO_GOBIERNO">Estado / Gobierno</option>
                                    <option value="MANUFACTURA">Manufactura</option>
                                    <option value="MEDICAL_SALUD">Médico / Salud</option>
                                    <option value="RETAIL_COMERCIO">Retail / Comercio</option>
                                    <option value="SERVICIOS_PROFESIONALES">Servicios Profesionales</option>
                                    <option value="TECNOLOGIA">Tecnología</option>
                                    <option value="TRANSPORTE_LOGISTICA">Transporte y Logística</option>
                                    <option value="OTRO">Otro</option>
                                </select>
                            </div>
                            {state.errors?.industry && (
                                <p className="mt-2 text-sm text-red-600">{state.errors.industry.join(', ')}</p>
                            )}
                        </div>

                        {/* Department Field */}
                        <div>
                            <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Sede (Departamento)
                            </label>
                            <div className="mt-1">
                                <select
                                    id="department"
                                    name="department"
                                    required={!invitation}
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white py-2 px-3"
                                >
                                    <option value="">Selecciona tu ubicación...</option>
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
                                <p className="mt-2 text-sm text-red-600">{state.errors.department.join(', ')}</p>
                            )}
                        </div>
                        <hr className="border-gray-200 dark:border-gray-700 my-6" />
                    </>
                )}

                {/* --- DATOS DEL USUARIO --- */}
                <div className="pt-2">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        Cuenta Personal
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Tus datos personales de acceso.</p>
                </div>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nombre Completo
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            autoComplete="name"
                            required
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white py-2"
                            placeholder="John Doe"
                        />
                    </div>
                    {state.errors?.name && (
                        <p className="mt-2 text-sm text-red-600" id="name-error">
                            {state.errors.name.join(', ')}
                        </p>
                    )}
                </div>

                {/* Email Field */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Correo electrónico
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            autoComplete="email"
                            defaultValue={invitation?.email || ''}
                            readOnly={!!invitation}
                            required
                            className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white py-2 ${invitation ? 'bg-slate-50 cursor-not-allowed' : ''}`}
                            placeholder="you@example.com"
                        />
                    </div>
                    {state.errors?.email && (
                        <p className="mt-2 text-sm text-red-600" id="email-error">
                            {state.errors.email.join(', ')}
                        </p>
                    )}
                </div>

                {/* Password Field */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Contraseña
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            required
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white py-2"
                            placeholder="••••••••"
                        />
                    </div>
                    {state.errors?.password && (
                        <p className="mt-2 text-sm text-red-600" id="password-error">
                            {state.errors.password.join(', ')}
                        </p>
                    )}
                </div>

                {/* Role Selection (Only if NOT invited) */}
                {!invitation && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Soy un...
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <label className="cursor-pointer">
                                <input type="radio" name="role" value="BUYER" className="peer sr-only" defaultChecked />
                                <div className="rounded-lg border border-gray-200 bg-white px-3 py-4 hover:bg-gray-50 peer-checked:border-blue-600 peer-checked:ring-1 peer-checked:ring-blue-600 dark:bg-gray-800 dark:border-gray-700 hover:dark:bg-gray-700 transition-all text-center">
                                    <span className="block text-sm font-medium text-gray-900 dark:text-white">Comprador</span>
                                    <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">Publicar Solicitudes</span>
                                </div>
                            </label>

                            <label className="cursor-pointer">
                                <input type="radio" name="role" value="SUPPLIER" className="peer sr-only" />
                                <div className="rounded-lg border border-gray-200 bg-white px-3 py-4 hover:bg-gray-50 peer-checked:border-blue-600 peer-checked:ring-1 peer-checked:ring-blue-600 dark:bg-gray-800 dark:border-gray-700 hover:dark:bg-gray-700 transition-all text-center">
                                    <span className="block text-sm font-medium text-gray-900 dark:text-white">Proveedor</span>
                                    <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">Enviar Ofertas</span>
                                </div>
                            </label>
                        </div>
                    </div>
                )}

                {/* Hidden role inherited from company if invited */}
                {invitation && (
                    <input type="hidden" name="role" value={invitation.role === 'ADMIN' ? 'ADMIN' : 'MEMBER'} /> // Not exact user Role (BUYER/SUPPLIER) but we handle that in backend
                )}


                {state.message && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    {state.message}
                                </h3>
                            </div>
                        </div>
                    </div>
                )}

                <div>
                    <Button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                        Create Account
                    </Button>
                </div>
            </form>

            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                            ¿Ya tienes una cuenta?
                        </span>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3">
                    <Link href="/login" className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600">
                        Iniciar Sesión
                    </Link>
                </div>
            </div>
        </div>
    )
}
