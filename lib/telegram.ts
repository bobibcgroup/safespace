import TelegramBot from 'node-telegram-bot-api'

let bot: TelegramBot | null = null

export function getTelegramBot(): TelegramBot | null {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return null
  }

  if (!bot) {
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false })
  }

  return bot
}

export async function sendTelegramMessage({
  chatId,
  text,
  parseMode = 'HTML',
}: {
  chatId: string
  text: string
  parseMode?: 'HTML' | 'Markdown'
}) {
  const telegramBot = getTelegramBot()
  if (!telegramBot) {
    console.warn('Telegram bot not configured. Set TELEGRAM_BOT_TOKEN environment variable.')
    return { success: false, error: 'Telegram not configured' }
  }

  try {
    await telegramBot.sendMessage(chatId, text, { parse_mode: parseMode })
    return { success: true }
  } catch (error) {
    console.error('Error sending Telegram message:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function sendNewResponseTelegram({
  chatId,
  campaignTitle,
  responseText,
  campaignId,
}: {
  chatId: string
  campaignTitle: string
  responseText: string
  campaignId: string
}) {
  const text = `
🆕 <b>New Response Received</b>

📋 <b>Campaign:</b> ${campaignTitle}

💬 <b>Response:</b>
"${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}"

<a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/campaigns/${campaignId}/crm">View in CRM →</a>
  `.trim()

  return sendTelegramMessage({ chatId, text })
}

export async function sendDailyDigestTelegram({
  chatId,
  summary,
}: {
  chatId: string
  summary: {
    totalResponses: number
    newResponses: number
    needsAttention: number
    campaigns: Array<{
      title: string
      responseCount: number
      campaignId: string
    }>
  }
}) {
  const text = `
📊 <b>Daily Feedback Digest</b>
${new Date().toLocaleDateString()}

📈 <b>Summary:</b>
• Total Responses: ${summary.totalResponses}
• New Responses: ${summary.newResponses}
• Needs Attention: ${summary.needsAttention}

${summary.campaigns.length > 0 ? `
<b>Campaign Activity:</b>
${summary.campaigns.map(c => `• ${c.title}: ${c.responseCount} response${c.responseCount !== 1 ? 's' : ''}`).join('\n')}
` : ''}

<a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}">Open Dashboard →</a>
  `.trim()

  return sendTelegramMessage({ chatId, text })
}

