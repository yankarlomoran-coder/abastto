import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-slate-100 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-white">A</span>
            </div>
            <span className="text-xl font-bold text-slate-900">Abastto</span>
          </div>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-3xl text-center space-y-8">
          <h1 className="text-5xl font-extrabold text-slate-900 leading-tight">
            La plataforma B2B para <span className="text-blue-600">compras inteligentes</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Conecta con proveedores verificados, gestiona cotizaciones y optimiza tu cadena de suministro en un solo lugar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2"
            >
              Comenzar Gratis
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 text-lg font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all"
            >
              Ya tengo cuenta
            </Link>
          </div>

          <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Proveedores Verificados</h3>
              <p className="text-slate-600 text-sm">Accede a una red de confianza para tus compras empresariales.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Cotizaciones Rápidas</h3>
              <p className="text-slate-600 text-sm">Publica RFQs y recibe ofertas competitivas en minutos.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Gestión Centralizada</h3>
              <p className="text-slate-600 text-sm">Controla todas tus compras y relaciones comerciales desde un solo panel.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Abastto. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
