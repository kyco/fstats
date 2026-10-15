export const categoryKey = {
  all: ['categories'] as const,
  // Nested under `all`, so invalidating `all` covers them
  rulesets: ['categories', 'rulesets'] as const,
  overrides: ['categories', 'overrides'] as const,
  storageSize: ['categories', 'storage-size'] as const,
}
