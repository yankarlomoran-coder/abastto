'use client'

import { useState } from 'react'
import { generateSpendAnalytics } from '@/actions/ai'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, TrendingUp, DollarSign, BrainCircuit, Loader2, AlertCircle } from 'lucide-react'

// Utilidad simple para parsear Markdown desde Gemini
function renderMarkdown(text: string) {
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/\n/g, '<br />')
    html = html.replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
    return html
}

export default function AnalyticsPageClient() {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const fetchAnalytics = async () => {
        setLoading(true)
        setError(null)
        setData(null)

        const result = await generateSpendAnalytics()
        if (result.success) {
            setData(result)
        } else {
            setError(result.message || 'Error al obtener métricas.')
        }
        setLoading(false)
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-8 min-h-screen bg-[#f7f9fb]">
            <a href="/dashboard" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                ← Volver al Panel
            </a>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-blue-600" />
                        Analíticas Generales de Compras
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium max-w-xl">
                        Descubre insights ocultos en tu historial operativo de Supply Chain. Nuestra IA (Gemini) evalúa tu impacto financiero automáticamente.
                    </p>
                </div>
                <Button 
                    onClick={fetchAnalytics} 
                    disabled={loading} 
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold h-11 px-6 shadow-md shadow-purple-200 transition-all hover:scale-[1.02]"
                >
                    {loading ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesando CFO Report</>
                    ) : (
                        <><BrainCircuit className="w-4 h-4 mr-2" /> Ejecutar CFO Report (IA)</>
                    )}
                </Button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold">No se pudo procesar</h4>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            )}

            {data && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg border-0">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-emerald-100 uppercase tracking-widest text-xs font-bold">Ahorro Generado</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-black mb-1">
                                    Q {data.savings.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </div>
                                <p className="text-emerald-100 flex items-center gap-1 font-semibold">
                                    <TrendingUp className="w-4 h-4" /> {data.savingsPercentage.toFixed(1)}% vs Presupuesto
                                </p>
                            </CardContent>
                        </Card>
                        
                        <Card className="bg-white border-slate-200 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-slate-500 uppercase tracking-widest text-xs font-bold">Gasto Total Ejecutado</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-slate-900 mb-1">
                                    Q {data.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </div>
                                <p className="text-slate-500 font-medium">Histórico en plataforma</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-900 border-slate-800 text-white shadow-sm overflow-hidden relative">
                            <div className="absolute -right-4 -top-4 opacity-10">
                                <BrainCircuit className="w-32 h-32" />
                            </div>
                            <CardHeader className="pb-2 relative z-10">
                                <CardTitle className="text-slate-400 uppercase tracking-widest text-xs font-bold">Motor de Análisis</CardTitle>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className="text-xl font-bold text-white mb-1">
                                    Google Gemini
                                </div>
                                <p className="text-slate-400 text-sm font-medium">Analizando variables y eficiencia de mercado</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border-indigo-100 shadow-xl bg-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                        <CardHeader className="bg-slate-50 border-b border-slate-100">
                            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-500" />
                                Resumen Ejecutivo del Director Financiero
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div 
                                className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-[0.95rem]" 
                                dangerouslySetInnerHTML={{ __html: renderMarkdown(data.analysis) }} 
                            />
                        </CardContent>
                    </Card>
                </div>
            )}
            
            {!data && !loading && !error && (
                <div className="flex flex-col items-center justify-center p-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
                    <BarChart3 className="w-16 h-16 mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-slate-500">Panel Inactivo</h3>
                    <p className="max-w-md text-center mt-2 font-medium">Presiona el botón superior para calcular tu impacto financiero leyendo el historial completo de contratos B2B.</p>
                </div>
            )}
        </div>
    )
}

function FileText(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
}
