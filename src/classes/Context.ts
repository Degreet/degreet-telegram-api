import {
  IChat,
  IContext,
  IMessage,
  IMessageExtra,
  IUpdate
} from '../types'

import { Markup } from './Markup'
import { TelegramMethods } from './TelegramMethods'

export class Msg {
  chat?: IChat
  from?: IChat
  message?: IMessage
  message_id?: number
  date?: number
  text: string

  constructor(from?: IChat, message?: IMessage) {
    this.from = from
    this.message = message
    this.chat = message && message.chat
    this.message_id = message && message.message_id
    this.date = message && message.date
    this.text = message && message.text || ''
  }

  async send(text: string, extra: IMessageExtra | Markup = {}): Promise<IMessage | void> {
    try {
      if (!this.from) throw new Error(`DegreetTelegram Error: can't found userId`)
      return new TelegramMethods().send(this.from.id, text, extra)
    } catch (e: any) {
      throw new Error(`TelegramError ${e.message}`)
    }
  }
}

export class Context<T> implements IContext {
  from?: IChat
  message?: IMessage
  msg: Msg
  props: Partial<T> = {}
  session: any = {}
  api: TelegramMethods

  constructor(update: IUpdate) {
    if (update.message) {
      this.message = update.message
      this.from = update.message?.from
    } else if (update.callback_query) {
      this.message = update.callback_query?.message
      this.from = update.callback_query?.from
    }

    this.api = new TelegramMethods()
    this.msg = new Msg(this.from, this.message)
  }
}