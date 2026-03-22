import { auth } from '@/lib/firebase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/**
 * Obtener token de autenticación de Firebase
 */
async function getAuthToken(): Promise<string> {
    const user = auth.currentUser
    if (!user) {
        throw new Error('No estás autenticado')
    }
    return await user.getIdToken()
}

/**
 * Hacer request autenticado al backend
 */
async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = await getAuthToken()

    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}`)
    }

    return data
}

// ==================== GRUPOS ====================

export interface CreateGroupPayload {
    title: string
    items: Array<{
        id: string
        name: string
        price: number
        qty: number
    }>
    includeTip?: boolean
    tipPercentage?: number
}

export interface CreateGroupResponse {
    success: boolean
    groupId?: string
    error?: string
}

/**
 * Crear un nuevo grupo con items
 */
export async function createGroup(payload: CreateGroupPayload): Promise<CreateGroupResponse> {
    return fetchWithAuth(`${API_URL}/api/groups`, {
        method: 'POST',
        body: JSON.stringify(payload),
    })
}

/**
 * Obtener detalles de un grupo
 */
export async function getGroup(groupId: string) {
    return fetchWithAuth(`${API_URL}/api/groups/${groupId}`, {
        method: 'GET',
    })
}

/**
 * Actualizar un grupo
 */
export async function updateGroup(groupId: string, title: string) {
    return fetchWithAuth(`${API_URL}/api/groups/${groupId}`, {
        method: 'PUT',
        body: JSON.stringify({ title }),
    })
}

/**
 * Eliminar un grupo
 */
export async function deleteGroup(groupId: string) {
    return fetchWithAuth(`${API_URL}/api/groups/${groupId}`, {
        method: 'DELETE',
    })
}

// ==================== MIEMBROS ====================

/**
 * Obtener miembros de un grupo
 */
export async function getMembers(groupId: string) {
    return fetchWithAuth(`${API_URL}/api/groups/${groupId}/members`, {
        method: 'GET',
    })
}

/**
 * Unirse a un grupo
 */
export async function joinGroup(groupId: string) {
    return fetchWithAuth(`${API_URL}/api/groups/${groupId}/members`, {
        method: 'POST',
        body: JSON.stringify({}),
    })
}

/**
 * Remover un miembro
 */
export async function removeMember(groupId: string, uid: string) {
    return fetchWithAuth(`${API_URL}/api/groups/${groupId}/members/${uid}`, {
        method: 'DELETE',
    })
}

// ==================== ITEMS ====================

/**
 * Obtener items de un grupo
 */
export async function getItems(groupId: string) {
    return fetchWithAuth(`${API_URL}/api/groups/${groupId}/items`, {
        method: 'GET',
    })
}

/**
 * Asignar un item a usuarios (admin)
 */
export async function assignItem(groupId: string, itemId: string, assignedUserIds: string[]) {
    return fetchWithAuth(`${API_URL}/api/groups/${groupId}/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ assignedUserIds }),
    })
}

/**
 * Reclamar un item para uno mismo
 */
export async function claimItem(groupId: string, itemId: string) {
    return fetchWithAuth(`${API_URL}/api/groups/${groupId}/items/${itemId}/claim`, {
        method: 'POST',
    })
}

/**
 * Desasignar un item de uno mismo
 */
export async function unclaimItem(groupId: string, itemId: string) {
    return fetchWithAuth(`${API_URL}/api/groups/${groupId}/items/${itemId}/claim`, {
        method: 'DELETE',
    })
}
