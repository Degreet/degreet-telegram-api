import { IInlineKeyboard, IMessage, IMessageExtra, IRemoveKeyboard, IReplyKeyboard } from '../types'
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
      throw new Error(`TelegramError: ${e.message}`)
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
      throw new Error(`TelegramError: ${e.message}`)
    }
  }
}