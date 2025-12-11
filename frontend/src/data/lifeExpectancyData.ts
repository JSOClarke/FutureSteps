// Life expectancy data by country (in years)
// Source: World Bank / WHO data (approximate 2023 values)

export const LIFE_EXPECTANCY_DATA: Record<string, number> = {
    'Afghanistan': 64.8,
    'Albania': 78.6,
    'Algeria': 76.9,
    'Argentina': 76.7,
    'Australia': 83.4,
    'Austria': 81.6,
    'Bangladesh': 72.6,
    'Belgium': 81.9,
    'Brazil': 75.9,
    'Canada': 82.3,
    'Chile': 80.2,
    'China': 77.5,
    'Colombia': 77.3,
    'Denmark': 81.4,
    'Egypt': 72.0,
    'Finland': 81.9,
    'France': 82.7,
    'Germany': 81.3,
    'Greece': 81.5,
    'India': 70.4,
    'Indonesia': 71.7,
    'Iran': 76.7,
    'Iraq': 70.6,
    'Ireland': 82.4,
    'Israel': 83.0,
    'Italy': 83.6,
    'Japan': 84.6,
    'Kenya': 66.7,
    'Mexico': 75.1,
    'Netherlands': 82.3,
    'New Zealand': 82.3,
    'Nigeria': 54.7,
    'Norway': 83.2,
    'Pakistan': 67.3,
    'Peru': 76.7,
    'Philippines': 71.2,
    'Poland': 78.0,
    'Portugal': 81.3,
    'Romania': 76.1,
    'Russia': 72.6,
    'Saudi Arabia': 75.1,
    'Singapore': 83.6,
    'South Africa': 64.4,
    'South Korea': 83.5,
    'Spain': 83.6,
    'Sweden': 83.0,
    'Switzerland': 83.8,
    'Thailand': 77.7,
    'Turkey': 77.7,
    'Ukraine': 72.1,
    'United Arab Emirates': 78.7,
    'United Kingdom': 81.3,
    'United States': 78.5,
    'Vietnam': 75.4,
}

export const DEFAULT_LIFE_EXPECTANCY = 78.0

export const COUNTRIES = Object.keys(LIFE_EXPECTANCY_DATA).sort()

export function getLifeExpectancy(country: string): number {
    return LIFE_EXPECTANCY_DATA[country] || DEFAULT_LIFE_EXPECTANCY
}

export function calculateDeathDate(dateOfBirth: string, country: string): string {
    const dob = new Date(dateOfBirth)
    const lifeExpectancy = getLifeExpectancy(country)

    const deathDate = new Date(dob)
    deathDate.setFullYear(dob.getFullYear() + Math.floor(lifeExpectancy))

    return deathDate.toISOString().split('T')[0]
}
