import {
  IAnswerCallbackQueryExtra,
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

  async send(userId?: number, text?: string, extra: IMessageExtra | Markup = {}): Promise<IMessage | void> {
    try {
      if (!userId || !text) return
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

  async toast(callbackQueryId?: string, text?: string, showAlert?: boolean): Promise<any> {
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

  async alert(callbackQueryId?: string, text?: string): Promise<any> {
    try {
      return await this.toast(callbackQueryId, text, true)
    } catch (e: any) {
      throw new Error(`TelegramError: ${e.response.data.description}`)
    }
  }
}