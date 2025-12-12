import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import AuthModal from './AuthModal'
import { syncGuestData } from '../../utils/sync'
import { supabase } from '../../lib/supabase'

export function LoginButton() {
    const { user, signOut } = useAuth()
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleAuthSuccess = async () => {
        // Get current user directly from Supabase to ensure we have the ID immediately
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (currentUser) {
            await syncGuestData(currentUser.id)
            // Force reload or context refresh might be needed?
            // The contexts (User, Plans, Items) listen to `user` changes, so they should refetch automatically.
            // But we just inserted data, so we want them to fetch the NEW data.
            // Since `user` changes from null to object, the effects in contexts will fire and fetch data.
            // So it should be fine.
            window.location.reload() // Reload to ensure clean state and fresh fetch is often safest for full sync
        }
    }

    if (user) {
        return (
            <div className="flex items-center gap-4">
                <span className="text-sm font-light text-gray-600 hidden sm:inline">
                    {user.email}
                </span>
                <button
                    onClick={signOut}
                    className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium transition-colors"
                >
                    Sign Out
                </button>
            </div>
        )
    }

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-black text-white hover:bg-gray-800 text-sm font-medium transition-colors"
            >
                Sign In / Sign Up
            </button>
            <AuthModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleAuthSuccess}
            />
        </>
    )
}
