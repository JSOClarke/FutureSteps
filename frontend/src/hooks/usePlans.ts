import { useQuery } from '@tanstack/react-query'
import { fetchPlans } from '../api/plans'
import { useAuth } from '../context/AuthContext'

export function usePlansQuery() {
    const { user, loading: authLoading } = useAuth()

    return useQuery({
        queryKey: ['plans', user?.id],
        queryFn: () => fetchPlans(user),
        enabled: !authLoading, // Only fetch when auth is settled
        staleTime: 5 * 60 * 1000 // Cache for 5 minutes
    })
}
