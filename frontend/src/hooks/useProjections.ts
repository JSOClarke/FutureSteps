import { useMemo, useState, useEffect } from 'react'
import { useFinancialItems } from '../context/FinancialItemsContext'
import { useUser } from '../context/UserContext'
import { ProjectionEngine, type YearResult } from '../utils/projections'
import { useSettings } from '../context/SettingsContext'
import { transformToRealValues } from '../utils/projections/transformer'
import { calculateNetWorth } from '../utils/projections/helpers'

export interface ProjectionConfig {
    startYear: number
    numberOfYears: number
    surplusPriority?: string[]
    deficitPriority?: string[]
}

export function useProjections(surplusPriority: string[] = [], deficitPriority: string[] = []) {
    const { items } = useFinancialItems()
    const { userProfile } = useUser()
    const { settings } = useSettings()

    // Calculate number of years from current year to user's death year
    const calculateNumberOfYears = () => {
        const currentYear = new Date().getFullYear()

        if (userProfile?.dateOfBirth) {
            const birthYear = new Date(userProfile.dateOfBirth).getFullYear()
            const lifeExpectancy = userProfile.lifeExpectancy || 85
            const deathYear = birthYear + lifeExpectancy

            // Ensure we project at least 1 year into the future
            return Math.max(1, deathYear - currentYear)
        }

        return 30 // Default fallback if no DOB set
    }

    const [config, setConfig] = useState<ProjectionConfig>({
        startYear: new Date().getFullYear(),
        numberOfYears: calculateNumberOfYears()
    })

    // Update numberOfYears when user profile changes
    useEffect(() => {
        setConfig(prev => ({
            ...prev,
            numberOfYears: calculateNumberOfYears()
        }))
    }, [userProfile?.dateOfBirth, userProfile?.lifeExpectancy])

    const { projection, realProjection } = useMemo(() => {
        if (items.length === 0 || !userProfile) return { projection: null, realProjection: null }

        const engine = new ProjectionEngine()
        const nominal = engine.runMultiYearProjection(
            items,
            config.startYear,
            config.numberOfYears,
            userProfile,
            surplusPriority,
            deficitPriority,
            settings.inflationRate
        )

        // Create Initial Year (Start State)
        // With End-Year labeling:
        // If First Projected Year is 2025 (Ending June 2025).
        // We want Initial Year to be 2024.
        // nominal.years[0].year should be 2025 (or 2026).

        const firstProjectedYear = nominal.years.length > 0 ? nominal.years[0].year : config.startYear
        const initialYear = firstProjectedYear - 1

        const birthYear = userProfile?.dateOfBirth ? new Date(userProfile.dateOfBirth).getFullYear() : (config.startYear - 30)
        const initialAge = (initialYear) - birthYear


        const initialYearResult: YearResult = {
            year: initialYear,
            age: initialAge,
            totalIncome: 0,
            totalExpenses: 0,
            fractionOfYear: 0,
            inflationFactor: 1,
            netCashflow: 0,
            remainingCashflow: 0,
            assets: items.filter(i => i.category === 'assets'),
            liabilities: items.filter(i => i.category === 'liabilities'),
            netWorth: calculateNetWorth(
                items.filter(i => i.category === 'assets'),
                items.filter(i => i.category === 'liabilities')
            ),
            history: {
                income: [], expenses: [], growth: [], yield: [],
                contributions: [], surplus: [], deficit: [], liabilityPayments: []
            }
        }

        // Prepend Initial Year
        // With distinct End-Year labeling (2025) and Initial Year (2024), we can safely prepend.
        nominal.years.unshift(initialYearResult)
        nominal.summary.startingNetWorth = initialYearResult.netWorth

        return {
            projection: nominal,
            realProjection: transformToRealValues(nominal)
        }
    }, [items, config.startYear, config.numberOfYears, surplusPriority, deficitPriority, settings.inflationRate])

    return {
        projection,
        realProjection,
        config,
        setConfig
    }
}
