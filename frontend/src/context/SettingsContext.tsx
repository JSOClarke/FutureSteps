import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

export interface UserSettings {
    birthYear: number | null
    customEndYear: number | null // Override for calculated end year
    inflationRate: number // Annual inflation rate (0-1)
}

interface SettingsContextType {
    settings: UserSettings
    defaultEndYear: number
    updateSettings: (updates: Partial<UserSettings>) => void
}

const SettingsContext = createContext<SettingsContextType | null>(null)

const STORAGE_KEY = 'user_settings'
const DEFAULT_LIFE_EXPECTANCY = 80
const DEFAULT_INFLATION_RATE = 0.025 // 2.5%

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<UserSettings>(() => {
        // Try to load from localStorage
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            try {
                const parsed = JSON.parse(stored)
                // Ensure new fields exist on stored data
                return {
                    birthYear: parsed.birthYear ?? null,
                    customEndYear: parsed.customEndYear ?? null,
                    inflationRate: parsed.inflationRate ?? DEFAULT_INFLATION_RATE
                }
            } catch (error) {
                console.error('Failed to parse settings:', error)
            }
        }

        // Default settings
        return {
            birthYear: null,
            customEndYear: null,
            inflationRate: DEFAULT_INFLATION_RATE
        }
    })

    // Persist settings to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    }, [settings])

    // Calculate default end year based on settings
    const defaultEndYear = (() => {
        // If custom end year is set, use that
        if (settings.customEndYear) {
            return settings.customEndYear
        }

        // If birth year is set, calculate end year based on life expectancy
        if (settings.birthYear) {
            return settings.birthYear + DEFAULT_LIFE_EXPECTANCY
        }

        // No default set
        return 0
    })()

    const updateSettings = (updates: Partial<UserSettings>) => {
        setSettings(prev => ({ ...prev, ...updates }))
    }

    return (
        <SettingsContext.Provider value={{
            settings,
            defaultEndYear,
            updateSettings
        }}>
            {children}
        </SettingsContext.Provider>
    )
}

export function useSettings() {
    const context = useContext(SettingsContext)
    if (!context) {
        throw new Error('useSettings must be used within SettingsProvider')
    }
    return context
}
