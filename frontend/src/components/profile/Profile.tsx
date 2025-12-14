import { useState, useEffect } from 'react'
import { useUser } from '../../context/UserContext'
import { PageHeader } from '../shared/PageHeader'
import { SUPPORTED_CURRENCIES } from '../../data/currencyData'

function Profile() {
    const { userProfile, updateProfile } = useUser()

    const [fullName, setFullName] = useState(userProfile?.full_name || '')
    const [dateOfBirth, setDateOfBirth] = useState(userProfile?.dateOfBirth || '')
    const [country, setCountry] = useState(userProfile?.country || '')
    const [customDeathDate, setCustomDeathDate] = useState(userProfile?.customDeathDate || '')
    const [currency, setCurrency] = useState(userProfile?.currency || 'USD')

    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (userProfile) {
            setFullName(userProfile.full_name || '')
            setDateOfBirth(userProfile.dateOfBirth || '')
            setCountry(userProfile.country || '')
            setCustomDeathDate(userProfile.customDeathDate || '')
            setCurrency(userProfile.currency || 'USD')
        }
    }, [userProfile])

    const handleSave = async () => {
        setIsSaving(true)
        setMessage(null)

        try {
            await updateProfile({
                full_name: fullName,
                dateOfBirth: dateOfBirth,
                country: country,
                customDeathDate: customDeathDate || undefined,
                currency: currency
            })
            setMessage({ type: 'success', text: 'Profile updated successfully!' })
        } catch (error) {
            console.error('Failed to update profile:', error)
            setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="w-full space-y-6">
            <PageHeader
                title="Profile"
                subtitle="Manage your personal information and preferences"
            />

            {/* Profile Form */}
            <div className="border border-black p-8 bg-white">
                <div className="max-w-2xl">
                    <div className="space-y-6">
                        {/* Full Name */}
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="John Doe"
                            />
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-2">
                                Date of Birth
                            </label>
                            <input
                                type="date"
                                id="dob"
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Country */}
                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                                Country
                            </label>
                            <input
                                type="text"
                                id="country"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="United States"
                            />
                        </div>

                        {/* Custom Death Date */}
                        <div>
                            <label htmlFor="deathDate" className="block text-sm font-medium text-gray-700 mb-2">
                                Custom Death Date (Optional)
                            </label>
                            <input
                                type="date"
                                id="deathDate"
                                value={customDeathDate}
                                onChange={(e) => setCustomDeathDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-gray-500 text-sm mt-1">
                                Leave empty to use the default life expectancy calculation.
                            </p>
                        </div>

                        {/* Currency */}
                        <div>
                            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                                Currency
                            </label>
                            <select
                                id="currency"
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="w-full px-3 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black bg-white font-light"
                            >
                                {SUPPORTED_CURRENCIES.map(curr => (
                                    <option key={curr.code} value={curr.code}>
                                        {curr.name} ({curr.symbol})
                                    </option>
                                ))}
                            </select>
                            <p className="text-gray-500 text-sm mt-1">
                                This will be used for all monetary values throughout the application.
                            </p>
                        </div>

                        {/* Save Button */}
                        <div className="flex items-center gap-4 pt-4">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-6 py-2 bg-black text-white hover:bg-gray-800 font-medium transition-colors disabled:bg-gray-400"
                            >
                                {isSaving ? 'Saving...' : 'Save Profile'}
                            </button>
                            {message && (
                                <p className={`font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                    {message.text}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile
