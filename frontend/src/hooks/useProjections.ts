import { useMemo, useState } from 'react'
import { useFinancialItems } from '../context/FinancialItemsContext'
import { ProjectionEngine } from '../utils/projections'
import type { ProjectionResult } from '../utils/projections'

export interface ProjectionConfig {
    startYear: number
    numberOfYears: number
}

export function useProjections() {
    const { items } = useFinancialItems()

    const [config, setConfig] = useState<ProjectionConfig>({
        startYear: new Date().getFullYear(),
        numberOfYears: 30
    })

    const projection: ProjectionResult | null = useMemo(() => {
        if (items.length === 0) return null

        const engine = new ProjectionEngine()
        return engine.runMultiYearProjection(
            items,
            config.startYear,
            config.numberOfYears
        )
    }, [items, config.startYear, config.numberOfYears])

    return {
        projection,
        config,
        setConfig
    }
}
