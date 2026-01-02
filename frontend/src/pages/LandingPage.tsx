import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import AuthModal from '../components/shared/AuthModal'
import { Carousel } from '../components/shared/Carousel'

export default function LandingPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

    // Redirect authenticated users to dashboard
    useEffect(() => {
        if (user) {
            navigate('/dashboard')
        }
    }, [user, navigate])

    const handleSignIn = () => {
        setIsAuthModalOpen(true)
    }

    const handleGetStarted = () => {
        // For now, just show the auth modal
        // In the future, you could show a signup-specific modal
        setIsAuthModalOpen(true)
    }

    const handleAuthSuccess = () => {
        setIsAuthModalOpen(false)
        // User will be redirected by the useEffect above
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="border-b border-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <img
                                src="/logo.png"
                                alt="FutureSteps Logo"
                                className="h-8 mix-blend-multiply contrast-125 brightness-110"
                            />
                            <h1 className="text-xl font-normal uppercase tracking-wide">FutureSteps</h1>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={handleSignIn}
                                className="px-6 py-2 border border-black hover:bg-gray-50 font-normal text-sm uppercase tracking-wide transition-colors"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={handleGetStarted}
                                className="px-6 py-2 bg-black text-white hover:bg-gray-800 font-normal text-sm uppercase tracking-wide transition-colors"
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="bg-white border-b border-black pt-20 pb-24 overflow-hidden relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h1 className="text-4xl sm:text-6xl font-light tracking-tight text-black mb-6">
                            Plan Your Financial Future
                        </h1>
                        <p className="text-xl sm:text-2xl font-light text-gray-600 mb-10 leading-relaxed">
                            Create detailed financial projections, track your progress, and make informed decisions about your future.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={handleGetStarted}
                                className="px-8 py-4 bg-black text-white hover:bg-gray-800 font-normal text-sm uppercase tracking-wide transition-colors shadow-lg"
                            >
                                Start Planning Free
                            </button>
                            <button
                                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                                className="px-8 py-4 bg-white border border-black hover:bg-gray-50 font-normal text-sm uppercase tracking-wide transition-colors"
                            >
                                Learn More
                            </button>
                        </div>
                    </div>

                    {/* Screenshot Container */}
                    <div className="relative max-w-5xl mx-auto mt-12 mb-8">
                        {/* Colored Shadow Effect - Left aligned */}
                        <div className="absolute top-10 -left-10 w-full h-full bg-blue-100 rounded-xl transform -rotate-1 skew-y-1 block z-0"></div>
                        <div className="absolute top-10 -left-10 w-full h-full bg-blue-500/10 blur-3xl rounded-full z-0"></div>

                        {/* Main Image */}
                        <img
                            src="/sitescreenshots/hero/full_app_plans.png"
                            alt="Financial Plans Overview"
                            className="relative z-10 w-full rounded-lg border border-gray-200 shadow-2xl bg-white"
                        />
                    </div>
                </div>
            </section>

            {/* Screenshot Carousel */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h2 className="text-3xl font-normal text-center mb-12 uppercase tracking-wide">
                    See It In Action
                </h2>
                <Carousel
                    images={[
                        {
                            src: '/sitescreenshots/carousel/linegraph.png',
                            alt: 'Financial Projections - Track your financial future with detailed year-by-year projections'
                        },
                        {
                            src: '/sitescreenshots/carousel/barchart.png',
                            alt: 'Financial Analysis - Visualize your income, expenses, assets, and liabilities'
                        },
                        {
                            src: '/sitescreenshots/carousel/cashflowsankey.png',
                            alt: 'Cash Flow Visualization - Understand where your money flows with interactive diagrams'
                        }
                    ]}
                    autoPlayInterval={5000}
                />
            </section>

            {/* Features Section */}
            <section id="features" className="bg-gray-50 border-y border-black py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-normal text-center mb-16 uppercase tracking-wide">
                        Everything You Need
                    </h2>
                    <div className="grid md:grid-cols-3 gap-12">
                        {/* Feature 1 */}
                        <div className="text-center">
                            <h3 className="text-xl font-normal mb-4 uppercase tracking-wide">
                                Financial Projections
                            </h3>
                            <p className="text-gray-600 font-light">
                                Create detailed year-by-year projections for income, expenses, assets, and liabilities.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="text-center">
                            <h3 className="text-xl font-normal mb-4 uppercase tracking-wide">
                                Milestone Tracking
                            </h3>
                            <p className="text-gray-600 font-light">
                                Set financial goals and track your progress towards retirement, home ownership, and more.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="text-center">
                            <h3 className="text-xl font-normal mb-4 uppercase tracking-wide">
                                Multiple Scenarios
                            </h3>
                            <p className="text-gray-600 font-light">
                                Compare different financial plans side-by-side to make the best decisions for your future.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center border-2 border-black p-12 sm:p-16">
                    <h2 className="text-3xl sm:text-4xl font-light mb-6">
                        Ready to Take Control?
                    </h2>
                    <p className="text-xl font-light text-gray-600 mb-8 max-w-2xl mx-auto">
                        Start planning your financial future today. No credit card required.
                    </p>
                    <button
                        onClick={handleGetStarted}
                        className="px-8 py-4 bg-black text-white hover:bg-gray-800 font-normal text-sm uppercase tracking-wide transition-colors"
                    >
                        Get Started Free
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-black bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center">
                        <p className="text-sm font-light text-gray-600">
                            © {new Date().getFullYear()} FutureSteps. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>

            {/* Auth Modal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={handleAuthSuccess}
            />
        </div>
    )
}
