import { Msg } from './classes/Context'
import { TelegramMethods } from './classes/TelegramMethods'

export type middleware = (ctx: IContext, next: nextMiddleware) => any | Promise<any>
export type nextMiddleware = () => any
export type sessionItem<T> = [number, T]
export type keyboard = IInlineKeyboard | IReplyKeyboard | IRemoveKeyboard
export type allowedTypes = 'base' | 'callback' | 'cb' | 'requestContact' | 'requestLocation' | 'webApp' | 'url' | 'switchInlineQuery'
export type keyboardType = 'inline' | 'reply' | 'remove'
export type parseModeTypes = 'HTML' | 'Markdown' | 'MarkdownV2'

export interface IContext {
  from?: IChat
  message?: IMessage
  msg: Msg
  props: any
  session: any
  api: TelegramMethods
  params: string[]
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
  parse_mode?: parseModeTypes
  disable_web_page_preview?: boolean
  disable_notification?: boolean
  protect_content?: boolean
  reply_to_message_id?: boolean
  allow_sending_without_reply?: boolean
  reply_markup?: keyboard
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

export interface ICallbackQuery {
  id: string,
  from: IChat
  message: IMessage
  chat_instance: string
  data: string
}

export interface IUpdate {
  update_id: number,
  from?: IChat,
  message?: IMessage
  callback_query?: ICallbackQuery
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

export interface IAnswerCallbackQueryExtra {
  callback_query_id: string,
  text?: string,
  show_alert?: boolean
  url?: string
}

export interface IDeleteMessageTextExtra {
  chat_id: number,
  message_id: number,
}

export interface IEditMarkupExtra extends IDeleteMessageTextExtra {
  reply_markup?: keyboard
}

export interface IEditMessageTextExtra extends IDeleteMessageTextExtra {
  text: string
  parse_mode?: parseModeTypes
  entities?: IEntity[]
  disable_web_page_preview?: boolean
  reply_markup?: keyboard
}