# Setup Instructions

Follow these steps to get the Anonymous Feedback webapp running.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- OpenAI API key (for AI report generation)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including Next.js, Prisma, OpenAI SDK, and UI components.

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```env
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY="sk-your-openai-api-key-here"
```

**Important**: Get your OpenAI API key from [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### 3. Set Up Database

Generate Prisma client and create the database:

```bash
npx prisma generate
npx prisma db push
```

This will:
- Generate the Prisma client
- Create the SQLite database file (`dev.db`)
- Set up all tables (Campaigns, Responses, Notes, ActionItems, AIReports)

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## First Steps After Setup

1. **Create Your First Campaign**
   - Click "Create Campaign" on the dashboard
   - Enter a title (e.g., "Monthly Team Pulse")
   - Enter a question (e.g., "What's the one thing we should improve next month?")
   - Copy the submission link

2. **Test Submission**
   - Open the submission link in a new tab/incognito window
   - Submit a test response
   - See the confetti animation!

3. **Explore the CRM**
   - Go back to the dashboard
   - Click "Open CRM" on your campaign
   - Try moving responses between columns

4. **Generate AI Report**
   - After collecting a few responses, go to the Report tab
   - Click "Generate AI Report"
   - View the analysis (sentiment, themes, highlights, suggestions)

## Troubleshooting

### Database Issues

If you see Prisma errors:
```bash
# Regenerate Prisma client
npx prisma generate

# Reset database (WARNING: deletes all data)
npx prisma db push --force-reset
```

### OpenAI API Errors

- Verify your API key is correct in `.env`
- Check your OpenAI account has credits
- Ensure the API key has proper permissions

### Port Already in Use

If port 3000 is taken:
```bash
# Use a different port
PORT=3001 npm run dev
```

## Next Steps

- Customize the UI colors in `tailwind.config.ts`
- Add authentication if needed (NextAuth.js is already included)
- Deploy to production (Vercel, Railway, etc.)

## Need Help?

- Check the main [README.md](./README.md) for more details
- Review the code comments in `/app` and `/components`
- Database schema is in `/prisma/schema.prisma`

