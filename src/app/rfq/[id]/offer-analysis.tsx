'use client'

import { useState } from 'react'
import { analyzeOffers } from '@/actions/ai'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Loader2, AlertCircle, FileDown } from 'lucide-react'
import dynamic from 'next/dynamic'
import { ComparativeAnalysisPDF } from '@/components/pdf/comparative-analysis-pdf'

const PDFDownloadLink = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
    { ssr: false, loading: () => <Button variant="outline" disabled className="w-full sm:w-auto"><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Preparando PDF</Button> }
)

// Simple Markdown Parser for the AI response
function renderMarkdown(text: string) {
    // Bold
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Line breaks
    html = html.replace(/\n/g, '<br />')
    // Lists (simple)
    html = html.replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
    return html
}

export default function OfferAnalysis({ rfqId }: { rfqId: string }) {
    const [isLoading, setIsLoading] = useState(false)
    const [analysis, setAnalysis] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleAnalyze = async () => {
        setIsLoading(true)
        setError(null)
        setAnalysis(null)

        try {
            const result = await analyzeOffers(rfqId)
            if (result.success && result.analysis) {
                setAnalysis(result.analysis)
            } else {
                setError(result.message || 'Error desconocido.')
            }
        } catch (err) {
            setError('Ocurrió un error de red al contactar a la IA.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="mb-8 border-indigo-200 shadow-sm bg-gradient-to-r from-indigo-50/50 to-white">
            <CardHeader className="pb-3 border-b border-indigo-100 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-xl font-bold flex items-center gap-2 text-indigo-900">
                        <Sparkles className="h-5 w-5 text-indigo-500" />
                        Asistente de Compras IA
                    </CardTitle>
                    <p className="text-sm text-indigo-600/80 mt-1">Obtén una recomendación objetiva basada en precio y condiciones comerciales.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
                    {analysis && (
                        <PDFDownloadLink
                            document={<ComparativeAnalysisPDF rfqId={rfqId} analysisText={analysis} date={new Date().toLocaleDateString()} />}
                            fileName={`Reporte-Analisis-${rfqId}.pdf`}
                        >
                            <Button variant="outline" className="w-full sm:w-auto border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                                <FileDown className="mr-2 h-4 w-4" />
                                Exportar PDF
                            </Button>
                        </PDFDownloadLink>
                    )}

                    <Button
                        onClick={handleAnalyze}
                        disabled={isLoading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all w-full sm:w-auto"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analizando...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                {analysis ? 'Actualizar Análisis' : 'Generar Comparativa'}
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>

            {(analysis || error) && (
                <CardContent className="pt-6">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-800 rounded-md flex items-start gap-3 text-sm">
                            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                            <p>{error}</p>
                        </div>
                    )}

                    {analysis && (
                        <div
                            className="prose prose-sm sm:prose-base prose-indigo text-slate-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(analysis) }}
                        />
                    )}
                </CardContent>
            )}
        </Card>
    )
}
