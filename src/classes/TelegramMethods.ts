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
  IPhotoInfo, IPinMessageExtra,
  ISendActionExtra,
  ISendDiceExtra,
  ISendPhotoExtra,
} from '../types'

import FormData from 'form-data'
import { Keyboard } from './Extra/Keyboard'
import axios from 'axios'
import * as fs from 'fs'
import { Options } from './Extra/Options'

let connectionUri = ''
export const updateConnectionUri = (uri: string): string => connectionUri = uri

let token = ''
export const updateToken = (newToken: string): string => token = newToken

export class TelegramMethods {
  public static get token(): string {
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
  
  private static getResultExtra(keyboard?: Keyboard | null, options?: Options | null): IMessageExtra {
    return {
      ...(keyboard ? keyboard.solveExtra() : {}),
      ...(options ? options.extra : {}),
    }
  }

  public static async send(userId?: number, text?: string, keyboard?: Keyboard | null, options?: Options | null): Promise<IMessage | void> {
    try {
      if (!userId || !text) return

      const initExtra: IMessageExtra = {
        chat_id: userId,
        parse_mode: 'HTML',
        text,
        ...this.getResultExtra(keyboard, options)
      }

      return await this.fetch<IMessage>('/sendMessage', initExtra)
    } catch (e: any) {
      throw e
    }
  }

  public static async sendPhoto(userId?: number, photo?: IPhotoInfo, keyboard?: Keyboard | null, options?: Options | null): Promise<IMessage | void> {
    try {
      if (!userId || !photo) return
      const resultExtra: IMessageExtra = this.getResultExtra(keyboard, options)

      if (photo.url) {
        const initExtra: ISendPhotoExtra = {
          chat_id: userId,
          parse_mode: 'HTML',
          photo: photo.url,
          ...resultExtra,
        }

        return await this.fetch<IMessage>('/sendPhoto', initExtra)
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

  public static async sendDice(userId?: number, emoji?: diceEmojis, keyboard?: Keyboard | null, options?: Options | null): Promise<IMessage | void> {
    try {
      if (!userId) return

      const initExtra: ISendDiceExtra = {
        chat_id: userId,
        parse_mode: 'HTML',
        emoji,
        ...this.getResultExtra(keyboard, options)
      }

      return await this.fetch<IMessage>('/sendDice', initExtra)
    } catch (e: any) {
      throw e
    }
  }

  public static async sendChatAction(chatId?: number, action?: chatActions): Promise<boolean | void> {
    try {
      if (!chatId || !action) return

      const initExtra: ISendActionExtra = {
        chat_id: chatId,
        action,
      }

      return await this.fetch<boolean>('/sendChatAction', initExtra)
    } catch (e: any) {
      throw e
    }
  }

  public static async toast(callbackQueryId?: string, text?: string, showAlert?: boolean): Promise<IMessage | void> {
    try {
      if (!callbackQueryId) return

      const extra: IAnswerCallbackQueryExtra = {
        callback_query_id: callbackQueryId,
        show_alert: showAlert,
        text,
      }

      return await this.fetch<IMessage>('/answerCallbackQuery', extra)
    } catch (e: any) {
      throw e
    }
  }

  public static async alert(callbackQueryId?: string, text?: string): Promise<IMessage | void> {
    try {
      return await this.toast(callbackQueryId, text, true)
    } catch (e: any) {
      throw e
    }
  }

  public static async edit(userId?: number, msgId?: number, text?: string, keyboard?: Keyboard | null, options?: Options | null): Promise<IMessage | void> {
    try {
      if (!userId || !msgId || !text) return

      const data: IEditMessageTextExtra = {
        chat_id: userId,
        message_id: msgId,
        parse_mode: 'HTML',
        text,
        ...this.getResultExtra(keyboard, options)
      }

      return await this.fetch<IMessage>('/editMessageText', data)
    } catch (e: any) {
      throw e
    }
  }

  public static async delete(userId?: number, msgId?: number): Promise<boolean> {
    try {
      if (!userId || !msgId) return false

      const data: IDeleteMessageTextExtra = {
        chat_id: userId,
        message_id: msgId,
      }

      return await this.fetch<boolean>('/deleteMessage', data)
    } catch (e: any) {
      throw e
    }
  }

  public static async pinMessage(chatId?: number | string, msgId?: number, disableNotification?: boolean): Promise<boolean> {
    try {
      if (!chatId || !msgId) return false

      const data: IPinMessageExtra = {
        chat_id: chatId,
        message_id: msgId,
        disable_notification: disableNotification,
      }

      return await this.fetch<boolean>('/pinChatMessage', data)
    } catch (e: any) {
      throw e
    }
  }

  public static async unpinMessage(chatId?: number | string, msgId?: number): Promise<boolean> {
    try {
      if (!chatId || !msgId) return false

      const data: IPinMessageExtra = {
        chat_id: chatId,
        message_id: msgId,
      }

      return await this.fetch<boolean>('/unpinChatMessage', data)
    } catch (e: any) {
      throw e
    }
  }

  public static async editKeyboard(userId?: number, msgId?: number, keyboard?: Keyboard | null, options?: Options | null): Promise<IMessage | void> {
    try {
      if (!userId || !msgId) return

      const data: IEditMarkupExtra = {
        chat_id: userId,
        message_id: msgId,
        ...this.getResultExtra(keyboard, options)
      }

      return await this.fetch<IMessage>('/editMessageReplyMarkup', data)
    } catch (e: any) {
      throw e
    }
  }

  public static async getChatMember(chatId: number | string, userId: number): Promise<IGetChatMemberResponse | void> {
    try {
      const data: IGetChatMemberExtra = {
        chat_id: chatId,
        user_id: userId,
      }

      return await this.fetch<IGetChatMemberResponse | void>('/getChatMember', data)
    } catch (e: any) {
      throw e
    }
  }

  public static async kickChatMember(chatId?: number | string, userId?: number, moreExtra?: IKickChatMemberExtra): Promise<boolean> {
    try {
      if (!chatId || !userId) return false

      const data: IKickChatMemberExtra = {
        chat_id: chatId,
        user_id: userId,
        ...moreExtra,
      }

      return await this.fetch<boolean>('/banChatMember', data)
    } catch (e: any) {
      throw e
    }
  }

  public static async getFile(fileId: string): Promise<IFile | void> {
    try {
      return await this.fetch<IFile | undefined>('/getFile', { file_id: fileId })
    } catch (e: any) {
      throw e
    }
  }
}