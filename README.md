# Personal Attendance Tracker

A complete personal attendance tracking web application built with Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Prisma ORM, and SQLite.

## Features

- **Dashboard**: View monthly attendance statistics, worked hours, overtime, salary calculations
- **Attendance Management**: Add, edit, and delete attendance entries with status tracking
- **Settings**: Configure monthly salary, required working hours, weekly off day, and currency
- **Reports**: Calendar view and table view with export to CSV/Excel
- **Dark/Light Mode**: Toggle between dark and light themes
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- **Framework**: Next.js 15 App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Prisma ORM with SQLite
- **Charts**: Recharts
- **Export**: xlsx for Excel export
- **Date Handling**: date-fns

## Installation

1. **Navigate to the project directory**:
   ```bash
   cd attendance-tracker
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Prisma and generate the client**:
   ```bash
   npx prisma generate
   ```

4. **Create the SQLite database and run migrations**:
   ```bash
   npx prisma db push
   ```

5. **Seed the database with default settings**:
   ```bash
   npx tsx prisma/seed.ts
   ```

6. **Run the development server**:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
attendance-tracker/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Database seed script
│   └── dev.db                 # SQLite database (generated)
├── src/
│   ├── app/
│   │   ├── actions/
│   │   │   ├── settings.ts    # Settings server actions
│   │   │   └── attendance.ts  # Attendance server actions
│   │   ├── api/
│   │   │   └── attendance/    # API routes
│   │   ├── dashboard/         # Dashboard page
│   │   ├── attendance/        # Attendance page
│   │   ├── reports/           # Reports page
│   │   ├── settings/          # Settings page
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page (redirects to dashboard)
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── navigation.tsx     # Navigation component
│   │   └── theme-provider.tsx # Theme provider
│   └── lib/
│       ├── prisma.ts          # Prisma client
│       ├── utils.ts           # Utility functions
│       └── calculations.ts    # Calculation functions
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

## Database Schema

### Settings Table
- `id`: Primary key (always 1)
- `monthlySalary`: Monthly salary amount
- `requiredHours`: Required working hours per day (default: 9)
- `weeklyOff`: Weekly off day (default: Sunday)
- `currency`: Currency symbol (default: $)

### Attendance Table
- `id`: Primary key
- `date`: Date of attendance
- `inTime`: Check-in time
- `outTime`: Check-out time
- `status`: Attendance status (Present, Holiday, Paid Leave, Unpaid Leave, WFH)
- `remarks`: Optional notes

## Calculations

### Worked Hours
```
Worked Hours = Out Time - In Time
```

### Hour Difference
```
Difference = Worked Hours - Required Hours
```
- Positive difference = Overtime
- Negative difference = Missing Hours

### Salary Calculations
```
Daily Salary = Monthly Salary / Working Days
Hourly Rate = Monthly Salary / (Working Days × Required Hours)
Overtime Amount = Overtime Hours × Hourly Rate
Deduction Amount = (Missing Hours × Hourly Rate) + (Unpaid Leave Days × Daily Salary)
Final Payable Salary = Monthly Salary + Overtime Amount - Deduction Amount
```

## Deployment to Vercel

### Prerequisites
- Vercel account
- GitHub repository with this code

### Steps

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/attendance-tracker.git
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will automatically detect Next.js
   - Click "Deploy"

3. **Environment Variables** (Optional):
   - No environment variables needed for local SQLite
   - For production, consider using PostgreSQL instead of SQLite for better persistence

4. **Database Setup for Production**:
   
   **Option 1: Keep SQLite (Not recommended for Vercel)**
   - SQLite files are not persistent on Vercel
   - Data will be lost on each deployment
   
   **Option 2: Use PostgreSQL (Recommended)**
   - Create a free PostgreSQL database on [Supabase](https://supabase.com) or [Neon](https://neon.tech)
   - Update `prisma/schema.prisma`:
     ```prisma
     datasource db {
       provider = "postgresql"
       url      = env("DATABASE_URL")
     }
     ```
   - Add `DATABASE_URL` to Vercel environment variables
   - Run `npx prisma db push` to create tables

## Usage

1. **Configure Settings**:
   - Go to Settings page
   - Set your monthly salary
   - Set required working hours per day (default: 9)
   - Select your weekly off day
   - Set your currency symbol

2. **Add Attendance**:
   - Go to Attendance page
   - Click "Quick Add Today" or add a new entry
   - Enter date, in/out times, status, and remarks
   - Status options: Present, Holiday, Paid Leave, Unpaid Leave, WFH

3. **View Dashboard**:
   - See monthly statistics
   - View worked hours, overtime, missing hours
   - Check salary calculations

4. **Generate Reports**:
   - Go to Reports page
   - Select month/year
   - View calendar or table view
   - Export to CSV or Excel
   - Print report

## Default Settings

- Monthly Salary: 50000
- Required Hours: 9
- Weekly Off: Sunday
- Currency: $

You can change these in the Settings page.

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
