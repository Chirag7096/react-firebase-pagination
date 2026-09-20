import { addDoc, collection, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'
import type { Product } from './types'

export const PRODUCTS_COLLECTION = 'products'

export async function createProduct(
  values: Omit<Product, 'createdAt'>,
): Promise<void> {
  await addDoc(collection(db, PRODUCTS_COLLECTION), {
    ...values,
    createdAt: serverTimestamp(),
  })
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, PRODUCTS_COLLECTION, id))
}
