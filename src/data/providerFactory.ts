import type { DataProvider } from './DataProvider'
import { ApiDataProvider } from './ApiDataProvider'
import { MockDataProvider } from './MockDataProvider'

/**
 * THE swap point. When VITE_USE_API=true, calendar comes from the backend;
 * all other widgets stay on mock until their subsystems ship.
 * Tests always use mock (zero latency, no network).
 */
const isTest = import.meta.env.MODE === 'test'
const mock = new MockDataProvider(isTest ? { latencyMs: 0 } : {})

const useApi = import.meta.env.VITE_USE_API === 'true' && !isTest
const apiBase = import.meta.env.VITE_API_BASE_URL ?? ''

export const provider: DataProvider = useApi
  ? new ApiDataProvider(apiBase, isTest ? { latencyMs: 0 } : {})
  : mock
