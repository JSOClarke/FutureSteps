import { useUser } from '../context/UserContext'

/**
 * Hook to get the user's selected currency
 * @returns currency code (e.g., 'USD', 'EUR', 'GBP') with default fallback to 'USD'
 */
export function useCurrency(): string {
    const { userProfile } = useUser()
    return userProfile?.currency || 'USD'
}
