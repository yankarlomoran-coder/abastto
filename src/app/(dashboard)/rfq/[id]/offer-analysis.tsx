'use client'

import { useState } from 'react'
import { analyzeOffers } from '@/actions/ai'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Sparkles, Loader2, AlertCircle, TrendingUp, CheckCircle, XCircle, AlertOctagon } from 'lucide-react'
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    Legend
} from 'recharts'

export default function OfferAnalysis({ rfqId, initialAnalysis }: { rfqId: string, initialAnalysis?: string | null }) {
    const [isLoading, setIsLoading] = useState(false)
    const [analysisString, setAnalysisString] = useState<string | null>(initialAnalysis || null)
    const [error, setError] = useState<string | null>(null)

    const handleAnalyze = async () => {
        setIsLoading(true)
        setError(null)
        setAnalysisString(null)

        try {
            const result = await analyzeOffers(rfqId)
            if (result.success && result.analysis) {
                setAnalysisString(result.analysis)
            } else {
                setError(result.message || 'Error desconocido.')
            }
        } catch (err) {
            setError('Ocurrió un error de red al contactar a la IA.')
        } finally {
            setIsLoading(false)
        }
    }

    let parsedData: any = null
    if (analysisString) {
        try {
            parsedData = JSON.parse(analysisString)
        } catch (e) {
            console.error("No se pudo parsear el JSON de la IA", e)
        }
    }

    // PREPARAR DATOS PARA RADAR CHART
    let radarData: any[] = []
    const colors = ["#818cf8", "#34d399", "#f472b6", "#fbbf24", "#60a5fa"]
    if (parsedData && parsedData.evaluations) {
        radarData = [
            { subject: 'Precio', fullMark: 100 },
            { subject: 'Tiempo', fullMark: 100 },
            { subject: 'Calidad Técnica', fullMark: 100 }
        ]
        
        // Populate Radar Data Points
        parsedData.evaluations.forEach((evalData: any, i: number) => {
            radarData[0][evalData.provider_name] = evalData.price_score || 0
            radarData[1][evalData.provider_name] = evalData.time_score || 0
            radarData[2][evalData.provider_name] = evalData.quality_score || 0
        })
    }

    return (
        <Card className="mb-8 border-indigo-200/60 shadow-lg bg-white/70 backdrop-blur-3xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[80px] -mr-40 -mt-20 pointer-events-none z-0"></div>
            
            <CardHeader className="pb-4 border-b border-indigo-50/50 flex flex-col sm:flex-row items-center justify-between relative z-10 bg-white/50">
                <div className="w-full sm:w-auto text-center sm:text-left mb-4 sm:mb-0">
                    <CardTitle className="text-2xl font-black flex items-center justify-center sm:justify-start gap-3 text-indigo-950 tracking-tight">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Sparkles className="h-6 w-6 text-indigo-600" />
                        </div>
                        Asistente de Compras IA
                    </CardTitle>
                    <CardDescription className="text-slate-500 mt-2 font-medium">Análisis algorítmico y recomendación objetiva de datos.</CardDescription>
                </div>

                <div className="w-full sm:w-auto">
                    <Button
                        onClick={handleAnalyze}
                        disabled={isLoading}
                        size="lg"
                        className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md font-bold transition-all hover:scale-105"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Computando Análisis...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-5 w-5" />
                                {analysisString ? 'Re-calcular Análisis' : 'Generar Comparativa Inteligente'}
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="pt-6 relative z-10">
                {error && (
                    <div className="p-4 bg-red-50 text-red-800 rounded-xl flex items-start gap-3 font-medium border border-red-100 mb-6 shadow-sm">
                        <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                        <p>{error}</p>
                    </div>
                )}

                {/* SI NO PUDO PARSEAR PERO HAY STRING, PINTALO FEO (FALLBACK) */}
                {analysisString && !parsedData && (
                    <div className="p-4 bg-amber-50 text-amber-800 rounded-xl text-sm border border-amber-200">
                        <p className="font-bold mb-2">Advertencia: El modelo no devolvió JSON puro. Renderizado en texto plano:</p>
                        <pre className="whitespace-pre-wrap">{analysisString}</pre>
                    </div>
                )}

                {/* RENDERIZADO VISUAL DEL JSON */}
                {parsedData && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-4">
                        
                        {/* RESUMEN EJECUTIVO / VEREDICTO */}
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest">🏆 Veredicto de la Inteligencia Artificial</h3>
                                <p className="text-xl md:text-2xl font-bold text-slate-800 leading-snug">
                                    Recomendamos adjudicar a <span className="text-indigo-700 underline decoration-indigo-300 decoration-4 underline-offset-4">{parsedData.best_bid_name || 'No determinado'}</span>.
                                </p>
                                <p className="text-slate-600 font-medium leading-relaxed">
                                    {parsedData.overall_verdict}
                                </p>

                                {/* Red Flags */}
                                {parsedData.red_flags && parsedData.red_flags.length > 0 && (
                                    <div className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                                        <h4 className="text-rose-800 font-bold flex items-center gap-2 mb-2">
                                            <AlertOctagon className="w-5 h-5" />
                                            Alertas Detectadas
                                        </h4>
                                        <ul className="space-y-1">
                                            {parsedData.red_flags.map((flag: string, i: number) => (
                                                <li key={i} className="text-rose-700 text-sm font-medium flex items-start gap-2">
                                                    <span className="mt-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0"></span>
                                                    {flag}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* GRAFICO RADAR */}
                            <div className="bg-white rounded-3xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center justify-center min-h-[300px]">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest w-full text-center mb-2">Mapa Competitivo</h4>
                                <div className="w-full h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                            <PolarGrid stroke="#e2e8f0" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 12, fontWeight: 700 }} />
                                            <RechartsTooltip wrapperClassName="rounded-xl shadow-xl font-medium" />
                                            <Legend wrapperStyle={{ fontSize: "12px", fontWeight: "600", paddingTop: "10px" }} />
                                            {parsedData.evaluations.map((ev: any, i: number) => (
                                                <Radar
                                                    key={ev.provider_name}
                                                    name={ev.provider_name}
                                                    dataKey={ev.provider_name}
                                                    stroke={colors[i % colors.length]}
                                                    fill={colors[i % colors.length]}
                                                    fillOpacity={0.4}
                                                />
                                            ))}
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* DESGLOSE POR PROVEEDOR */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Analítica por Proveedor</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {parsedData.evaluations.map((ev: any, i: number) => (
                                    <div key={i} className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-200 hover:border-indigo-200 transition-colors">
                                        <div className="flex items-center justify-between mb-6">
                                            <h4 className="font-black text-lg text-slate-900 line-clamp-1" title={ev.provider_name}>{ev.provider_name}</h4>
                                            {ev.provider_name === parsedData.best_bid_name && (
                                                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full flex items-center gap-1">
                                                    <TrendingUp className="w-3 h-3" /> TOP
                                                </span>
                                            )}
                                        </div>

                                        {/* Barras de Puntuacion */}
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5">
                                                    <span>Precio/Costos</span>
                                                    <span className={ev.price_score >= 80 ? 'text-emerald-600' : 'text-slate-600'}>{ev.price_score}/100</span>
                                                </div>
                                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all duration-1000 ${ev.price_score >= 80 ? 'bg-emerald-500' : 'bg-slate-400'}`} style={{ width: `${ev.price_score}%` }}></div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5">
                                                    <span>Agilidad de Entrega</span>
                                                    <span className={ev.time_score >= 80 ? 'text-blue-600' : 'text-slate-600'}>{ev.time_score}/100</span>
                                                </div>
                                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all duration-1000 ${ev.time_score >= 80 ? 'bg-blue-500' : 'bg-slate-400'}`} style={{ width: `${ev.time_score}%` }}></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pros y Contras */}
                                        <div className="mt-8 space-y-4">
                                            {ev.pros && ev.pros.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5"/> Fortalezas</p>
                                                    <ul className="space-y-1.5">
                                                        {ev.pros.map((pro: string, idx: number) => (
                                                            <li key={idx} className="text-xs text-slate-600 font-medium bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/50 leading-relaxed">{pro}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {ev.cons && ev.cons.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2 flex items-center gap-1"><XCircle className="w-3.5 h-3.5"/> Debilidades</p>
                                                    <ul className="space-y-1.5">
                                                        {ev.cons.map((con: string, idx: number) => (
                                                            <li key={idx} className="text-xs text-slate-600 font-medium bg-rose-50/50 p-2 rounded-lg border border-rose-100/50 leading-relaxed">{con}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

