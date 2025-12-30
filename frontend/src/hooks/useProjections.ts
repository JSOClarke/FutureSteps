import { useMemo, useState, useEffect } from 'react'
import { useFinancialItems } from '../context/FinancialItemsContext'
import { useUser } from '../context/UserContext'
import { ProjectionEngine } from '../utils/projections'
import type { ProjectionResult } from '../utils/projections'

export interface ProjectionConfig {
    startYear: number
    numberOfYears: number
    surplusPriority?: string[]
    deficitPriority?: string[]
}

export function useProjections(surplusPriority: string[] = [], deficitPriority: string[] = []) {
    const { items } = useFinancialItems()
    const { userProfile } = useUser()

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

    const projection: ProjectionResult | null = useMemo(() => {
        if (items.length === 0) return null

        const engine = new ProjectionEngine()
        return engine.runMultiYearProjection(
            items,
            config.startYear,
            config.numberOfYears,
            surplusPriority,
            deficitPriority
        )
    }, [items, config.startYear, config.numberOfYears, surplusPriority, deficitPriority])

    return {
        projection,
        config,
        setConfig
    }
}
