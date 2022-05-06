import {
  IAnswerCallbackQueryExtra, IDeleteMessageTextExtra, IEditMarkupExtra, IEditMessageTextExtra,
  IInlineKeyboard,
  IMessage,
  IMessageExtra,
  IRemoveKeyboard,
  IReplyKeyboard
} from '../types'
import { Markup } from './Markup'
import axios from 'axios'

let connectionUri = ''
export const updateConnectionUri = (uri: string): string => connectionUri = uri

export class TelegramMethods {
  private static async fetch<T>(url: string, extra: IMessageExtra): Promise<T> {
    try {
      const { data } = await axios.get(connectionUri + url, { params: extra })
      return data.result
    } catch (e: any) {
      throw new Error(`TelegramError: ${e.response.data.description}`)
    }
  }

  private static extraMarkup(markup: Markup | IMessageExtra): IMessageExtra | any {
    if (markup instanceof Markup) {
      if (markup.type === 'inline') {
        const keyboard: IInlineKeyboard = { inline_keyboard: markup.rows }
        return { reply_markup: keyboard }
      } else if (markup.type === 'reply') {
        const keyboard: IReplyKeyboard = { keyboard: markup.rows }
        return { reply_markup: keyboard }
      } else if (markup.type === 'remove') {
        const keyboard: IRemoveKeyboard = { remove_keyboard: true }
        return { reply_markup: keyboard }
      } else {
        return markup
      }
    } else {
      return markup
    }
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
      throw new Error(`TelegramError: ${e.response.data.description}`)
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
      throw new Error(`TelegramError: ${e.response.data.description}`)
    }
  }

  async alert(callbackQueryId?: string, text?: string): Promise<IMessage | void> {
    try {
      return await this.toast(callbackQueryId, text, true)
    } catch (e: any) {
      throw new Error(`TelegramError: ${e.response.data.description}`)
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
      throw new Error(`TelegramError: ${e.response.data.description}`)
    }
  }

  async del(userId?: number, msgId?: number): Promise<boolean> {
    if (!userId || !msgId) return false

    const data: IDeleteMessageTextExtra = {
      chat_id: userId,
      message_id: msgId,
    }

    return await TelegramMethods.fetch<boolean>('/deleteMessage', data)
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
      throw new Error(`TelegramError: ${e.response.data.description}`)
    }
  }
}