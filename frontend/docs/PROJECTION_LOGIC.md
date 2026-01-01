# Financial Projection Logic Documentation

This document explains the mathematical engine and transformation logic behind the financial projections in FutureSteps.

## 1. Core Projection Engine (Nominal Values)

The engine runs year-by-year, starting from the current year. It uses **Nominal Values**, which represent the actual number of dollars expected to be in your bank account in the future.

### A. Income & Expenses
- **Annualization**: All items (Monthly, Annual) are converted to an annual sum.
- **Inflation Adjustment**: 
  - If "Adjust for Inflation" is enabled, the nominal amount increases every year by the global inflation rate.
  - Calculation: `Amount * (1 + Inflation Rate)^(Year - Plan Start Year)`.
  - This ensures your expenses/income keep their real value ("Purchasing Power") over time.

### B. Liabilities
- Interest is calculated on the current balance: `Balance * Interest Rate`.
- Minimum payments are subtracted from the cashflow first.
- If cashflow is positive, additional debt can be paid off based on priority (if configured).

### C. Cashflow & Waterfall Allocation
- **Net Cashflow** = `Total Income - Total Expenses - Liability Payments`.
- **Surplus**: If positive, cash is added to assets based on a **Priority Waterfall**. It fills up accounts with contribution limits (like ISAs/401ks) first before moving to unlimited accounts.
- **Deficit**: If negative, cash is withdrawn from assets based on a priority list until the deficit is covered.

### D. Asset Growth (Mid-Year Convention)
FutureSteps uses the **Mid-Year Convention** for more realistic growth:
1. **Principal Growth**: The opening balance grows for the full year.
2. **Flow Growth**: New contributions (which happen throughout the year) grow for only half the year on average.
- `Total Growth = (Opening Balance * Rate) + (New Contributions * Rate * 0.5)`.

### E. Asset Yield
Yield (Dividends/Interest) is calculated on the asset balance **after** growth is applied.

---

## 2. "Today's Money" Transformation (Real Values)

Switching to "Today's Money" transforms the nominal future dollars back into their **Purchasing Power** relative to today.

### A. The Deflation Factor
We use a `Cumulative Inflation Factor`: `(1 + Inflation Rate)^YearsFromNow`.
To get Today's Money, we divide the future amount by this factor:
- `Real Value = Nominal Value / (1 + Inflation Rate)^n`

### B. Yield Breakdown (Passive Income)
In "Today's Money" mode, the Yield is deflated to show its real value.
- **Inflation Discount**: The UI shows the difference between the Nominal yield you'll get and what it's actually worth today.
- **Logic**: If inflation is 5%, a $400 nominal yield is only worth ~$381 today. The UI shows this as "Nominal Value: $400" and "Inflation Discount: -$19".

### C. Asset Real Returns Breakdown
This section explains why an asset's value changed in real terms.
1. **Market Gains (Real)**: The deflated version of the asset's price growth.
2. **Yield (Real)**: The deflated version of dividends/interest.
3. **Inflation Impact (Principal)**: This is the "hidden" loss of purchasing power on your existing savings.
   - Example: If you have $10,000 and inflation is 5%, you need $10,500 just to stay even. If you still have $10,000, you have "lost" ~$476 in purchasing power.

### D. Calculation Summary
`Total Real Return = Real Market Gains + Real Yield + Inflation Impact (Principal)`.

---

## 3. UI Key Terms

- **Nominal Mode**: "Bank Statement" view. What the numbers will look like in the future.
- **Today's Money Mode**: "Standard of Living" view. What you can buy with that money compared to today's prices.
- **Adjust for Inflation (Toggle on Item)**: If ON, the item's nominal value grows to keep up with inflation. If OFF, the item stays flat in nominal terms (effectively losing value every year).
