import type { DataProvider } from './DataProvider'
import { MockDataProvider } from './MockDataProvider'

/**
 * THE swap point. Backend day: return new ApiDataProvider(...) here.
 * Zero-latency in tests so widget tests stay fast and deterministic.
 */
// Mock-only branch; drop this once ApiDataProvider lands.
const isTest = import.meta.env.MODE === 'test'

export const provider: DataProvider = new MockDataProvider(isTest ? { latencyMs: 0 } : {})
