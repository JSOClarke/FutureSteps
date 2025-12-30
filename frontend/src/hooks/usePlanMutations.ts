import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createPlan, updatePlan, deletePlan } from '../api/plans'
import { useAuth } from '../context/AuthContext'
import type { Plan } from '../types'

export function useCreatePlan() {
    const queryClient = useQueryClient()
    const { user } = useAuth()

    return useMutation({
        mutationFn: (planData: { name: string, description?: string }) => createPlan(user, planData),
        onSuccess: (newPlan) => {
            // Optimistic update - or simpler: just invalidate
            queryClient.setQueryData(['plans', user?.id], (old: Plan[] = []) => {
                return [...old, newPlan]
            })
            // queryClient.invalidateQueries({ queryKey: ['plans', user?.id] })
        }
    })
}

export function useUpdatePlan() {
    const queryClient = useQueryClient()
    const { user } = useAuth()

    return useMutation({
        mutationFn: ({ id, updates }: { id: string, updates: Partial<Plan> }) => updatePlan(user, id, updates),
        onMutate: async ({ id, updates }) => {
            // Cancel outgoing queries
            await queryClient.cancelQueries({ queryKey: ['plans', user?.id] })

            // Snapshot previous value
            const previousPlans = queryClient.getQueryData<Plan[]>(['plans', user?.id])

            // Optimistic Update
            if (previousPlans) {
                queryClient.setQueryData(['plans', user?.id], previousPlans.map(p =>
                    p.id === id ? { ...p, ...updates } : p
                ))
            }

            return { previousPlans }
        },
        onError: (_err, _newPlan, context) => {
            // Rollback
            if (context?.previousPlans) {
                queryClient.setQueryData(['plans', user?.id], context.previousPlans)
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['plans', user?.id] })
        }
    })
}

export function useDeletePlan() {
    const queryClient = useQueryClient()
    const { user } = useAuth()

    return useMutation({
        mutationFn: (id: string) => deletePlan(user, id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['plans', user?.id] })
            const previousPlans = queryClient.getQueryData<Plan[]>(['plans', user?.id])

            if (previousPlans) {
                queryClient.setQueryData(['plans', user?.id], previousPlans.filter(p => p.id !== id))
            }

            return { previousPlans }
        },
        onError: (_err, _id, context) => {
            if (context?.previousPlans) {
                queryClient.setQueryData(['plans', user?.id], context.previousPlans)
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['plans', user?.id] })
        }
    })
}
