'use client'

import React, { useActionState } from 'react'
import { registerUser } from '@/actions/register'
import { ArrowLeft, Building2, User, Mail, Lock, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function RegisterPage() {
    const initialState = { message: '', errors: {} }
    const [state, dispatch] = useActionState(registerUser, initialState)

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center">
                        <span className="font-bold text-2xl text-white">A</span>
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    Crea tu cuenta
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    Únete al mercado B2B líder
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100 dark:border-gray-700">
                    <form action={dispatch} className="space-y-6">

                        {/* Name Field */}
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
                                    required
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white py-2"
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

                        {/* Role Selection */}
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Soy un...
                            </label>
                            <div className="mt-2 grid grid-cols-2 gap-3">

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
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
            </div>
        </div>
    )
}
