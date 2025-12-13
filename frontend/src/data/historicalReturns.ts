// Historical market returns data (1970-2024)
// Sources:
// - S&P 500 Total Return: Yahoo Finance / FRED
// - 10-Year Treasury: FRED (Federal Reserve Economic Data)
// - CPI Inflation: Bureau of Labor Statistics

export interface YearlyReturn {
    year: number
    sp500Return: number      // S&P 500 total return (including dividends)
    bondReturn: number        // 10-year Treasury return
    inflationRate: number     // CPI inflation rate
}

/**
 * Historical annual returns from 1970-2024
 * Returns are expressed as decimals (e.g., 0.10 = 10%)
 */
export const HISTORICAL_RETURNS: YearlyReturn[] = [
    { year: 1970, sp500Return: 0.0401, bondReturn: 0.0812, inflationRate: 0.0574 },
    { year: 1971, sp500Return: 0.1431, bondReturn: 0.0920, inflationRate: 0.0440 },
    { year: 1972, sp500Return: 0.1898, bondReturn: 0.0543, inflationRate: 0.0327 },
    { year: 1973, sp500Return: -0.1466, bondReturn: 0.0394, inflationRate: 0.0621 },
    { year: 1974, sp500Return: -0.2647, bondReturn: 0.0569, inflationRate: 0.1103 },
    { year: 1975, sp500Return: 0.3720, bondReturn: 0.0919, inflationRate: 0.0913 },
    { year: 1976, sp500Return: 0.2384, bondReturn: 0.1175, inflationRate: 0.0586 },
    { year: 1977, sp500Return: -0.0718, bondReturn: 0.0471, inflationRate: 0.0651 },
    { year: 1978, sp500Return: 0.0656, bondReturn: 0.0741, inflationRate: 0.0761 },
    { year: 1979, sp500Return: 0.1844, bondReturn: 0.0578, inflationRate: 0.1135 },
    { year: 1980, sp500Return: 0.3242, bondReturn: 0.0367, inflationRate: 0.1355 },
    { year: 1981, sp500Return: -0.0491, bondReturn: 0.1540, inflationRate: 0.1025 },
    { year: 1982, sp500Return: 0.2155, bondReturn: 0.3209, inflationRate: 0.0619 },
    { year: 1983, sp500Return: 0.2256, bondReturn: 0.0235, inflationRate: 0.0323 },
    { year: 1984, sp500Return: 0.0627, bondReturn: 0.1543, inflationRate: 0.0439 },
    { year: 1985, sp500Return: 0.3165, bondReturn: 0.3097, inflationRate: 0.0356 },
    { year: 1986, sp500Return: 0.1847, bondReturn: 0.2422, inflationRate: 0.0186 },
    { year: 1987, sp500Return: 0.0525, bondReturn: 0.0270, inflationRate: 0.0368 },
    { year: 1988, sp500Return: 0.1661, bondReturn: 0.0853, inflationRate: 0.0413 },
    { year: 1989, sp500Return: 0.3169, bondReturn: 0.1811, inflationRate: 0.0480 },
    { year: 1990, sp500Return: -0.0310, bondReturn: 0.0818, inflationRate: 0.0540 },
    { year: 1991, sp500Return: 0.3047, bondReturn: 0.1792, inflationRate: 0.0424 },
    { year: 1992, sp500Return: 0.0762, bondReturn: 0.0805, inflationRate: 0.0303 },
    { year: 1993, sp500Return: 0.1008, bondReturn: 0.1517, inflationRate: 0.0296 },
    { year: 1994, sp500Return: 0.0132, bondReturn: -0.0773, inflationRate: 0.0261 },
    { year: 1995, sp500Return: 0.3758, bondReturn: 0.2341, inflationRate: 0.0281 },
    { year: 1996, sp500Return: 0.2296, bondReturn: 0.0043, inflationRate: 0.0298 },
    { year: 1997, sp500Return: 0.3336, bondReturn: 0.0959, inflationRate: 0.0233 },
    { year: 1998, sp500Return: 0.2858, bondReturn: 0.1302, inflationRate: 0.0155 },
    { year: 1999, sp500Return: 0.2104, bondReturn: -0.0751, inflationRate: 0.0219 },
    { year: 2000, sp500Return: -0.0910, bondReturn: 0.1660, inflationRate: 0.0338 },
    { year: 2001, sp500Return: -0.1189, bondReturn: 0.0551, inflationRate: 0.0283 },
    { year: 2002, sp500Return: -0.2210, bondReturn: 0.1515, inflationRate: 0.0159 },
    { year: 2003, sp500Return: 0.2869, bondReturn: 0.0238, inflationRate: 0.0227 },
    { year: 2004, sp500Return: 0.1088, bondReturn: 0.0481, inflationRate: 0.0268 },
    { year: 2005, sp500Return: 0.0491, bondReturn: 0.0293, inflationRate: 0.0339 },
    { year: 2006, sp500Return: 0.1579, bondReturn: 0.0197, inflationRate: 0.0323 },
    { year: 2007, sp500Return: 0.0549, bondReturn: 0.0984, inflationRate: 0.0285 },
    { year: 2008, sp500Return: -0.3700, bondReturn: 0.2025, inflationRate: 0.0385 },
    { year: 2009, sp500Return: 0.2646, bondReturn: -0.0822, inflationRate: -0.0036 },
    { year: 2010, sp500Return: 0.1506, bondReturn: 0.0854, inflationRate: 0.0164 },
    { year: 2011, sp500Return: 0.0211, bondReturn: 0.1675, inflationRate: 0.0316 },
    { year: 2012, sp500Return: 0.1600, bondReturn: 0.0297, inflationRate: 0.0207 },
    { year: 2013, sp500Return: 0.3239, bondReturn: -0.0901, inflationRate: 0.0150 },
    { year: 2014, sp500Return: 0.1369, bondReturn: 0.1086, inflationRate: 0.0076 },
    { year: 2015, sp500Return: 0.0138, bondReturn: 0.0087, inflationRate: 0.0012 },
    { year: 2016, sp500Return: 0.1196, bondReturn: 0.0069, inflationRate: 0.0131 },
    { year: 2017, sp500Return: 0.2183, bondReturn: 0.0241, inflationRate: 0.0213 },
    { year: 2018, sp500Return: -0.0438, bondReturn: 0.0002, inflationRate: 0.0244 },
    { year: 2019, sp500Return: 0.3157, bondReturn: 0.0850, inflationRate: 0.0181 },
    { year: 2020, sp500Return: 0.1840, bondReturn: 0.1104, inflationRate: 0.0124 },
    { year: 2021, sp500Return: 0.2889, bondReturn: -0.0243, inflationRate: 0.0470 },
    { year: 2022, sp500Return: -0.1811, bondReturn: -0.1731, inflationRate: 0.0801 },
    { year: 2023, sp500Return: 0.2643, bondReturn: 0.0297, inflationRate: 0.0410 },
    { year: 2024, sp500Return: 0.2500, bondReturn: 0.0450, inflationRate: 0.0335 }, // Estimated
]

/**
 * Get a random year's historical returns
 */
export function getRandomHistoricalYear(): YearlyReturn {
    const randomIndex = Math.floor(Math.random() * HISTORICAL_RETURNS.length)
    return HISTORICAL_RETURNS[randomIndex]
}

/**
 * Get historical return for a specific year
 */
export function getHistoricalReturn(year: number): YearlyReturn | null {
    return HISTORICAL_RETURNS.find(r => r.year === year) || null
}

/**
 * Calculate statistics from historical data
 */
export function calculateHistoricalStats() {
    const returns = HISTORICAL_RETURNS

    const avgSP500 = returns.reduce((sum, r) => sum + r.sp500Return, 0) / returns.length
    const avgBond = returns.reduce((sum, r) => sum + r.bondReturn, 0) / returns.length
    const avgInflation = returns.reduce((sum, r) => sum + r.inflationRate, 0) / returns.length

    return {
        sp500: {
            mean: avgSP500,
            min: Math.min(...returns.map(r => r.sp500Return)),
            max: Math.max(...returns.map(r => r.sp500Return)),
        },
        bonds: {
            mean: avgBond,
            min: Math.min(...returns.map(r => r.bondReturn)),
            max: Math.max(...returns.map(r => r.bondReturn)),
        },
        inflation: {
            mean: avgInflation,
            min: Math.min(...returns.map(r => r.inflationRate)),
            max: Math.max(...returns.map(r => r.inflationRate)),
        },
        yearRange: {
            start: returns[0].year,
            end: returns[returns.length - 1].year,
            totalYears: returns.length,
        }
    }
}
