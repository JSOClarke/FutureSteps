import { useState, useCallback } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Home, User, FileText, LogOut, ChevronDown, FolderOpen, X, Plus } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { usePlans } from '../../context/PlansContext'
import CreatePlanModal from '../plans/CreatePlanModal'
import { ConfirmationDialog } from './ConfirmationDialog'
import { useToast } from '../../context/ToastContext'

interface SidebarProps {
    isCollapsed: boolean
    onToggleCollapse: () => void
}

export function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
    const { signOut, user } = useAuth()
    const { plans, activePlanId, setActivePlanId, deletePlan } = usePlans()
    const [plansExpanded, setPlansExpanded] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [planToDelete, setPlanToDelete] = useState<{ id: string, name: string } | null>(null)
    const { toast } = useToast()
    const navigate = useNavigate()

    // Reusable handler to close sidebar on mobile after navigation
    const closeSidebarOnMobile = useCallback(() => {
        if (window.innerWidth < 1024) {
            onToggleCollapse()
        }
    }, [onToggleCollapse])

    const handlePlanClick = (planId: string) => {
        setActivePlanId(planId)
        navigate('/plans')
        closeSidebarOnMobile()
    }

    const handleGuestSignIn = () => {
        // Clear all guest data
        localStorage.removeItem('guest_profile')
        localStorage.removeItem('guest_plans')
        localStorage.removeItem('guest_financial_items')

        // Reload the app to trigger onboarding
        window.location.href = '/'
    }



    const handleDeleteClick = (planId: string, planName: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setPlanToDelete({ id: planId, name: planName })
    }

    const confirmDeletePlan = async () => {
        if (!planToDelete) return

        try {
            await deletePlan(planToDelete.id)
            setPlanToDelete(null)
            toast({
                title: 'Plan Deleted',
                message: `"${planToDelete.name}" has been deleted.`,
                type: 'success'
            })
            // If active plan was deleted, router/context should handle redirect, 
            // but we can force it here if needed.
            if (activePlanId === planToDelete.id) {
                navigate('/dashboard')
            }
        } catch (error) {
            console.error('Failed to delete plan:', error)
            toast({
                title: 'Delete Failed',
                message: 'Failed to delete plan. Please try again.',
                type: 'error'
            })
        }
    }

    const navigation = [
        { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
        { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
        { id: 'reports', label: 'Reports', icon: FileText, path: '/reports' },
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
                                <NavLink to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                    <img
                                        src="/logo.png"
                                        alt="FutureSteps"
                                        className="h-8 mix-blend-multiply"
                                    />
                                    <h1 className="text-xl font-light">FutureSteps</h1>
                                </NavLink>
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
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const Icon = item.icon
                            return (
                                <NavLink
                                    key={item.id}
                                    to={item.path}
                                    onClick={closeSidebarOnMobile}
                                    className={({ isActive }) => `
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
                                </NavLink>
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
                                            <div
                                                key={plan.id}
                                                className={`
                                                    group flex items-center justify-between px-4 py-2
                                                    transition-colors
                                                    ${activePlanId === plan.id
                                                        ? 'bg-gray-200 text-black'
                                                        : 'text-gray-600 hover:bg-gray-50'
                                                    }
                                                `}
                                            >
                                                <button
                                                    onClick={() => handlePlanClick(plan.id)}
                                                    className="flex-1 text-left text-xs font-light truncate"
                                                >
                                                    {plan.name}
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteClick(plan.id, plan.name, e)}
                                                    className="p-1 text-gray-400 hover:text-red-600 transition-all"
                                                    title={`Delete ${plan.name}`}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}

                                        {/* Add Plan Button */}
                                        <div className="px-4 py-2">
                                            <button
                                                onClick={() => setShowCreateModal(true)}
                                                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-black text-white hover:bg-gray-800 transition-colors text-sm font-normal uppercase tracking-wide"
                                            >
                                                <Plus size={16} />
                                                Add Plan
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Plans icon when collapsed */}
                        {isCollapsed && (
                            <button
                                onClick={onToggleCollapse}
                                className="w-full flex items-center justify-center px-4 py-3 text-black hover:bg-gray-100 transition-colors"
                                title="Plans"
                            >
                                <FolderOpen className="w-5 h-5" />
                            </button>
                        )}
                    </nav>

                    {/* User info & Logout */}
                    <div className="p-4 border-t border-gray-200">
                        {user ? (
                            <>
                                {!isCollapsed && (
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
                            </>
                        ) : (
                            <>
                                {!isCollapsed && (
                                    <div className="mb-3 px-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                            <p className="text-xs text-orange-600 uppercase tracking-wide font-medium">Guest Mode</p>
                                        </div>
                                        <p className="text-xs text-gray-600 font-light leading-relaxed">
                                            ⚠️ Your data will be lost when you close this browser. Sign in to save permanently.
                                        </p>
                                    </div>
                                )}
                                <button
                                    onClick={handleGuestSignIn}
                                    className={`
                                        w-full flex items-center gap-3 px-4 py-3
                                        bg-black text-white hover:bg-gray-800 transition-colors
                                        font-light text-sm uppercase tracking-wide
                                        ${isCollapsed ? 'justify-center' : ''}
                                    `}
                                    title={isCollapsed ? 'Sign In' : undefined}
                                >
                                    <User className="w-5 h-5 flex-shrink-0" />
                                    {!isCollapsed && <span>Sign In</span>}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </aside>

            {/* Mobile menu button - FAB style */}
            <button
                onClick={onToggleCollapse}
                className={`
                    fixed bottom-6 right-6 z-30 p-3 
                    bg-black/90 text-white rounded-full shadow-lg
                    hover:bg-black transition-all lg:hidden
                    ${isCollapsed ? 'block' : 'hidden'}
                `}
                aria-label="Open menu"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Create Plan Modal */}
            <CreatePlanModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            />
            {/* Confirmation Dialogs */}
            <ConfirmationDialog
                isOpen={!!planToDelete}
                onClose={() => setPlanToDelete(null)}
                onConfirm={confirmDeletePlan}
                title="Delete Plan"
                description={`Are you sure you want to delete "${planToDelete?.name}"? This will permanently delete the plan and all its associated items.`}
                confirmLabel="Delete Plan"
                variant="danger"
            />
        </>
    )
}
