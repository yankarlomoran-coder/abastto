import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

type ActivityAction =
    | 'RFQ_CREATED'
    | 'RFQ_UPDATED'
    | 'RFQ_CLOSED'
    | 'BID_SUBMITTED'
    | 'BID_ACCEPTED'
    | 'BID_REJECTED'
    | 'KYC_SUBMITTED'
    | 'KYC_APPROVED'
    | 'KYC_REJECTED'
    | 'MEMBER_INVITED'
    | 'MEMBER_JOINED'
    | 'REVIEW_SUBMITTED'
    | 'DOCUMENT_UPLOADED'
    | 'LOGIN'
    | 'SETTINGS_UPDATED'

export async function logActivity({
    action,
    description,
    userId,
    companyId,
    metadata,
}: {
    action: ActivityAction
    description: string
    userId?: string
    companyId?: string
    metadata?: Prisma.InputJsonValue
}) {
    try {
        await prisma.activityLog.create({
            data: {
                action,
                description,
                userId,
                companyId,
                metadata: metadata ?? Prisma.JsonNull,
            }
        })
    } catch (error) {
        // Never let logging break the main flow
        console.error('[ActivityLog] Failed to log activity:', error)
    }
}

export async function getActivityLog({
    companyId,
    userId,
    limit = 20,
    offset = 0,
}: {
    companyId?: string
    userId?: string
    limit?: number
    offset?: number
}) {
    const where: any = {}
    if (companyId) where.companyId = companyId
    if (userId) where.userId = userId

    return prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
    })
}
