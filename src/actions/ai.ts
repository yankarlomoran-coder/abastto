'use server'

import { auth } from '@/auth'
import prisma from '@/lib/prisma'

export async function analyzeOffers(rfqId: string) {
    try {
        const session = await auth()
        if (!session?.user || session.user.role !== 'BUYER') {
            return { success: false, message: 'No autorizado.' }
        }

        // 1. Fetch the RFQ and its Bids
        const rfq = await prisma.rfq.findUnique({
            where: { id: rfqId },
            include: {
                bids: {
                    include: { supplier: { select: { name: true } } }
                }
            }
        })

        if (!rfq) return { success: false, message: 'Solicitud no encontrada.' }
        if (rfq.buyerId !== session.user.id) return { success: false, message: 'No eres el dueño de esta solicitud.' }
        if (rfq.bids.length === 0) return { success: false, message: 'No hay ofertas para analizar todavía.' }

        // 2. Initialize Gemini Client
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) return { success: false, message: 'Clave de IA no configurada (GEMINI_API_KEY).' }

        const { GoogleGenerativeAI } = require('@google/generative-ai')
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        // 3. Construct the Prompt
        const prompt = `
Eres un analista de compras experto B2B (Business-to-Business) en Guatemala.
Han publicado una Solicitud de Cotización (RFQ) y han llegado múltiples ofertas.
Tu trabajo es analizar las ofertas, compararlas de manera objetiva y recomendar la mejor opción basándote en un balance entre precio (Quetzales) y las condiciones/tiempo de entrega.

### Detalles de la Solicitud (Lo que el comprador necesita):
* Título: ${rfq.title}
* Descripción Técnica: ${rfq.description}
* Presupuesto Máximo del Comprador: Q ${Number(rfq.budget).toFixed(2)}

### Ofertas Recibidas de Proveedores:
${rfq.bids.map((bid: any, index: number) => `
--- Oferta #${index + 1} ---
* Proveedor: ${bid.supplier.name}
* Precio Ofertado: Q ${Number(bid.amount).toFixed(2)}
* Tiempo de Entrega y Condiciones: ${bid.coverLetter}
`).join('\n')}

### Instrucciones para tu respuesta:
1. Sé directo, profesional e imparcial. Responde en Español.
2. Analiza los pros y contras de cada oferta brevemente.
3. Termina dando un "Veredicto o Recomendación Final" muy claro sobre cuál elegir justificando por qué (¿Es la más barata? ¿Tiene mejor tiempo de entrega? ¿Ofrece garantías extra?).
4. Usa formato Markdown (saltos de línea, negritas) para que sea fácil de leer en pantalla. No uses colores ni HTML.
`

        // 4. Call Gemini API
        const result = await model.generateContent(prompt)
        const response = result.response

        return {
            success: true,
            analysis: response.text()
        }

    } catch (error) {
        console.error("AI Error:", error)
        return { success: false, message: 'Ocurrió un error al contactar al motor de Inteligencia Artificial.' }
    }
}
