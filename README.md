# Anonymous Feedback Webapp

A modern, internal-only webapp for collecting anonymous feedback and managing it through a CRM-style interface.

## Features

- **Admin Dashboard**: Create campaigns, view analytics, manage public links
- **Anonymous Submission**: Employees submit feedback via a simple link (no login required)
- **AI-Powered Reports**: Automatic sentiment analysis, theme extraction, and actionable insights
- **Feedback CRM**: Kanban/list view for HR to triage and resolve feedback
- **Public Reports**: Shareable read-only reports (toggleable per campaign)
- **Festive UI**: Celebratory animations, confetti, and modern dark theme

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Database**: SQLite with Prisma ORM
- **AI**: OpenAI API for report generation
- **Styling**: Tailwind CSS with dark theme
- **UI Components**: Radix UI primitives

## Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Run the setup script
./scripts/setup.sh
```

### Option 2: Manual Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```

3. **Edit `.env` and add your OpenAI API key:**
```env
OPENAI_API_KEY=your-openai-api-key-here
```

4. **Set up the database:**
```bash
npx prisma generate
npx prisma db push
```

5. **Run the development server:**
```bash
npm run dev
```

6. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

## Environment Variables

Required:
- `DATABASE_URL`: SQLite database path (default: `file:./dev.db`)
- `OPENAI_API_KEY`: OpenAI API key for AI report generation

Optional:
- `NEXTAUTH_URL`: Your app URL (for future auth features)
- `NEXTAUTH_SECRET`: Secret for NextAuth (generate with `openssl rand -base64 32`)

## Usage Guide

### 1. Create a Campaign
- Go to the dashboard and click "Create Campaign"
- Enter a title and question
- Copy the submission link and share it with your team
- Optionally generate a QR code for easy sharing

### 2. Collect Feedback
- Employees visit the submission link (no login required)
- They answer the question anonymously
- Optional: Select a mood emoji
- Submit and see a celebratory confetti animation!

### 3. Manage Feedback (CRM)
- Open the CRM view for any campaign
- Triage responses using Kanban or List view
- Move items between columns: New → Needs Attention → In Review → Resolved
- Add notes and create action items

### 4. Generate AI Report
- Go to the Report tab for a campaign
- Click "Generate AI Report" (requires responses)
- View sentiment breakdown, themes, highlights, quotes, and suggestions
- Toggle public report link ON/OFF to share with stakeholders

## Database Management

- **View database**: `npm run db:studio`
- **Push schema changes**: `npm run db:push`
- **Generate Prisma client**: `npm run db:generate`

## Project Structure

```
/app
  /api              # API routes
  /campaigns        # Campaign management pages
  /submit           # Anonymous submission page
  /reports          # Public report pages
/components         # React components
/lib                # Utilities and database
/prisma             # Database schema
```

## Notes

- The app is designed for internal use only
- All submissions are completely anonymous (no tracking, no emails, no names)
- AI reports are generated per campaign (no cross-campaign blending)
- Public reports can be toggled ON/OFF per campaign
- The app uses a festive, celebratory design with confetti animations

