import { useState } from 'react'
import { useUser } from '../context/UserContext'
import { useAuth } from '../context/AuthContext'
import { usePlans } from '../context/PlansContext'
import { COUNTRIES } from '../data/lifeExpectancyData'
import { getDefaultCurrency } from '../data/currencyData'
import AuthModal from './shared/AuthModal'

type OnboardingMode = 'welcome' | 'signup' | 'onboarding'

function Onboarding() {
    const { createProfile } = useUser()
    const { signUpWithEmail } = useAuth()
    const { createPlan } = usePlans()

    const [mode, setMode] = useState<OnboardingMode>('welcome')
    const [currentSlide, setCurrentSlide] = useState(0)
    const [fadeIn, setFadeIn] = useState(true)
    const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Signup form data
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    // Onboarding form data
    const [name, setName] = useState('')
    const [dateOfBirth, setDateOfBirth] = useState('')
    const [country, setCountry] = useState('')
    const [lifeExpectancy, setLifeExpectancy] = useState(85)
    const [planName, setPlanName] = useState('My First Plan')

    const handleNext = () => {
        if (currentSlide < 2) {
            setFadeIn(false)
            setTimeout(() => {
                setCurrentSlide(currentSlide + 1)
                setFadeIn(true)
            }, 300)
        }
    }

    const handleBack = () => {
        if (currentSlide > 0) {
            setFadeIn(false)
            setTimeout(() => {
                setCurrentSlide(currentSlide - 1)
                setFadeIn(true)
            }, 300)
        }
    }

    const handleSignUp = async () => {
        if (!email || !password) {
            setError('Please enter email and password')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)
        setError(null)

        try {
            await signUpWithEmail(email, password)
            // After signup, move to onboarding
            setMode('onboarding')
            setCurrentSlide(0)
        } catch (err: any) {
            setError(err.message || 'Error creating account')
        } finally {
            setLoading(false)
        }
    }

    const handleCompleteOnboarding = async () => {
        if (!name || !dateOfBirth || !country || !planName) {
            alert('Please fill in all required fields')
            return
        }

        setLoading(true)
        try {
            await createProfile({
                full_name: name,
                dateOfBirth,
                country,
                lifeExpectancy: lifeExpectancy,
                currency: getDefaultCurrency(country)
            })

            await createPlan(planName, 'My first financial plan')
        } catch (err) {
            console.error('Error completing onboarding:', err)
            alert('Error saving your information. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleSignInSuccess = () => {
        setIsSignInModalOpen(false)
        // User will be redirected to dashboard by App.tsx since they have a profile
    }

    const canProceed = () => {
        if (currentSlide === 0) return name && dateOfBirth && country
        if (currentSlide === 1) return !!planName
        return true
    }

    // Welcome screen
    if (mode === 'welcome') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-2xl bg-white border border-black p-8">
                    <div className="text-center mb-12">
                        <img
                            src="/logo.png"
                            alt="FutureSteps"
                            className="h-32 mx-auto mb-8 mix-blend-multiply contrast-125 brightness-110"
                        />
                        <h1 className="text-4xl font-normal text-black mb-4 uppercase tracking-wide">
                            Welcome to FutureSteps
                        </h1>
                        <p className="text-lg text-gray-600 font-light max-w-md mx-auto">
                            Plan your financial future with precision
                        </p>
                    </div>

                    <div className="space-y-4 max-w-md mx-auto">
                        <button
                            onClick={() => setIsSignInModalOpen(true)}
                            className="w-full px-8 py-4 bg-black text-white hover:bg-gray-800 font-normal uppercase tracking-wide text-sm transition-colors"
                            data-testid="welcome-signin-button"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setMode('signup')}
                            className="w-full px-8 py-4 bg-white border border-black text-black hover:bg-gray-50 font-normal uppercase tracking-wide text-sm transition-colors"
                            data-testid="welcome-signup-button"
                        >
                            Sign Up
                        </button>

                        <div className="border-t border-gray-200 pt-4">
                            <p className="text-xs text-gray-500 text-center mb-3">
                                ⚠️ Guest mode: Your data will NOT be saved permanently
                            </p>
                            <button
                                onClick={() => setMode('onboarding')}
                                className="w-full px-8 py-4 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-normal uppercase tracking-wide text-sm transition-colors"
                            >
                                Continue as Guest
                            </button>
                        </div>
                    </div>
                </div>

                <AuthModal
                    isOpen={isSignInModalOpen}
                    onClose={() => setIsSignInModalOpen(false)}
                    onSuccess={handleSignInSuccess}
                />
            </div>
        )
    }

    // Signup screen
    if (mode === 'signup') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md bg-white border border-black p-8">
                    <h2 className="text-3xl font-normal text-black mb-2 uppercase tracking-wide">
                        Create Account
                    </h2>
                    <p className="text-gray-600 font-light mb-8">
                        Enter your credentials to get started
                    </p>

                    <div className="space-y-6">
                        <div>
                            <label htmlFor="signup-email" className="block text-sm font-normal text-black mb-2 uppercase tracking-wide">
                                Email *
                            </label>
                            <input
                                id="signup-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="w-full px-4 py-3 border border-black focus:outline-none focus:ring-1 focus:ring-black font-light"
                                data-testid="signup-email-input"
                                aria-label="Signup Email"
                            />
                        </div>

                        <div>
                            <label htmlFor="signup-password" className="block text-sm font-normal text-black mb-2 uppercase tracking-wide">
                                Password *
                            </label>
                            <input
                                id="signup-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Min. 6 characters"
                                minLength={6}
                                className="w-full px-4 py-3 border border-black focus:outline-none focus:ring-1 focus:ring-black font-light"
                                data-testid="signup-password-input"
                                aria-label="Signup Password"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <button
                                onClick={handleSignUp}
                                disabled={loading}
                                className="w-full px-6 py-4 bg-black text-white hover:bg-gray-800 font-normal uppercase tracking-wide text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                data-testid="signup-create-account-button"
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                            <button
                                onClick={() => setMode('welcome')}
                                disabled={loading}
                                className="w-full text-gray-500 hover:text-black text-sm underline disabled:opacity-50"
                            >
                                Back
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Onboarding slides
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white border border-black p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-light mb-2">FutureSteps</h1>
                    <p className="text-gray-600 text-sm">Financial projection planning</p>
                </div>

                <div
                    className="transition-opacity duration-300"
                    style={{ opacity: fadeIn ? 1 : 0 }}
                >
                    {/* Slide 1: Personal Info */}
                    {currentSlide === 0 && (
                        <div>
                            <h2 className="text-3xl font-normal text-black mb-2 uppercase tracking-wide">
                                Personal Information
                            </h2>
                            <p className="text-gray-600 font-light mb-8">
                                Tell us about yourself to personalize your experience
                            </p>

                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="onboarding-name" className="block text-sm font-normal text-black mb-2 uppercase tracking-wide">
                                        Full Name *
                                    </label>
                                    <input
                                        id="onboarding-name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="w-full px-4 py-3 border border-black focus:outline-none focus:ring-1 focus:ring-black font-light"
                                        data-testid="onboarding-name-input"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="onboarding-dob" className="block text-sm font-normal text-black mb-2 uppercase tracking-wide">
                                        Date of Birth *
                                    </label>
                                    <input
                                        id="onboarding-dob"
                                        type="date"
                                        value={dateOfBirth}
                                        onChange={(e) => setDateOfBirth(e.target.value)}
                                        max={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 border border-black focus:outline-none focus:ring-1 focus:ring-black font-light"
                                        data-testid="onboarding-dob-input"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="onboarding-country" className="block text-sm font-normal text-black mb-2 uppercase tracking-wide">
                                        Country *
                                    </label>
                                    <select
                                        id="onboarding-country"
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        className="w-full px-4 py-3 border border-black focus:outline-none focus:ring-1 focus:ring-black font-light"
                                        data-testid="onboarding-country-select"
                                    >
                                        <option value="">Select your country</option>
                                        {COUNTRIES.map((c) => (
                                            <option key={c} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button
                                    onClick={() => setMode('welcome')}
                                    className="flex-1 px-6 py-3 bg-white border border-black text-black hover:bg-gray-50 font-normal uppercase tracking-wide text-sm transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={!canProceed()}
                                    className="flex-1 px-6 py-3 bg-black text-white hover:bg-gray-800 font-normal uppercase tracking-wide text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    data-testid="onboarding-next-button"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Slide 2: Plan Setup */}
                    {currentSlide === 1 && (
                        <div>
                            <h2 className="text-3xl font-normal text-black mb-2 uppercase tracking-wide">
                                Name Your Plan
                            </h2>
                            <p className="text-gray-600 font-light mb-8">
                                Give your first financial plan a name
                            </p>

                            <div>
                                <label htmlFor="onboarding-plan-name" className="block text-sm font-normal text-black mb-2 uppercase tracking-wide">
                                    Plan Name *
                                </label>
                                <input
                                    id="onboarding-plan-name"
                                    type="text"
                                    value={planName}
                                    onChange={(e) => setPlanName(e.target.value)}
                                    placeholder="e.g., Early Retirement, Dream Home"
                                    className="w-full px-4 py-3 border border-black focus:outline-none focus:ring-1 focus:ring-black font-light"
                                    data-testid="onboarding-plan-name-input"
                                />
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button
                                    onClick={handleBack}
                                    className="flex-1 px-6 py-3 bg-white border border-black text-black hover:bg-gray-50 font-normal uppercase tracking-wide text-sm transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={!canProceed()}
                                    className="flex-1 px-6 py-3 bg-black text-white hover:bg-gray-800 font-normal uppercase tracking-wide text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    data-testid="onboarding-plan-next-button"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Slide 3: Life Projection & Complete */}
                    {currentSlide === 2 && (
                        <div>
                            <h2 className="text-3xl font-normal text-black mb-2 uppercase tracking-wide">
                                Life Projection
                            </h2>
                            <p className="text-gray-600 font-light mb-8">
                                Based on your country's average, we've calculated your expected lifespan
                            </p>

                            <div className="bg-gray-50 border border-black p-6 mb-6">
                                <div className="text-center">
                                    <p className="text-sm font-normal text-black uppercase tracking-wide mb-2">
                                        Estimated Life Expectancy
                                    </p>
                                    <p className="text-3xl font-light text-black">
                                        {lifeExpectancy} Years
                                    </p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label htmlFor="onboarding-life-expectancy" className="block text-sm font-normal text-black mb-2 uppercase tracking-wide">
                                    Adjust Life Expectancy
                                </label>
                                <input
                                    id="onboarding-life-expectancy"
                                    type="number"
                                    value={lifeExpectancy}
                                    onChange={(e) => setLifeExpectancy(parseInt(e.target.value) || 85)}
                                    min="60"
                                    max="120"
                                    className="w-full px-4 py-3 border border-black focus:outline-none focus:ring-1 focus:ring-black font-light"
                                    data-testid="onboarding-life-expectancy-input"
                                />
                                <p className="text-xs text-gray-500 mt-2 font-light">
                                    You can change this later in settings
                                </p>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={handleCompleteOnboarding}
                                    disabled={loading}
                                    className="w-full px-6 py-4 bg-black text-white hover:bg-gray-800 font-normal uppercase tracking-wide text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    data-testid="onboarding-complete-button"
                                >
                                    {loading ? 'Saving...' : 'Get Started'}
                                </button>
                                <button
                                    onClick={handleBack}
                                    disabled={loading}
                                    className="w-full text-gray-500 hover:text-black text-sm underline disabled:opacity-50"
                                >
                                    Back
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Slide Indicators */}
                <div className="flex justify-center gap-2 mt-12">
                    {[0, 1, 2].map((index) => (
                        <div
                            key={index}
                            className={`h-2 w-2 transition-colors ${currentSlide === index ? 'bg-black' : 'bg-gray-300'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Onboarding
