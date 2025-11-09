declare module 'node-telegram-bot-api' {
  export interface TelegramBotOptions {
    polling?: boolean
    webHook?: boolean
    onlyFirstMatch?: boolean
    request?: any
    baseApiUrl?: string
    filepath?: boolean
    healthCheck?: boolean
  }

  export interface Message {
    message_id: number
    from?: User
    date: number
    chat: Chat
    text?: string
    [key: string]: any
  }

  export interface User {
    id: number
    is_bot: boolean
    first_name: string
    last_name?: string
    username?: string
    language_code?: string
  }

  export interface Chat {
    id: number
    type: string
    title?: string
    username?: string
    first_name?: string
    last_name?: string
    [key: string]: any
  }

  export interface SendMessageOptions {
    parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2'
    disable_web_page_preview?: boolean
    disable_notification?: boolean
    reply_to_message_id?: number
    reply_markup?: any
    [key: string]: any
  }

  export default class TelegramBot {
    constructor(token: string, options?: TelegramBotOptions)
    sendMessage(chatId: string | number, text: string, options?: SendMessageOptions): Promise<Message>
    onText(regexp: RegExp, callback: (msg: Message, match: RegExpMatchArray | null) => void): void
    on(event: string, callback: (msg: Message) => void): void
    setWebHook(url: string, options?: any): Promise<boolean>
    deleteWebHook(): Promise<boolean>
    getWebHookInfo(): Promise<any>
    getMe(): Promise<User>
    [key: string]: any
  }
}

