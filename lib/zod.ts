import type { z } from 'zod'

/**
 * E.g. "sections.0.parserId: Invalid input, status: Invalid input"
 */
export const formatZodIssues = (error: z.ZodError): string => {
  return error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ')
}

type ParseOrThrowProps<T extends z.ZodType> = {
  schema: T
  data: unknown
  label: string
}

/**
 * Like `schema.parse()`, with a readable error message, e.g. "Cannot sync User: name: Invalid input"
 */
export const parseOrThrow = <T extends z.ZodType>({ schema, data, label }: ParseOrThrowProps<T>): z.output<T> => {
  const res = schema.safeParse(data)

  if (!res.success) {
    throw new Error(`${label}: ${formatZodIssues(res.error)}`)
  }

  return res.data
}
