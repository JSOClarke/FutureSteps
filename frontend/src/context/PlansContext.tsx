import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { Plan } from '../components/plans/types'
import type { FinancialItem } from '../types'

interface PlansContextType {
    plans: Plan[]
    activePlanId: string | null
    activePlan: Plan | null
    setActivePlan: (id: string) => void
    createPlan: (name: string, duplicateFromId?: string) => string
    updatePlan: (id: string, updates: Partial<Omit<Plan, 'id' | 'createdAt'>>) => void
    deletePlan: (id: string) => void
    renamePlan: (id: string, newName: string) => void
    exportPlans: () => void
    importPlans: (file: File) => Promise<void>
}

const PlansContext = createContext<PlansContextType | null>(null)

const STORAGE_KEY = 'financial_plans'
const ACTIVE_PLAN_KEY = 'active_plan_id'

// Migration: Convert old localStorage data to first plan
function migrateOldData(): Plan | null {
    try {
        const oldItems = localStorage.getItem('financial_items')
        if (!oldItems) return null

        const items: FinancialItem[] = JSON.parse(oldItems)

        // Check if we already have plans (migration already done)
        const existingPlans = localStorage.getItem(STORAGE_KEY)
        if (existingPlans) return null

        // Create default plan from old data
        const defaultPlan: Plan = {
            id: crypto.randomUUID(),
            name: 'My Plan',
            createdAt: Date.now(),
            financialItems: items,
            milestones: [],
            surplusPriority: [],
            deficitPriority: []
        }

        // Clear old storage
        localStorage.removeItem('financial_items')

        return defaultPlan
    } catch (error) {
        console.error('Migration error:', error)
        return null
    }
}

export function PlansProvider({ children }: { children: ReactNode }) {
    const [plans, setPlans] = useState<Plan[]>(() => {
        // Try to load from localStorage
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            return JSON.parse(stored)
        }

        // Check for old data to migrate
        const migratedPlan = migrateOldData()
        if (migratedPlan) {
            return [migratedPlan]
        }

        // No data, create first plan
        const firstPlan: Plan = {
            id: crypto.randomUUID(),
            name: 'My Plan',
            createdAt: Date.now(),
            financialItems: [],
            milestones: [],
            surplusPriority: [],
            deficitPriority: []
        }
        return [firstPlan]
    })

    const [activePlanId, setActivePlanId] = useState<string | null>(() => {
        const stored = localStorage.getItem(ACTIVE_PLAN_KEY)
        if (stored && plans.some(p => p.id === stored)) {
            return stored
        }
        return plans[0]?.id || null
    })

    // Persist plans to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(plans))
    }, [plans])

    // Persist active plan ID
    useEffect(() => {
        if (activePlanId) {
            localStorage.setItem(ACTIVE_PLAN_KEY, activePlanId)
        }
    }, [activePlanId])

    const activePlan = plans.find(p => p.id === activePlanId) || null

    const setActivePlan = (id: string) => {
        if (plans.some(p => p.id === id)) {
            setActivePlanId(id)
        }
    }

    const createPlan = (name: string, duplicateFromId?: string): string => {
        const newId = crypto.randomUUID()

        if (duplicateFromId) {
            const sourcePlan = plans.find(p => p.id === duplicateFromId)
            if (sourcePlan) {
                const newPlan: Plan = {
                    ...sourcePlan,
                    id: newId,
                    name,
                    createdAt: Date.now(),
                    // Deep copy arrays to avoid reference issues
                    financialItems: JSON.parse(JSON.stringify(sourcePlan.financialItems)),
                    milestones: JSON.parse(JSON.stringify(sourcePlan.milestones)),
                    surplusPriority: [...sourcePlan.surplusPriority],
                    deficitPriority: [...sourcePlan.deficitPriority]
                }
                setPlans([...plans, newPlan])
                setActivePlanId(newId)
                return newId
            }
        }

        // Create blank plan
        const newPlan: Plan = {
            id: newId,
            name,
            createdAt: Date.now(),
            financialItems: [],
            milestones: [],
            surplusPriority: [],
            deficitPriority: []
        }
        setPlans([...plans, newPlan])
        setActivePlanId(newId)
        return newId
    }

    const updatePlan = (id: string, updates: Partial<Omit<Plan, 'id' | 'createdAt'>>) => {
        setPlans(plans.map(p =>
            p.id === id ? { ...p, ...updates } : p
        ))
    }

    const deletePlan = (id: string) => {
        if (plans.length === 1) {
            alert('Cannot delete the last plan')
            return
        }

        setPlans(plans.filter(p => p.id !== id))

        // If deleting active plan, switch to first remaining plan
        if (activePlanId === id) {
            const remaining = plans.filter(p => p.id !== id)
            setActivePlanId(remaining[0]?.id || null)
        }
    }

    const renamePlan = (id: string, newName: string) => {
        updatePlan(id, { name: newName })
    }

    const exportPlans = () => {
        const dataStr = JSON.stringify(plans, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `financial-plans-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    const importPlans = async (file: File): Promise<void> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()

            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string
                    const imported = JSON.parse(content) as Plan[]

                    // Validate imported data
                    if (!Array.isArray(imported) || imported.length === 0) {
                        throw new Error('Invalid import file: must contain an array of plans')
                    }

                    // Validate each plan has required fields
                    for (const plan of imported) {
                        if (!plan.id || !plan.name || !plan.createdAt) {
                            throw new Error('Invalid plan structure in import file')
                        }
                    }

                    // Replace all plans with imported ones
                    setPlans(imported)
                    setActivePlanId(imported[0].id)

                    alert(`Successfully imported ${imported.length} plan(s)!`)
                    resolve()
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Failed to import plans'
                    alert(message)
                    reject(error)
                }
            }

            reader.onerror = () => {
                const error = new Error('Failed to read file')
                alert(error.message)
                reject(error)
            }

            reader.readAsText(file)
        })
    }

    return (
        <PlansContext.Provider value={{
            plans,
            activePlanId,
            activePlan,
            setActivePlan,
            createPlan,
            updatePlan,
            deletePlan,
            renamePlan,
            exportPlans,
            importPlans
        }}>
            {children}
        </PlansContext.Provider>
    )
}

export function usePlans() {
    const context = useContext(PlansContext)
    if (!context) {
        throw new Error('usePlans must be used within PlansProvider')
    }
    return context
}
