import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/layout/footer";

export default function TermsPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium mb-10 transition-colors">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver a inicio
        </Link>
        
        <header className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Términos de Servicio</h1>
          <p className="text-slate-500 dark:text-slate-400">Última actualización: {new Date().toLocaleDateString()}</p>
        </header>

        <article className="prose prose-slate dark:prose-invert prose-blue max-w-none text-slate-700 dark:text-slate-300 lead">
          <h2>1. Aceptación de los términos</h2>
          <p>
            Al acceder y utilizar esta aplicación web, usted acepta estar sujeto a estos términos y condiciones.
            Aliquam euismod erat in magna luctus, vel bibendum mauris tincidunt. Phasellus sit amet libero ut turpis mattis hendrerit.
          </p>

          <h2>2. Proveedores y usuarios</h2>
          <p>
            Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.
            Suspendisse potenti. In hac habitasse platea dictumst. Curabitur blandit tempus porttitor.
          </p>

          <h2>3. Limitación de responsabilidad</h2>
          <p>
            En ningún caso seremos responsables por cualquier daño directo o indirecto que surja de la conexión entre el cliente y el proveedor.
            Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.
          </p>
        </article>
      </div>
      <Footer />
    </div>
  );
}
