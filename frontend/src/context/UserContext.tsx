import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'
import type { UserProfile } from '../types'

interface UserContextType {
    userProfile: UserProfile | null
    loading: boolean
    updateProfile: (updates: Partial<UserProfile>) => Promise<void>
    createProfile: (profile: Omit<UserProfile, 'id' | 'email'>) => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()

    useEffect(() => {
        const loadProfile = async () => {
            setLoading(true)
            if (user) {
                // Authenticated user: fetch from Supabase
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (error) {
                    console.error('Error fetching profile:', error)
                    // If row not found, userProfile remains null -> triggers Onboarding
                } else {
                    setUserProfile({
                        id: data.id,
                        email: data.email,
                        full_name: data.full_name,
                        dateOfBirth: data.date_of_birth,
                        country: data.country,
                        customDeathDate: data.custom_death_date
                    })
                }
            } else {
                // Guest user: fetch from localStorage
                const localProfile = localStorage.getItem('guest_profile')
                if (localProfile) {
                    try {
                        setUserProfile(JSON.parse(localProfile))
                    } catch (e) {
                        console.error('Error parsing guest profile:', e)
                        localStorage.removeItem('guest_profile')
                    }
                } else {
                    setUserProfile(null)
                }
            }
            setLoading(false)
        }

        loadProfile()
    }, [user])

    const updateProfile = async (updates: Partial<UserProfile>) => {
        // Optimistic update
        const updatedProfile = userProfile ? { ...userProfile, ...updates } : null
        setUserProfile(updatedProfile)

        if (user) {
            // Authenticated: Update Supabase
            const dbUpdates: any = { ...updates }
            if (updates.customDeathDate) dbUpdates.custom_death_date = updates.customDeathDate
            if (updates.dateOfBirth) dbUpdates.date_of_birth = updates.dateOfBirth

            delete dbUpdates.customDeathDate
            delete dbUpdates.dateOfBirth

            const { error } = await supabase
                .from('profiles')
                .update(dbUpdates)
                .eq('id', user.id)

            if (error) {
                console.error('Error updating profile:', error)
            }
        } else {
            // Guest: Update localStorage
            if (updatedProfile) {
                localStorage.setItem('guest_profile', JSON.stringify(updatedProfile))
            }
        }
    }

    const createProfile = async (profileData: Omit<UserProfile, 'id' | 'email'>) => {
        if (user) {
            // Authenticated: Create in Supabase
            const newProfile: UserProfile = {
                id: user.id,
                email: user.email || '',
                ...profileData
            }

            setUserProfile(newProfile)

            const dbProfile = {
                id: user.id,
                email: user.email,
                full_name: profileData.full_name,
                date_of_birth: profileData.dateOfBirth,
                country: profileData.country,
                custom_death_date: profileData.customDeathDate
            }

            const { error } = await supabase
                .from('profiles')
                .upsert(dbProfile)

            if (error) {
                console.error('Error creating profile:', error)
            }
        } else {
            // Guest: Create in localStorage
            const guestId = crypto.randomUUID()
            const newProfile: UserProfile = {
                id: guestId,
                email: 'guest@local',
                ...profileData
            }
            setUserProfile(newProfile)
            localStorage.setItem('guest_profile', JSON.stringify(newProfile))
        }
    }

    return (
        <UserContext.Provider value={{ userProfile, loading, updateProfile, createProfile }}>
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
