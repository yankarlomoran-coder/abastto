import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/layout/footer";

export default function CookiesPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium mb-10 transition-colors">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver a inicio
        </Link>
        
        <header className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Política de Cookies</h1>
          <p className="text-slate-500 dark:text-slate-400">Última actualización: {new Date().toLocaleDateString()}</p>
        </header>

        <article className="prose prose-slate dark:prose-invert prose-blue max-w-none text-slate-700 dark:text-slate-300 lead">
          <h2>1. ¿Qué son las cookies?</h2>
          <p>
            Las cookies son pequeños archivos de texto que los sitios web almacenan en su computadora o dispositivo móvil.
            Nulla vitae elit libero, a pharetra augue. Donec id elit non mi porta gravida at eget metus.
          </p>

          <h2>2. Cómo usamos las cookies</h2>
          <p>
            Podemos utilizar cookies para la funcionalidad del sitio web, personalización y autenticación (ej. mantener su sesión activa).
          </p>
          <ul>
            <li><strong>Cookies esenciales:</strong> Necesarias para el funcionamiento del servidor.</li>
            <li><strong>Cookies de personalización:</strong> Para mantener sus preferencias (modo oscuro, por ejemplo).</li>
            <li><strong>Cookies de análisis:</strong> Para entender cómo mejorar nuestra plataforma.</li>
          </ul>

          <h2>3. Control de opciones de cookies</h2>
          <p>
            Usted puede administrar o deshabilitar las cookies desde las configuraciones de su navegador.
            Tenga en cuenta que al hacerlo es posible que ciertas funciones dejen de estar disponibles.
          </p>
        </article>
      </div>
      <Footer />
    </div>
  );
}
