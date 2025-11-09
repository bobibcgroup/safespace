# Campaign Schedule Cron Job Setup

The app needs a cron job to automatically check and update campaign statuses when their start/close dates are met.

## What It Does

The cron job automatically:
- ✅ Activates campaigns when their `startDate` is reached
- ✅ Deactivates campaigns when their `closeDate` is reached  
- ✅ Handles recurring campaigns (weekly, monthly, quarterly)

## Setup Options

### Option 1: Vercel Cron (Recommended for Vercel Deployments)

If you're deploying on Vercel, add a `vercel.json` file in the root:

```json
{
  "crons": [
    {
      "path": "/api/campaigns/schedule",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

**Schedule Options:**
- `*/15 * * * *` - Every 15 minutes (recommended)
- `*/30 * * * *` - Every 30 minutes
- `0 * * * *` - Every hour
- `0 */6 * * *` - Every 6 hours

**Environment Variable Required:**
Add to your Vercel environment variables:
```
CRON_SECRET=your-secret-key-here
```

Generate a secret:
```bash
openssl rand -base64 32
```

### Option 2: External Cron Service (e.g., cron-job.org, EasyCron)

1. Set up a cron job to call: `https://your-domain.com/api/campaigns/schedule`
2. Method: `POST`
3. Headers: `Authorization: Bearer YOUR_CRON_SECRET`
4. Schedule: Every 15-30 minutes

**Required Environment Variable:**
```
CRON_SECRET=your-secret-key-here
```

### Option 3: Server Cron (For Self-Hosted)

If you're running on your own server, add to crontab:

```bash
# Edit crontab
crontab -e

# Add this line (runs every 15 minutes)
*/15 * * * * cd /path/to/your/app && npm run process-schedules
```

Or use the API endpoint:
```bash
*/15 * * * * curl -X POST https://your-domain.com/api/campaigns/schedule -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Option 4: Manual Testing

You can manually trigger the schedule processing:

**Via Script:**
```bash
npm run process-schedules
```

**Via API (requires CRON_SECRET):**
```bash
curl -X POST https://your-domain.com/api/campaigns/schedule \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Testing

1. Create a test campaign with a close date in the past
2. Run the cron job manually or wait for it to run
3. Check that the campaign status changed to "Finished" (isActive = false)

## Troubleshooting

- **Campaigns not updating automatically?** 
  - Check that the cron job is running
  - Verify `CRON_SECRET` is set correctly
  - Check server logs for errors

- **Want more frequent checks?**
  - Update the cron schedule to run more often (e.g., every 5 minutes: `*/5 * * * *`)

- **Want less frequent checks?**
  - Update the cron schedule to run less often (e.g., every hour: `0 * * * *`)

