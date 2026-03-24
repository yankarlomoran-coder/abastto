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
                items: true,
                bids: {
                    include: {
                        company: { select: { name: true } },
                        items: { include: { rfqItem: true } }
                    }
                }
            }
        })

        if (!rfq) return { success: false, message: 'Solicitud no encontrada.' }
        if (rfq.companyId !== session.user.companyId) return { success: false, message: 'Tu empresa no es dueña de esta solicitud.' }
        if (rfq.bids.length === 0) return { success: false, message: 'No hay ofertas para analizar todavía.' }

        // 2. Initialize Gemini Client
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) return { success: false, message: 'Clave de IA no configurada (GEMINI_API_KEY).' }

        const { GoogleGenerativeAI } = require('@google/generative-ai')
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        // 3. Construct the Prompt
        const rfqItemsText = rfq.items.map(item => `- ${item.quantity} ${item.unit} de ${item.name}`).join('\n')

        const bidDataText = rfq.bids.map((bid: any, index: number) => {
            const itemsText = bid.items.map((bItem: any) =>
                `  * ${bItem.rfqItem?.name}: Q ${Number(bItem.unitPrice).toFixed(2)} c/u (Total: Q ${Number(bItem.totalPrice).toFixed(2)})${bItem.remarks ? ` - Nota: ${bItem.remarks}` : ''}`
            ).join('\n')

            return `
--- Oferta #${index + 1} ---
* Proveedor: ${bid.company?.name || 'Empresa Anónima'}
* Precio Total Ofertado: Q ${Number(bid.amount).toFixed(2)}
* Días de Validez de Oferta: ${bid.validityDays || 'No especificado'}
* Tiempo de Entrega Prometido: ${bid.deliveryLeadTime || 'No especificado'}
* Carta/Desglose General: ${bid.coverLetter}
* Cotización por Ítem:
${itemsText}
`
        }).join('\n')

        const prompt = `
Eres un analista de compras experto B2B (Business-to-Business) en Guatemala.
Han publicado una Solicitud de Cotización (RFQ) multi-producto y han llegado múltiples ofertas.
Tu trabajo es analizar las ofertas, compararlas de manera objetiva y recomendar la mejor opción basándote en un balance entre precio unitario total, condiciones establecidas, y tiempo de entrega.

### Detalles de la Solicitud (Lo que el comprador necesita):
* Título: ${rfq.title}
* Descripción Técnica: ${rfq.description}
* Categoría: ${rfq.category || 'No especificada'}
* Lugar de Entrega: ${rfq.deliveryLocation || 'No especificado'}
* Condiciones de Pago Esperadas: ${rfq.paymentTerms || 'No especificadas'}
* Presupuesto Máximo Ofertado del Comprador: Q ${Number(rfq.budget).toFixed(2)}
* Productos Solicitados:
${rfqItemsText}

### Ofertas Recibidas de Proveedores:
${bidDataText}

### Instrucciones para tu respuesta:
1. Sé directo, profesional e imparcial. Responde en Español.
2. Analiza los pros y contras de cada oferta. ¿Algún proveedor ofreció un precio unitario sospechosamente bajo o alto comparado con los demás? 
3. Termina dando un "Veredicto o Recomendación Final" muy claro sobre cuál elegir justificando por qué (¿Es la más barata a nivel total? ¿Tiene mejores condiciones de entrega?).
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

export async function generateSpendAnalytics() {
    try {
        const session = await auth()
        if (!session?.user?.companyId || session.user.role !== 'BUYER') {
            return { success: false, message: 'No autorizado o no eres comprador.' }
        }

        const rfqs = await prisma.rfq.findMany({
            where: { 
                companyId: session.user.companyId,
                status: 'CLOSED'
            },
            include: {
                bids: {
                    where: { status: 'ACCEPTED' },
                    include: { company: true }
                }
            }
        })

        if (rfqs.length === 0) {
            return { success: false, message: 'No hay suficientes datos históricos. Necesitas cerrar al menos una licitación.' }
        }

        let totalBudget = 0
        let totalSpent = 0
        const vendorCount: Record<string, number> = {}

        const historicalData = rfqs.map(rfq => {
            const acceptedBid = rfq.bids[0]
            if (!acceptedBid) return null;
            
            totalBudget += Number(rfq.budget)
            const spent = Number(acceptedBid.amount)
            totalSpent += spent
            
            const vendorName = acceptedBid.company?.name || 'Proveedor Anónimo'
            vendorCount[vendorName] = (vendorCount[vendorName] || 0) + 1

            return `- Licitación "${rfq.title}": Presupuesto Q${Number(rfq.budget).toFixed(2)}, Adjudicado a ${vendorName} por Q${spent.toFixed(2)}.`
        }).filter(Boolean).join('\n')
        
        if (totalBudget === 0) {
            return { success: false, message: 'Las licitaciones cerradas no tienen presupuesto asignado para comparar.' }
        }

        const savings = totalBudget - totalSpent;
        const savingsPercentage = totalBudget > 0 ? (savings / totalBudget) * 100 : 0;

        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) return { success: false, message: 'Clave de IA no configurada.' }

        const { GoogleGenerativeAI } = require('@google/generative-ai')
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        const prompt = `
Eres un Analista Financiero B2B y Director de Compras (CPO).
Tu objetivo es generar a partir del historial de compras de la empresa, un informe ejecutivo rápido resaltando el ahorro generado.

Datos Históricos Recientes (Licitaciones Cerradas):
${historicalData}

Resumen Matemático:
* Presupuesto Total Original: Q${totalBudget.toFixed(2)}
* Gasto Real Ejecutado: Q${totalSpent.toFixed(2)}
* Ahorro Logrado: Q${savings.toFixed(2)} (${savingsPercentage.toFixed(2)}%)

Instrucciones:
Escribe un reporte ejecutivo de 2 a 3 párrafos.
1. Haz un resumen resaltando el porcentaje de ahorro y su impacto financiero positivo.
2. Identifica fortalezas en la estrategia de negociación actual.
3. Menciona brevemente alguna recomendación futura basada en estos datos.
Usa markdown (negritas, bullet points) para facilitar la lectura. No uses HTML. Usa un tono ejecutivo, enfocado a resultados contables y motivacional.
`
        const result = await model.generateContent(prompt)
        return { 
            success: true, 
            analysis: result.response.text(), 
            savings, 
            totalSpent,
            savingsPercentage 
        }

    } catch (error) {
        console.error("AI Analytics Error:", error)
        return { success: false, message: 'Error procesando analíticas financieras con IA.' }
    }
}
