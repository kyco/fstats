import type { User, UserAtRest } from '@/types'
import { zSyncableUser } from '@/types'
import { parseOrThrow } from '@/lib/zod'

export const syncUser = (dataToSync: User): UserAtRest => {
  return parseOrThrow({ schema: zSyncableUser, data: dataToSync, label: 'Cannot sync User' })
}
