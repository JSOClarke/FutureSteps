import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { FinancialItem, FinancialCategory } from '../types'

interface FinancialItemsContextType {
    items: FinancialItem[]
    addItem: (item: Omit<FinancialItem, 'id'>) => void
    updateItem: (id: string, item: Partial<FinancialItem>) => void
    deleteItem: (id: string) => void
    getItemsByCategory: (category: FinancialCategory) => FinancialItem[]
}

const FinancialItemsContext = createContext<FinancialItemsContextType | undefined>(undefined)

export function FinancialItemsProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<FinancialItem[]>([])

    const addItem = (item: Omit<FinancialItem, 'id'>) => {
        const newItem: FinancialItem = {
            ...item,
            id: crypto.randomUUID(),
        }
        setItems((prev) => [...prev, newItem])
    }

    const updateItem = (id: string, updates: Partial<FinancialItem>) => {
        setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
        )
    }

    const deleteItem = (id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id))
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
