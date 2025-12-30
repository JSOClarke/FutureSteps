```typescript
import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SnapshotsProvider, useSnapshots } from '../SnapshotsContext'
import type { DashboardItem } from '../../types'

// Mock AuthContext
vi.mock('../AuthContext', () => ({
    useAuth: vi.fn(() => ({
        user: { id: 'test-user-id', email: 'test@example.com' },
        loading: false
    }))
}))

// Mock Supabase
const mockInsert = vi.fn()
const mockFrom = vi.fn()

vi.mock('../../lib/supabase', () => ({
    supabase: {
        from: (table: string) => mockFrom(table)
    }
}))

describe('SnapshotsContext Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        const builder = {
            select: vi.fn(),
            eq: vi.fn(),
            order: vi.fn(),
            single: vi.fn(),
            insert: vi.fn(),
            delete: vi.fn()
        } as any

        // Wiring
        builder.select.mockReturnValue(builder)
        builder.eq.mockReturnValue(builder)
        
        mockFrom.mockReturnValue(builder)

        // Mock Insert Strategy
        builder.insert.mockImplementation((args: any) => {
            mockInsert(args)
            if (Array.isArray(args)) {
                return Promise.resolve({ data: [], error: null })
            } else {
                return builder
            }
        })

        // Terminals
        builder.order.mockResolvedValue({ data: [], error: null })
        builder.single.mockResolvedValue({ data: { id: 'new-snap-id' }, error: null })
    })

    it('should save snapshot and its items to Supabase', async () => {
        const { result } = renderHook(() => useSnapshots(), { wrapper: SnapshotsProvider })

        // Wait for initial fetch to complete (provider loads snapshots on mount)
        await waitFor(() => expect(result.current.loading).toBe(false))

        const dummyTotals = {
            total_income: 1000,
            total_expenses: 500,
            total_assets: 5000,
            total_liabilities: 0,
            net_worth: 5000,
            note: 'Test Snapshot'
        }
        const dummyItems: DashboardItem[] = [
            { id: '1', name: 'Salary', amount: 1000, category: 'income', subCategory: 'salary' }
        ]

        await act(async () => {
            await result.current.saveSnapshot(dummyTotals, dummyItems)
        })

        // Verify Snapshot Insert
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
            user_id: 'test-user-id',
            note: 'Test Snapshot',
            total_income: 1000
        }))

        // Verify Items Insert
        expect(mockInsert).toHaveBeenCalledWith(expect.arrayContaining([
            expect.objectContaining({
                snapshot_id: 'new-snap-id',
                name: 'Salary',
                amount: 1000,
                sub_category: 'salary'
            })
        ]))
    })
})
