'use client'

import { useState, useEffect, useRef } from 'react'
import { getMessages, sendMessage } from '@/actions/chat'
import { Send, Clock } from 'lucide-react'

export default function ChatClient({ 
    rfqId, 
    currentUserCompanyId, 
    otherCompanyId 
}: { 
    rfqId: string, 
    currentUserCompanyId: string, 
    otherCompanyId: string 
}) {
    const [messages, setMessages] = useState<any[]>([])
    const [inputValue, setInputValue] = useState('')
    const [sending, setSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const fetchChat = async () => {
        const msgs = await getMessages(rfqId, currentUserCompanyId, otherCompanyId)
        setMessages(msgs)
    }

    // Polling simulation for Real-Time experience
    useEffect(() => {
        fetchChat() // Instante
        const interval = setInterval(fetchChat, 5000)
        return () => clearInterval(interval)
    }, [rfqId, currentUserCompanyId, otherCompanyId])

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputValue.trim() || sending) return

        const currentText = inputValue.trim()
        setInputValue('')
        setSending(true)

        // Optimistic Update
        const optimisticMsg = {
            id: 'temp-' + Date.now(),
            content: currentText,
            senderId: currentUserCompanyId,
            receiverId: otherCompanyId,
            createdAt: new Date(),
            sender: { name: 'Tú' }
        }
        setMessages(prev => [...prev, optimisticMsg])

        // Server Call
        const formData = new FormData()
        formData.append('rfqId', rfqId)
        formData.append('receiverId', otherCompanyId)
        formData.append('content', currentText)
        
        try {
            await sendMessage(formData)
            await fetchChat() // Refetch re-validando la BD exacta
        } catch (err) {
            console.error(err)
            // Rollback is omitted for simplicity in this MVP
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50 relative overflow-hidden">
            {/* Mensajes */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <Clock className="w-12 h-12 mb-4 opacity-50" />
                        <p className="font-semibold">No hay mensajes anteriores.</p>
                        <p className="text-sm mt-1">Envía un mensaje para iniciar la negociación.</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId === currentUserCompanyId
                        return (
                            <div key={msg.id} className={`flex flex-col max-w-[75%] ${isMe ? 'self-end items-end ml-auto' : 'self-start items-start mr-auto'}`}>
                                <div className={`px-4 py-3 rounded-2xl text-[0.925rem] leading-relaxed shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm'}`}>
                                    {msg.content}
                                </div>
                                <span className="text-[0.6875rem] text-slate-500 font-medium mt-1.5 px-1 flex items-center gap-1.5">
                                    {new Date(msg.createdAt).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })}
                                    {!isMe && `• ${msg.sender?.name}`}
                                </span>
                            </div>
                        )
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-white border-t border-slate-200 shrink-0 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
                <form onSubmit={handleSend} className="max-w-5xl mx-auto relative flex items-end overflow-hidden border border-slate-200 rounded-xl bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                    <textarea 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Escribe un mensaje de negociación oficial..."
                        className="w-full max-h-32 min-h-[52px] px-4 py-3.5 bg-transparent resize-none outline-none text-[0.925rem] text-slate-800 placeholder:text-slate-400"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleSend(e)
                            }
                        }}
                    />
                    <button 
                        type="submit" 
                        disabled={!inputValue.trim() || sending}
                        className="m-2 shrink-0 h-10 w-10 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg flex items-center justify-center transition-colors"
                    >
                        <Send className="w-4 h-4 ml-0.5" />
                    </button>
                </form>
                <div className="text-center mt-2">
                    <p className="text-[0.6875rem] text-slate-400 font-medium">B2B Chat Seguro • Las conversaciones son privadas entre ambas empresas.</p>
                </div>
            </div>
        </div>
    )
}
