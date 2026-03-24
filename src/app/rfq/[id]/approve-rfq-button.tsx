'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShieldCheck } from 'lucide-react'
import { approveRfq } from '@/actions/rfq'

export default function ApproveRfqButton({ rfqId }: { rfqId: string }) {
    const [loading, setLoading] = useState(false)

    const handleApprove = async () => {
        setLoading(true)
        const result = await approveRfq(rfqId)
        if (result?.success) {
            // Success, the page will revalidate
        } else {
            alert(result?.message || "Error al aprobar la licitación")
            setLoading(false)
        }
    }

    return (
        <div className="bg-amber-50 border-2 border-dashed border-amber-200 rounded-xl p-6 text-center shadow-sm">
            <ShieldCheck className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-amber-900 mb-2">Requiere Aprobación Gerencial</h3>
            <p className="text-sm text-amber-700 mb-4 max-w-md mx-auto">
                Este requerimiento fue creado por un miembro de tu equipo. Como administrador, revisa la información y apruébalo para que los proveedores puedan cotizar.
            </p>
            <Button onClick={handleApprove} disabled={loading} className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-8 shadow-md">
                {loading ? "Aprobando y publicando..." : "✅ Aprobar y Publicar"}
            </Button>
        </div>
    )
}
