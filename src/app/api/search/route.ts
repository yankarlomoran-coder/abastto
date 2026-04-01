import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.companyId) {
        return NextResponse.json({ results: [] }, { status: 401 })
    }

    const q = req.nextUrl.searchParams.get('q')?.trim()
    if (!q || q.length < 2) {
        return NextResponse.json({ results: [] })
    }

    const isBuyer = session.user.role === 'BUYER'
    const companyId = session.user.companyId

    try {
        // Search RFQs
        const rfqs = await prisma.rfq.findMany({
            where: {
                AND: [
                    { title: { contains: q, mode: 'insensitive' } },
                    isBuyer
                        ? { companyId }
                        : { OR: [{ status: 'OPEN' }, { bids: { some: { companyId } } }] }
                ]
            },
            select: { id: true, title: true, status: true, budget: true, deadline: true },
            take: 5,
            orderBy: { createdAt: 'desc' }
        })

        // Search Companies
        const companies = await prisma.company.findMany({
            where: {
                name: { contains: q, mode: 'insensitive' }
            },
            select: { id: true, name: true, industry: true, department: true },
            take: 5,
            orderBy: { name: 'asc' }
        })

        const results = [
            ...rfqs.map(rfq => ({
                id: rfq.id,
                title: rfq.title,
                subtitle: `Q ${Number(rfq.budget).toLocaleString()} · ${rfq.status}`,
                type: 'rfq' as const,
                href: `/rfq/${rfq.id}`
            })),
            ...companies.map(c => ({
                id: c.id,
                title: c.name,
                subtitle: `${c.industry?.replace(/_/g, ' ')} · ${c.department?.replace(/_/g, ' ')}`,
                type: 'company' as const,
                href: `/network` // Future: /company/${c.id}
            }))
        ]

        return NextResponse.json({ results })
    } catch (error) {
        console.error('Search error:', error)
        return NextResponse.json({ results: [] }, { status: 500 })
    }
}
