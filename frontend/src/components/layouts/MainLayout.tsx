import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../shared/Sidebar'

export function MainLayout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar
                isCollapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Main content area - adjusts based on sidebar state */}
            <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                {/* Consistent padding for all pages */}
                <div className="p-4">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}
