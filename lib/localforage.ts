import localforage from 'localforage'

const baseConfig = {
  name: 'fstats',
  driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
}

let filesStore: LocalForage | null = null
let userStore: LocalForage | null = null
let customParsersStore: LocalForage | null = null
let categoryRulesetsStore: LocalForage | null = null
let categoryOverridesStore: LocalForage | null = null
let categoryRulesStore: LocalForage | null = null

export const initStorage = () => {
  filesStore = localforage.createInstance({
    ...baseConfig,
    storeName: 'fstats__files',
    description: 'Uploaded files store',
  })

  userStore = localforage.createInstance({
    ...baseConfig,
    storeName: 'fstats__user',
    description: 'User store',
  })

  customParsersStore = localforage.createInstance({
    ...baseConfig,
    storeName: 'fstats__custom_parsers',
    description: 'Custom parsers store',
  })

  categoryRulesetsStore = localforage.createInstance({
    ...baseConfig,
    storeName: 'fstats__category_rulesets',
    description: 'Category rule sets store',
  })

  categoryOverridesStore = localforage.createInstance({
    ...baseConfig,
    storeName: 'fstats__category_overrides',
    description: 'Category overrides store',
  })

  categoryRulesStore = localforage.createInstance({
    ...baseConfig,
    storeName: 'fstats__category_rules',
    description: 'Category rules store (the user library)',
  })
}

/**
 * Approximate size of a store (UTF-8 bytes of each serialised record).
 */
export const getStoreSize = async (store: LocalForage): Promise<number> => {
  let totalSize = 0
  await store.iterate((value) => {
    totalSize += new Blob([JSON.stringify(value)]).size
  })
  return totalSize
}

export const db = {
  get filesStore() {
    if (!filesStore) {
      throw new Error('DB not initialised! Call initStorage() first.')
    }
    return filesStore
  },
  get userStore() {
    if (!userStore) {
      throw new Error('DB not initialised! Call initStorage() first.')
    }
    return userStore
  },
  get customParsersStore() {
    if (!customParsersStore) {
      throw new Error('DB not initialised! Call initStorage() first.')
    }
    return customParsersStore
  },
  get categoryRulesetsStore() {
    if (!categoryRulesetsStore) {
      throw new Error('DB not initialised! Call initStorage() first.')
    }
    return categoryRulesetsStore
  },
  get categoryOverridesStore() {
    if (!categoryOverridesStore) {
      throw new Error('DB not initialised! Call initStorage() first.')
    }
    return categoryOverridesStore
  },
  get categoryRulesStore() {
    if (!categoryRulesStore) {
      throw new Error('DB not initialised! Call initStorage() first.')
    }
    return categoryRulesStore
  },
}
