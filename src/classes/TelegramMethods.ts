import {
  chatActions,
  diceEmojis,
  IAnswerCallbackQueryExtra,
  IDeleteMessageTextExtra,
  IEditMarkupExtra,
  IEditMessageTextExtra, IFile,
  IGetChatMemberExtra,
  IGetChatMemberResponse, IKickChatMemberExtra,
  IMessage,
  IMessageExtra,
  IPhotoInfo,
  ISendActionExtra,
  ISendDiceExtra,
  ISendPhotoExtra,
} from '../types'

import FormData from 'form-data'
import { Markup } from './Markup'
import axios from 'axios'
import * as fs from 'fs'

let connectionUri = ''
export const updateConnectionUri = (uri: string): string => connectionUri = uri

let token = ''
export const updateToken = (newToken: string): string => token = newToken

export class TelegramMethods {
  public get token(): string {
    return token
  }

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

  async sendPhoto(userId?: number, photo?: IPhotoInfo, extra: ISendPhotoExtra | Markup = {}): Promise<IMessage | void> {
    try {
      if (!userId || !photo) return
      const resultExtra: ISendPhotoExtra = TelegramMethods.extraMarkup(extra)

      if (photo.url) {
        const initExtra: ISendPhotoExtra = {
          chat_id: userId,
          parse_mode: 'HTML',
          photo: photo.url,
          ...resultExtra,
        }

        return await TelegramMethods.fetch<IMessage>('/sendPhoto', initExtra)
      } else if (photo.photoPath) {
        const formData = new FormData()
        formData.append('chat_id', userId)
        formData.append('parse_mode', 'HTML')
        formData.append('photo', fs.createReadStream(photo.photoPath))

        Object.keys(resultExtra).forEach((key: string): void => {
          const data = resultExtra[key as keyof typeof resultExtra]
          formData.append(key, typeof data === 'object' ? JSON.stringify(data) : data)
        })

        try {
          const { data } = await axios.post(
            connectionUri + '/sendPhoto',
            formData,
            { headers: formData.getHeaders() }
          )

          return data.result
        } catch (e: any) {
          throw new Error(e.response ? `TelegramError: ${e.response.data.description}` : e)
        }
      }
    } catch (e: any) {
      throw e
    }
  }

  async sendDice(userId?: number, emoji?: diceEmojis, extra: IMessageExtra | Markup = {}): Promise<IMessage | void> {
    try {
      if (!userId) return
      const resultExtra: IMessageExtra = TelegramMethods.extraMarkup(extra)

      const initExtra: ISendDiceExtra = {
        chat_id: userId,
        parse_mode: 'HTML',
        emoji,
        ...resultExtra,
      }

      return await TelegramMethods.fetch<IMessage>('/sendDice', initExtra)
    } catch (e: any) {
      throw e
    }
  }

  async sendChatAction(chatId?: number, action?: chatActions): Promise<boolean | void> {
    try {
      if (!chatId || !action) return

      const initExtra: ISendActionExtra = {
        chat_id: chatId,
        action,
      }

      return await TelegramMethods.fetch<boolean>('/sendChatAction', initExtra)
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

  async kickChatMember(chatId?: number | string, userId?: number, moreExtra?: IKickChatMemberExtra): Promise<boolean> {
    try {
      if (!chatId || !userId) return false

      const data: IKickChatMemberExtra = {
        chat_id: chatId,
        user_id: userId,
        ...moreExtra,
      }

      return await TelegramMethods.fetch<boolean>('/banChatMember', data)
    } catch (e: any) {
      throw e
    }
  }

  async getFile(fileId: string): Promise<IFile | void> {
    try {
      return await TelegramMethods.fetch<IFile | undefined>('/getFile', { file_id: fileId })
    } catch (e: any) {
      throw e
    }
  }
}