export function rowsOf<T = any>(response: unknown): T[] {
  if (Array.isArray(response)) return response as T[]
  if (response && typeof response === 'object') {
    const data = (response as { data?: unknown }).data
    if (Array.isArray(data)) return data as T[]
  }
  return []
}

export interface AdminPaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export function metaOf(response: unknown): AdminPaginationMeta {
  const fallback: AdminPaginationMeta = { total: 0, page: 1, limit: 20, totalPages: 1 }
  if (!response || typeof response !== 'object') return fallback

  const meta = (response as { meta?: Partial<AdminPaginationMeta> }).meta
  if (!meta) {
    const data = (response as { data?: unknown }).data
    const total = Array.isArray(data) ? data.length : 0
    return { total, page: 1, limit: Math.max(total, 1), totalPages: 1 }
  }

  return {
    total: Number(meta.total ?? 0),
    page: Number(meta.page ?? 1),
    limit: Number(meta.limit ?? 20),
    totalPages: Number(meta.totalPages ?? 1),
  }
}
