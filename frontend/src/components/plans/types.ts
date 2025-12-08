import type { Milestone } from '../milestones/types'
import type { FinancialItem } from '../../types'

export interface Plan {
    id: string
    name: string
    createdAt: number
    financialItems: FinancialItem[]
    milestones: Milestone[]
    surplusPriority: string[]
    deficitPriority: string[]
}
