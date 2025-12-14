import { createContext, useContext, useState } from 'react'
import type { DashboardItem, FinancialCategory } from '../types'

interface DashboardItemsContextType {
    items: DashboardItem[]
    addItem: (item: Omit<DashboardItem, 'id'>) => void
    updateItem: (id: string, updates: Partial<DashboardItem>) => void
    deleteItem: (id: string) => void
    getItemsByCategory: (category: FinancialCategory) => DashboardItem[]
    getTotalByCategory: (category: FinancialCategory) => number
    clearAllItems: () => void
}

const DashboardItemsContext = createContext<DashboardItemsContextType | undefined>(undefined)

export function DashboardItemsProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<DashboardItem[]>([])

    const addItem = (item: Omit<DashboardItem, 'id'>) => {
        const newItem: DashboardItem = {
            ...item,
            id: crypto.randomUUID()
        }
        setItems([...items, newItem])
    }

    const updateItem = (id: string, updates: Partial<DashboardItem>) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, ...updates } : item
        ))
    }

    const deleteItem = (id: string) => {
        setItems(items.filter(item => item.id !== id))
    }

    const getItemsByCategory = (category: FinancialCategory) => {
        return items.filter(item => item.category === category)
    }

    const getTotalByCategory = (category: FinancialCategory) => {
        return items
            .filter(item => item.category === category)
            .reduce((sum, item) => sum + item.amount, 0)
    }

    const clearAllItems = () => {
        setItems([])
    }

    return (
        <DashboardItemsContext.Provider value={{
            items,
            addItem,
            updateItem,
            deleteItem,
            getItemsByCategory,
            getTotalByCategory,
            clearAllItems
        }}>
            {children}
        </DashboardItemsContext.Provider>
    )
}

export function useDashboardItems() {
    const context = useContext(DashboardItemsContext)
    if (context === undefined) {
        throw new Error('useDashboardItems must be used within a DashboardItemsProvider')
    }
    return context
}
