import {
  collection, doc, getDoc, setDoc, serverTimestamp,
  getDocs,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export type GroupDoc = {
  title: string
  ownerUid: string
  createdAt: any
}

export type MemberDoc = {
  role: 'admin' | 'member'
  joinedAt: any
}

// Crea grupo + membership admin en la misma operación (2 escrituras)
export async function createGroup(groupId: string, title: string, ownerUid: string) {
  const gRef = doc(db, 'groups', groupId)
  const mRef = doc(db, 'groups', groupId, 'members', ownerUid)

  await setDoc(gRef, {
    title, ownerUid, createdAt: serverTimestamp(),
  } as GroupDoc)

  await setDoc(mRef, {
    role: 'admin', joinedAt: serverTimestamp(),
  } as MemberDoc)

  return { groupId }
}

// Agregar miembro como 'member'
export async function joinGroup(groupId: string, uid: string, profile?: { displayName?: string|null; email?: string|null; photoURL?: string|null }) {
  const mRef = doc(db, 'groups', groupId, 'members', uid)
  await setDoc(mRef, {
    role: 'member',
    joinedAt: serverTimestamp(),
    displayName: profile?.displayName ?? null,
    email: profile?.email ?? null,
    photoURL: profile?.photoURL ?? null,
  } as any, { merge: true })
}
export type MemberRow = {
  uid: string
  role: 'admin' | 'member'
  displayName?: string | null
  email?: string | null
  photoURL?: string | null
}

export async function listMembers(groupId: string): Promise<MemberRow[]> {
  const snap = await getDocs(collection(db, 'groups', groupId, 'members'))
  return snap.docs.map(d => {
    const x = d.data() as any
    return {
      uid: d.id,
      role: x.role,
      displayName: x.displayName ?? null,
      email: x.email ?? null,
      photoURL: x.photoURL ?? null,
    }
  })
}
export async function isMember(groupId: string, uid: string) {
  if (!uid) return false
  const snap = await getDoc(doc(db, 'groups', groupId, 'members', uid))
  return snap.exists()
}

export async function isAdmin(groupId: string, uid: string) {
  const m = await getDoc(doc(db, 'groups', groupId, 'members', uid))
  return m.exists() && m.data()?.role === 'admin'
}
