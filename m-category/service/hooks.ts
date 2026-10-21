'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { formatISO } from 'date-fns'
import { sortBy } from 'lodash'
import { useMemo } from 'react'
import { useLocalStorage } from 'usehooks-ts'

import type { CategoryId, CategoryOverride, CategoryRule, CategoryRuleDraft, CategoryRuleset } from '@/types'
import { MISC } from '@/common'
import { DEFAULT_TEMPLATE_ID, getTemplate, TEMPLATES } from '@/utils/Category'
import { i18n } from '@/lib/i18n'

import {
  copyRulesetOverrides,
  getCategoryOverrides,
  getCategoryRuleset,
  getCategoryRulesets,
  getCategoryStoreSize,
  getStoredCategoryRules,
  putCategoryRule,
  putCategoryRuleset,
  removeAllCategoryData,
  removeCategoryOverride,
  removeCategoryRule,
  removeCategoryRuleset,
  removeRulesetOverrides,
  setCategoryOverride,
  syncCategoryRule,
  syncCategoryRuleset,
} from '../api'
import { createCategoryEngine } from './engine'
import { categoryKey } from './keys'
import type { RulesetUpdate } from './ruleset'
import { createRuleset, getNextNumber, setRuleMapping } from './ruleset'

const NO_RULESETS: CategoryRuleset[] = []
const NO_OVERRIDES: CategoryOverride[] = []
const NO_RULES: CategoryRule[] = []

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

/**
 * The user's rules, their library shared by all rule sets, oldest first.
 */
export const useCategoryRules = () => {
  return useQuery({
    queryKey: categoryKey.rules,
    queryFn: async () => {
      return sortBy((await getStoredCategoryRules()).map(syncCategoryRule), 'number')
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
  const { data: rules = NO_RULES, isLoading: isLoadingRules } = useCategoryRules()
  const { data: overrides = NO_OVERRIDES, isLoading: isLoadingOverrides } = useCategoryOverrides()
  const engine = useMemo(
    () =>
      createCategoryEngine({
        ruleset,
        rules,
        overrides: isDemoMode ? NO_OVERRIDES : overrides,
        usePresets: isDemoMode,
      }),
    [isDemoMode, ruleset, rules, overrides],
  )

  return { engine, ruleset, isLoading: isLoadingRulesets || isLoadingRules || isLoadingOverrides }
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
      const added = await putCategoryRuleset(ruleset)
      // The categories set for single transactions belong to the rule set, the copy keeps them
      if (copyOfId) {
        await copyRulesetOverrides(copyOfId, added.id)
      }
      return added
    },
    onSettled,
  })
}

export const useMutateRemoveRuleset = () => {
  const onSettled = useInvalidateCategories()

  return useMutation({
    mutationFn: async (id: string) => {
      await removeRulesetOverrides(id)
      await removeCategoryRuleset(id)
    },
    onSettled,
  })
}

type AddCategoryRuleProps = {
  rule: CategoryRuleDraft
  /**
   * Maps the new rule to the category in this rule set.
   */
  rulesetId: string
  category: CategoryId
}

/**
 * Adds a rule to the user's library and maps it in the rule set.
 */
export const useMutateAddCategoryRule = () => {
  const onSettled = useInvalidateCategories()

  return useMutation({
    mutationFn: async ({ rule, rulesetId, category }: AddCategoryRuleProps) => {
      const added = await putCategoryRule({
        ...rule,
        id: crypto.randomUUID(),
        number: getNextNumber(await getStoredCategoryRules()),
      })
      const ruleset = await getCategoryRuleset(rulesetId)
      await putCategoryRuleset({
        ...setRuleMapping({ ruleId: added.id, category })(ruleset),
        modified: formatISO(new Date()),
      })
      return added
    },
    onSettled,
  })
}

type UpdateCategoryRuleProps = {
  rule: CategoryRule
}

/**
 * Changes one of the user's rules, in all rule sets using it.
 */
export const useMutateUpdateCategoryRule = () => {
  const onSettled = useInvalidateCategories()

  return useMutation({
    mutationFn: ({ rule }: UpdateCategoryRuleProps) => {
      return putCategoryRule(rule)
    },
    onSettled,
  })
}

/**
 * Deletes one of the user's rules, from their library and all rule sets.
 */
export const useMutateRemoveCategoryRule = () => {
  const onSettled = useInvalidateCategories()

  return useMutation({
    mutationFn: async (ruleId: string) => {
      const rulesets = await getCategoryRulesets()
      await Promise.all(
        rulesets
          .filter((ruleset) => ruleId in ruleset.rules)
          .map((ruleset) =>
            putCategoryRuleset({
              ...setRuleMapping({ ruleId, category: undefined })(syncCategoryRuleset(ruleset)),
              modified: formatISO(new Date()),
            }),
          ),
      )
      await removeCategoryRule(ruleId)
    },
    onSettled,
  })
}

type SetCategoryOverrideProps = {
  rulesetId: string
  transactionId: string
  category: CategoryId
}

export const useMutateSetCategoryOverride = () => {
  const onSettled = useInvalidateCategories()

  return useMutation({
    mutationFn: ({ rulesetId, transactionId, category }: SetCategoryOverrideProps) => {
      return setCategoryOverride(rulesetId, transactionId, category)
    },
    onSettled,
  })
}

export const useMutateRemoveCategoryOverride = () => {
  const onSettled = useInvalidateCategories()

  return useMutation({
    mutationFn: ({ rulesetId, transactionId }: { rulesetId: string; transactionId: string }) => {
      return removeCategoryOverride(rulesetId, transactionId)
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
