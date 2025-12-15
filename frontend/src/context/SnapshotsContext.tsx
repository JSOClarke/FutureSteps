import { createContext, useContext, useState, useEffect } from 'react'
import type { FinancialSnapshot, DashboardItem, SnapshotItem } from '../types'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'

interface SnapshotsContextType {
    snapshots: FinancialSnapshot[]
    saveSnapshot: (data: Omit<FinancialSnapshot, 'id' | 'user_id' | 'created_at'>, items: DashboardItem[]) => Promise<void>
    deleteSnapshot: (id: string) => Promise<void>
    getSnapshotItems: (snapshotId: string) => Promise<SnapshotItem[]>
    loading: boolean
    error: string | null
}

const SnapshotsContext = createContext<SnapshotsContextType | undefined>(undefined)

const GUEST_SNAPSHOTS_KEY = 'guest_snapshots'
const GUEST_SNAPSHOT_ITEMS_KEY = 'guest_snapshot_items'

export function SnapshotsProvider({ children }: { children: React.ReactNode }) {
    const [snapshots, setSnapshots] = useState<FinancialSnapshot[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { user } = useAuth()

    // Fetch snapshots when user changes
    useEffect(() => {
        const fetchSnapshots = async () => {
            setLoading(true)
            setError(null)

            if (!user) {
                // Guest mode: Load from local storage
                try {
                    const storedSnapshots = localStorage.getItem(GUEST_SNAPSHOTS_KEY)
                    if (storedSnapshots) {
                        setSnapshots(JSON.parse(storedSnapshots))
                    } else {
                        setSnapshots([])
                    }
                } catch (err) {
                    console.error('Error loading guest snapshots:', err)
                    setError('Failed to load local snapshots')
                }
                setLoading(false)
                return
            }

            // Authenticated mode: Load from Supabase
            const { data, error: fetchError } = await supabase
                .from('financial_snapshots')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (fetchError) {
                console.error('Error fetching snapshots:', fetchError)
                setError(fetchError.message)
            } else {
                setSnapshots(data || [])
            }

            setLoading(false)
        }

        fetchSnapshots()
    }, [user])

    const saveSnapshot = async (data: Omit<FinancialSnapshot, 'id' | 'user_id' | 'created_at'>, items: DashboardItem[]) => {
        if (!user) {
            // Guest mode: Save to local storage
            try {
                const newSnapshotId = crypto.randomUUID()
                const now = new Date().toISOString()

                const newSnapshot: FinancialSnapshot = {
                    id: newSnapshotId,
                    user_id: 'guest',
                    created_at: now,
                    ...data
                }

                // Save items
                const newItems: SnapshotItem[] = items.map(item => ({
                    id: crypto.randomUUID(),
                    snapshot_id: newSnapshotId,
                    created_at: now,
                    name: item.name,
                    amount: item.amount,
                    category: item.category
                }))

                // Update Snapshots
                const currentSnapshots = [...snapshots]
                const updatedSnapshots = [newSnapshot, ...currentSnapshots]
                localStorage.setItem(GUEST_SNAPSHOTS_KEY, JSON.stringify(updatedSnapshots))
                setSnapshots(updatedSnapshots)

                // Update Items
                const storedItems = localStorage.getItem(GUEST_SNAPSHOT_ITEMS_KEY)
                const currentItems: SnapshotItem[] = storedItems ? JSON.parse(storedItems) : []
                const updatedItems = [...currentItems, ...newItems]
                localStorage.setItem(GUEST_SNAPSHOT_ITEMS_KEY, JSON.stringify(updatedItems))

                return
            } catch (err) {
                console.error('Error saving guest snapshot:', err)
                throw new Error('Failed to save snapshot locally')
            }
        }

        // Authenticated mode: Save to Supabase
        // Insert snapshot and get the ID back
        const { data: snapshotData, error: insertError } = await supabase
            .from('financial_snapshots')
            .insert({
                user_id: user.id,
                ...data
            })
            .select()
            .single()

        if (insertError || !snapshotData) {
            console.error('Error saving snapshot:', insertError)
            throw new Error(`Failed to save snapshot: ${insertError?.message || 'Unknown error'}`)
        }

        // Save all items with the snapshot_id
        if (items.length > 0) {
            const snapshotItems = items.map(item => ({
                snapshot_id: snapshotData.id,
                name: item.name,
                amount: item.amount,
                category: item.category
            }))

            const { error: itemsError } = await supabase
                .from('snapshot_items')
                .insert(snapshotItems)

            if (itemsError) {
                console.error('Error saving snapshot items:', itemsError)
                // Snapshot is saved but items failed - could rollback or continue
                throw new Error(`Failed to save snapshot items: ${itemsError.message}`)
            }
        }

        // Refresh snapshots
        const { data: refreshedData } = await supabase
            .from('financial_snapshots')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        setSnapshots(refreshedData || [])
    }

    const deleteSnapshot = async (id: string) => {
        if (!user) {
            // Guest mode: Delete from local storage
            try {
                // Remove snapshot
                const updatedSnapshots = snapshots.filter(s => s.id !== id)
                localStorage.setItem(GUEST_SNAPSHOTS_KEY, JSON.stringify(updatedSnapshots))
                setSnapshots(updatedSnapshots)

                // Remove associated items to keep storage clean
                const storedItems = localStorage.getItem(GUEST_SNAPSHOT_ITEMS_KEY)
                if (storedItems) {
                    const currentItems: SnapshotItem[] = JSON.parse(storedItems)
                    const updatedItems = currentItems.filter(item => item.snapshot_id !== id)
                    localStorage.setItem(GUEST_SNAPSHOT_ITEMS_KEY, JSON.stringify(updatedItems))
                }
                return
            } catch (err) {
                console.error('Error deleting guest snapshot:', err)
                throw new Error('Failed to delete snapshot locally')
            }
        }

        // Authenticated mode: Delete from Supabase
        const { error: deleteError } = await supabase
            .from('financial_snapshots')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (deleteError) {
            console.error('Error deleting snapshot:', deleteError)
            throw new Error(`Failed to delete snapshot: ${deleteError.message}`)
        }

        // Update local state
        setSnapshots(snapshots.filter(s => s.id !== id))
    }

    const getSnapshotItems = async (snapshotId: string): Promise<SnapshotItem[]> => {
        if (!user) {
            // Guest mode: Get from local storage
            try {
                const storedItems = localStorage.getItem(GUEST_SNAPSHOT_ITEMS_KEY)
                if (!storedItems) return []
                const items: SnapshotItem[] = JSON.parse(storedItems)
                return items.filter(item => item.snapshot_id === snapshotId)
            } catch (err) {
                console.error('Error fetching guest items:', err)
                return []
            }
        }

        // Authenticated mode: Get from Supabase
        const { data, error } = await supabase
            .from('snapshot_items')
            .select('*')
            .eq('snapshot_id', snapshotId)

        if (error) {
            console.error('Error fetching snapshot items:', error)
            throw new Error(`Failed to fetch items: ${error.message}`)
        }

        return data || []
    }

    return (
        <SnapshotsContext.Provider value={{ snapshots, saveSnapshot, deleteSnapshot, getSnapshotItems, loading, error }}>
            {children}
        </SnapshotsContext.Provider>
    )
}

export function useSnapshots() {
    const context = useContext(SnapshotsContext)
    if (context === undefined) {
        throw new Error('useSnapshots must be used within a SnapshotsProvider')
    }
    return context
}
