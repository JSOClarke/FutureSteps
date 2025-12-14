import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../shared/Sidebar'

export function MainLayout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    const handleContentClick = () => {
        // Collapse sidebar when clicking on content area (desktop only)
        if (!sidebarCollapsed && window.innerWidth >= 1024) {
            setSidebarCollapsed(true)
        }
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar
                isCollapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Main content area - adjusts based on sidebar state */}
            <div
                className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}
                onClick={handleContentClick}
            >
                {/* Consistent padding for all pages */}
                <div className="p-4">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}
