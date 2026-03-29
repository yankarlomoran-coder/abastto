import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

// POST: Save a user message to an existing conversation 
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id: conversationId } = await params
  const { content, role } = await req.json()

  // Verify ownership
  const conversation = await prisma.chatConversation.findFirst({
    where: { id: conversationId, userId: session.user.id },
  })

  if (!conversation) {
    return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 })
  }

  const message = await prisma.chatMessage.create({
    data: {
      conversationId,
      role: role || 'USER',
      content,
    },
  })

  // Update conversation title if it's the first user message
  const messageCount = await prisma.chatMessage.count({
    where: { conversationId, role: 'USER' },
  })
  
  if (messageCount === 1) {
    await prisma.chatConversation.update({
      where: { id: conversationId },
      data: {
        title: content.substring(0, 60) + (content.length > 60 ? '...' : ''),
        updatedAt: new Date(),
      },
    })
  } else {
    await prisma.chatConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })
  }

  return NextResponse.json(message)
}

// GET: Get messages for a conversation
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id: conversationId } = await params

  const conversation = await prisma.chatConversation.findFirst({
    where: { id: conversationId, userId: session.user.id },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!conversation) {
    return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 })
  }

  return NextResponse.json(conversation)
}
