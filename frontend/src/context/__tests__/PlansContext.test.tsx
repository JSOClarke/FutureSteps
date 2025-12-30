import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PlansProvider, usePlans } from '../PlansContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as api from '../../api/plans'

// Mock the API layer
vi.mock('../../api/plans', () => ({
    fetchPlans: vi.fn(),
    createPlan: vi.fn(),
    updatePlan: vi.fn(),
    deletePlan: vi.fn()
}))

// Mock AuthContext
const mockUser = { id: 'test-user-id', email: 'test@example.com' }
vi.mock('../AuthContext', () => ({
    useAuth: () => ({
        user: mockUser,
        loading: false
    })
}))

// Wrapper for React Query
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false }
        }
    })
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <PlansProvider>{children}</PlansProvider>
        </QueryClientProvider>
    )
}

describe('PlansContext Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should fetch plans on mount', async () => {
        const mockPlans = [{ id: 'p1', name: 'Test Plan' }]
        vi.mocked(api.fetchPlans).mockResolvedValue(mockPlans as any)

        const { result } = renderHook(() => usePlans(), { wrapper: createWrapper() })

        await waitFor(() => expect(result.current.plans).toHaveLength(1))
        expect(result.current.plans[0].name).toBe('Test Plan')
    })

    it('should add a new plan', async () => {
        const mockPlans = [{ id: 'p1', name: 'Existing Plan' }]
        vi.mocked(api.fetchPlans).mockResolvedValue(mockPlans as any)

        const newPlan = { id: 'new-id', name: 'New Savings Plan' }
        vi.mocked(api.createPlan).mockResolvedValue(newPlan as any)

        const { result } = renderHook(() => usePlans(), { wrapper: createWrapper() })

        await waitFor(() => expect(result.current.plans).toHaveLength(1))

        await act(async () => {
            await result.current.createPlan('New Savings Plan')
        })

        expect(api.createPlan).toHaveBeenCalledWith(expect.any(Object), { name: 'New Savings Plan', description: undefined })
    })

    it('should update a plan', async () => {
        const mockPlans = [{ id: 'p1', name: 'Test Plan' }]
        vi.mocked(api.fetchPlans).mockResolvedValue(mockPlans as any)
        vi.mocked(api.updatePlan).mockResolvedValue()

        const { result } = renderHook(() => usePlans(), { wrapper: createWrapper() })

        await waitFor(() => expect(result.current.plans).toHaveLength(1))

        await act(async () => {
            await result.current.updatePlan('p1', { name: 'Updated Plan' })
        })

        expect(api.updatePlan).toHaveBeenCalledWith(expect.any(Object), 'p1', { name: 'Updated Plan' })
    })

    it('should delete a plan', async () => {
        const mockPlans = [{ id: 'p1', name: 'Test Plan' }]
        vi.mocked(api.fetchPlans).mockResolvedValue(mockPlans as any)
        vi.mocked(api.deletePlan).mockResolvedValue()

        const { result } = renderHook(() => usePlans(), { wrapper: createWrapper() })

        await waitFor(() => expect(result.current.plans).toHaveLength(1))

        await act(async () => {
            await result.current.deletePlan('p1')
        })

        expect(api.deletePlan).toHaveBeenCalledWith(expect.any(Object), 'p1')
    })
})
