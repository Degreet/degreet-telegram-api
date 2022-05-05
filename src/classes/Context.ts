import {
  IChat,
  IContext,
  IInlineKeyboard,
  IMessage,
  IMessageExtra,
  IRemoveKeyboard,
  IReplyKeyboard,
  IUpdate
} from '../types'
import axios from 'axios'
import { Markup } from './Markup'

export class Msg {
  chat?: IChat
  from?: IChat
  message?: IMessage
  connectionUri?: string
  message_id?: number
  date?: number
  text: string

  constructor(from?: IChat, message?: IMessage, connectionUri?: string) {
    this.from = from
    this.message = message
    this.connectionUri = connectionUri
    this.chat = message && message.chat
    this.message_id = message && message.message_id
    this.date = message && message.date
    this.text = message && message.text || ''
  }

  private async fetch<T>(url: string, extra: IMessageExtra): Promise<T> {
    try {
      const { data } = await axios.get(this.connectionUri + url, { params: extra })
      return data.result
    } catch (e: any) {
      throw new Error(`TelegramError ${e.message}`)
    }
  }

  async send(text: string, extra: IMessageExtra | Markup = {}): Promise<IMessage> {
    let resultExtra: IMessageExtra = {}

    if (extra instanceof Markup) {
      if (extra.type === 'inline') {
        const keyboard: IInlineKeyboard = { inline_keyboard: extra.rows }
        resultExtra = { reply_markup: keyboard }
      } else if (extra.type === 'reply') {
        const keyboard: IReplyKeyboard = { keyboard: extra.rows }
        resultExtra = { reply_markup: keyboard }
      } else if (extra.type === 'remove') {
        const keyboard: IRemoveKeyboard = { remove_keyboard: true }
        resultExtra = { reply_markup: keyboard }
      }
    } else {
      resultExtra = extra
    }

    const initExtra: IMessageExtra = {
      chat_id: this.from && this.from.id,
      parse_mode: 'HTML',
      text,
      ...resultExtra,
    }

    return await this.fetch<IMessage>('/sendMessage', initExtra)
  }
}

export class Context<T> implements IContext {
  from?: IChat
  message?: IMessage
  msg: Msg
  props: Partial<T> = {}
  session: any = {}

  constructor(update: IUpdate, connectionUri: string) {
    this.message = update.message
    this.from = update.message && update.message.from
    this.msg = new Msg(this.from, this.message, connectionUri)
  }
}