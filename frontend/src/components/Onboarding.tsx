import { useState } from 'react'
import { useUser } from '../context/UserContext'
import { COUNTRIES, calculateDeathDate } from '../data/lifeExpectancyData'

function Onboarding() {
    const { createProfile } = useUser()
    const [currentSlide, setCurrentSlide] = useState(0)
    const [fadeIn, setFadeIn] = useState(true)

    // Form data
    const [name, setName] = useState('')
    const [dateOfBirth, setDateOfBirth] = useState('')
    const [country, setCountry] = useState('')
    const [customDeathDate, setCustomDeathDate] = useState('')

    const calculatedDeathDate = dateOfBirth && country
        ? calculateDeathDate(dateOfBirth, country)
        : ''

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

    const handleComplete = () => {
        if (!name || !dateOfBirth || !country) {
            alert('Please fill in all required fields')
            return
        }

        // Fade out before completing
        setFadeIn(false)
        setTimeout(() => {
            createProfile({
                name,
                dateOfBirth,
                country,
                customDeathDate: customDeathDate || calculatedDeathDate,
            })
        }, 300)
    }

    const canProceed = () => {
        if (currentSlide === 0) return true
        if (currentSlide === 1) return name && dateOfBirth && country
        return true
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-8">
            <div className="w-full max-w-2xl">
                {/* Slide Content with Fade */}
                <div
                    className="transition-opacity duration-300"
                    style={{ opacity: fadeIn ? 1 : 0 }}
                >
                    {/* Slide 1: Welcome */}
                    {currentSlide === 0 && (
                        <div className="text-center">
                            <img
                                src="/chronos-logo.png"
                                alt="Chronos"
                                className="h-32 mx-auto mb-8"
                            />
                            <h1 className="text-4xl font-normal text-black mb-4 uppercase tracking-wide">
                                Welcome to Chronos
                            </h1>
                            <p className="text-lg text-gray-600 font-light mb-12 max-w-md mx-auto">
                                Plan your financial future with precision. Let's start by getting to know you.
                            </p>
                            <button
                                onClick={handleNext}
                                className="px-8 py-4 bg-black text-white hover:bg-gray-800 font-normal uppercase tracking-wide text-sm transition-colors"
                            >
                                Get Started
                            </button>
                        </div>
                    )}

                    {/* Slide 2: Personal Info */}
                    {currentSlide === 1 && (
                        <div>
                            <h2 className="text-3xl font-normal text-black mb-2 uppercase tracking-wide">
                                Personal Information
                            </h2>
                            <p className="text-gray-600 font-light mb-8">
                                Tell us about yourself to personalize your experience
                            </p>

                            <div className="space-y-6">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-normal text-black mb-2 uppercase tracking-wide">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="w-full px-4 py-3 border border-black focus:outline-none focus:ring-1 focus:ring-black font-light"
                                    />
                                </div>

                                {/* Date of Birth */}
                                <div>
                                    <label className="block text-sm font-normal text-black mb-2 uppercase tracking-wide">
                                        Date of Birth *
                                    </label>
                                    <input
                                        type="date"
                                        value={dateOfBirth}
                                        onChange={(e) => setDateOfBirth(e.target.value)}
                                        max={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 border border-black focus:outline-none focus:ring-1 focus:ring-black font-light"
                                    />
                                </div>

                                {/* Country */}
                                <div>
                                    <label className="block text-sm font-normal text-black mb-2 uppercase tracking-wide">
                                        Country *
                                    </label>
                                    <select
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        className="w-full px-4 py-3 border border-black focus:outline-none focus:ring-1 focus:ring-black font-light"
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
                                    onClick={handleBack}
                                    className="flex-1 px-6 py-3 bg-white border border-black text-black hover:bg-gray-50 font-normal uppercase tracking-wide text-sm transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={!canProceed()}
                                    className="flex-1 px-6 py-3 bg-black text-white hover:bg-gray-800 font-normal uppercase tracking-wide text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Slide 3: Life Projection */}
                    {currentSlide === 2 && (
                        <div>
                            <h2 className="text-3xl font-normal text-black mb-2 uppercase tracking-wide">
                                Life Projection
                            </h2>
                            <p className="text-gray-600 font-light mb-8">
                                Based on your country's average, we've calculated your expected lifespan
                            </p>

                            <div className="bg-gray-50 border border-black p-6 mb-6">
                                <div className="text-center mb-4">
                                    <p className="text-sm font-normal text-black uppercase tracking-wide mb-2">
                                        Estimated End Date
                                    </p>
                                    <p className="text-3xl font-light text-black">
                                        {new Date(calculatedDeathDate).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* Custom Death Date */}
                            <div>
                                <label className="block text-sm font-normal text-black mb-2 uppercase tracking-wide">
                                    Customize End Date (Optional)
                                </label>
                                <input
                                    type="date"
                                    value={customDeathDate}
                                    onChange={(e) => setCustomDeathDate(e.target.value)}
                                    min={dateOfBirth}
                                    className="w-full px-4 py-3 border border-black focus:outline-none focus:ring-1 focus:ring-black font-light"
                                />
                                <p className="text-xs text-gray-500 mt-2 font-light">
                                    You can change this later in settings
                                </p>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button
                                    onClick={handleBack}
                                    className="flex-1 px-6 py-3 bg-white border border-black text-black hover:bg-gray-50 font-normal uppercase tracking-wide text-sm transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleComplete}
                                    className="flex-1 px-6 py-3 bg-black text-white hover:bg-gray-800 font-normal uppercase tracking-wide text-sm transition-colors"
                                >
                                    Complete Setup
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
