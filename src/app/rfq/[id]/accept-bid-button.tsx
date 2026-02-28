'use client'

import { useTransition } from 'react'
import { acceptBid } from '@/actions/bid'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2 } from 'lucide-react'

export default function AcceptBidButton({ bidId, rfqId, amount }: { bidId: string, rfqId: string, amount: number }) {
    const [isPending, startTransition] = useTransition()

    const handleAccept = () => {
        if (confirm(`¿Estás seguro de aceptar esta oferta por Q${amount}? La solicitud se cerrará.`)) {
            startTransition(async () => {
                const result = await acceptBid(bidId, rfqId)
                if (!result.success && result.message) {
                    alert(result.message)
                }
            })
        }
    }

    return (
        <Button
            onClick={handleAccept}
            disabled={isPending}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 font-semibold transition-all ease-in-out"
        >
            {isPending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...
                </>
            ) : (
                <>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Aceptar Oferta
                </>
            )}
        </Button>
    )
}
