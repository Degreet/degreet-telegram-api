import { Msg } from './classes/Context'

export type middleware = (ctx: IContext, next: nextMiddleware) => any | Promise<any>
export type nextMiddleware = () => any
export type sessionItem<T> = [number, T]
export type allowedTypes = 'base' | 'callback' | 'cb' | 'requestContact' | 'requestLocation' | 'webApp' | 'url' | 'switchInlineQuery'
export type keyboardType = 'inline' | 'reply' | 'remove'

export interface IContext {
  from?: IChat
  message?: IMessage
  msg: Msg
  props: any
  session: any
}

export interface IInlineKeyboard {
  inline_keyboard: IButton[][]
}

export interface IReplyKeyboard {
  keyboard: IButton[][]
}

export interface IRemoveKeyboard {
  remove_keyboard: boolean
}

export interface IMessageExtra {
  chat_id?: number
  text?: string
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2'
  disable_web_page_preview?: boolean
  disable_notification?: boolean
  protect_content?: boolean
  reply_to_message_id?: boolean
  allow_sending_without_reply?: boolean
  reply_markup?: IInlineKeyboard | IReplyKeyboard | IRemoveKeyboard
}

export interface IHandler {
  type: string
  event?: string
  text?: string
  middlewares: middleware[]
}

export interface IChat {
  id: number
  is_bot: boolean
  first_name: string
  username: string
  can_join_groups: boolean
  can_read_all_group_messages: boolean
  supports_inline_queries: boolean
}

export interface IMessage {
  message_id: number,
  from?: IChat,
  chat: IChat,
  date: number,
  text: string,
  entities?: IEntity[]
}

export interface IUpdate {
  update_id: number,
  from?: IChat,
  message?: IMessage
}

export interface IEntity {
  offset: number
  length: number
  type: 'bot_command' | 'bold' | string
}

export interface IWebAppButton {
  url: string
}

export interface IButton {
  text: string
  url?: string
  callback_data?: string
  request_contact?: boolean
  request_location?: boolean
  switch_inline_query?: string
  web_app?: IWebAppButton
}