'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { formatISO } from 'date-fns'
import { sortBy } from 'lodash'
import { useMemo } from 'react'
import { useLocalStorage } from 'usehooks-ts'

import type { CategoryCode, CategoryOverride, CategoryRuleDraft, CategoryRuleset } from '@/types'
import { MISC } from '@/common'
import { DEFAULT_TEMPLATE_ID, getTemplate, TEMPLATES } from '@/utils/Category'
import { i18n } from '@/lib/i18n'

import {
  getCategoryOverrides,
  getCategoryRuleset,
  getCategoryRulesets,
  getCategoryStoreSize,
  putCategoryRuleset,
  removeAllCategoryData,
  removeCategoryOverride,
  removeCategoryRuleset,
  setCategoryOverride,
  syncCategoryRuleset,
} from '../api'
import { createCategoryEngine } from './engine'
import { categoryKey } from './keys'
import type { RulesetUpdate } from './ruleset'
import { addRule, createRuleset, getNextNumber, removeRule } from './ruleset'

const NO_RULESETS: CategoryRuleset[] = []
const NO_OVERRIDES: CategoryOverride[] = []

/**
 * Like `useLocalStorage`, which is notified by the event.
 */
const writeLocalStorage = (key: string, value: unknown) => {
  window.localStorage.setItem(key, JSON.stringify(value))
  window.dispatchEvent(new StorageEvent('local-storage', { key }))
}

/**
 * The stored rule sets. New users get one per template, the standard one active. All can be deleted, transactions are
 * then uncategorised.
 */
const loadCategoryRulesets = async () => {
  const rulesets = await getCategoryRulesets()

  if (rulesets.length || window.localStorage.getItem(MISC.LS_CATEGORY_RULESETS_CREATED_KEY)) {
    return sortBy(rulesets.map(syncCategoryRuleset), 'number')
  }

  const now = formatISO(new Date())
  const created = await Promise.all(
    TEMPLATES.map((template, index) =>
      putCategoryRuleset(
        createRuleset({ name: i18n.t(`RULESETS_PAGE.TEMPLATES.${template.id}`), number: index + 1, now, template }),
      ),
    ),
  )
  const active = created[TEMPLATES.findIndex((template) => template.id === DEFAULT_TEMPLATE_ID)]
  writeLocalStorage(MISC.LS_CATEGORY_ACTIVE_RULESET_KEY, active.id)
  writeLocalStorage(MISC.LS_CATEGORY_RULESETS_CREATED_KEY, true)
  return created
}

export const useCategoryRulesets = () => {
  return useQuery({
    queryKey: categoryKey.rulesets,
    queryFn: () => {
      return loadCategoryRulesets()
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
 * The rule set deciding the categories, the first one when the stored one was removed.
 */
export const useActiveRuleset = () => {
  const [storedId, setActiveId] = useLocalStorage<string | null>(MISC.LS_CATEGORY_ACTIVE_RULESET_KEY, null, {
    initializeWithValue: false,
  })
  const { data: rulesets = NO_RULESETS, isLoading } = useCategoryRulesets()
  const ruleset = rulesets.find((other) => other.id === storedId) ?? rulesets.at(0) ?? null

  return { ruleset, rulesets, setActiveId, isLoading }
}

type UseCategoryEngineProps = {
  /**
   * The demo transactions keep their categories the active rule set has (all with the standard one), the rules
   * categorise the others. Its transactions have no overrides, it's read-only.
   */
  isDemoMode?: boolean
}

/**
 * Decides the categories of all transactions, a new one whenever the active rule set, its rules or the overrides
 * change.
 */
export const useCategoryEngine = ({ isDemoMode = false }: UseCategoryEngineProps = {}) => {
  const { ruleset, isLoading: isLoadingRulesets } = useActiveRuleset()
  const { data: overrides = NO_OVERRIDES, isLoading: isLoadingOverrides } = useCategoryOverrides()
  const engine = useMemo(
    () => createCategoryEngine({ ruleset, overrides: isDemoMode ? NO_OVERRIDES : overrides, usePresets: isDemoMode }),
    [isDemoMode, ruleset, overrides],
  )

  return { engine, ruleset, isLoading: isLoadingRulesets || isLoadingOverrides }
}

const useInvalidateCategories = () => {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: categoryKey.all })
}

type UpdateRulesetProps = {
  rulesetId: string
  update: RulesetUpdate
}

/**
 * Changes the stored rule set, see the changes in `ruleset.ts`.
 */
export const useMutateUpdateRuleset = () => {
  const onSettled = useInvalidateCategories()

  return useMutation({
    mutationFn: async ({ rulesetId, update }: UpdateRulesetProps) => {
      const ruleset = await getCategoryRuleset(rulesetId)
      return putCategoryRuleset({ ...update(ruleset), modified: formatISO(new Date()) })
    },
    onSettled,
  })
}

type AddRulesetProps = {
  name: string
  /**
   * Its categories and rules are copied, otherwise those of `copyOfId`, empty without either.
   */
  templateId?: string
  copyOfId?: string
}

export const useMutateAddRuleset = () => {
  const onSettled = useInvalidateCategories()

  return useMutation({
    mutationFn: async ({ name, templateId, copyOfId }: AddRulesetProps) => {
      const rulesets = await loadCategoryRulesets()
      const ruleset = createRuleset({
        name,
        number: getNextNumber(rulesets),
        now: formatISO(new Date()),
        template: templateId ? getTemplate(templateId) : undefined,
        copyOf: rulesets.find((other) => other.id === copyOfId),
      })
      return putCategoryRuleset(ruleset)
    },
    onSettled,
  })
}

export const useMutateRemoveRuleset = () => {
  const onSettled = useInvalidateCategories()

  return useMutation({
    mutationFn: (id: string) => {
      return removeCategoryRuleset(id)
    },
    onSettled,
  })
}

type AddCategoryRuleProps = {
  rulesetId: string
  rule: CategoryRuleDraft
}

export const useMutateAddCategoryRule = () => {
  const { mutateAsync, ...mutation } = useMutateUpdateRuleset()
  return {
    ...mutation,
    mutateAsync: ({ rulesetId, rule }: AddCategoryRuleProps) => mutateAsync({ rulesetId, update: addRule(rule) }),
  }
}

type RemoveCategoryRuleProps = {
  rulesetId: string
  ruleId: string
}

export const useMutateRemoveCategoryRule = () => {
  const { mutateAsync, ...mutation } = useMutateUpdateRuleset()
  return {
    ...mutation,
    mutateAsync: ({ rulesetId, ruleId }: RemoveCategoryRuleProps) =>
      mutateAsync({ rulesetId, update: removeRule(ruleId) }),
  }
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
