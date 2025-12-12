import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
    const { signInWithEmail, signUpWithEmail, error, clearError } = useAuth()
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            if (isLogin) {
                await signInWithEmail(email, password)
                if (onSuccess) onSuccess()
                onClose()
            } else {
                await signUpWithEmail(email, password)
                alert('Account created! You can now sign in.')
                setIsLogin(true)
            }
        } catch (err) {
            // Error is handled in context
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md p-8 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-black"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-light mb-6 uppercase tracking-wide text-center">
                    {isLogin ? 'Sign In' : 'Create Account'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                            required
                            minLength={6}
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm bg-red-50 p-2 border border-red-200">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                <div className="mt-4 text-center text-sm text-gray-600">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin)
                            clearError()
                        }}
                        className="text-black font-medium hover:underline"
                    >
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </div>
            </div>
        </div>
    )
}
