import {
  ICallbackQuery,
  IChat,
  IContext,
  IGetChatMemberResponse,
  IMessage,
  IMessageExtra,
  IUpdate
} from '../types'

import { Markup } from './Markup'
import { TelegramMethods } from './TelegramMethods'

export class Msg {
  chat?: IChat
  from?: IChat
  update?: IUpdate
  message?: IMessage
  message_id?: number
  date?: number
  text: string

  constructor(from?: IChat, message?: IMessage, update?: IUpdate) {
    this.from = from
    this.message = message
    this.chat = message && message.chat
    this.message_id = message && message.message_id
    this.date = message && message.date
    this.text = message && message.text || ''
    this.update = update
  }

  async send(text: string, extra: IMessageExtra | Markup = {}): Promise<IMessage | void> {
    try {
      if (!this.from) throw new Error(`DegreetTelegram Error: can't found userId`)
      return new TelegramMethods().send(this.from.id, text, extra)
    } catch (e: any) {
      throw new Error(`TelegramError ${e.response.data.description}`)
    }
  }

  async toast(text: string): Promise<IMessage | void> {
    try {
      if (!this.from) throw new Error(`DegreetTelegram Error: can't found userId`)
      return new TelegramMethods().toast(this.update?.callback_query?.id, text)
    } catch (e: any) {
      throw new Error(`TelegramError ${e.response.data.description}`)
    }
  }

  async alert(text: string): Promise<IMessage | void> {
    try {
      if (!this.from) throw new Error(`DegreetTelegram Error: can't found userId`)
      return new TelegramMethods().alert(this.update?.callback_query?.id, text)
    } catch (e: any) {
      throw new Error(`TelegramError ${e.response.data.description}`)
    }
  }

  async edit(text: string, extra?: IMessageExtra | Markup): Promise<IMessage | void> {
    try {
      if (!this.from || !this.message_id)
        throw new Error(`DegreetTelegram Error: can't found userId & msgId`)

      return new TelegramMethods().edit(this.from.id, this.message_id, text, extra)
    } catch (e: any) {
      throw new Error(`TelegramError ${e.response.data.description}`)
    }
  }

  async editMarkup(extra?: IMessageExtra | Markup): Promise<IMessage | void> {
    try {
      if (!this.from || !this.message_id)
        throw new Error(`DegreetTelegram Error: can't found userId & msgId`)

      return new TelegramMethods().editMarkup(this.from.id, this.message_id, extra)
    } catch (e: any) {
      throw new Error(`TelegramError ${e.response.data.description}`)
    }
  }

  async del(): Promise<boolean> {
    try {
      if (!this.from || !this.message_id)
        throw new Error(`DegreetTelegram Error: can't found userId & msgId`)

      return new TelegramMethods().del(this.from.id, this.message_id)
    } catch (e: any) {
      throw new Error(`TelegramError ${e.response.data.description}`)
    }
  }

  async getChatMember(chatId: number | string): Promise<IGetChatMemberResponse | void> {
    try {
      if (!this.from) throw new Error(`DegreetTelegram Error: can't found userId`)
      return new TelegramMethods().getChatMember(chatId, this.from.id)
    } catch (e: any) {
      throw new Error(`TelegramError ${e.response.data.description}`)
    }
  }

  async checkSubscription(chatId: number | string): Promise<boolean> {
    try {
      const member = await this.getChatMember(chatId)
      if (!member) return false
      return ['creator', 'administrator', 'member'].includes(member.status)
    } catch (e: any) {
      throw new Error(`TelegramError ${e.response.data.description}`)
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
  callbackQuery: ICallbackQuery
  params: string[] = []

  constructor(update: IUpdate) {
    if (update.message) {
      this.message = update.message
      this.from = update.message?.from

      if (
        update.message.entities && update.message.text &&
        update.message.entities[0].type === 'bot_command' &&
        update.message.text.length !== update.message.entities[0].length
      ) {
        this.params = update.message.text
          .slice(update.message.entities[0].length + 1)
          .split(' ')
      }
    } else if (update.callback_query) {
      this.message = update.callback_query?.message
      this.from = update.callback_query?.from
      this.callbackQuery = update.callback_query
    }

    this.api = new TelegramMethods()
    this.msg = new Msg(this.from, this.message, update)
  }
}