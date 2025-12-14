import { useState } from 'react'
import { Home, User, Settings, FileText, LogOut, ChevronDown, FolderOpen } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { usePlans } from '../../context/PlansContext'
import PlanModal from '../plans/PlanModal'

interface SidebarProps {
    currentPage: string
    onNavigate: (page: string) => void
    isCollapsed: boolean
    onToggleCollapse: () => void
}

export function Sidebar({ currentPage, onNavigate, isCollapsed, onToggleCollapse }: SidebarProps) {
    const { signOut, user } = useAuth()
    const { plans, activePlanId, setActivePlanId } = usePlans()
    const [plansExpanded, setPlansExpanded] = useState(true)
    const [showPlanModal, setShowPlanModal] = useState(false)

    const handlePlanClick = (planId: string) => {
        setActivePlanId(planId)
        onNavigate('plans') // Navigate to plans page when selecting a plan
    }

    const navigation = [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'reports', label: 'Reports', icon: FileText },
    ]

    return (
        <>
            {/* Mobile overlay */}
            {!isCollapsed && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onToggleCollapse}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 h-full bg-white border-r border-black z-50
                    transition-transform duration-300 ease-in-out
                    ${isCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
                    ${isCollapsed ? 'lg:w-20' : 'w-64'}
                `}
            >
                <div className="flex flex-col h-full">
                    {/* Logo/Header */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            {!isCollapsed && (
                                <div className="flex items-center gap-3">
                                    <img
                                        src="/logo.png"
                                        alt="FutureSteps"
                                        className="h-8 mix-blend-multiply"
                                    />
                                    <h1 className="text-xl font-light">FutureSteps</h1>
                                </div>
                            )}
                            <button
                                onClick={onToggleCollapse}
                                className="p-2 hover:bg-gray-100 transition-colors hidden lg:block"
                            >
                                <svg
                                    className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        {navigation.map((item) => {
                            const Icon = item.icon
                            const isActive = currentPage === item.id
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        onNavigate(item.id)
                                        if (window.innerWidth < 1024) onToggleCollapse()
                                    }}
                                    className={`
                                        w-full flex items-center gap-3 px-4 py-3
                                        transition-colors font-light text-sm uppercase tracking-wide
                                        ${isActive
                                            ? 'bg-black text-white'
                                            : 'text-black hover:bg-gray-100'
                                        }
                                        ${isCollapsed ? 'justify-center' : ''}
                                    `}
                                    title={isCollapsed ? item.label : undefined}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    {!isCollapsed && <span>{item.label}</span>}
                                </button>
                            )
                        })}

                        {/* Plans Section */}
                        {!isCollapsed && (
                            <div className="pt-2">
                                <button
                                    onClick={() => setPlansExpanded(!plansExpanded)}
                                    className="w-full flex items-center justify-between px-4 py-3 text-black hover:bg-gray-100 transition-colors font-light text-sm uppercase tracking-wide"
                                >
                                    <div className="flex items-center gap-3">
                                        <FolderOpen className="w-5 h-5 flex-shrink-0" />
                                        <span>Plans</span>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${plansExpanded ? 'rotate-180' : ''}`} />
                                </button>

                                {plansExpanded && (
                                    <div className="ml-4 mt-1 space-y-1">
                                        {plans.map((plan) => (
                                            <button
                                                key={plan.id}
                                                onClick={() => handlePlanClick(plan.id)}
                                                className={`
                                                    w-full text-left px-4 py-2 text-xs font-light
                                                    transition-colors flex items-center justify-between
                                                    ${activePlanId === plan.id
                                                        ? 'bg-gray-200 text-black'
                                                        : 'text-gray-600 hover:bg-gray-50'
                                                    }
                                                `}
                                            >
                                                <span className="truncate">{plan.name}</span>
                                                {activePlanId === plan.id && (
                                                    <span className="text-black font-bold ml-2">✓</span>
                                                )}
                                            </button>
                                        ))}

                                        <button
                                            onClick={() => setShowPlanModal(true)}
                                            className="w-full text-left px-4 py-2 text-xs font-light text-gray-500 hover:text-black hover:bg-gray-50 transition-colors"
                                        >
                                            + Manage Plans
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Plans icon when collapsed */}
                        {isCollapsed && (
                            <button
                                onClick={() => setShowPlanModal(true)}
                                className="w-full flex items-center justify-center px-4 py-3 text-black hover:bg-gray-100 transition-colors"
                                title="Plans"
                            >
                                <FolderOpen className="w-5 h-5" />
                            </button>
                        )}
                    </nav>

                    {/* User info & Logout */}
                    <div className="p-4 border-t border-gray-200">
                        {user && !isCollapsed && (
                            <div className="mb-3 px-4">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Signed in as</p>
                                <p className="text-sm font-light truncate">{user.email}</p>
                            </div>
                        )}
                        <button
                            onClick={() => signOut()}
                            className={`
                                w-full flex items-center gap-3 px-4 py-3
                                text-black hover:bg-gray-100 transition-colors
                                font-light text-sm uppercase tracking-wide
                                ${isCollapsed ? 'justify-center' : ''}
                            `}
                            title={isCollapsed ? 'Sign Out' : undefined}
                        >
                            <LogOut className="w-5 h-5 flex-shrink-0" />
                            {!isCollapsed && <span>Sign Out</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile menu button */}
            <button
                onClick={onToggleCollapse}
                className={`
                    fixed top-4 left-4 z-30 p-2 bg-white border border-black
                    hover:bg-gray-50 transition-colors lg:hidden
                    ${isCollapsed ? 'block' : 'hidden'}
                `}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Plan Modal */}
            <PlanModal
                isOpen={showPlanModal}
                onClose={() => setShowPlanModal(false)}
            />
        </>
    )
}
