'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { useLocalStorage } from 'usehooks-ts'

import type { CategoryCode, CategoryOverride, CategoryRuleset } from '@/types'
import { MISC } from '@/common'
import { DEFAULT_RULESET_ID, getBuiltInRuleset, MY_RULES_ID } from '@/utils/Category'

import {
  addCategoryRule,
  addCategoryRuleset,
  getCategoryOverrides,
  getCategoryRulesets,
  getCategoryStoreSize,
  removeAllCategoryData,
  removeCategoryOverride,
  removeCategoryRule,
  removeCategoryRuleset,
  setCategoryOverride,
} from '../api'
import { createCategoryEngine, getActiveRulesetIds, toCategoryRules } from './engine'
import { categoryKey } from './keys'

const NO_RULESETS: CategoryRuleset[] = []
const NO_OVERRIDES: CategoryOverride[] = []

export const useCategoryRulesets = () => {
  return useQuery({
    queryKey: categoryKey.rulesets,
    queryFn: () => {
      return getCategoryRulesets()
    },
  })
}

export const useCategoryOverrides = () => {
  return useQuery({
    queryKey: categoryKey.overrides,
    queryFn: () => {
      return getCategoryOverrides()
    },
  })
}

export const useCategoryStorageSize = () => {
  return useQuery({
    queryKey: categoryKey.storageSize,
    queryFn: () => {
      return getCategoryStoreSize()
    },
    // Invalidated while the settings page isn't shown (e.g. a rule added), refetched once it is
    refetchOnMount: true,
    retry: false,
  })
}

/**
 * Stored before rule sets could be combined: a single ID, `'none'` for none. "My rules" is stored separately.
 */
const toRulesetIds = (stored: string | string[]) => {
  const ids = typeof stored === 'string' ? (stored === 'none' ? [] : [stored]) : stored
  return ids.filter((id) => id !== MY_RULES_ID)
}

/**
 * The rule sets checked in the toolbar (built-in ones, "My rules" and the user's), in their order, without removed ones.
 * "My rules" is checked unless unchecked by the user. Overrides of single transactions always apply.
 */
export const useCheckedRulesets = () => {
  const [stored, setStored] = useLocalStorage<string | string[]>(MISC.LS_CATEGORY_RULESET_KEY, [DEFAULT_RULESET_ID], {
    initializeWithValue: false,
  })
  const [isMyRulesChecked, setIsMyRulesChecked] = useLocalStorage(MISC.LS_CATEGORY_MY_RULES_KEY, true, {
    initializeWithValue: false,
  })
  const { data: rulesets = NO_RULESETS } = useCategoryRulesets()
  // Memoized, the categories of all transactions are recomputed when it changes
  const rulesetIds = useMemo(
    () =>
      getActiveRulesetIds({
        rulesetIds: [...toRulesetIds(stored), ...(isMyRulesChecked ? [MY_RULES_ID] : [])],
        rulesets,
      }),
    [stored, isMyRulesChecked, rulesets],
  )

  const toggleRuleset = useCallback(
    (id: string) => {
      if (id === MY_RULES_ID) {
        setIsMyRulesChecked((prev) => !prev)
        return
      }

      setStored((prev) => {
        const ids = toRulesetIds(prev)
        return ids.includes(id) ? ids.filter((other) => other !== id) : [...ids, id]
      })
    },
    [setStored, setIsMyRulesChecked],
  )

  const checkRuleset = useCallback(
    (id: string) => {
      if (id === MY_RULES_ID) {
        setIsMyRulesChecked(true)
        return
      }

      setStored((prev) => (toRulesetIds(prev).includes(id) ? prev : [...toRulesetIds(prev), id]))
    },
    [setStored, setIsMyRulesChecked],
  )

  return { rulesetIds, toggleRuleset, checkRuleset }
}

/**
 * Decides the categories of all transactions, a new one whenever the rules, overrides or the checked rule sets change.
 */
export const useCategoryEngine = () => {
  const { rulesetIds } = useCheckedRulesets()
  const { data: rulesets = NO_RULESETS, isLoading: isLoadingRulesets } = useCategoryRulesets()
  const { data: overrides = NO_OVERRIDES, isLoading: isLoadingOverrides } = useCategoryOverrides()
  const engine = useMemo(
    () => createCategoryEngine({ rulesetIds, rulesets, overrides }),
    [rulesetIds, rulesets, overrides],
  )

  return { engine, isLoading: isLoadingRulesets || isLoadingOverrides }
}

const useInvalidateCategories = () => {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: categoryKey.all })
}

export const useMutateAddCategoryRule = () => {
  const onSettled = useInvalidateCategories()

  return useMutation({
    mutationFn: (props: Parameters<typeof addCategoryRule>[0]) => {
      return addCategoryRule(props)
    },
    onSettled,
  })
}

export const useMutateRemoveCategoryRule = () => {
  const onSettled = useInvalidateCategories()

  return useMutation({
    mutationFn: (props: Parameters<typeof removeCategoryRule>[0]) => {
      return removeCategoryRule(props)
    },
    onSettled,
  })
}

type AddCategoryRulesetProps = {
  name: string
  /**
   * Built-in rule set whose rules it starts with, otherwise empty.
   */
  copyFrom?: string
}

export const useMutateAddCategoryRuleset = () => {
  const onSettled = useInvalidateCategories()

  return useMutation({
    mutationFn: ({ name, copyFrom }: AddCategoryRulesetProps) => {
      const builtIn = copyFrom ? getBuiltInRuleset(copyFrom) : undefined
      return addCategoryRuleset({ name, rules: builtIn ? toCategoryRules(builtIn) : [] })
    },
    onSettled,
  })
}

export const useMutateRemoveCategoryRuleset = () => {
  const onSettled = useInvalidateCategories()

  return useMutation({
    mutationFn: (id: string) => {
      return removeCategoryRuleset(id)
    },
    onSettled,
  })
}

type SetCategoryOverrideProps = {
  transactionId: string
  category: CategoryCode
}

export const useMutateSetCategoryOverride = () => {
  const onSettled = useInvalidateCategories()

  return useMutation({
    mutationFn: ({ transactionId, category }: SetCategoryOverrideProps) => {
      return setCategoryOverride(transactionId, category)
    },
    onSettled,
  })
}

export const useMutateRemoveCategoryOverride = () => {
  const onSettled = useInvalidateCategories()

  return useMutation({
    mutationFn: (transactionId: string) => {
      return removeCategoryOverride(transactionId)
    },
    onSettled,
  })
}

export const useMutateRemoveAllCategoryData = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => {
      return removeAllCategoryData()
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: categoryKey.all })
    },
  })
}
