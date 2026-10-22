export const ROUTES = {
  HOME: '/',
  STATS: '/stats',
  RULESETS: '/rule-sets',
  LIBRARY: '/library',
  SETTINGS: '/settings',
  ABOUT: '/about',
}

type SearchParams = { get: (name: string) => string | null; toString: () => string }

const VIEW_PARAM = 'view'

const TAG_PARAM = 'tag'

const KEYWORD_PARAM = 'keyword'

const RULE_PARAM = 'rule'

/**
 * The library page showing a tag (e.g. 'transfer'), a library keyword (e.g. 'de.rewe') or one of the user's rules (by ID).
 */
export const getLibraryHref = ({ tag, keyword, rule }: { tag?: string; keyword?: string; rule?: string }) => {
  const params = new URLSearchParams()
  Object.entries({ [TAG_PARAM]: tag, [KEYWORD_PARAM]: keyword, [RULE_PARAM]: rule }).forEach(([name, value]) => {
    if (value) {
      params.set(name, value)
    }
  })
  const query = params.toString()
  return query ? `${ROUTES.LIBRARY}?${query}` : ROUTES.LIBRARY
}

/**
 * The tag, library keyword or rule the library page shows, see `getLibraryHref`.
 */
export const getLibraryTarget = (searchParams: SearchParams) => {
  return {
    tag: searchParams.get(TAG_PARAM),
    keyword: searchParams.get(KEYWORD_PARAM),
    rule: searchParams.get(RULE_PARAM),
  }
}

const DEMO_PARAM = 'demo'

const SETUP_PARAM = 'setup'

/**
 * View of the middle column, `transactions` when the URL has none (or an unknown one).
 */
export const WorkspaceView = {
  CSV: 'csv',
  TRANSACTIONS: 'transactions',
  STATS: 'stats',
  BREAKDOWN: 'breakdown',
} as const

export type WorkspaceView = (typeof WorkspaceView)[keyof typeof WorkspaceView]

export const getView = (searchParams: SearchParams): WorkspaceView => {
  const view = searchParams.get(VIEW_PARAM)
  return Object.values(WorkspaceView).find((value) => value === view) ?? WorkspaceView.TRANSACTIONS
}

/**
 * ID of the unsupported file whose format is being set up in the middle column, see `ParserSetup`.
 */
export const getSetupFileId = (searchParams: SearchParams) => {
  return searchParams.get(SETUP_PARAM)
}

export const getSetupChange = (fileId: string | null) => {
  return { [SETUP_PARAM]: fileId }
}

export const isDemo = (searchParams: SearchParams) => {
  return searchParams.get(DEMO_PARAM) === 'true'
}

/**
 * URL of the workspace with the current params changed, `null` removes a param. Keeps the others, e.g. the view
 * when ending the demo.
 */
export const getWorkspaceHref = (searchParams: SearchParams, changes: Record<string, string | null>) => {
  const next = new URLSearchParams(searchParams.toString())

  Object.entries(changes).forEach(([name, value]) => (value === null ? next.delete(name) : next.set(name, value)))

  const query = next.toString()
  return query ? `${ROUTES.STATS}?${query}` : ROUTES.STATS
}

/**
 * The default view has no param, so the plain route stays clean.
 */
export const getViewChange = (view: WorkspaceView) => {
  return { [VIEW_PARAM]: view === WorkspaceView.TRANSACTIONS ? null : view }
}

type GetDemoHrefProps = {
  searchParams?: SearchParams
  view?: WorkspaceView
}

/**
 * The workspace URL in demo mode, keeping the current params (if any) and optionally switching to `view`.
 */
export const getDemoHref = ({ searchParams = new URLSearchParams(), view }: GetDemoHrefProps = {}) => {
  return getWorkspaceHref(searchParams, { [DEMO_PARAM]: 'true', ...(view ? getViewChange(view) : {}) })
}

/**
 * The current workspace URL without demo mode, keeping the view.
 */
export const getEndDemoHref = (searchParams: SearchParams) => {
  return getWorkspaceHref(searchParams, { [DEMO_PARAM]: null })
}
