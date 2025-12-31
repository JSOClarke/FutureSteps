/**
 * Centralized Icon Configuration
 * Using Phosphor Icons: https://phosphoricons.com/
 */

import {
    House,
    FileText,
    User,
    FolderOpen,
    SignOut,
    CaretDown,
    CaretRight,
    CaretUp,
    Plus,
    X,
    Check,
    CheckCircle,
    WarningCircle,
    Info,
    TrendUp,
    TrendDown,
    Bank,
    CreditCard,
    Buildings,
    Pencil,
    Trash,
    Gear,
    Percent,
    Play,
    ChartBar,
    Spinner,
    ArrowsClockwise,
    Car,
    Lightbulb,
    Heart,
    DeviceMobile,
    GraduationCap,
    DotsThree,
    Wallet,
    ForkKnife,
    ArrowRight,
    FloppyDisk,
    Warning,
    Briefcase,
    ShoppingBag
} from 'phosphor-react'

// Exporting as aliases to maintain compatibility or semantic naming

// Navigation
export const Home = House
export const Reports = FileText
export const Profile = User
export const Plans = FolderOpen
export const LogOut = SignOut

// UI Elements
export const ChevronDown = CaretDown
export const ChevronRight = CaretRight
export const ChevronUp = CaretUp
export const Add = Plus
export const Close = X
export const CheckMark = Check
export const Success = CheckCircle
export const ErrorIcon = WarningCircle
export const InfoIcon = Info
export const WarningIcon = Warning

// Financial & Data
export const TrendingUp = TrendUp
export const TrendingDown = TrendDown
export const Institution = Bank
export const Card = CreditCard
export const Building = Buildings
export const Edit = Pencil
export const Delete = Trash
export const Settings = Gear
export const Percentage = Percent
export const Run = Play
export const BarChart3 = ChartBar
export const Loader2 = Spinner
export const RefreshCw = ArrowsClockwise
export const Save = FloppyDisk
export const ArrowRightIcon = ArrowRight

// Categories
export const Vehicle = Car
export const Utilities = Lightbulb
export const Healthcare = Heart
export const Entertainment = DeviceMobile
export const Education = GraduationCap
export const Savings = Bank
export const More = DotsThree
export const Income = Wallet
export const Food = ForkKnife
export const LivingExpenses = ShoppingBag
export const Work = Briefcase

// Re-export specific icons directly if needed without alias, or commonly used ones
export {
    Plus,
    X,
    Pencil,
    Trash,
    User,
    Play,
    Spinner,
    Check,
    Briefcase,
    Bank,
    ShoppingBag
}

export type { IconProps } from 'phosphor-react'
export type IconType = React.ComponentType<any>
