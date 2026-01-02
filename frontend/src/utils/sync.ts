import { supabase } from '../lib/supabase'

export async function syncGuestData(userId: string) {
    const guestProfile = localStorage.getItem('guest_profile')
    const guestPlans = localStorage.getItem('guest_plans')
    const guestItems = localStorage.getItem('guest_items')

    // 1. Sync Profile
    if (guestProfile) {
        try {
            const profile = JSON.parse(guestProfile)
            // We don't overwrite email, as the auth user has a real email
            await supabase.from('profiles').upsert({
                id: userId,
                full_name: profile.full_name,
                date_of_birth: profile.dateOfBirth,
                country: profile.country,
                life_expectancy: profile.lifeExpectancy
            })
        } catch (e) {
            console.error('Error syncing guest profile:', e)
        }
    }

    const planIdMap = new Map<string, string>()

    // 2. Sync Plans
    if (guestPlans) {
        try {
            const plans = JSON.parse(guestPlans)
            for (const plan of plans) {
                const { data, error } = await supabase.from('plans').insert({
                    user_id: userId,
                    name: plan.name,
                    description: plan.description
                }).select().single()

                if (error) {
                    console.error('Error syncing plan:', error)
                    continue
                }

                if (data) {
                    planIdMap.set(plan.id, data.id)

                    // Sync milestones for this plan
                    if (plan.milestones && plan.milestones.length > 0) {
                        const milestonesToInsert = plan.milestones.map((m: any) => ({
                            user_id: userId,
                            plan_id: data.id,
                            name: m.name,
                            value: m.value,
                            type: m.type,
                            color: m.color
                        }))
                        await supabase.from('milestones').insert(milestonesToInsert)
                    }
                }
            }
        } catch (e) {
            console.error('Error syncing guest plans:', e)
        }
    }

    // 3. Sync Financial Items
    if (guestItems) {
        try {
            const items = JSON.parse(guestItems)
            const itemsToInsert = items.map((item: any) => {
                // If item has a planId, map it. If not (legacy?), maybe skip or assign to first plan?
                // For now, assume strict mapping.
                const newPlanId = planIdMap.get(item.planId)
                if (!newPlanId) return null

                return {
                    user_id: userId,
                    plan_id: newPlanId,
                    name: item.name,
                    value: item.value,
                    category: item.category,
                    start_year: item.startYear,
                    end_year: item.endYear,
                    frequency: item.frequency,
                    growth_rate: item.growthRate,
                    yield_rate: item.yieldRate,
                    monthly_contribution: item.monthlyContribution,
                    interest_rate: item.interestRate,
                    minimum_payment: item.minimumPayment,
                    growth_mode: item.growthMode,
                    max_value: item.maxValue
                }
            }).filter((i: any) => i !== null)

            if (itemsToInsert.length > 0) {
                await supabase.from('financial_items').insert(itemsToInsert)
            }
        } catch (e) {
            console.error('Error syncing guest items:', e)
        }
    }

    // 4. Clear Guest Data
    localStorage.removeItem('guest_profile')
    localStorage.removeItem('guest_plans')
    localStorage.removeItem('guest_items')
}
