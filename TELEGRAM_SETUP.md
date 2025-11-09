# Telegram Bot Setup Guide

## Overview
The application uses Telegram bots to send notifications to campaign creators when new responses are received and for AI report alerts.

## Prerequisites
1. A Telegram account
2. Access to create a Telegram bot via BotFather

## Step-by-Step Setup

### 1. Create a Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Start a conversation with BotFather
3. Send the command `/newbot`
4. Follow the prompts:
   - Choose a name for your bot (e.g., "Feedback Notifier")
   - Choose a username for your bot (must end with `bot`, e.g., `feedback_notifier_bot`)
5. BotFather will provide you with a **Bot Token** (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Get Your Chat ID

There are two methods to get your Telegram Chat ID:

#### Method 1: Using @userinfobot (Recommended)
1. Search for `@userinfobot` on Telegram
2. Start a conversation
3. The bot will immediately send you your Chat ID (a number like `123456789`)

#### Method 2: Using @getidsbot
1. Search for `@getidsbot` on Telegram
2. Start a conversation
3. Send any message to the bot
4. The bot will reply with your Chat ID

### 3. Configure Environment Variables

Add the following to your `.env` file:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

**Important:** Never commit your bot token to version control. Keep it secure.

### 4. Configure User Settings

1. Log in to the application
2. Go to **Settings** (click your profile → Settings)
3. Enable Telegram notifications
4. Enter your **Telegram Chat ID** (the number you got from step 2)
5. Configure your notification preferences:
   - **Notify on new responses**: Get instant notifications when someone submits feedback
   - **Daily digest**: Receive a summary of all activity once per day
   - **Weekly digest**: Receive a summary of all activity once per week

### 5. Test Notifications

1. Create a test campaign
2. Submit a test response to that campaign
3. You should receive a Telegram message with:
   - Campaign title
   - Response preview
   - Link to view in CRM

## Notification Features

### New Response Notifications
- Sent immediately when a new response is submitted
- Includes campaign title, response preview, and direct link to CRM
- Only sent if "Notify on new responses" is enabled

### Daily/Weekly Digests
- Summary of all new responses
- Count of responses needing attention
- List of active campaigns with response counts
- Sent based on your digest preferences

### AI Report Notifications
- Sent when AI report generation completes
- Includes key insights and summary
- Direct link to view full report

## Troubleshooting

### Not Receiving Notifications?

1. **Check Bot Token**: Ensure `TELEGRAM_BOT_TOKEN` is set correctly in `.env`
2. **Check Chat ID**: Verify your Chat ID is correct in Settings
3. **Check Preferences**: Ensure notifications are enabled in Settings
4. **Bot Status**: Make sure the bot hasn't been blocked or deleted
5. **Start Bot**: Send `/start` to your bot if you haven't interacted with it yet

### Bot Token Invalid Error

- Verify the token from BotFather is correct
- Ensure there are no extra spaces in the `.env` file
- Restart the application after updating `.env`

### Chat ID Not Working

- Make sure you're using your personal Chat ID, not the bot's ID
- Try getting a fresh Chat ID from `@userinfobot`
- Ensure you've started a conversation with your bot (send `/start`)

## Security Best Practices

1. **Never share your bot token** publicly
2. **Keep Chat IDs private** - they can be used to send you messages
3. **Use environment variables** - never hardcode tokens in code
4. **Rotate tokens** if compromised - create a new bot via BotFather

## Advanced: Custom Bot Commands

You can add custom commands to your bot via BotFather:

1. Send `/setcommands` to BotFather
2. Select your bot
3. Add commands like:
   ```
   start - Start receiving notifications
   status - Check notification status
   help - Show help message
   ```

## Support

If you encounter issues:
1. Check the application logs for error messages
2. Verify all environment variables are set correctly
3. Test the bot token by sending a message manually via Telegram API
4. Ensure the bot has permission to send messages to your Chat ID

