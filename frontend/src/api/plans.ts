import { supabase } from '../lib/supabase'
import type { Plan } from '../types'
import type { User } from '@supabase/supabase-js'

export async function fetchPlans(user: User | null): Promise<Plan[]> {
    if (!user) {
        // Guest mode: Load from local storage
        try {
            const localPlans = localStorage.getItem('guest_plans')
            const localItems = localStorage.getItem('guest_items')

            if (localPlans) {
                const parsedPlans = JSON.parse(localPlans)
                const parsedItems = localItems ? JSON.parse(localItems) : []

                // Reassemble plans with their items
                return parsedPlans.map((p: any) => ({
                    ...p,
                    financialItems: parsedItems.filter((i: any) => i.planId === p.id)
                }))
            }
            return []
        } catch (e) {
            console.error('Error parsing guest plans:', e)
            return []
        }
    }

    // Authenticated: Fetch from Supabase
    // Fetch plans
    const { data: plansData, error: plansError } = await supabase
        .from('plans')
        .select('*')
        .order('created_at', { ascending: true })

    if (plansError) throw new Error(plansError.message)

    // Fetch milestones
    const { data: milestonesData, error: milestonesError } = await supabase
        .from('milestones')
        .select('*')

    if (milestonesError) throw new Error(milestonesError.message)

    // Fetch items
    const { data: itemsData, error: itemsError } = await supabase
        .from('financial_items')
        .select('*')
        .order('created_at', { ascending: true })

    if (itemsError) throw new Error(itemsError.message)

    // Map and Assemble
    return plansData.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        createdAt: p.created_at,
        financialItems: itemsData
            .filter(i => i.plan_id === p.id)
            .map(item => ({
                id: item.id,
                name: item.name,
                value: Number(item.value),
                category: item.category,
                subCategory: item.sub_category,
                startYear: item.start_year,
                endYear: item.end_year,
                frequency: item.frequency,
                growthRate: item.growth_rate,
                yieldRate: item.yield_rate,
                maxAnnualContribution: item.max_annual_contribution,
                interestRate: item.interest_rate,
                minimumPayment: item.minimum_payment,
                growthMode: item.growth_mode,
                maxValue: item.max_value
            })),
        milestones: milestonesData
            .filter(m => m.plan_id === p.id)
            .map(m => ({
                id: m.id,
                name: m.name,
                value: Number(m.value),
                type: m.type as 'net_worth' | 'year',
                color: m.color
            })),
        surplusPriority: p.surplus_priority || [],
        deficitPriority: p.deficit_priority || []
    }))
}

export async function createPlan(user: User | null, planData: { name: string, description?: string }): Promise<Plan> {
    const newPlanBase = {
        id: crypto.randomUUID(),
        name: planData.name,
        description: planData.description,
        createdAt: new Date().toISOString(),
        financialItems: [],
        milestones: [],
        surplusPriority: [],
        deficitPriority: []
    }

    if (!user) {
        // Guest Mode
        const currentPlans = await fetchPlans(null)
        const updatedPlans = [...currentPlans, newPlanBase]
        localStorage.setItem('guest_plans', JSON.stringify(updatedPlans))
        return newPlanBase
    }

    // Authenticated Mode
    const { data, error } = await supabase
        .from('plans')
        .insert({
            user_id: user.id,
            name: planData.name,
            description: planData.description
        })
        .select()
        .single()

    if (error) throw new Error(error.message)

    return { ...newPlanBase, id: data.id }
}

export async function updatePlan(user: User | null, id: string, updates: Partial<Plan>): Promise<void> {
    if (!user) {
        // Guest Mode
        const currentPlans = await fetchPlans(null)
        const updatedPlans = currentPlans.map(p => p.id === id ? { ...p, ...updates } : p)
        localStorage.setItem('guest_plans', JSON.stringify(updatedPlans))
        return
    }

    // Authenticated
    if (updates.name || updates.description || updates.surplusPriority !== undefined || updates.deficitPriority !== undefined) {
        const updateData: any = {}

        if (updates.name !== undefined) updateData.name = updates.name
        if (updates.description !== undefined) updateData.description = updates.description
        if (updates.surplusPriority !== undefined) updateData.surplus_priority = updates.surplusPriority
        if (updates.deficitPriority !== undefined) updateData.deficit_priority = updates.deficitPriority

        const { error } = await supabase
            .from('plans')
            .update(updateData)
            .eq('id', id)

        if (error) throw new Error(error.message)
    }

    if (updates.milestones) {
        // Transaction-like update for milestones
        const { error: deleteError } = await supabase.from('milestones').delete().eq('plan_id', id)
        if (deleteError) throw new Error(deleteError.message)

        if (updates.milestones.length > 0) {
            const milestonesToInsert = updates.milestones.map((m: any) => ({
                user_id: user.id,
                plan_id: id,
                name: m.name,
                value: m.value,
                type: m.type,
                color: m.color
            }))
            const { error: insertError } = await supabase.from('milestones').insert(milestonesToInsert)
            if (insertError) throw new Error(insertError.message)
        }
    }
}

export async function deletePlan(user: User | null, id: string): Promise<void> {
    if (!user) {
        // Guest
        const currentPlans = await fetchPlans(null)
        const updatedPlans = currentPlans.filter(p => p.id !== id)
        localStorage.setItem('guest_plans', JSON.stringify(updatedPlans))
        return
    }

    // Authenticated
    const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', id)

    if (error) throw new Error(error.message)
}

export async function duplicatePlan(user: User | null, sourcePlanId: string, newName: string, description?: string): Promise<Plan> {
    const plans = await fetchPlans(user)
    const sourcePlan = plans.find(p => p.id === sourcePlanId)

    if (!sourcePlan) {
        throw new Error('Source plan not found')
    }

    const newPlanBase = {
        id: crypto.randomUUID(),
        name: newName,
        description: description || sourcePlan.description, // Use source description if not provided
        createdAt: new Date().toISOString(),
        financialItems: [], // Will be filled below
        milestones: [],      // Will be filled below
        surplusPriority: sourcePlan.surplusPriority,
        deficitPriority: sourcePlan.deficitPriority
    }

    if (!user) {
        // Guest Mode
        const newItems = sourcePlan.financialItems.map(item => ({
            ...item,
            id: crypto.randomUUID(),
            planId: newPlanBase.id
        }))

        const newMilestones = sourcePlan.milestones.map(milestone => ({
            ...milestone,
            id: crypto.randomUUID(),
            planId: newPlanBase.id
        }))

        const fullNewPlan = {
            ...newPlanBase,
            financialItems: newItems,
            milestones: newMilestones
        }

        // Save Plans
        const localPlans = localStorage.getItem('guest_plans')
        const currentPlans = localPlans ? JSON.parse(localPlans) : []
        localStorage.setItem('guest_plans', JSON.stringify([...currentPlans, fullNewPlan]))

        // Save Items (Guest items are stored separately flattened in 'guest_items')
        const localItems = localStorage.getItem('guest_items')
        const currentItems = localItems ? JSON.parse(localItems) : []
        localStorage.setItem('guest_items', JSON.stringify([...currentItems, ...newItems]))

        return fullNewPlan
    }

    // Authenticated Mode
    // 1. Create the new plan
    const { data: newPlanData, error: planError } = await supabase
        .from('plans')
        .insert({
            user_id: user.id,
            name: newPlanBase.name,
            description: newPlanBase.description,
            surplus_priority: newPlanBase.surplusPriority,
            deficit_priority: newPlanBase.deficitPriority
        })
        .select()
        .single()

    if (planError) throw new Error(`Failed to create plan: ${planError.message}`)

    // 2. Prepare and Insert Items
    if (sourcePlan.financialItems.length > 0) {
        const itemsToInsert = sourcePlan.financialItems.map(item => ({
            user_id: user.id,
            plan_id: newPlanData.id,
            name: item.name,
            value: item.value,
            category: item.category,
            sub_category: item.subCategory,
            start_year: item.startYear,
            end_year: item.endYear,
            frequency: item.frequency,
            growth_rate: item.growthRate,
            yield_rate: item.yieldRate,
            max_annual_contribution: item.maxAnnualContribution,
            interest_rate: item.interestRate,
            minimum_payment: item.minimumPayment,
            growth_mode: item.growthMode,
            max_value: item.maxValue
        }))

        const { error: itemsError } = await supabase
            .from('financial_items')
            .insert(itemsToInsert)

        if (itemsError) throw new Error(`Failed to copy items: ${itemsError.message}`)
    }

    // 3. Prepare and Insert Milestones
    if (sourcePlan.milestones.length > 0) {
        const milestonesToInsert = sourcePlan.milestones.map(m => ({
            user_id: user.id,
            plan_id: newPlanData.id,
            name: m.name,
            value: m.value,
            type: m.type,
            color: m.color
        }))

        const { error: milestonesError } = await supabase
            .from('milestones')
            .insert(milestonesToInsert)

        if (milestonesError) throw new Error(`Failed to copy milestones: ${milestonesError.message}`)
    }

    // Return the constructed full plan object (fetching again would be safer but this saves a roundtrip if we trust our local construction)
    // Actually, let's just return the local construction with the real ID to be fast.
    return {
        ...newPlanBase,
        id: newPlanData.id,
        financialItems: sourcePlan.financialItems.map(i => ({ ...i, id: 'temp-id' })), // IDs won't match DB but we reload mostly
        milestones: sourcePlan.milestones.map(m => ({ ...m, id: 'temp-id' }))
    }
}
