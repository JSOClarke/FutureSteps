import { useState, useEffect } from 'react'
import { useSettings } from '../context/SettingsContext'

interface SettingsProps {
    onBack: () => void
}

function Settings({ onBack }: SettingsProps) {
    const { settings, defaultEndYear, updateSettings } = useSettings()
    const currentYear = new Date().getFullYear()

    const [birthYear, setBirthYear] = useState(settings.birthYear?.toString() || '')
    const [customEndYear, setCustomEndYear] = useState(settings.customEndYear?.toString() || '')
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [saveMessage, setSaveMessage] = useState('')

    // Update local state when settings change
    useEffect(() => {
        setBirthYear(settings.birthYear?.toString() || '')
        setCustomEndYear(settings.customEndYear?.toString() || '')
    }, [settings])

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (birthYear) {
            const year = Number(birthYear)
            if (isNaN(year)) {
                newErrors.birthYear = 'Must be a valid year'
            } else if (year < 1900 || year > currentYear) {
                newErrors.birthYear = `Must be between 1900 and ${currentYear}`
            }
        }

        if (customEndYear) {
            const year = Number(customEndYear)
            if (isNaN(year)) {
                newErrors.customEndYear = 'Must be a valid year'
            } else if (year < currentYear || year > 2150) {
                newErrors.customEndYear = `Must be between ${currentYear} and 2150`
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSave = () => {
        if (!validate()) {
            return
        }

        updateSettings({
            birthYear: birthYear ? Number(birthYear) : null,
            customEndYear: customEndYear ? Number(customEndYear) : null
        })

        setSaveMessage('Settings saved successfully!')
        setTimeout(() => setSaveMessage(''), 3000)
    }

    const calculatedEndYear = birthYear ? Number(birthYear) + 80 : null

    return (
        <div className="w-full">
            {/* Header */}
            <div className="border border-black p-6 mb-4 bg-white">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="px-4 py-2 bg-gray-200 border-2 border-gray-400 text-gray-800 hover:bg-gray-300 font-medium transition-colors"
                    >
                        ← Back to Dashboard
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                </div>
            </div>

            {/* Settings Form */}
            <div className="border border-black p-8 bg-white">
                <div className="max-w-2xl">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Default End Year Configuration</h2>

                    <p className="text-gray-600 mb-6">
                        Configure the default end year for income and expenses. This will be automatically
                        applied when creating new financial items.
                    </p>

                    <div className="space-y-6">
                        {/* Birth Year */}
                        <div>
                            <label htmlFor="birthYear" className="block text-sm font-medium text-gray-700 mb-2">
                                Birth Year
                            </label>
                            <input
                                type="number"
                                id="birthYear"
                                value={birthYear}
                                onChange={(e) => setBirthYear(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={`e.g., ${currentYear - 30}`}
                                min="1900"
                                max={currentYear}
                            />
                            {errors.birthYear && <p className="text-red-500 text-sm mt-1">{errors.birthYear}</p>}
                            {calculatedEndYear && !errors.birthYear && (
                                <p className="text-gray-600 text-sm mt-1">
                                    Based on life expectancy of 80 years, your default end year will be: <strong>{calculatedEndYear}</strong>
                                </p>
                            )}
                        </div>

                        {/* Custom End Year Override */}
                        <div>
                            <label htmlFor="customEndYear" className="block text-sm font-medium text-gray-700 mb-2">
                                Custom End Year Override (Optional)
                            </label>
                            <input
                                type="number"
                                id="customEndYear"
                                value={customEndYear}
                                onChange={(e) => setCustomEndYear(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Leave empty to use calculated end year"
                                min={currentYear}
                                max="2150"
                            />
                            {errors.customEndYear && <p className="text-red-500 text-sm mt-1">{errors.customEndYear}</p>}
                            <p className="text-gray-600 text-sm mt-1">
                                If set, this will override the calculated end year from your birth year.
                            </p>
                        </div>

                        {/* Current Default Display */}
                        {defaultEndYear > 0 && (
                            <div className="p-4 bg-blue-50 border border-blue-200">
                                <p className="text-sm font-medium text-gray-800">
                                    Current default end year: <strong className="text-blue-700">{defaultEndYear}</strong>
                                </p>
                            </div>
                        )}

                        {/* Save Button */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 bg-blue-500 text-white hover:bg-blue-600 font-medium transition-colors"
                            >
                                Save Settings
                            </button>
                            {saveMessage && (
                                <p className="text-green-600 font-medium">{saveMessage}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Settings
