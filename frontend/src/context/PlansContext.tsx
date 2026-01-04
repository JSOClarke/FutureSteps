import { createContext, useContext } from 'react'
import type { Plan } from '../types'
import { usePlansQuery } from '../hooks/usePlans'
import { useCreatePlan, useUpdatePlan, useDeletePlan, useDuplicatePlan } from '../hooks/usePlanMutations'

interface PlansContextType {
    plans: Plan[]
    getPlanById: (id: string) => Plan | null
    createPlan: (name: string, description?: string) => Promise<string>
    updatePlan: (id: string, updates: Partial<Plan>) => Promise<void>
    deletePlan: (id: string) => Promise<void>
    renamePlan: (id: string, newName: string) => Promise<void>
    duplicatePlan: (sourcePlanId: string, name: string, description?: string) => Promise<string>
    loading: boolean
    error: any
}

const PlansContext = createContext<PlansContextType | undefined>(undefined)

export function PlansProvider({ children }: { children: React.ReactNode }) {
    // React Query Hooks
    const { data: plans = [], isLoading, error } = usePlansQuery()
    const createMutation = useCreatePlan()
    const updateMutation = useUpdatePlan()
    const deleteMutation = useDeletePlan()

    // Helper to get plan by ID
    const getPlanById = (id: string): Plan | null => {
        return plans.find((p) => p.id === id) || null
    }

    // Create plan and return the new plan ID for navigation
    const createPlan = async (name: string, description?: string): Promise<string> => {
        const result = await createMutation.mutateAsync({ name, description })
        return result.id
    }

    const updatePlan = async (id: string, updates: Partial<Plan>) => {
        await updateMutation.mutateAsync({ id, updates })
    }

    const deletePlan = async (id: string) => {
        await deleteMutation.mutateAsync(id)
    }

    const renamePlan = async (id: string, newName: string) => {
        await updatePlan(id, { name: newName })
    }

    const duplicateMutation = useDuplicatePlan()

    const duplicatePlan = async (sourcePlanId: string, name: string, description?: string): Promise<string> => {
        const result = await duplicateMutation.mutateAsync({ sourcePlanId, name, description })
        return result.id
    }

    return (
        <PlansContext.Provider value={{
            plans,
            getPlanById,
            createPlan,
            updatePlan,
            deletePlan,
            renamePlan,
            duplicatePlan,
            loading: isLoading,
            error
        }}>
            {children}
        </PlansContext.Provider>
    )
}

export function usePlans() {
    const context = useContext(PlansContext)
    if (context === undefined) {
        throw new Error('usePlans must be used within a PlansProvider')
    }
    return context
}
