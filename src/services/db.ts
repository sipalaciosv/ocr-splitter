import {
  collection, doc, getDoc, setDoc, serverTimestamp, onSnapshot, updateDoc, arrayUnion, arrayRemove,
  getDocs, 
 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export type GroupDoc = {
  title: string
  ownerUid: string
  createdAt: any
}
export type ItemDoc = {
  name: string
  price: number
  qty: number
  assignedUserIds: string[]
}
export type MemberDoc = {
  role: 'admin' | 'member'
  joinedAt: any
  displayName?: string | null
  email?: string | null
  photoURL?: string | null
}


export async function createGroup(
  groupId: string,
  title: string,
  owner: { uid: string; displayName: string | null; email: string | null; photoURL: string | null }
) {
  const gRef = doc(db, 'groups', groupId)
  const mRef = doc(db, 'groups', groupId, 'members', owner.uid)

  await setDoc(gRef, {
    title,
    ownerUid: owner.uid,
    createdAt: serverTimestamp(),
  } as GroupDoc)

  await setDoc(mRef, {
    role: 'admin',
    joinedAt: serverTimestamp(),
    displayName: owner.displayName ?? null,
    email: owner.email ?? null,
    photoURL: owner.photoURL ?? null,
  } as MemberDoc)

  return { groupId }
}



export async function joinGroup(
  groupId: string,
  uid: string,
  profile: { displayName: string | null; email: string | null; photoURL: string | null }
) {
  const ref = doc(db, 'groups', groupId, 'members', uid)

  await setDoc(
    ref,
    {
      role: 'member',
      displayName: profile.displayName ?? null,
      email: profile.email ?? null,
      photoURL: profile.photoURL ?? null,
      updatedAt: serverTimestamp(),
    },
    { merge: true } 
  )
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
export function subscribeMembers(
  groupId: string,
  cb: (rows: MemberRow[]) => void
) {
  const colRef = collection(db, 'groups', groupId, 'members')
  const off = onSnapshot(colRef, (snap) => {
    const rows: MemberRow[] = snap.docs.map((d) => {
      const x = d.data() as any
      return {
        uid: d.id,
        role: x.role,
        displayName: x.displayName ?? null,
        email: x.email ?? null,
        photoURL: x.photoURL ?? null,
      }
    })
    cb(rows)
  })
  return off
}

export async function isMember(groupId: string, uid: string) {
  if (!uid) return false
  try {
    const snap = await getDoc(doc(db, 'groups', groupId, 'members', uid))
    return snap.exists()
  } catch (e: any) {
    if (e?.code === 'permission-denied') {
      return false
    }
    throw e
  }
}


export async function isAdmin(groupId: string, uid: string) {
  const m = await getDoc(doc(db, 'groups', groupId, 'members', uid))
  return m.exists() && m.data()?.role === 'admin'
}
export function subscribeItems(groupId: string, cb: (items: (ItemDoc & { id: string })[]) => void) {
  const colRef = collection(db, 'groups', groupId, 'items')
  const off = onSnapshot(colRef, (snap) => {
    const rows = snap.docs.map(d => ({ id: d.id, ...(d.data() as ItemDoc) }))
    cb(rows)
  })
  return off
}
export async function seedItems(groupId: string, items: (ItemDoc & { id: string })[]) {
  for (const it of items) {
    await setDoc(doc(db, 'groups', groupId, 'items', it.id), {
      name: it.name, price: it.price, qty: it.qty,
      assignedUserIds: it.assignedUserIds ?? []
    })
  }
}
export async function setItemAssignments(groupId: string, itemId: string, assignedUserIds: string[]) {
  await updateDoc(doc(db, 'groups', groupId, 'items', itemId), { assignedUserIds })
}

export async function claimItem(groupId: string, itemId: string, uid: string) {
  try {
    await updateDoc(doc(db, 'groups', groupId, 'items', itemId), {
      assignedUserIds: arrayUnion(uid)
    })
  } catch (e: any) {
    console.error('claimItem failed', { groupId, itemId, uid, code: e?.code, msg: e?.message })
    throw e
  }
}
export async function unclaimItem(groupId: string, itemId: string, uid: string) {
  try {
    await updateDoc(doc(db, 'groups', groupId, 'items', itemId), {
      assignedUserIds: arrayRemove(uid)
    })
  } catch (e: any) {
    console.error('unclaimItem failed', { groupId, itemId, uid, code: e?.code, msg: e?.message })
    throw e
  }
}