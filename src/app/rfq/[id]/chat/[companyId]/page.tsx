import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import ChatClient from './chat-client'
import { ShieldCheck, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function ChatPage({ params }: { params: Promise<{ id: string, companyId: string }> }) {
    const session = await auth()
    if (!session?.user?.companyId) redirect('/login')

    const { id: rfqId, companyId: otherCompanyId } = await params

    const rfq = await prisma.rfq.findUnique({
        where: { id: rfqId },
        include: { company: true }
    })

    if (!rfq) notFound()

    // Verificamos si la contraparte existe
    const otherCompany = await prisma.company.findUnique({
        where: { id: otherCompanyId }
    })

    if (!otherCompany) notFound()

    // Validar acceso: el usuario debe pertenecer a la empresa compradora o a la proveedora.
    const isBuyer = session.user.companyId === rfq.companyId
    const isSupplier = session.user.companyId === otherCompanyId

    // Si el usuario no es el comprador de este RFQ y no es el proveedor siendo visitado
    if (!isBuyer && !isSupplier) {
        redirect(`/rfq/${rfqId}`)
    }

    // El "otro" u objetivo al que le vamos a escribir depende de quién está navegando:
    // Si soy el Comprador, le escribo al Proveedor (otherCompanyId de la URL).
    // Si soy el Proveedor, le escribo al Comprador creador de la RFQ (rfq.companyId).
    const actualOtherCompanyId = isBuyer ? otherCompanyId : rfq.companyId;
    const actualOtherCompanyTitle = isBuyer ? otherCompany.name : rfq.company.name;
    const actualOtherCompanyVerified = isBuyer ? otherCompany.isVerified : rfq.company.isVerified;

    return (
        <div className="flex flex-col h-screen bg-[#f7f9fb]">
            {/* Encabezado del Chat */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 shrink-0 shadow-sm z-10">
                <Link href={`/rfq/${rfqId}`} className="p-2 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-slate-900">{actualOtherCompanyTitle}</h1>
                        {actualOtherCompanyVerified && <ShieldCheck className="w-5 h-5 text-green-500" />}
                    </div>
                    <p className="text-sm font-semibold text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="text-blue-600">Ref: {rfq.title}</span>
                    </p>
                </div>
            </header>

            {/* Renderizar Cliente de Chat */}
            <ChatClient 
                rfqId={rfqId}
                currentUserCompanyId={session.user.companyId}
                otherCompanyId={actualOtherCompanyId}
            />
        </div>
    )
}
