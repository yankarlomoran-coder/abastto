import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/layout/footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium mb-10 transition-colors">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver a inicio
        </Link>
        
        <header className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Política de Privacidad</h1>
          <p className="text-slate-500 dark:text-slate-400">Última actualización: {new Date().toLocaleDateString()}</p>
        </header>

        <article className="prose prose-slate dark:prose-invert prose-blue max-w-none text-slate-700 dark:text-slate-300 lead">
          <h2>1. Información que recopilamos</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. 
            Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor.
          </p>
          
          <h2>2. Cómo utilizamos su información</h2>
          <p>
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </p>
          <ul>
            <li>Proporcionar y mantener la plataforma.</li>
            <li>Notificar sobre cambios en el servicio.</li>
            <li>Brindar atención de soporte al cliente.</li>
          </ul>

          <h2>3. Seguridad de los datos</h2>
          <p>
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            Nuestra principal prioridad es proteger sus datos, implementamos medidas de seguridad de alto nivel.
          </p>
        </article>
      </div>
      <Footer />
    </div>
  );
}
