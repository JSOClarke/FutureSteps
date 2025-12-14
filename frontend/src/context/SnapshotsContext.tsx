import { createContext, useContext, useState, useEffect } from 'react'
import type { FinancialSnapshot, DashboardItem } from '../types'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'

interface SnapshotsContextType {
    snapshots: FinancialSnapshot[]
    saveSnapshot: (data: Omit<FinancialSnapshot, 'id' | 'user_id' | 'created_at'>, items: DashboardItem[]) => Promise<void>
    deleteSnapshot: (id: string) => Promise<void>
    loading: boolean
    error: string | null
}

const SnapshotsContext = createContext<SnapshotsContextType | undefined>(undefined)

export function SnapshotsProvider({ children }: { children: React.ReactNode }) {
    const [snapshots, setSnapshots] = useState<FinancialSnapshot[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { user } = useAuth()

    // Fetch snapshots when user changes
    useEffect(() => {
        const fetchSnapshots = async () => {
            if (!user) {
                setSnapshots([])
                setLoading(false)
                return
            }

            setLoading(true)
            setError(null)

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
            throw new Error('Must be logged in to save snapshots')
        }

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
            throw new Error('Must be logged in to delete snapshots')
        }

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

    return (
        <SnapshotsContext.Provider value={{ snapshots, saveSnapshot, deleteSnapshot, loading, error }}>
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
