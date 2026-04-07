'use client'

import { useState } from 'react'
import { Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { exportRfqsToCSV, exportBidsToCSV } from '@/actions/export'

function downloadCSV(csv: string, filename: string) {
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

export function ExportRfqsButton({ className = '' }: { className?: string }) {
    const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [errorMsg, setErrorMsg] = useState('')

    const handleExport = async () => {
        setState('loading')
        const result = await exportRfqsToCSV()
        
        if (result.success && result.csv) {
            const date = new Date().toISOString().split('T')[0]
            downloadCSV(result.csv, `abastto-solicitudes-${date}.csv`)
            setState('success')
            setTimeout(() => setState('idle'), 3000)
        } else {
            setErrorMsg(result.message || 'Error desconocido')
            setState('error')
            setTimeout(() => setState('idle'), 4000)
        }
    }

    return (
        <Button 
            variant="outline" 
            onClick={handleExport}
            disabled={state === 'loading'}
            className={`rounded-xl border-slate-200 dark:border-white/10 font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-all ${className}`}
        >
            {state === 'loading' ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Exportando...</>
            ) : state === 'success' ? (
                <><CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" /> Descargado</>
            ) : state === 'error' ? (
                <><AlertCircle className="w-4 h-4 mr-2 text-red-500" /> {errorMsg}</>
            ) : (
                <><Download className="w-4 h-4 mr-2" /> Exportar CSV</>
            )}
        </Button>
    )
}

export function ExportBidsButton({ rfqId, rfqTitle, className = '' }: { rfqId: string, rfqTitle: string, className?: string }) {
    const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

    const handleExport = async () => {
        setState('loading')
        const result = await exportBidsToCSV(rfqId)
        
        if (result.success && result.csv) {
            const slug = rfqTitle.slice(0, 30).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
            downloadCSV(result.csv, `ofertas-${slug}.csv`)
            setState('success')
            setTimeout(() => setState('idle'), 3000)
        } else {
            setState('error')
            setTimeout(() => setState('idle'), 4000)
        }
    }

    return (
        <Button 
            variant="ghost" 
            size="sm"
            onClick={handleExport}
            disabled={state === 'loading'}
            className={`rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 font-bold text-xs ${className}`}
        >
            {state === 'loading' ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : state === 'success' ? (
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            ) : (
                <Download className="w-3.5 h-3.5 mr-1.5" />
            )}
            {state === 'success' ? 'Descargado' : 'Exportar Ofertas'}
        </Button>
    )
}
