import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { UserProfile, UserProfileInput } from '../types/user'
import { calculateDeathDate } from '../data/lifeExpectancyData'

interface UserContextType {
    userProfile: UserProfile | null
    createProfile: (input: UserProfileInput) => void
    updateProfile: (input: Partial<UserProfileInput>) => void
    clearProfile: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

const STORAGE_KEY = 'chronos_user_profile'

export function UserProvider({ children }: { children: ReactNode }) {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

    // Load profile from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            try {
                const profile = JSON.parse(stored)
                setUserProfile(profile)
            } catch (error) {
                console.error('Failed to parse user profile:', error)
                localStorage.removeItem(STORAGE_KEY)
            }
        }
    }, [])

    const createProfile = (input: UserProfileInput) => {
        const profile: UserProfile = {
            id: crypto.randomUUID(),
            name: input.name,
            dateOfBirth: input.dateOfBirth,
            country: input.country,
            customDeathDate: input.customDeathDate || calculateDeathDate(input.dateOfBirth, input.country),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }

        setUserProfile(profile)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
    }

    const updateProfile = (input: Partial<UserProfileInput>) => {
        if (!userProfile) return

        const updated: UserProfile = {
            ...userProfile,
            ...input,
            updatedAt: new Date().toISOString(),
        }

        // Recalculate death date if DOB or country changed
        if ((input.dateOfBirth || input.country) && !input.customDeathDate) {
            updated.customDeathDate = calculateDeathDate(
                input.dateOfBirth || userProfile.dateOfBirth,
                input.country || userProfile.country
            )
        }

        setUserProfile(updated)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    }

    const clearProfile = () => {
        setUserProfile(null)
        localStorage.removeItem(STORAGE_KEY)
    }

    return (
        <UserContext.Provider value={{ userProfile, createProfile, updateProfile, clearProfile }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider')
    }
    return context
}
