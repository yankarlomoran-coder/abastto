'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { Bot, X, MessageSquare, Send, Minus, Maximize2, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function NexusChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  
  const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading, append } = useChat({
    api: '/api/agent/chat',
    body: {
      conversationId: conversationId
    },
    onResponse(response) {
      // Si recibimos un ID de conversacion en headers, podríamos capturarlo
      // Pero para este MVP lo simplificaremos asignando ID si no existe
    },
    onError(error) {
      console.error(error)
    }
  })

  // Ref for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Crear ID the primera vez que entra a la vista, si queremos persistencia
  useEffect(() => {
    if (isOpen && !conversationId) {
      // Create new conversation
      fetch('/api/agent/conversations', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Chat con Nexus' })
      })
      .then(res => res.json())
      .then(data => {
        if(data.id) setConversationId(data.id)
      })
      .catch(console.error)
    }
  }, [isOpen, conversationId])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-br from-[#0053db] to-[#0048c1] hover:from-[#0048c1] hover:to-[#003798] text-white rounded-full shadow-[0_8px_30px_rgba(0,83,219,0.3)] hover:scale-110 transition-transform cursor-pointer z-50 flex items-center justify-center animate-bounce-subtle"
        aria-label="Abrir asistente Nexus"
      >
        <Bot className="w-7 h-7" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#fe8983] border-2 border-white rounded-full"></span>
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-[400px] h-[600px] bg-white rounded-2xl shadow-[0_12px_40px_rgba(42,52,57,0.15)] flex flex-col overflow-hidden z-50 border border-[#e1e9ee] animate-in fade-in slide-in-from-bottom-5 duration-300">
      {/* Header */}
      <header className="px-5 py-4 bg-gradient-to-r from-[#0053db] to-[#0048c1] text-white flex justify-between items-center shrink-0 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-sm">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-[1rem] tracking-tight leading-tight">Nexus AI</h3>
            <p className="text-[0.6875rem] text-blue-100 font-medium">Copiloto Inteligente Abastto</p>
          </div>
        </div>
        <div className="flex items-center gap-2 relative z-10">
          <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-md transition-colors text-white/80 hover:text-white cursor-pointer" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 bg-[#fcfdff] space-y-5 scroll-smooth">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 bg-[#dbe1ff] text-[#003798] rounded-full flex items-center justify-center mb-4">
              <Bot className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-[#2a3439] text-[1.125rem]">¿En qué puedo ayudarte?</h4>
            <p className="text-[#566166] text-[0.875rem] mt-2 mb-6">Soy tu colega experto en trade y compras, listo para ayudarte en la red B2B.</p>
            
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                "Dame un resumen analítico",
                "Compara las últimas ofertas",
                "Quiero generar una RFQ"
              ].map((suggestion, i) => (
                <button 
                  key={i}
                  onClick={() => append({ role: 'user', content: suggestion })}
                  className="px-3 py-1.5 bg-white border border-[#e1e9ee] text-[#0053db] text-[0.75rem] font-bold rounded-full hover:bg-[#dbe1ff] hover:border-[#c5d6f0] transition-colors cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
              <div 
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user' 
                    ? 'bg-[#0053db] text-white rounded-br-sm shadow-md' 
                    : 'bg-[#f0f4f7] text-[#2a3439] rounded-bl-sm border border-[#e8eff3] shadow-sm'
                }`}
              >
                {msg.role !== 'user' && (
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-bold text-[0.6875rem] text-[#003798] uppercase tracking-wide">Nexus</span>
                  </div>
                )}
                
                {msg.toolInvocations ? (
                  <div className="text-[0.875rem] space-y-2">
                    {msg.toolInvocations.map(tool => (
                      <div key={tool.toolCallId} className="flex items-center gap-2 text-[0.75rem] text-[#566166] bg-[#e1e9ee] px-2 py-1 rounded-md mb-1 w-fit font-mono font-medium">
                        <Loader2 className="w-3 h-3 animate-spin text-[#0053db]" />
                        ejecutando {tool.toolName}...
                      </div>
                    ))}
                    {msg.content && <div className="mt-2"><MarkdownContent content={msg.content} /></div>}
                  </div>
                ) : (
                  <div className={`text-[0.875rem] prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : 'prose-slate'}`}>
                    <MarkdownContent content={msg.content} />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
           <div className="flex justify-start w-full">
            <div className="bg-[#f0f4f7] border border-[#e8eff3] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-2">
               <Bot className="w-4 h-4 text-[#0053db] animate-pulse" />
               <div className="flex gap-1">
                 <span className="w-1.5 h-1.5 bg-[#0053db]/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                 <span className="w-1.5 h-1.5 bg-[#0053db]/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                 <span className="w-1.5 h-1.5 bg-[#0053db]/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
               </div>
            </div>
         </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input formatting */}
      <div className="border-t border-[#e8eff3] bg-white p-4 shrink-0">
        <form 
          className="flex relative" 
          onSubmit={(e) => {
             e.preventDefault(); 
             
             // First save to our persistence API
             if (input.trim() && conversationId) {
                fetch(`/api/agent/conversations/${conversationId}`, {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify({ role: 'user', content: input })
                }).catch(console.error)
             }
             
             handleSubmit(e)
          }}
        >
          <Input 
            value={input}
            onChange={handleInputChange}
            placeholder="Pregúntale a Nexus..." 
            className="w-full bg-[#f7f9fb] border-[#e1e9ee] rounded-full pl-4 pr-12 py-5 text-[0.875rem] focus-visible:ring-[#0053db] focus-visible:border-[#0053db] shadow-inner"
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#0053db] text-white flex items-center justify-center disabled:opacity-50 disabled:bg-[#a9b4b9] hover:bg-[#0048c1] transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
        <div className="text-center mt-2">
            <p className="text-[0.65rem] text-[#a9b4b9] font-medium">Las respuestas son generadas por IA y pueden tener errores.</p>
        </div>
      </div>
    </div>
  )
}

function MarkdownContent({ content }: { content: string }) {
   if (!content) return null;
   return (
      <ReactMarkdown 
         remarkPlugins={[remarkGfm]}
         className="react-markdown break-words"
         components={{
            p: ({ children }) => <p className="m-0 mb-2 leading-relaxed">{children}</p>,
            h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-3">{children}</h1>,
            h2: ({ children }) => <h2 className="text-md font-bold mb-2 mt-3">{children}</h2>,
            h3: ({ children }) => <h3 className="text-sm font-bold mb-2 mt-2">{children}</h3>,
            ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
            li: ({ children }) => <li>{children}</li>,
            a: ({ href, children }) => <a href={href} className="text-[#0053db] underline underline-offset-2 hover:text-[#003798]" target="_blank" rel="noopener noreferrer">{children}</a>,
            strong: ({ children }) => <strong className="font-bold text-[#0b0f10]">{children}</strong>,
            table: ({ children }) => <div className="overflow-x-auto w-[100%] my-3 rounded-lg border border-[#e1e9ee]"><table className="w-full text-left text-xs">{children}</table></div>,
            th: ({ children }) => <th className="bg-[#f0f4f7] px-3 py-2 font-bold text-[#566166]">{children}</th>,
            td: ({ children }) => <td className="border-t border-[#e8eff3] px-3 py-2">{children}</td>,
         }}
      >
         {content}
      </ReactMarkdown>
   )
}
