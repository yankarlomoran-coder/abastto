'use client'

import { FileDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'
import { PurchaseOrderPDF } from './purchase-order-pdf'

const PDFDownloadLink = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
    { ssr: false, loading: () => <Button variant="outline" size="sm" disabled><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Preparando PDF</Button> }
)

export function PoDownloadButton({ rfq, bid }: { rfq: any, bid: any }) {
    return (
        <PDFDownloadLink
            document={<PurchaseOrderPDF rfq={rfq} bid={bid} date={new Date().toLocaleDateString()} />}
            fileName={`Orden-Compra-PO-${rfq.id.substring(0, 8).toUpperCase()}.pdf`}
        >
            <Button variant="outline" size="sm" className="ml-2 border-slate-300 text-slate-700 hover:bg-slate-100">
                <FileDown className="mr-2 h-4 w-4" />
                Descargar PO
            </Button>
        </PDFDownloadLink>
    )
}
