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

FutureSteps is financial planning application that helps users visualize their financial future through detailed projections, milestone tracking, and retirement simulations projecting future netwoth from current finances. 
## Key Features

### Financial Projections
- **Interactive Visualizations**: Toggle between bar and line charts with real-time data updates
- **Year-by-Year Analysis**: Click any year to view detailed financial breakdowns
- **Net Worth Tracking**: Monitor projected net worth growth over your lifetime
- **Multi-Currency Support**: 30+ currencies with automatic formatting and country-based defaults
- **Data Sync**: Sync data and use on any device. 

### Retirement Simulation

### Financial Snapshots Dashboard

### Multi-Plan Support

### Smart Priority Management
- **Surplus Allocation**: Automatically distribute extra cash flow

- **Deficit Coverage**: Define how shortfalls are covered
 
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
- UI/UX inspired by modern financial planning tools.

## Contact

For questions, suggestions, or support:
- GitHub Issues: [Create an issue](https://github.com/JSOClarke/FutureSteps/issues)
- Email: futurestepsfinance@gmail.com

---


