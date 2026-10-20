import { describe, expect, it } from 'vitest'

import type { CategoryRuleset } from '@/types'
import { i18n } from '@/lib/i18n'

import { getCopyName } from '../actions'

const toRuleset = (name: string) => ({ name }) as CategoryRuleset

describe('getCopyName', () => {
  it('should number copies when the name is taken', () => {
    const t = i18n.getFixedT('en')

    expect(getCopyName({ name: 'Standard', rulesets: [toRuleset('Standard')], t })).toBe('Standard (copy)')
    expect(
      getCopyName({ name: 'Standard', rulesets: [toRuleset('Standard (copy)'), toRuleset('Standard (copy 2)')], t }),
    ).toBe('Standard (copy 3)')
  })
})
