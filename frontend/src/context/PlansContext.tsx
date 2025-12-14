import { createContext, useContext, useState, useEffect } from 'react'
import type { Plan } from '../types'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'

interface PlansContextType {
    plans: Plan[]
    activePlanId: string | null
    activePlan: Plan | null
    createPlan: (name: string, description?: string) => Promise<void>
    updatePlan: (id: string, updates: Partial<Plan>) => Promise<void>
    deletePlan: (id: string) => Promise<void>
    setActivePlanId: (id: string) => void
    // Aliases/Helpers for compatibility
    setActivePlan: (id: string) => void
    renamePlan: (id: string, newName: string) => Promise<void>
}

const PlansContext = createContext<PlansContextType | undefined>(undefined)

export function PlansProvider({ children }: { children: React.ReactNode }) {
    const [plans, setPlans] = useState<Plan[]>([])
    const [activePlanId, setActivePlanId] = useState<string | null>(null)
    const { user } = useAuth()

    // Fetch plans when user changes
    useEffect(() => {
        const loadPlans = async () => {
            if (user) {
                // Authenticated: Fetch from Supabase
                const { data: plansData, error: plansError } = await supabase
                    .from('plans')
                    .select('*')
                    .order('created_at', { ascending: true })

                if (plansError) {
                    console.error('Error fetching plans:', plansError)
                    return
                }

                const { data: milestonesData, error: milestonesError } = await supabase
                    .from('milestones')
                    .select('*')

                if (milestonesError) {
                    console.error('Error fetching milestones:', milestonesError)
                    return
                }

                const mappedPlans: Plan[] = plansData.map(p => ({
                    id: p.id,
                    name: p.name,
                    description: p.description,
                    createdAt: p.created_at,
                    financialItems: [],
                    milestones: milestonesData
                        .filter(m => m.plan_id === p.id)
                        .map(m => ({
                            id: m.id,
                            name: m.name,
                            value: Number(m.value),
                            type: m.type as 'net_worth' | 'year',
                            color: m.color
                        })),
                    surplusPriority: [],
                    deficitPriority: []
                }))

                setPlans(mappedPlans)
                if (mappedPlans.length > 0 && !activePlanId) {
                    setActivePlanId(mappedPlans[0].id)
                }
            } else {
                // Guest: Fetch from localStorage
                const localPlans = localStorage.getItem('guest_plans')
                if (localPlans) {
                    try {
                        const parsedPlans = JSON.parse(localPlans)
                        setPlans(parsedPlans)
                        if (parsedPlans.length > 0 && !activePlanId) {
                            setActivePlanId(parsedPlans[0].id)
                        }
                    } catch (e) {
                        console.error('Error parsing guest plans:', e)
                        localStorage.removeItem('guest_plans')
                        setPlans([])
                    }
                } else {
                    setPlans([])
                }
            }
        }

        loadPlans()
    }, [user])

    const activePlan = plans.find((p) => p.id === activePlanId) || null

    const createPlan = async (name: string, description?: string) => {
        console.log('createPlan called with name:', name, 'description:', description)
        console.log('User in PlansContext:', user ? `ID: ${user.id}` : 'NULL - will save to localStorage')

        const tempId = crypto.randomUUID()
        const newPlan: Plan = {
            id: tempId,
            name,
            description,
            createdAt: new Date().toISOString(),
            financialItems: [],
            milestones: [],
            surplusPriority: [],
            deficitPriority: []
        }

        // Optimistic update
        const updatedPlans = [...plans, newPlan]
        setPlans(updatedPlans)
        setActivePlanId(tempId)

        if (user) {
            console.log('Saving plan to Supabase for user:', user.id)
            // Authenticated: Save to Supabase
            const { data, error } = await supabase
                .from('plans')
                .insert({
                    user_id: user.id,
                    name,
                    description
                })
                .select()
                .single()

            if (error) {
                console.error('Error creating plan in Supabase:', error)
                setPlans(prev => prev.filter(p => p.id !== tempId))
                return
            }

            console.log('Plan created in Supabase successfully:', data)
            // Update with real ID
            setPlans(prev => prev.map(p => p.id === tempId ? { ...p, id: data.id } : p))
            setActivePlanId(data.id)
        } else {
            console.log('No user - saving plan to localStorage')
            // Guest: Save to localStorage
            localStorage.setItem('guest_plans', JSON.stringify(updatedPlans))
        }
    }

    const updatePlan = async (id: string, updates: Partial<Plan>) => {
        // Optimistic update
        const updatedPlans = plans.map(p => p.id === id ? { ...p, ...updates } : p)
        setPlans(updatedPlans)

        if (user) {
            // Authenticated: Update Supabase
            if (updates.name || updates.description) {
                await supabase
                    .from('plans')
                    .update({
                        name: updates.name,
                        description: updates.description
                    })
                    .eq('id', id)
            }

            if (updates.milestones) {
                await supabase.from('milestones').delete().eq('plan_id', id)
                if (updates.milestones.length > 0) {
                    const milestonesToInsert = updates.milestones.map((m: any) => ({
                        user_id: user.id,
                        plan_id: id,
                        name: m.name,
                        value: m.value,
                        type: m.type,
                        color: m.color
                    }))
                    await supabase.from('milestones').insert(milestonesToInsert)
                }
            }
        } else {
            // Guest: Update localStorage
            localStorage.setItem('guest_plans', JSON.stringify(updatedPlans))
        }
    }

    const deletePlan = async (id: string) => {
        const prevPlans = [...plans]
        const updatedPlans = plans.filter(p => p.id !== id)
        setPlans(updatedPlans)

        if (activePlanId === id) {
            setActivePlanId(updatedPlans.length > 0 ? updatedPlans[0].id : null)
        }

        if (user) {
            // Authenticated: Delete from Supabase
            const { error } = await supabase
                .from('plans')
                .delete()
                .eq('id', id)

            if (error) {
                console.error('Error deleting plan:', error)
                setPlans(prevPlans)
            }
        } else {
            // Guest: Update localStorage
            localStorage.setItem('guest_plans', JSON.stringify(updatedPlans))
        }
    }

    const setActivePlan = setActivePlanId

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
            setActivePlan,
            renamePlan
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
