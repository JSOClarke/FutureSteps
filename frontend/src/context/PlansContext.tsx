import { createContext, useContext, useState, useEffect } from 'react'
import type { Plan } from '../types'
import { usePlansQuery } from '../hooks/usePlans'
import { useCreatePlan, useUpdatePlan, useDeletePlan } from '../hooks/usePlanMutations'

interface PlansContextType {
    plans: Plan[]
    activePlanId: string | null
    activePlan: Plan | null
    createPlan: (name: string, description?: string) => Promise<void>
    updatePlan: (id: string, updates: Partial<Plan>) => Promise<void>
    deletePlan: (id: string) => Promise<void>
    setActivePlanId: (id: string) => void
    setActivePlan: (id: string) => void
    renamePlan: (id: string, newName: string) => Promise<void>
    loading: boolean
    error: any
}

const PlansContext = createContext<PlansContextType | undefined>(undefined)

export function PlansProvider({ children }: { children: React.ReactNode }) {
    const [activePlanId, setActivePlanId] = useState<string | null>(null)

    // React Query Hooks
    const { data: plans = [], isLoading, error } = usePlansQuery()
    const createMutation = useCreatePlan()
    const updateMutation = useUpdatePlan()
    const deleteMutation = useDeletePlan()

    // Auto-select first plan if none selected
    useEffect(() => {
        if (plans.length > 0 && !activePlanId) {
            setActivePlanId(plans[0].id)
        }
    }, [plans, activePlanId])

    const activePlan = plans.find((p) => p.id === activePlanId) || null

    // Wrappers to match existing interface (could expose mutations directly later)
    const createPlan = async (name: string, description?: string) => {
        const result = await createMutation.mutateAsync({ name, description })
        setActivePlanId(result.id)
    }

    const updatePlan = async (id: string, updates: Partial<Plan>) => {
        await updateMutation.mutateAsync({ id, updates })
    }

    const deletePlan = async (id: string) => {
        await deleteMutation.mutateAsync(id)
        if (activePlanId === id) {
            setActivePlanId(null) // effect will pick next one
        }
    }

    const renamePlan = async (id: string, newName: string) => {
        await updatePlan(id, { name: newName })
    }

    return (
        <PlansContext.Provider value={{
            plans,
            activePlanId,
            activePlan,
            createPlan,
            updatePlan,
            deletePlan,
            setActivePlanId,
            setActivePlan: setActivePlanId,
            renamePlan,
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
