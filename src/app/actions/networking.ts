'use server'

/**
 * ========================================
 * DEGUX.CL - SERVER ACTIONS (NETWORKING)
 * ========================================
 * Next.js 15 + React 19 Server Actions
 * Implementación moderna sin API routes tradicionales
 *
 * Features:
 * - Progressive Enhancement (funciona sin JS)
 * - Optimistic Updates (useOptimistic)
 * - Form validation con Zod
 * - Type-safe con TypeScript
 * ========================================
 */

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/supabase/auth'

// ========================================
// TIPOS Y VALIDACIONES
// ========================================

const ConnectionRequestSchema = z.object({
  receiverId: z.string().min(1, 'Usuario requerido'),
  message: z.string().optional(),
})

const ConnectionActionSchema = z.object({
  connectionId: z.string().min(1, 'Conexión requerida'),
  action: z.enum(['accept', 'reject', 'block']),
})

type ActionResponse<T = void> = {
  success: boolean
  message?: string
  data?: T
  error?: string
}

// ========================================
// HELPER: Obtener usuario autenticado
// ========================================

async function getAuthenticatedUser() {
  const supabaseUser = await getUser()

  if (!supabaseUser?.email) {
    throw new Error('No autenticado')
  }

  const user = await prisma.user.findUnique({
    where: { email: supabaseUser.email },
    select: { id: true, email: true, name: true }
  })

  if (!user) {
    throw new Error('Usuario no encontrado')
  }

  return user
}

// ========================================
// SERVER ACTION: Enviar solicitud de conexión
// ========================================

export async function sendConnectionRequest(
  formData: FormData
): Promise<ActionResponse<{ connectionId: string }>> {
  try {
    // 1. Autenticación
    const currentUser = await getAuthenticatedUser()

    // 2. Validación de datos
    const validatedData = ConnectionRequestSchema.parse({
      receiverId: formData.get('receiverId'),
      message: formData.get('message'),
    })

    // 3. Validaciones de negocio
    if (validatedData.receiverId === currentUser.id) {
      return {
        success: false,
        error: 'No puedes enviarte una solicitud a ti mismo',
      }
    }

    // Verificar que el receptor existe
    const receiver = await prisma.user.findUnique({
      where: { id: validatedData.receiverId },
      select: { id: true, name: true }
    })

    if (!receiver) {
      return {
        success: false,
        error: 'Usuario no encontrado',
      }
    }

    // Verificar que no exista conexión previa
    const existingConnection = await prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId: currentUser.id, receiverId: validatedData.receiverId },
          { requesterId: validatedData.receiverId, receiverId: currentUser.id },
        ],
      },
    })

    if (existingConnection) {
      return {
        success: false,
        error: 'Ya existe una conexión con este usuario',
      }
    }

    // 4. Crear conexión
    const connection = await prisma.connection.create({
      data: {
        id: crypto.randomUUID(),
        requesterId: currentUser.id,
        receiverId: validatedData.receiverId,
        message: validatedData.message,
        status: 'pending',
        updatedAt: new Date(),
      },
    })

    // 5. Revalidar rutas afectadas
    revalidatePath('/networking')
    revalidatePath(`/networking/${validatedData.receiverId}`)
    revalidatePath('/dashboard/conexiones')

    // 6. TODO: Enviar notificación (Fase 2)
    // await sendConnectionNotification(receiver.email, currentUser.name)

    return {
      success: true,
      message: `Solicitud enviada a ${receiver.name}`,
      data: { connectionId: connection.id },
    }
  } catch (error) {
    console.error('Error en sendConnectionRequest:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al enviar solicitud',
    }
  }
}

// ========================================
// SERVER ACTION: Aceptar/Rechazar conexión
// ========================================

export async function handleConnectionAction(
  formData: FormData
): Promise<ActionResponse> {
  try {
    // 1. Autenticación
    const currentUser = await getAuthenticatedUser()

    // 2. Validación
    const validatedData = ConnectionActionSchema.parse({
      connectionId: formData.get('connectionId'),
      action: formData.get('action'),
    })

    // 3. Verificar que la conexión existe y el usuario es el receptor
    const connection = await prisma.connection.findUnique({
      where: { id: validatedData.connectionId },
      include: {
        User_Connection_requesterIdToUser: { select: { name: true, email: true } },
        User_Connection_receiverIdToUser: { select: { id: true } },
      },
    })

    if (!connection) {
      return { success: false, error: 'Conexión no encontrada' }
    }

    if (connection.User_Connection_receiverIdToUser.id !== currentUser.id) {
      return { success: false, error: 'No autorizado' }
    }

    // 4. Actualizar estado
    const newStatus = validatedData.action === 'accept'
      ? 'accepted'
      : validatedData.action === 'reject'
      ? 'rejected'
      : 'blocked'

    await prisma.connection.update({
      where: { id: validatedData.connectionId },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      },
    })

    // 5. Revalidar
    revalidatePath('/dashboard/conexiones')
    revalidatePath('/networking')

    return {
      success: true,
      message: `Solicitud ${newStatus === 'accepted' ? 'aceptada' : 'rechazada'}`,
    }
  } catch (error) {
    console.error('Error en handleConnectionAction:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al procesar acción',
    }
  }
}

// ========================================
// SERVER ACTION: Eliminar conexión
// ========================================

export async function removeConnection(
  formData: FormData
): Promise<ActionResponse> {
  try {
    // 1. Autenticación
    const currentUser = await getAuthenticatedUser()

    // 2. Obtener connectionId
    const connectionId = formData.get('connectionId') as string

    if (!connectionId) {
      return { success: false, error: 'ID de conexión requerido' }
    }

    // 3. Verificar permisos (solo participantes pueden eliminar)
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId },
    })

    if (!connection) {
      return { success: false, error: 'Conexión no encontrada' }
    }

    const isParticipant =
      connection.requesterId === currentUser.id ||
      connection.receiverId === currentUser.id

    if (!isParticipant) {
      return { success: false, error: 'No autorizado' }
    }

    // 4. Eliminar
    await prisma.connection.delete({
      where: { id: connectionId },
    })

    // 5. Revalidar
    revalidatePath('/dashboard/conexiones')
    revalidatePath('/networking')

    return {
      success: true,
      message: 'Conexión eliminada',
    }
  } catch (error) {
    console.error('Error en removeConnection:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar conexión',
    }
  }
}

// ========================================
// SERVER ACTION: Obtener conexiones del usuario
// ========================================

export async function getUserConnections() {
  try {
    const currentUser = await getAuthenticatedUser()

    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { requesterId: currentUser.id },
          { receiverId: currentUser.id },
        ],
        status: 'accepted',
      },
      include: {
        User_Connection_requesterIdToUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            profession: true,
            company: true,
            commune: true,
          },
        },
        User_Connection_receiverIdToUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            profession: true,
            company: true,
            commune: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Normalizar: siempre retornar el otro usuario como "connection"
    const normalizedConnections = connections.map((conn) => {
      const isRequester = conn.requesterId === currentUser.id
      return {
        id: conn.id,
        connection: isRequester ? conn.User_Connection_receiverIdToUser : conn.User_Connection_requesterIdToUser,
        createdAt: conn.createdAt,
      }
    })

    return {
      success: true,
      data: normalizedConnections,
    }
  } catch (error) {
    console.error('Error en getUserConnections:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener conexiones',
      data: [],
    }
  }
}

// ========================================
// SERVER ACTION: Obtener solicitudes pendientes
// ========================================

export async function getPendingRequests() {
  try {
    const currentUser = await getAuthenticatedUser()

    const pendingRequests = await prisma.connection.findMany({
      where: {
        receiverId: currentUser.id,
        status: 'pending',
      },
      include: {
        User_Connection_requesterIdToUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            profession: true,
            company: true,
            bio: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return {
      success: true,
      data: pendingRequests,
    }
  } catch (error) {
    console.error('Error en getPendingRequests:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener solicitudes',
      data: [],
    }
  }
}
