import type { CustomParser } from '@/types'
import { zCustomParser } from '@/types'
import { parseOrThrow } from '@/lib/zod'

export const syncCustomParser = (dataToSync: CustomParser): CustomParser => {
  return parseOrThrow({ schema: zCustomParser, data: dataToSync, label: 'Cannot sync CustomParser' })
}
