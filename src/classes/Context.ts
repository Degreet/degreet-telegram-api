import { IChat, IContext, IMessage, IMessageExtra, IUpdate } from '../types'
import axios from 'axios'

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

  async send(text: string, extra: IMessageExtra = {}): Promise<IMessage> {
    const initExtra: IMessageExtra = {
      chat_id: this.from && this.from.id,
      parse_mode: 'HTML',
      text,
      ...extra,
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