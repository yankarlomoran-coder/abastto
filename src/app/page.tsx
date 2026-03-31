"use client"

import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, BarChart3 } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { HeroGraphic } from "@/components/landing/hero-graphic";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300 overflow-x-hidden font-sans">
      <Navbar />

      {/* Main Section */}

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center">
        <section className="relative w-full max-w-7xl mx-auto px-6 xl:px-8 py-20 lg:py-32 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Fondo Decorativo */}
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/10 dark:bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
          
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={staggerContainer}
            className="space-y-8 text-center lg:text-left z-10"
          >
            <motion.div variants={fadeIn} className="inline-block px-4 py-2 bg-blue-100/50 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 font-medium text-sm border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-md">
              Bienvenido a la nueva forma de comprar
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
              La red conectada para <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500 dark:from-blue-400 dark:to-sky-400">crecer tu negocio</span>
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto lg:mx-0">
              Encuentra a los proveedores que necesitas, solicita presupuestos al instante y organiza todas tus compras de empresa en un solo lugar.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link
                href="/register"
                className="group px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-500 hover:-translate-y-1 transition-all shadow-[0_10px_20px_rgba(37,99,235,0.2)] dark:shadow-[0_10px_30px_rgba(37,99,235,0.2)] flex items-center gap-3 w-full sm:w-auto justify-center"
              >
                Únete a la red
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 text-lg font-semibold text-slate-700 dark:text-slate-200 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all w-full sm:w-auto justify-center flex backdrop-blur-sm"
              >
                Descubre más
              </Link>
            </motion.div>
          </motion.div>

          {/* SVG Animated Component */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative h-[400px] lg:h-[600px] flex items-center justify-center pointer-events-none lg:pointer-events-auto"
          >
            <HeroGraphic />
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full relative bg-white dark:bg-[#0d1323] border-t border-slate-200 dark:border-slate-800/80 transition-colors">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
          
          <div className="max-w-7xl mx-auto px-6 xl:px-8 py-24">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Todo lo que necesitas, <span className="text-blue-600 dark:text-blue-400">simplificado</span></h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Nuestra plataforma está diseñada para quitarte dolores de cabeza y ahorrar tiempo en cada cotización.</p>
            </div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left"
            >
              {/* Feature 1 */}
              <motion.div variants={fadeIn} className="p-8 bg-slate-50 dark:bg-[#111827] rounded-3xl border border-slate-100 dark:border-white/5 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-300 group">
                <div className="h-14 w-14 bg-blue-100 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-300">
                  <ShieldCheck className="h-7 w-7 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Proveedores Seguros</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Evita sorpresas. Formamos una red de empresas de confianza para que consigas la mejor calidad sin tomar riesgos innecesarios.
                </p>
              </motion.div>

              {/* Feature 2 */}
              <motion.div variants={fadeIn} className="p-8 bg-slate-50 dark:bg-[#111827] rounded-3xl border border-slate-100 dark:border-white/5 hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-300 group">
                <div className="h-14 w-14 bg-indigo-100 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:scale-110 transition-all duration-300">
                  <Zap className="h-7 w-7 text-indigo-600 dark:text-indigo-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Cotizaciones Rápidas</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Dinos qué requieres y recibe presupuestos en cuestión de minutos. El proceso te ahorrará horas de llamadas y correos.
                </p>
              </motion.div>

              {/* Feature 3 */}
              <motion.div variants={fadeIn} className="p-8 bg-slate-50 dark:bg-[#111827] rounded-3xl border border-slate-100 dark:border-white/5 hover:border-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/10 hover:-translate-y-2 transition-all duration-300 group">
                <div className="h-14 w-14 bg-violet-100 dark:bg-violet-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-violet-600 group-hover:scale-110 transition-all duration-300">
                  <BarChart3 className="h-7 w-7 text-violet-600 dark:text-violet-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Control Centralizado</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Supervisa tus pedidos, pagos y el estado de tu logística desde un panel claro y organizado. Todo queda registrado.
                </p>
              </motion.div>

            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
