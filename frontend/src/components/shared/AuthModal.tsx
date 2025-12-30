import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Modal } from './Modal'

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            if (isLogin) {
                await signInWithEmail(email, password)
            } else {
                await signUpWithEmail(email, password)
            }
            // Call onSuccess for both login and signup
            if (onSuccess) await onSuccess()
            onClose()
        } catch (err) {
            // Error is handled in context
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isLogin ? 'Sign In' : 'Create Account'}
            maxWidth="max-w-md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="auth-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        id="auth-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black font-light"
                        required
                        data-testid="auth-email-input"
                        aria-label="Email Address"
                    />
                </div>
                <div>
                    <label htmlFor="auth-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                        id="auth-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black font-light"
                        required
                        minLength={6}
                        data-testid="auth-password-input"
                        aria-label="Password"
                    />
                </div>

                {error && (
                    <div className="text-red-600 text-sm bg-red-50 p-2 border border-red-200">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-black text-white font-normal uppercase tracking-wide hover:bg-gray-800 transition-colors disabled:opacity-50"
                    data-testid="auth-submit-button"
                >
                    {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-gray-600 font-light">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                    onClick={() => {
                        setIsLogin(!isLogin)
                        clearError()
                    }}
                    className="text-black font-medium hover:underline uppercase tracking-wide text-xs ml-1"
                >
                    {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
            </div>
        </Modal>
    )
}
