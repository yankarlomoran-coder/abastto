'use client'

import { useState, useActionState } from 'react'
import { createReview } from '@/actions/review'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Star, Loader2, MessageSquare, CheckCircle2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

// Simple helper component to render 5 clickable stars
function StarRating({ label, value, onChange }: { label: string, value: number, onChange: (val: number) => void }) {
    return (
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
            <span className="text-sm font-medium text-slate-700">{label}</span>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        className={`focus:outline-none transition-transform hover:scale-110 ${star <= value ? 'text-amber-400' : 'text-slate-200'}`}
                    >
                        <Star className={`h-6 w-6 ${star <= value ? 'fill-current' : ''}`} />
                    </button>
                ))}
            </div>
        </div>
    )
}

export default function ReviewForm({ rfqId, targetCompanyId, targetCompanyName }: { rfqId: string, targetCompanyId: string, targetCompanyName: string }) {
    const [state, formAction, isPending] = useActionState(createReview, { success: false, message: '' })
    
    // Controlled states for ratings
    const [quality, setQuality] = useState(0)
    const [punctuality, setPunctuality] = useState(0)
    const [communication, setCommunication] = useState(0)
    const [professionalism, setProfessionalism] = useState(0)

    if (state.success) {
        return (
            <Card className="bg-emerald-50 border-emerald-200 shadow-sm mt-8">
                <CardContent className="pt-6 pb-6 text-center">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-emerald-900 mb-2">¡Reseña Publicada!</h3>
                    <p className="text-emerald-700">{state.message}</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="mt-8 border-t-4 border-t-amber-500 shadow-sm bg-white">
            <CardHeader className="bg-slate-50/50">
                <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-900">
                    <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                    Calificar Transacción B2B
                </CardTitle>
                <CardDescription>
                    Evalúa tu experiencia trabajando con <strong>{targetCompanyName}</strong>. Tus calificaciones son vitales para mantener la confianza empresarial en Abastto.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <form action={formAction} className="space-y-6">
                    <input type="hidden" name="rfqId" value={rfqId} />
                    <input type="hidden" name="targetCompanyId" value={targetCompanyId} />
                    <input type="hidden" name="ratingQuality" value={quality} />
                    <input type="hidden" name="ratingPunctuality" value={punctuality} />
                    <input type="hidden" name="ratingCommunication" value={communication} />
                    <input type="hidden" name="ratingProfessionalism" value={professionalism} />

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <StarRating label="Calidad del Producto / Claridad del Requerimiento" value={quality} onChange={setQuality} />
                        <StarRating label="Puntualidad de Entrega / Agilidad de Cierre" value={punctuality} onChange={setPunctuality} />
                        <StarRating label="Comunicación Transparente" value={communication} onChange={setCommunication} />
                        <StarRating label="Profesionalismo y Resolución de Problemas" value={professionalism} onChange={setProfessionalism} />
                    </div>

                    {!state.success && state.message && (
                        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                            {state.message}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-slate-400" />
                            Comentarios Adicionales (Opcional)
                        </label>
                        <Textarea
                            name="comment"
                            placeholder="Describe brevemente cómo fue la experiencia y si recomendarías hacer negocios con esta empresa..."
                            className="bg-white"
                            rows={3}
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isPending || quality === 0 || punctuality === 0 || communication === 0 || professionalism === 0}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                            </>
                        ) : (
                            'Publicar Evaluación B2B'
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
