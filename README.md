<div align="center">
  <img src="frontend/public/chronos-logo.png" alt="FutureSteps Logo" width="200"/>
  
  # FutureSteps
  
  **Advanced Financial Projection & Retirement Planning Tool**
  
  Plan your financial future with precision using interactive projections, Monte Carlo simulations, and comprehensive portfolio analysis.
  
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  
  **[Live Demo](https://chronosprojections.netlify.app/)**
  
</div>

---

## Overview

FutureSteps is a sophisticated financial planning application that helps users visualize their financial future through detailed projections, milestone tracking, and retirement simulations. Built with modern web technologies, it provides an intuitive interface for managing income, expenses, assets, and liabilities while projecting net worth trajectories over time.

## Key Features

### Financial Projections
- **Interactive Visualizations**: Toggle between bar and line charts with real-time data updates
- **Year-by-Year Analysis**: Click any year to view detailed financial breakdowns
- **Net Worth Tracking**: Monitor projected net worth growth over your lifetime
- **Currency Support**: Multi-currency support with automatic formatting

### Comprehensive Financial Management
- **Income Tracking**: Salary, bonuses, investment returns, and more
- **Expense Management**: Recurring and one-time expenses with inflation adjustments
- **Asset Portfolio**: Track stocks, real estate, retirement accounts, and other assets
- **Liability Monitoring**: Mortgages, loans, and debt management

### Milestone Planning
- **Goal Setting**: Define financial milestones (retirement age, target net worth, etc.)
- **Visual Markers**: See milestone achievements directly on your projection charts
- **Custom Milestones**: Create year-based or value-based goals

### Monte Carlo Retirement Simulation
- **1000+ Simulations**: Statistical analysis of retirement outcomes
- **4% Withdrawal Rule**: Industry-standard safe withdrawal rate calculations
- **Success Rate Analysis**: Probability-based retirement planning
- **Portfolio Scenarios**: Test different asset allocations and withdrawal rates
- **Visual Path Analysis**: See median, best, and worst-case scenarios

### User Experience
- **Responsive Design**: Seamless experience on desktop, tablet, and mobile
- **Dark Mode Ready**: Modern, minimalist interface
- **Collapsible Sections**: Organized, clutter-free information display
- **Real-time Updates**: Instant recalculation as you modify inputs

## Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first CSS framework
- **Recharts** - Powerful charting library
- **Lucide React** - Beautiful icon library

### Backend & Storage
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication (Google OAuth, Email/Password)
  - Row-level security

### State Management
- **React Context API** - Global state management
- **Local Storage** - Client-side persistence

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for backend services)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/FutureSteps.git
   cd FutureSteps
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

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the database migrations (see `/supabase/migrations`)
   - Configure authentication providers (Google OAuth)

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
FutureSteps/
├── frontend/
│   ├── public/              # Static assets
│   │   ├── chronos-logo.png
│   │   └── favicon.png
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── financial/   # Income, expenses, assets, liabilities
│   │   │   ├── milestones/  # Milestone management
│   │   │   ├── plans/       # Multi-plan support
│   │   │   ├── priorities/  # Surplus/deficit allocation
│   │   │   ├── profile/     # User profile & settings
│   │   │   ├── projections/ # Charts and detailed views
│   │   │   ├── retirement/  # Monte Carlo simulation
│   │   │   └── shared/      # Reusable components
│   │   ├── context/         # React contexts
│   │   ├── data/           # Static data & market data
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Supabase client
│   │   ├── types.ts        # TypeScript definitions
│   │   └── utils/          # Utility functions & calculations
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Usage Guide

### Creating Your First Projection

1. **Complete Onboarding**
   - Enter your name, birth date, and country
   - System auto-detects life expectancy and currency
   - Create your first financial plan

2. **Add Financial Items**
   - Navigate to Income/Expenses/Assets/Liabilities sections
   - Click "+" to add new items
   - Configure start/end years, amounts, and growth rates

3. **Set Milestones**
   - Click "Milestones" in the navigation
   - Create retirement age, net worth targets, etc.
   - View milestone markers on your projection chart

4. **Configure Priorities**
   - Set surplus priority (how extra cash is allocated)
   - Set deficit priority (how shortfalls are covered)

5. **Run Retirement Simulation**
   - Navigate to "Run Simulation"
   - Enter starting portfolio value
   - Adjust retirement years and asset allocation
   - Review success rate and portfolio paths

## Authentication

FutureSteps supports multiple authentication methods:

- **Email/Password**: Traditional account creation
- **Google OAuth**: One-click sign-in
- **Guest Mode**: Try the app without an account (data stored locally)

## Multi-Currency Support

Supported currencies include:
- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- CAD (Canadian Dollar)
- AUD (Australian Dollar)
- JPY (Japanese Yen)
- And 25+ more...

## Calculation Methodology

### Net Worth Projection
```
Net Worth = Assets - Liabilities + Cumulative Cash Flow

Cash Flow = Income - Expenses + Asset Growth + Yields - Debt Payments
```

### Monte Carlo Simulation
- **Returns**: Normal distribution (stocks: 7%±18%, bonds: 2%±5%)
- **Inflation**: 3%±2% annually
- **Withdrawal**: 4% initial + inflation adjustments
- **Success**: Portfolio > $0 at end of retirement period

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.

## Acknowledgments

- Financial calculations based on the Trinity Study and William Bengen's research
- Market data averages from historical S&P 500 and bond market analysis
- UI design inspired by modern financial planning tools

## Contact

For questions, suggestions, or support:
- Email: support@futuresteps.com
- Website: https://chronosprojections.netlify.app/

---

<div align="center">
  <p>Built for better financial futures</p>
  <p><strong>FutureSteps</strong> - Plan Today, Prosper Tomorrow</p>
</div>
