'use client'

import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-[#0a0f1c] border-t border-slate-200 dark:border-slate-800/80 py-16 transition-colors w-full">
      <div className="max-w-7xl mx-auto px-6 xl:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="flex items-center gap-3 mb-6 w-fit group">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
              <span className="font-bold text-white text-sm text-[12px]">A</span>
            </div>
            <span className="text-2xl font-bold dark:text-white">Abastto</span>
          </Link>
          <p className="text-slate-500 dark:text-slate-400 text-base max-w-sm leading-relaxed">
            Conectando tu negocio con el mercado. Las compras de tu empresa más simples, más rápidas y comprobadas.
          </p>
        </div>
        
        <div>
          <h4 className="font-bold mb-6 text-slate-900 dark:text-white">Plataforma</h4>
          <ul className="space-y-4 text-slate-600 dark:text-slate-400 font-medium">
            <li><Link href="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Iniciar sesión</Link></li>
            <li><Link href="/register" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Crea tu perfil</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6 text-slate-900 dark:text-white">Legal</h4>
          <ul className="space-y-4 text-slate-600 dark:text-slate-400 font-medium">
            <li><Link href="/legal/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Términos del Servicio</Link></li>
            <li><Link href="/legal/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacidad</Link></li>
            <li><Link href="/legal/cookies" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Cookies</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 xl:px-8 pt-8 mt-16 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center text-sm text-slate-500 dark:text-slate-500">
        <p>&copy; {new Date().getFullYear()} Abastto. Todos los derechos reservados.</p>
        <div className="mt-4 sm:mt-0 flex gap-6">
           <Link href="/" className="hover:text-blue-600 transition-colors">Inicio</Link>
           <Link href="/register" className="hover:text-blue-600 transition-colors">Registro</Link>
        </div>
      </div>
    </footer>
  )
}
