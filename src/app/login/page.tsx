'use client'

import React, { useActionState } from 'react'
import { authenticate } from '@/lib/actions'
import { ArrowRight, CheckCircle2, Lock, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function LoginPage() {
    const [errorMessage, dispatch] = useActionState(authenticate, undefined)

    return (
        <div className="min-h-screen bg-white flex">
            {/* Left Side - Hero/Testimonial */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <span className="font-bold text-white">A</span>
                        </div>
                        <span className="text-xl font-bold">Abastto</span>
                    </div>

                    <h1 className="text-4xl font-bold mb-6 leading-tight">
                        Optimiza tu proceso de compras B2B hoy.
                    </h1>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-blue-400" />
                            <span>Red de proveedores verificados</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-blue-400" />
                            <span>Gestión inteligente de cotizaciones</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-blue-400" />
                            <span>Flujo de transacciones seguro</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 mt-12 bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur-sm">
                    <p className="text-lg text-slate-200 italic mb-4">
                        "Abastto ha transformado cómo obtenemos materiales. La plataforma es intuitiva y la calidad de los proveedores inigualable."
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-600 flex items-center justify-center font-bold">
                            JU
                        </div>
                        <div>
                            <p className="font-semibold">Juan Pérez</p>
                            <p className="text-sm text-slate-400">Gerente de Compras, TechCorp</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
                <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Bienvenido de nuevo</h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Ingresa tus datos para iniciar sesión
                        </p>
                    </div>

                    <form action={dispatch} className="mt-8 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Correo electrónico
                                </label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Contraseña
                                    </label>
                                    <div className="text-sm">
                                        <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                                            ¿Olvidaste tu contraseña?
                                        </a>
                                    </div>
                                </div>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        {errorMessage && (
                            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md">
                                {errorMessage}
                            </div>
                        )}

                        <Button type="submit" className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-lg shadow-blue-500/30">
                            Iniciar Sesión
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>

                        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                            ¿No tienes una cuenta?{' '}
                            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                                Regístrate gratis
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}
