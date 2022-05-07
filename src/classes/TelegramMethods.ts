import {
  IAnswerCallbackQueryExtra,
  IDeleteMessageTextExtra,
  IEditMarkupExtra,
  IEditMessageTextExtra,
  IGetChatMemberExtra,
  IGetChatMemberResponse,
  IMessage,
  IMessageExtra,
} from '../types'

import { Markup } from './Markup'
import axios from 'axios'

let connectionUri = ''
export const updateConnectionUri = (uri: string): string => connectionUri = uri

export class TelegramMethods {
  private static async fetch<T>(url: string, extra: any): Promise<T> {
    try {
      const { data } = await axios.get(connectionUri + url, { params: extra })
      return data.result
    } catch (e: any) {
      throw new Error(`TelegramError: ${e.response.data.description}`)
    }
  }

  private static extraMarkup(markup: Markup | IMessageExtra): IMessageExtra | any {
    return markup instanceof Markup ? markup.solveExtra() : markup
  }

  async send(userId?: number, text?: string, extra: IMessageExtra | Markup = {}): Promise<IMessage | void> {
    try {
      if (!userId || !text) return
      const resultExtra: IMessageExtra = TelegramMethods.extraMarkup(extra)

      const initExtra: IMessageExtra = {
        chat_id: userId,
        parse_mode: 'HTML',
        text,
        ...resultExtra,
      }

      return await TelegramMethods.fetch<IMessage>('/sendMessage', initExtra)
    } catch (e: any) {
      throw e
    }
  }

  async toast(callbackQueryId?: string, text?: string, showAlert?: boolean): Promise<IMessage | void> {
    try {
      if (!callbackQueryId) return

      const extra: IAnswerCallbackQueryExtra = {
        callback_query_id: callbackQueryId,
        show_alert: showAlert,
        text,
      }

      return await TelegramMethods.fetch<IMessage>('/answerCallbackQuery', extra)
    } catch (e: any) {
      throw e
    }
  }

  async alert(callbackQueryId?: string, text?: string): Promise<IMessage | void> {
    try {
      return await this.toast(callbackQueryId, text, true)
    } catch (e: any) {
      throw e
    }
  }

  async edit(userId?: number, msgId?: number, text?: string, extra: IMessageExtra | Markup = {}): Promise<IMessage | void> {
    try {
      if (!userId || !msgId || !text) return
      const resultExtra: IMessageExtra = TelegramMethods.extraMarkup(extra)

      const data: IEditMessageTextExtra = {
        chat_id: userId,
        message_id: msgId,
        parse_mode: 'HTML',
        text,
        ...resultExtra,
      }

      return await TelegramMethods.fetch<IMessage>('/editMessageText', data)
    } catch (e: any) {
      throw e
    }
  }

  async del(userId?: number, msgId?: number): Promise<boolean> {
    try {
      if (!userId || !msgId) return false

      const data: IDeleteMessageTextExtra = {
        chat_id: userId,
        message_id: msgId,
      }

      return await TelegramMethods.fetch<boolean>('/deleteMessage', data)
    } catch (e: any) {
      throw e
    }
  }

  async editMarkup(userId?: number, msgId?: number, extra: IMessageExtra | Markup = {}): Promise<IMessage | void> {
    try {
      if (!userId || !msgId) return
      const resultExtra: IMessageExtra = TelegramMethods.extraMarkup(extra)

      const data: IEditMarkupExtra = {
        chat_id: userId,
        message_id: msgId,
        ...resultExtra,
      }

      return await TelegramMethods.fetch<IMessage>('/editMessageReplyMarkup', data)
    } catch (e: any) {
      throw e
    }
  }

  async getChatMember(chatId: number | string, userId: number): Promise<IGetChatMemberResponse | void> {
    try {
      const data: IGetChatMemberExtra = {
        chat_id: chatId,
        user_id: userId,
      }

      return await TelegramMethods.fetch<IGetChatMemberResponse | void>('/getChatMember', data)
    } catch (e: any) {
      throw e
    }
  }
}