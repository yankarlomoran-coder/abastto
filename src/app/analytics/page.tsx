'use client'

import { useState } from 'react'
import { generateSpendAnalytics } from '@/actions/ai'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, TrendingUp, DollarSign, BrainCircuit, Loader2, AlertCircle, ArrowLeft } from 'lucide-react'

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
        <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-8 min-h-screen bg-slate-50 dark:bg-[#030712] transition-colors duration-500">
            <a href="/dashboard" className="text-sm font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Volver al Resumen Operativo
            </a>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 dark:border-white/5 pb-8">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-blue-600" />
                        Análisis Estratégico de Adquisiciones
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-3 font-medium max-w-2xl leading-relaxed">
                        Obtenga una visión detallada de su impacto financiero mediante inteligencia artificial avanzada. Nuestro sistema evalúa la eficiencia operativa automáticamente.
                    </p>
                </div>
                <Button 
                    onClick={fetchAnalytics} 
                    disabled={loading} 
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-purple-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    {loading ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generando Informe...</>
                    ) : (
                        <><BrainCircuit className="w-4 h-4 mr-2" /> Ejecutar Informe Financiero</>
                    )}
                </Button>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-5 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold">Error en el procesamiento</h4>
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                </div>
            )}

            {data && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-600/20 border-0 p-1">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-white/70 uppercase tracking-widest text-[0.7rem] font-black">Ahorro Proyectado</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-black mb-2">
                                    Q {data.savings.toLocaleString('es-GT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </div>
                                <p className="text-white/80 flex items-center gap-2 font-bold text-sm">
                                    <TrendingUp className="w-4 h-4" /> {data.savingsPercentage.toFixed(1)}% de eficiencia acumulada
                                </p>
                            </CardContent>
                        </Card>
                        
                        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 shadow-sm rounded-2xl">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[0.7rem] font-black">Capital Ejecutado</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                                    Q {data.totalSpent.toLocaleString('es-GT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </div>
                                <p className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-tight">Registro histórico total</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 shadow-sm rounded-2xl overflow-hidden relative group">
                            <div className="absolute -right-4 -top-4 opacity-[0.03] dark:opacity-10 group-hover:scale-110 transition-transform">
                                <BrainCircuit className="w-32 h-32 text-blue-600" />
                            </div>
                            <CardHeader className="pb-2 relative z-10">
                                <CardTitle className="text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[0.7rem] font-black">Metodología de Análisis</CardTitle>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className="text-xl font-black text-slate-900 dark:text-white mb-2">
                                    Inteligencia Superior
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold leading-relaxed">
                                    Evaluación asistida por modelos de lenguaje avanzados para garantizar precisión operativa.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border-slate-200 dark:border-white/5 shadow-xl bg-white dark:bg-slate-900 relative overflow-hidden rounded-2xl">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600"></div>
                        <CardHeader className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 py-6 px-10">
                            <CardTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                <FileText className="w-6 h-6 text-blue-600" />
                                Informe de Dirección Financiera
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-10">
                            <div 
                                className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed text-lg" 
                                dangerouslySetInnerHTML={{ __html: renderMarkdown(data.analysis) }} 
                            />
                        </CardContent>
                    </Card>
                </div>
            )}
            
            {!data && !loading && !error && (
                <div className="flex flex-col items-center justify-center p-20 text-slate-400 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl bg-white/50 dark:bg-white/5 mt-12">
                    <BarChart3 className="w-20 h-20 mb-6 opacity-20 text-blue-600" />
                    <h3 className="text-2xl font-black text-slate-700 dark:text-slate-300">Panel de Análisis Inactivo</h3>
                    <p className="max-w-lg text-center mt-3 font-medium text-slate-500 dark:text-slate-500 text-lg">
                        Presione el botón superior para proyectar su impacto comercial mediante el análisis automático de su historial de adquisiciones.
                    </p>
                </div>
            )}
        </div>
    )
}

function FileText(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
}
