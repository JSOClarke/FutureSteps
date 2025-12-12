import { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    error: string | null
    signInWithGoogle: () => Promise<void>
    signInWithEmail: (email: string, password: string) => Promise<void>
    signUpWithEmail: (email: string, password: string) => Promise<void>
    signOut: () => Promise<void>
    clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        })

        // Listen for changes on auth state (sign in, sign out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
            setError(null) // Clear error on auth state change
        })

        return () => subscription.unsubscribe()
    }, [])

    const signInWithGoogle = async () => {
        setError(null)
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        })
        if (error) {
            console.error('Error signing in with Google:', error.message)
            setError(error.message)
        }
    }

    const signInWithEmail = async (email: string, password: string) => {
        setError(null)
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        })
        if (error) {
            console.error('Error signing in:', error.message)
            setError(error.message)
            throw error
        }
    }

    const signUpWithEmail = async (email: string, password: string) => {
        setError(null)
        const { error } = await supabase.auth.signUp({
            email,
            password
        })
        if (error) {
            console.error('Error signing up:', error.message)
            setError(error.message)
            throw error
        }
    }

    const signOut = async () => {
        setError(null)
        const { error } = await supabase.auth.signOut()
        if (error) {
            console.error('Error signing out:', error.message)
            setError(error.message)
        }
    }

    const clearError = () => setError(null)

    return (
        <AuthContext.Provider value={{
            user,
            session,
            loading,
            error,
            signInWithGoogle,
            signInWithEmail,
            signUpWithEmail,
            signOut,
            clearError
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
