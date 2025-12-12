import { SUPPORTED_CURRENCIES } from '../data/currencyData'

export const formatCurrency = (value: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value)
}

/**
 * Get the currency symbol for a given currency code
 * @param currency - ISO currency code (e.g., 'USD', 'EUR', 'GBP')
 * @returns currency symbol (e.g., '$', '€', '£')
 */
export const getCurrencySymbol = (currency: string = 'USD'): string => {
    const currencyInfo = SUPPORTED_CURRENCIES.find(c => c.code === currency)
    return currencyInfo?.symbol || '$'
}
