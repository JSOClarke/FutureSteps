import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { FinancialItem, FinancialCategory } from '../types'
import { usePlans } from './PlansContext'

interface FinancialItemsContextType {
    items: FinancialItem[]
    addItem: (item: Omit<FinancialItem, 'id'>) => void
    updateItem: (id: string, item: Partial<FinancialItem>) => void
    deleteItem: (id: string) => void
    getItemsByCategory: (category: FinancialCategory) => FinancialItem[]
}

const FinancialItemsContext = createContext<FinancialItemsContextType | undefined>(undefined)

export function FinancialItemsProvider({ children }: { children: ReactNode }) {
    const { activePlan, updatePlan, activePlanId } = usePlans()

    // Use items from active plan
    const items = activePlan?.financialItems || []

    const addItem = (item: Omit<FinancialItem, 'id'>) => {
        if (!activePlanId || !activePlan) return

        const newItem: FinancialItem = {
            ...item,
            id: crypto.randomUUID(),
        }

        updatePlan(activePlanId, {
            financialItems: [...activePlan.financialItems, newItem]
        })
    }

    const updateItem = (id: string, updates: Partial<FinancialItem>) => {
        if (!activePlanId || !activePlan) return

        const updatedItems = activePlan.financialItems.map(item =>
            item.id === id ? { ...item, ...updates } : item
        )

        updatePlan(activePlanId, {
            financialItems: updatedItems
        })
    }

    const deleteItem = (id: string) => {
        if (!activePlanId || !activePlan) return

        const updatedItems = activePlan.financialItems.filter(item => item.id !== id)

        updatePlan(activePlanId, {
            financialItems: updatedItems
        })
    }

    const getItemsByCategory = (category: FinancialCategory) => {
        return items.filter((item) => item.category === category)
    }

    return (
        <FinancialItemsContext.Provider
            value={{ items, addItem, updateItem, deleteItem, getItemsByCategory }}
        >
            {children}
        </FinancialItemsContext.Provider>
    )
}

export function useFinancialItems() {
    const context = useContext(FinancialItemsContext)
    if (context === undefined) {
        throw new Error('useFinancialItems must be used within a FinancialItemsProvider')
    }
    return context
}
