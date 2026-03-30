import { google } from '@ai-sdk/google'
import { streamText, tool } from 'ai'
import { z } from 'zod'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

const NEXUS_SYSTEM_PROMPT = `Eres **Nexus**, el asistente de IA de Abastto — la plataforma B2B de procurement más innovadora de Guatemala.

## Tu Personalidad
- Eres profesional pero cercano. Hablas como un consultor de procurement joven, eficiente y con experiencia.
- Eres directo y basado en datos. Cuando puedes, das números concretos.
- Usas un tono cálido pero conciso. No eres un robot — eres un colega inteligente.
- Siempre respondes en español, salvo que el usuario escriba en otro idioma.
- Cuando celebras logros del usuario, eres genuino (no exagerado).
- Te refieres a ti mismo como "Nexus" cuando es relevante.
- Puedes usar emojis con moderación para hacer la conversación más dinámica (📊, ✅, 💡, etc.)

## Tu Contexto
- Estás integrado en Abastto, un marketplace B2B que conecta compradores y proveedores en Guatemala.
- Los usuarios pueden ser BUYER (compradores) o SUPPLIER (proveedores).
- La plataforma maneja RFQs (Request for Quotation / Licitaciones), Bids (Ofertas), Reviews, y Mensajes entre empresas.
- La moneda es Quetzales (Q).
- Los departamentos son de Guatemala.

## Tus Capacidades
Tienes acceso a herramientas que te permiten:
1. Buscar y listar las RFQs del usuario
2. Ver las ofertas (bids) recibidas o enviadas
3. Obtener información de la empresa del usuario
4. Comparar ofertas en una licitación específica
5. Obtener métricas y analytics de actividad

## Reglas
- NUNCA inventes datos. Si no tienes la información, usa tus herramientas para buscarla.
- Si una herramienta no devuelve resultados, informa al usuario amablemente.
- Formatea tus respuestas con Markdown cuando sea útil (tablas, listas, negritas).
- Si el usuario pide algo que no puedes hacer, sugiere alternativas dentro de la plataforma.
- Cuando muestres montos, usa el formato "Q 1,234.56".
- Sé proactivo: si ves algo interesante en los datos, menciónalo.`

export async function POST(req: Request) {
  const session = await auth()

  if (!session?.user?.id || !session?.user?.companyId) {
    return new Response('No autorizado', { status: 401 })
  }

  const { messages, conversationId } = await req.json()

  const userId = session.user.id
  const companyId = session.user.companyId
  const userRole = session.user.role as string
  const userName = session.user.name || 'Usuario'

  // Context injection: tell Nexus about the current user
  const contextMessage = `[CONTEXTO DEL USUARIO]
- Nombre: ${userName}
- Rol: ${userRole === 'BUYER' ? 'Comprador' : 'Proveedor'}
- ID de Empresa: ${companyId}
- Fecha actual: ${new Date().toLocaleDateString('es-GT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`

  const result = streamText({
    model: google('gemini-2.0-flash'),
    system: NEXUS_SYSTEM_PROMPT + '\n\n' + contextMessage,
    messages,
    tools: {
      // @ts-ignore
      searchRfqs: tool({
        description: 'Busca y lista las RFQs (licitaciones) del usuario. Para compradores muestra sus propias RFQs. Para proveedores muestra RFQs abiertas en el mercado.',
        parameters: z.object({
          status: z.enum(['OPEN', 'EVALUATING', 'CLOSED', 'AWARDED', 'DRAFT_PENDING_APPROVAL', 'ALL']).optional()
            .describe('Filtrar por estado. Usa ALL para ver todas.'),
          searchTerm: z.string().optional()
            .describe('Término de búsqueda para filtrar por título o descripción'),
          limit: z.number().optional()
            .describe('Cantidad máxima de resultados'),
        }),
        // @ts-ignore
        execute: async (args: any) => {
          const { status, searchTerm, limit } = args;
          const limitN = limit || 5;
          const where: any = {}

          if (userRole === 'BUYER') {
            where.companyId = companyId
          } else {
            where.status = 'OPEN'
            where.deadline = { gt: new Date() }
          }

          if (status && status !== 'ALL') {
            where.status = status
          }

          if (searchTerm) {
            where.OR = [
              { title: { contains: searchTerm, mode: 'insensitive' } },
              { description: { contains: searchTerm, mode: 'insensitive' } },
            ]
          }

          const rfqs = await prisma.rfq.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limitN,
            include: {
              _count: { select: { bids: true } },
              company: { select: { name: true } },
              items: { select: { name: true, quantity: true, unit: true } },
            },
          })

          return rfqs.map(rfq => ({
            id: rfq.id,
            titulo: rfq.title,
            descripcion: rfq.description.substring(0, 150) + (rfq.description.length > 150 ? '...' : ''),
            presupuesto: `Q ${Number(rfq.budget).toLocaleString()}`,
            estado: rfq.status,
            deadline: rfq.deadline.toLocaleDateString('es-GT'),
            cantidadOfertas: rfq._count.bids,
            empresa: rfq.company?.name,
            items: rfq.items.map(i => `${i.quantity} ${i.unit} de ${i.name}`),
            categoria: rfq.category,
          }))
        },
      }) as any,

      // @ts-ignore
      getMyBids: tool({
        description: 'Obtiene las ofertas (bids) de la empresa del usuario. Para compradores: ofertas recibidas en sus RFQs. Para proveedores: ofertas enviadas.',
        parameters: z.object({
          status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'ALL']).optional()
            .describe('Filtrar por estado de la oferta'),
          limit: z.number().optional().describe('Límite de resultados'),
        }),
        // @ts-ignore
        execute: async (args: any) => {
          const { status, limit } = args;
          const limitN = limit || 5;
          const where: any = {}

          if (userRole === 'BUYER') {
            where.rfq = { companyId }
          } else {
            where.companyId = companyId
          }

          if (status && status !== 'ALL') {
            where.status = status
          }

          const bids = await prisma.bid.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limitN,
            include: {
              rfq: { select: { title: true, budget: true, status: true } },
              company: { select: { name: true } },
              items: {
                include: { rfqItem: { select: { name: true } } },
              },
            },
          })

          return bids.map(bid => ({
            id: bid.id,
            monto: `Q ${Number(bid.amount).toLocaleString()}`,
            estado: bid.status,
            empresa: bid.company.name,
            rfqTitulo: bid.rfq.title,
            rfqPresupuesto: `Q ${Number(bid.rfq.budget).toLocaleString()}`,
            coverLetter: bid.coverLetter.substring(0, 100) + '...',
            tiempoEntrega: bid.deliveryLeadTime,
            validezDias: bid.validityDays,
            items: bid.items.map(i => ({
              producto: i.rfqItem.name,
              precioUnitario: `Q ${Number(i.unitPrice).toLocaleString()}`,
              total: `Q ${Number(i.totalPrice).toLocaleString()}`,
            })),
            fecha: bid.createdAt.toLocaleDateString('es-GT'),
          }))
        },
      }) as any,

      // @ts-ignore
      getCompanyProfile: tool({
        description: 'Obtiene el perfil de la empresa del usuario, incluyendo info y trust score basado en reviews.',
        parameters: z.object({}),
        // @ts-ignore
        execute: async (args: any) => {
          const company = await prisma.company.findUnique({
            where: { id: companyId },
            include: {
              receivedReviews: true,
              _count: {
                select: {
                  rfqs: true,
                  bids: true,
                  receivedReviews: true,
                },
              },
            },
          })

          if (!company) return { error: 'Empresa no encontrada' }

          const reviews = company.receivedReviews
          const avgRatings = reviews.length > 0 ? {
            calidad: (reviews.reduce((sum, r) => sum + r.ratingQuality, 0) / reviews.length).toFixed(1),
            puntualidad: (reviews.reduce((sum, r) => sum + r.ratingPunctuality, 0) / reviews.length).toFixed(1),
            comunicacion: (reviews.reduce((sum, r) => sum + r.ratingCommunication, 0) / reviews.length).toFixed(1),
            profesionalismo: (reviews.reduce((sum, r) => sum + r.ratingProfessionalism, 0) / reviews.length).toFixed(1),
          } : null

          return {
            nombre: company.name,
            nit: company.nit,
            industria: company.industry,
            departamento: company.department,
            verificada: company.isVerified,
            kycStatus: company.kycStatus,
            totalRfqs: company._count.rfqs,
            totalBids: company._count.bids,
            totalReviews: company._count.receivedReviews,
            ratings: avgRatings,
          }
        },
      }) as any,

      // @ts-ignore
      compareBids: tool({
        description: 'Compara las ofertas recibidas en una RFQ específica. Genera un ranking ponderado para ayudar al usuario a decidir.',
        parameters: z.object({
          rfqId: z.string().describe('El ID de la RFQ a comparar. Si no tienes el ID, usa searchRfqs primero.'),
        }),
        // @ts-ignore
        execute: async (args: any) => {
          const { rfqId } = args;
          const rfq = await prisma.rfq.findUnique({
            where: { id: rfqId },
            include: {
              bids: {
                include: {
                  company: {
                    include: {
                      receivedReviews: true,
                    },
                  },
                  items: {
                    include: { rfqItem: { select: { name: true, quantity: true, unit: true } } },
                  },
                },
              },
              items: true,
            },
          })

          if (!rfq) return { error: 'RFQ no encontrada' }
          if (rfq.bids.length === 0) return { mensaje: 'Esta RFQ no tiene ofertas todavía.' }

          const comparativa = rfq.bids.map(bid => {
            const reviews = bid.company.receivedReviews
            const avgScore = reviews.length > 0
              ? (reviews.reduce((sum, r) => sum + r.ratingQuality + r.ratingPunctuality + r.ratingCommunication + r.ratingProfessionalism, 0) / (reviews.length * 4)).toFixed(1)
              : 'Sin reviews'

            const precioVsBudget = ((Number(bid.amount) / Number(rfq.budget)) * 100).toFixed(1)

            return {
              empresa: bid.company.name,
              monto: `Q ${Number(bid.amount).toLocaleString()}`,
              porcentajeVsPresupuesto: `${precioVsBudget}%`,
              trustScore: avgScore,
              tiempoEntrega: bid.deliveryLeadTime || 'No especificado',
              validezDias: bid.validityDays,
              cantidadReviews: reviews.length,
              detalleItems: bid.items.map(i => ({
                producto: i.rfqItem.name,
                precioUnitario: `Q ${Number(i.unitPrice).toLocaleString()}`,
                total: `Q ${Number(i.totalPrice).toLocaleString()}`,
                observaciones: i.remarks,
              })),
            }
          })

          return {
            rfqTitulo: rfq.title,
            presupuesto: `Q ${Number(rfq.budget).toLocaleString()}`,
            totalOfertas: rfq.bids.length,
            comparativa,
          }
        },
      }) as any,

      // @ts-ignore
      getAnalytics: tool({
        description: 'Obtiene métricas y analytics de actividad de la empresa del usuario: spending, actividad mensual, tendencias.',
        parameters: z.object({
          periodo: z.enum(['semana', 'mes', 'trimestre', 'anio']).optional()
            .describe('Período de tiempo para las métricas'),
        }),
        // @ts-ignore
        execute: async (args: any) => {
          const { periodo } = args;
          const periodoFinal = periodo || 'mes';
          const now = new Date()
          const startDate = new Date()

          switch (periodoFinal) {
            case 'semana': startDate.setDate(now.getDate() - 7); break
            case 'mes': startDate.setMonth(now.getMonth() - 1); break
            case 'trimestre': startDate.setMonth(now.getMonth() - 3); break
            case 'anio': startDate.setFullYear(now.getFullYear() - 1); break
          }

          if (userRole === 'BUYER') {
            const [totalSpent, rfqsCreated, rfqsOpen, rfqsClosed, bidsReceived] = await Promise.all([
              prisma.bid.aggregate({
                where: { status: 'ACCEPTED', rfq: { companyId }, createdAt: { gte: startDate } },
                _sum: { amount: true },
              }),
              prisma.rfq.count({ where: { companyId, createdAt: { gte: startDate } } }),
              prisma.rfq.count({ where: { companyId, status: 'OPEN' } }),
              prisma.rfq.count({ where: { companyId, status: 'CLOSED', createdAt: { gte: startDate } } }),
              prisma.bid.count({ where: { rfq: { companyId }, createdAt: { gte: startDate } } }),
            ])

            return {
              periodo,
              rol: 'Comprador',
              totalGastado: `Q ${Number(totalSpent._sum.amount || 0).toLocaleString()}`,
              rfqsCreadas: rfqsCreated,
              rfqsAbiertas: rfqsOpen,
              rfqsCerradas: rfqsClosed,
              ofertasRecibidas: bidsReceived,
              promedioOfertasPorRfq: rfqsCreated > 0 ? (bidsReceived / rfqsCreated).toFixed(1) : '0',
            }
          } else {
            const [totalEarned, bidsSubmitted, bidsWon, bidsLost] = await Promise.all([
              prisma.bid.aggregate({
                where: { status: 'ACCEPTED', companyId, createdAt: { gte: startDate } },
                _sum: { amount: true },
              }),
              prisma.bid.count({ where: { companyId, createdAt: { gte: startDate } } }),
              prisma.bid.count({ where: { companyId, status: 'ACCEPTED', createdAt: { gte: startDate } } }),
              prisma.bid.count({ where: { companyId, status: 'REJECTED', createdAt: { gte: startDate } } }),
            ])

            return {
              periodo,
              rol: 'Proveedor',
              totalGanado: `Q ${Number(totalEarned._sum.amount || 0).toLocaleString()}`,
              ofertasEnviadas: bidsSubmitted,
              ofertasGanadas: bidsWon,
              ofertasPerdidas: bidsLost,
              tasaExito: bidsSubmitted > 0 ? `${((bidsWon / bidsSubmitted) * 100).toFixed(1)}%` : '0%',
            }
          }
        },
      }) as any,
    },

    // Persist after streaming completes
    async onFinish({ text }) {
      if (conversationId && text) {
        try {
          await prisma.chatMessage.createMany({
            data: [
              {
                conversationId,
                role: 'ASSISTANT',
                content: text,
              },
            ],
          })
        } catch (e) {
          console.error('Failed to persist assistant message:', e)
        }
      }
    },
  })

  // @ts-ignore
  return typeof result.toDataStreamResponse === 'function' ? result.toDataStreamResponse() : (result as any).toTextStreamResponse()
}
