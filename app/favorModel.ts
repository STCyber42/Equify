export type FavorStatus = 'pending' | 'completed' | 'cancelled';

export interface Favor {
  id: string;
  contactName: string;
  contactId?: string; // opsional, jika sinkron dengan kontak perangkat
  description: string;
  date: string; // ISO string
  proofImage?: string; // path atau URI gambar
  status: FavorStatus;
} 