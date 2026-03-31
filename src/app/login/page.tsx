"use client"

import React, { useActionState, useState } from 'react'
import { authenticate } from '@/lib/actions'
import { ArrowRight, CheckCircle2, Lock, Mail, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Footer from '@/components/layout/footer'

export default function LoginPage() {
    const [errorMessage, dispatch] = useActionState(authenticate, undefined)
    const [showPassword, setShowPassword] = useState(false)

    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex-grow flex flex-col lg:flex-row">
            {/* Left Side - Hero/Testimonial */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center" />

                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-2.5 mb-8 group cursor-pointer w-fit">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                            <BoxIcon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-white">
                            ABASTTO
                        </span>
                    </Link>

                    <h1 className="text-4xl font-bold mb-6 leading-tight">
                        Optimiza tu proceso de compras hoy.
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
                                        placeholder="correo@ejemplo.com"
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
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        className="appearance-none block w-full pl-10 pr-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-500 transition-colors"
                                        onMouseDown={() => setShowPassword(true)}
                                        onMouseUp={() => setShowPassword(false)}
                                        onMouseLeave={() => setShowPassword(false)}
                                        onTouchStart={() => setShowPassword(true)}
                                        onTouchEnd={() => setShowPassword(false)}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
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
                                Crear cuenta
                            </Link>
                        </p>
                    </form>
                </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
function BoxIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
}
