import { createContext, useContext, useState, useEffect } from 'react'
import type { FinancialItem, FinancialCategory } from '../types'
import { useAuth } from './AuthContext'
import { usePlans } from './PlansContext'
import { supabase } from '../lib/supabase'

interface FinancialItemsContextType {
    items: FinancialItem[]
    addItem: (item: Omit<FinancialItem, 'id'>) => Promise<void>
    updateItem: (id: string, item: Partial<FinancialItem>) => Promise<void>
    deleteItem: (id: string) => Promise<void>
    getItemsByCategory: (category: FinancialCategory) => FinancialItem[]
}

const FinancialItemsContext = createContext<FinancialItemsContextType | undefined>(undefined)

export function FinancialItemsProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<FinancialItem[]>([])
    const { user } = useAuth()
    const { activePlanId } = usePlans()

    // Fetch items when user or active plan changes
    useEffect(() => {
        const fetchItems = async () => {
            if (!activePlanId) {
                setItems([])
                return
            }

            if (user) {
                // Authenticated: Fetch from Supabase
                const { data, error } = await supabase
                    .from('financial_items')
                    .select('*')
                    .eq('plan_id', activePlanId)

                if (error) {
                    console.error('Error fetching financial items:', error)
                    return
                }

                const mappedItems: FinancialItem[] = data.map(item => ({
                    id: item.id,
                    name: item.name,
                    value: Number(item.value),
                    category: item.category as FinancialCategory,
                    startYear: item.start_year,
                    endYear: item.end_year,
                    frequency: item.frequency,
                    growthRate: item.growth_rate,
                    yieldRate: item.yield_rate,
                    monthlyContribution: item.monthly_contribution,
                    interestRate: item.interest_rate,
                    minimumPayment: item.minimum_payment
                }))

                setItems(mappedItems)
            } else {
                // Guest: Fetch from localStorage
                const localItems = localStorage.getItem('guest_items')
                if (localItems) {
                    try {
                        const parsedItems = JSON.parse(localItems)
                        // Filter by activePlanId (even for guests, items belong to a plan)
                        setItems(parsedItems.filter((i: any) => i.planId === activePlanId))
                    } catch (e) {
                        console.error('Error parsing guest items:', e)
                        localStorage.removeItem('guest_items')
                        setItems([])
                    }
                } else {
                    setItems([])
                }
            }
        }

        fetchItems()
    }, [user, activePlanId])

    const addItem = async (newItemData: Omit<FinancialItem, 'id'>) => {
        if (!activePlanId) return

        const tempId = crypto.randomUUID()
        const optimisticItem = { ...newItemData, id: tempId }
        setItems(prev => [...prev, optimisticItem])

        if (user) {
            // Authenticated: Save to Supabase
            const dbItem = {
                user_id: user.id,
                plan_id: activePlanId,
                name: newItemData.name,
                value: newItemData.value,
                category: newItemData.category,
                start_year: newItemData.startYear,
                end_year: newItemData.endYear,
                frequency: newItemData.frequency,
                growth_rate: newItemData.growthRate,
                yield_rate: newItemData.yieldRate,
                monthly_contribution: newItemData.monthlyContribution,
                interest_rate: newItemData.interestRate,
                minimum_payment: newItemData.minimumPayment
            }

            const { data, error } = await supabase
                .from('financial_items')
                .insert(dbItem)
                .select()
                .single()

            if (error) {
                console.error('Error adding item:', error)
                setItems(prev => prev.filter(i => i.id !== tempId))
                return
            }

            // Replace optimistic item with real one
            setItems(prev => prev.map(i => i.id === tempId ? { ...newItemData, id: data.id } : i))
        } else {
            // Guest: Save to localStorage
            // We need to store planId with the item in localStorage to filter correctly
            const guestItem = { ...optimisticItem, planId: activePlanId }

            const localItems = localStorage.getItem('guest_items')
            const allGuestItems = localItems ? JSON.parse(localItems) : []
            const updatedGuestItems = [...allGuestItems, guestItem]

            localStorage.setItem('guest_items', JSON.stringify(updatedGuestItems))
        }
    }

    const updateItem = async (id: string, updatedData: Partial<FinancialItem>) => {
        // Optimistic update
        setItems(prev => prev.map(item => item.id === id ? { ...item, ...updatedData } : item))

        if (user) {
            // Authenticated: Update Supabase
            const dbUpdate: any = {}
            if (updatedData.name !== undefined) dbUpdate.name = updatedData.name
            if (updatedData.value !== undefined) dbUpdate.value = updatedData.value
            if (updatedData.category !== undefined) dbUpdate.category = updatedData.category
            if (updatedData.startYear !== undefined) dbUpdate.start_year = updatedData.startYear
            if (updatedData.endYear !== undefined) dbUpdate.end_year = updatedData.endYear
            if (updatedData.frequency !== undefined) dbUpdate.frequency = updatedData.frequency
            if (updatedData.growthRate !== undefined) dbUpdate.growth_rate = updatedData.growthRate
            if (updatedData.yieldRate !== undefined) dbUpdate.yield_rate = updatedData.yieldRate
            if (updatedData.monthlyContribution !== undefined) dbUpdate.monthly_contribution = updatedData.monthlyContribution
            if (updatedData.interestRate !== undefined) dbUpdate.interest_rate = updatedData.interestRate
            if (updatedData.minimumPayment !== undefined) dbUpdate.minimum_payment = updatedData.minimumPayment

            const { error } = await supabase
                .from('financial_items')
                .update(dbUpdate)
                .eq('id', id)

            if (error) {
                console.error('Error updating item:', error)
            }
        } else {
            // Guest: Update localStorage
            const localItems = localStorage.getItem('guest_items')
            if (localItems) {
                const allGuestItems = JSON.parse(localItems)
                const updatedGuestItems = allGuestItems.map((item: any) =>
                    item.id === id ? { ...item, ...updatedData } : item
                )
                localStorage.setItem('guest_items', JSON.stringify(updatedGuestItems))
            }
        }
    }

    const deleteItem = async (id: string) => {
        const previousItems = [...items]
        setItems(prev => prev.filter(item => item.id !== id))

        if (user) {
            // Authenticated: Delete from Supabase
            const { error } = await supabase
                .from('financial_items')
                .delete()
                .eq('id', id)

            if (error) {
                console.error('Error deleting item:', error)
                setItems(previousItems)
            }
        } else {
            // Guest: Delete from localStorage
            const localItems = localStorage.getItem('guest_items')
            if (localItems) {
                const allGuestItems = JSON.parse(localItems)
                const updatedGuestItems = allGuestItems.filter((item: any) => item.id !== id)
                localStorage.setItem('guest_items', JSON.stringify(updatedGuestItems))
            }
        }
    }

    const getItemsByCategory = (category: FinancialCategory) => {
        return items.filter(item => item.category === category)
    }

    return (
        <FinancialItemsContext.Provider value={{ items, addItem, updateItem, deleteItem, getItemsByCategory }}>
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
