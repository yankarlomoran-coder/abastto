'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Send, MessageCircleQuestion, Reply, MessagesSquare } from 'lucide-react'
import { createQuestion, answerQuestion } from '@/actions/question'

type QuestionItem = {
    id: string
    content: string
    answer: string | null
    createdAt: Date
    companyId: string
    company?: { name: string }
}

export default function QaSection({
    rfqId,
    questions,
    userRole,
    userCompanyId,
    isOwner,
    isActive
}: {
    rfqId: string,
    questions: QuestionItem[],
    userRole: string,
    userCompanyId: string,
    isOwner: boolean,
    isActive: boolean
}) {
    const [newQuestion, setNewQuestion] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    // For Buyers replying
    const [replyingTo, setReplyingTo] = useState<string | null>(null)
    const [replyContent, setReplyContent] = useState('')

    const handleAskQuestion = async () => {
        if (!newQuestion.trim()) return
        setIsSubmitting(true)
        setErrorMsg('')

        const res = await createQuestion(rfqId, newQuestion)
        if (res.error) {
            setErrorMsg(res.error)
        } else {
            setNewQuestion('')
        }
        setIsSubmitting(false)
    }

    const handleReply = async (questionId: string) => {
        if (!replyContent.trim()) return
        setIsSubmitting(true)
        setErrorMsg('')

        const res = await answerQuestion(questionId, replyContent, rfqId)
        if (res.error) {
            setErrorMsg(res.error)
        } else {
            setReplyingTo(null)
            setReplyContent('')
        }
        setIsSubmitting(false)
    }

    return (
        <Card className="border-t-4 border-t-amber-500 shadow-sm mt-8">
            <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50 border-t-0 rounded-t-xl">
                <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <MessagesSquare className="h-5 w-5 text-amber-500" />
                    Foro de Preguntas Públicas ({questions.length})
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                {!isActive && (
                    <div className="bg-slate-100/50 border border-slate-200 p-3 flex items-center gap-2 text-sm text-slate-500 rounded-lg">
                        <MessageCircleQuestion className="h-4 w-4" />
                        El foro de preguntas ha sido cerrado de forma automática porque se alcanzó la fecha límite.
                    </div>
                )}

                {/* List of Questions */}
                {questions.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed">
                        <MessageCircleQuestion className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                        <p>Aún no hay preguntas. Las dudas técnicas aparecerán aquí.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {questions.map((q) => {
                            const isMyQuestion = q.companyId === userCompanyId;

                            return (
                                <div key={q.id} className={`p-4 rounded-xl border ${isMyQuestion ? 'bg-blue-50/30 border-blue-100' : 'bg-white border-slate-200'} shadow-sm`}>
                                    <div className="flex gap-3">
                                        <div className="shrink-0 mt-1">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                                                <MessageCircleQuestion className="w-4 h-4" />
                                            </div>
                                        </div>
                                        <div className="w-full">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="text-sm font-semibold text-slate-900">
                                                    {isMyQuestion ? 'Tu Empresa' : (q.company?.name || 'Proveedor')}
                                                </p>
                                                <span className="text-xs text-slate-400">
                                                    {new Date(q.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{q.content}</p>

                                            {/* Answer Section */}
                                            {q.answer ? (
                                                <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100 flex gap-3">
                                                    <Reply className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-xs font-bold text-amber-800 mb-1">Respuesta del Comprador:</p>
                                                        <p className="text-sm text-slate-800 whitespace-pre-wrap">{q.answer}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                // Only owners see the reply box for unanswered questions if active
                                                isOwner && isActive && (
                                                    <div className="mt-4 border-t pt-3">
                                                        {replyingTo === q.id ? (
                                                            <div className="space-y-3">
                                                                <textarea
                                                                    className="w-full text-sm p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
                                                                    rows={3}
                                                                    placeholder="Escribe tu respuesta oficial a esta duda..."
                                                                    value={replyContent}
                                                                    onChange={(e) => setReplyContent(e.target.value)}
                                                                />
                                                                <div className="flex justify-end gap-2">
                                                                    <Button variant="ghost" size="sm" onClick={() => { setReplyingTo(null); setReplyContent(''); }}>Cancelar</Button>
                                                                    <Button
                                                                        size="sm"
                                                                        className="bg-amber-600 hover:bg-amber-700"
                                                                        onClick={() => handleReply(q.id)}
                                                                        disabled={isSubmitting || !replyContent.trim()}
                                                                    >
                                                                        Publicar Respuesta
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <Button variant="outline" size="sm" onClick={() => setReplyingTo(q.id)} className="text-amber-600 border-amber-200 hover:bg-amber-50">
                                                                <Reply className="w-4 h-4 mr-2" />
                                                                Responder a esta duda
                                                            </Button>
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Input for New Question (Suppliers Only) */}
                {userRole === 'SUPPLIER' && isActive && (
                    <div className="mt-6 border-t pt-6">
                        <h4 className="font-semibold text-slate-900 mb-3">¿Tienes alguna duda técnica?</h4>
                        {errorMsg && <p className="text-sm text-red-600 mb-3 bg-red-50 p-2 rounded">{errorMsg}</p>}

                        <div className="flex gap-3 items-start">
                            <textarea
                                className="w-full text-sm p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                rows={2}
                                placeholder="Escribe tu pregunta públicamente (tu identidad estará oculta para otros proveedores)..."
                                value={newQuestion}
                                onChange={(e) => setNewQuestion(e.target.value)}
                            />
                            <Button
                                onClick={handleAskQuestion}
                                disabled={isSubmitting || !newQuestion.trim()}
                                className="bg-blue-600 hover:bg-blue-700 shrink-0 h-auto self-stretch"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
