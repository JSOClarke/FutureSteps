<div align="center">
  <img src="frontend/public/logo.png" alt="FutureSteps Logo" width="200"/>
  
  # FutureSteps
  
  **Advanced Financial Projection & Retirement Planning Tool**
  
  Plan your financial future with precision using interactive projections, Monte Carlo simulations, and comprehensive portfolio analysis.
  
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  
</div>

---

## Overview

FutureSteps is a sophisticated financial planning application that helps users visualize their financial future through detailed projections, milestone tracking, and retirement simulations. Built with modern web technologies, it provides an intuitive interface for managing income, expenses, assets, and liabilities while projecting net worth trajectories over time.

## Key Features

### Financial Projections
- **Interactive Visualizations**: Toggle between bar and line charts with real-time data updates
- **Year-by-Year Analysis**: Click any year to view detailed financial breakdowns
- **Net Worth Tracking**: Monitor projected net worth growth over your lifetime
- **Multi-Currency Support**: 30+ currencies with automatic formatting and country-based defaults
- **Responsive Design**: Optimized for desktop, tablet, and mobile viewing

### Comprehensive Financial Management
- **Income Tracking**: Salary, bonuses, investment returns, and more
  - Configurable start/end years
  - Annual growth rates
  - One-time or recurring
- **Expense Management**: Track all expenses with inflation adjustments
  - Living expenses
  - Discretionary spending
  - One-time purchases
- **Asset Portfolio**: Complete asset tracking
  - Stocks, bonds, ETFs
  - Real estate
  - Retirement accounts (401k, IRA)
  - Cash and savings
- **Liability Management**: Monitor all debts
  - Mortgages with amortization
  - Auto loans
  - Student loans
  - Credit card debt

### Milestone Planning
- **Goal Setting**: Define financial milestones (retirement age, target net worth, etc.)
- **Visual Markers**: See milestone achievements directly on projection charts
- **Dual Milestone Types**:
  - Year-based (e.g., "Retire at 65")
  - Value-based (e.g., "$1M net worth")
- **Quick Management**: Add, edit, and delete milestones on the fly

### Monte Carlo Retirement Simulation
- **1000+ Simulations**: Statistical analysis of retirement outcomes
- **4% Withdrawal Rule**: Industry-standard safe withdrawal rate calculations
- **Success Rate Analysis**: Probability-based retirement planning
- **Portfolio Scenarios**: Test different asset allocations
- **Visual Path Analysis**: See median, best, and worst-case scenarios
- **Two Simulation Modes**:
  - **Custom Simulation** (Reports page): Freeform analysis with any parameters
  - **Plan-Specific Simulation** (Plans page): Locked to current plan data

### Financial Snapshots Dashboard
- **Point-in-Time Recording**: Save current financial state
- **Historical Tracking**: View all past snapshots
- **Itemized Breakdowns**: Drill down into each snapshot's details
- **Category Summaries**: See income, expenses, assets, liabilities at a glance
- **Net Worth History**: Track your net worth changes over time
- **Expandable Details**: View individual items within each snapshot

### Multi-Plan Support
- **Unlimited Plans**: Create different financial scenarios
  - Conservative
  - Aggressive
  - Retirement-focused
  - Custom scenarios
- **Plan Duplication**: Copy existing plans to test variations
- **Quick Switching**: Toggle between plans via sidebar
- **Modal-Based Creation**: Streamlined plan creation workflow
- **Auto-Navigation**: Automatically switch to new plans after creation

### Smart Priority Management
- **Surplus Allocation**: Automatically distribute extra cash flow
  - Retirement accounts
  - Investment accounts
  - Debt paydown
  - Emergency fund
- **Deficit Coverage**: Define how shortfalls are covered
  - Liquid savings
  - Investment liquidation
  - Credit/loans

### Modern User Experience
- **Responsive Sidebar**: Collapsible navigation with plan management
- **Mobile-Optimized**: FAB-style menu button, auto-collapse navigation
- **Consistent Headers**: Reusable PageHeader component across all pages
- **Guest Mode**: Try the app without signing up
  - **WARNING**: Data stored locally only and will be lost
  - Local storage persistence
  - Easy upgrade to full account
- **Authenticated Mode**: Full data persistence with Supabase
- **Clean Interface**: Minimalist, professional design

### Flexible Authentication
- **Guest Mode**: Start immediately without signup
  - Clear visibility of guest status
  - Persistent reminders about data loss
  - One-click upgrade to authenticated account
- **Email/Password**: Traditional account creation
- **Future: Google OAuth**: One-click sign-in (coming soon)

## Technology Stack

### Frontend
- **React 19** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **TailwindCSS 4** - Utility-first CSS framework
- **shadcn/ui** - High-quality, accessible UI components (Radix UI)
- **Recharts** - Interactive data visualization
- **Lucide React** - Beautiful icon library
- **React Router** - Client-side routing

### Backend & Storage
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Real-time subscriptions
  - Row-Level Security (RLS)
  - Email/password authentication
- **localStorage** - Guest mode persistence

### State Management
- **React Context API** - Global state
  - AuthContext
  - UserContext
  - PlansContext
  - FinancialItemsContext
  - SnapshotsContext
  - SettingsContext

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (for authenticated users)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/FutureSteps.git
   cd FutureSteps/Apollo2.0
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase** (Optional for guest mode)
   - Create a new Supabase project
   - Run the database migrations from `/migrations`
   - Configure authentication providers

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

## Project Structure

```
Apollo2.0/
├── frontend/
│   ├── public/
│   │   ├── logo.png
│   │   └── favicon.png
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/          # Snapshot dashboard
│   │   │   ├── financial/          # Income, expenses, assets, liabilities
│   │   │   ├── layouts/            # MainLayout
│   │   │   ├── milestones/         # Milestone management
│   │   │   ├── plans/              # Plan modals & components
│   │   │   ├── priorities/         # Surplus/deficit allocation
│   │   │   ├── profile/            # User profile & settings
│   │   │   ├── projections/        # Charts and visualizations
│   │   │   ├── retirement/         # Monte Carlo simulation
│   │   │   ├── shared/             # Reusable components
│   │   │   │   ├── AuthModal.tsx
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── PageHeader.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   ├── ui/                 # shadcn/ui components
│   │   │   └── Onboarding.tsx
│   │   ├── context/                # React contexts
│   │   ├── data/                   # Static data & market data
│   │   ├── hooks/                  # Custom hooks
│   │   ├── lib/                    # Utilities (Supabase, etc.)
│   │   ├── pages/                  # Page components
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── PlansPage.tsx
│   │   │   ├── ReportsPage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   └── index.ts
│   │   ├── types.ts
│   │   └── utils/                  # Projection calculations
│   └── vite.config.ts
├── migrations/                     # Supabase migrations
└── README.md
```

## Usage Guide

### Quick Start

1. **Welcome Screen**
   - Sign In (existing users)
   - Sign Up (create account)
   - Continue as Guest (WARNING: data not saved)

2. **Onboarding** (First-time users)
   - Personal information (name, DOB, country)
   - Auto-detected life expectancy
   - Auto-selected currency
   - Create your first plan

3. **Dashboard - Financial Snapshots**
   - View most recent snapshot
   - Create new snapshot
   - Add income, expenses, assets, liabilities
   - Save snapshot
   - Review historical snapshots

4. **Plans Page - Projections**
   - Add financial items
   - View year-by-year projections
   - Click years for detailed breakdown
   - Set milestones
   - Run plan-specific simulation

5. **Reports Page - Custom Simulations**
   - Custom portfolio analysis
   - Test "what-if" scenarios
   - Monte Carlo retirement planning

### Creating Financial Projections

1. **Navigate to Plans page**
2. **Add Financial Items**:
   - Income (salary, investments)
   - Expenses (living costs, discretionary)
   - Assets (house, stocks, savings)
   - Liabilities (mortgage, loans)
3. **Set Milestones**: Retirement age, net worth goals
4. **Configure Priorities**: Surplus/deficit handling
5. **View Projections**: Interactive charts update automatically

### Running Retirement Simulations

**Plan-Specific** (from Plans page):
1. Click "Simulation" button in navbar
2. Review plan-locked parameters
3. Analyze success rate
4. View portfolio paths

**Custom** (from Reports page):
1. Choose portfolio source (plan or custom)
2. Set starting portfolio value
3. Adjust retirement parameters
4. Configure asset allocation
5. Run 1000+ simulations
6. Review results and success probability

## Data Persistence

### Guest Mode
- Stored in browser localStorage
- **WARNING: Lost when browser cache is cleared**
- **WARNING: Not accessible from other devices**
- Best for: Trying out the app, demos

### Authenticated Mode
- Stored in Supabase PostgreSQL
- Persistent and backed up
- Accessible from any device
- Secure with Row-Level Security
- Best for: Long-term planning

## Calculation Methodology

### Net Worth Projection
```
Year N Net Worth = 
  Previous Net Worth +
  Annual Income -
  Annual Expenses +
  Asset Appreciation +
  Investment Yields -
  Liability Payments
```

### Monte Carlo Simulation
- **Stock Returns**: Normal distribution (μ=7%, σ=18%)
- **Bond Returns**: Normal distribution (μ=2%, σ=5%)
- **Inflation**: Normal distribution (μ=3%, σ=2%)
- **Withdrawal Rate**: 4% of initial value, inflation-adjusted
- **Success Criteria**: Portfolio > $0 at end of retirement period
- **Simulations**: 1000 independent scenarios

## Supported Currencies

USD, EUR, GBP, CAD, AUD, JPY, CHF, CNY, INR, BRL, MXN, ZAR, SEK, NOK, DKK, NZD, SGD, HKD, KRW, THB, MYR, PHP, IDR, VND, TRY, PLN, CZK, HUF, RUB, and more...

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests if applicable
5. Submit a pull request

## License

This project is proprietary software. All rights reserved.

## Acknowledgments

- Financial calculations based on the Trinity Study and William Bengen's research
- Market data from historical S&P 500 and bond market analysis
- Life expectancy data from WHO and national statistics
- UI/UX inspired by modern financial planning tools

## Contact

For questions, suggestions, or support:
- GitHub Issues: [Create an issue](https://github.com/yourusername/FutureSteps/issues)
- Email: support@futuresteps.com

---

<div align="center">
  <p><strong>FutureSteps</strong> - Plan Today, Prosper Tomorrow</p>
  <p>Built for better financial futures</p>
</div>
