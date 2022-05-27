import {
  chatActions,
  diceEmojis,
  IAnswerCallbackQueryExtra, IContext,
  IDeleteMessageTextExtra,
  IEditMarkupExtra,
  IEditMessageTextExtra, IFile, IForwardMessageExtra,
  IGetChatMemberExtra,
  IGetChatMemberResponse, IKickChatMemberExtra,
  IMessage,
  IMessageExtra, IPaymentExtra,
  IPinMessageExtra, IPreCheckoutQueryExtra, IPrivateChat,
  ISendActionExtra,
  ISendDiceExtra,
  sendTypes,
} from '../types'

import { Keyboard } from './Extra/Keyboard'
import { Options } from './Extra/Options'
import { Payment } from './SendTypes/Payment'
import { Media } from './SendTypes/Media'

import FormData from 'form-data'
import axios from 'axios'

let connectionUri = ''
export const updateConnectionUri = (uri: string): string => connectionUri = uri

let token = ''
export const updateToken = (newToken: string): string => token = newToken

export class TelegramMethods {
  ctx?: IContext

  constructor(ctx?: IContext) {
    this.ctx = ctx
  }
  
  public static get token(): string {
    return token
  }

  private static async fetch<T>(url: string, params: any): Promise<T> {
    try {
      const { data } = await axios.post(connectionUri + url, params)
      return data.result
    } catch (e: any) {
      throw new Error(`TelegramError: ${e.response.data.description}`)
    }
  }
  
  private getResultExtra(keyboard?: Keyboard | null, options?: Options | null): IMessageExtra {
    return {
      ...(keyboard ? keyboard.solveExtra(this.ctx) : {}),
      ...(options ? options.extra : {}),
    }
  }

  public async getMe(): Promise<IPrivateChat> {
    return await TelegramMethods.fetch<IPrivateChat>('/getMe', null)
  }

  public async send(userId?: number, data?: sendTypes, keyboard?: Keyboard | null, options?: Options | null): Promise<IMessage | void> {
    try {
      if (!userId || !data) return

      if (data instanceof Media) {
        if (data.type === 'photo') {
          return this.sendPhoto(userId, data, keyboard, options)
        } else if (data.type === 'video') {
          return this.sendVideo(userId, data, keyboard, options)
        } else if (data.type === 'document') {
          return this.sendDocument(userId, data, keyboard, options)
        } else return
      } else if (data instanceof Payment) {
        return this.sendInvoice(userId, data.info, keyboard, options)
      }

      const initExtra: IMessageExtra = {
        chat_id: userId,
        parse_mode: 'HTML',
        text: data,
        ...this.getResultExtra(keyboard, options)
      }

      return await TelegramMethods.fetch<IMessage>('/sendMessage', initExtra)
    } catch (e: any) {
      throw e
    }
  }

  public async sendInvoice(userId?: number, paymentInfo?: IPaymentExtra, keyboard?: Keyboard | null, options?: Options | null): Promise<IMessage | void> {
    try {
      if (!userId || !paymentInfo) return
      if (keyboard && keyboard.type !== 'under_the_message') throw new Error(`TelegramError: For invoices you can use under_the_message keyboard only`)

      const initExtra: IPaymentExtra = {
        chat_id: userId,
        parse_mode: 'HTML',
        ...paymentInfo,
        ...this.getResultExtra(keyboard, options)
      }

      return await TelegramMethods.fetch<IMessage>('/sendInvoice', initExtra)
    } catch (e: any) {
      throw e
    }
  }

  public async forward(fromChatId?: number, toChatId?: number, msgId?: number, options?: Options): Promise<IMessage | void> {
    try {
      if (!fromChatId || !toChatId || !msgId) return

      const initExtra: IForwardMessageExtra = {
        chat_id: toChatId,
        from_chat_id: fromChatId,
        message_id: msgId,
        ...this.getResultExtra(null, options)
      }

      return await TelegramMethods.fetch<IMessage>('/forwardMessage', initExtra)
    } catch (e: any) {
      throw e
    }
  }

  public async copy(fromChatId?: number, toChatId?: number, msgId?: number, options?: Options): Promise<IMessage | void> {
    try {
      if (!fromChatId || !toChatId || !msgId) return

      const initExtra: IForwardMessageExtra = {
        chat_id: toChatId,
        from_chat_id: fromChatId,
        message_id: msgId,
        ...this.getResultExtra(null, options)
      }

      return await TelegramMethods.fetch<IMessage>('/copyMessage', initExtra)
    } catch (e: any) {
      throw e
    }
  }

  public async sendPhoto(userId?: number, media?: Media, keyboard?: Keyboard | null, options?: Options | null): Promise<IMessage | void> {
    try {
      if (!userId || !media) return
      const resultExtra: IMessageExtra = this.getResultExtra(keyboard, options)
      const formData: FormData = await media.getFormData(userId, resultExtra)

      try {
        const { data } = await axios.post(
          connectionUri + '/sendPhoto',
          formData,
          { headers: formData.getHeaders() }
        )

        media.saveCache(data.result.photo[data.result.photo.length - 1].file_id)
        return data.result
      } catch (e: any) {
        throw new Error(e.response ? `TelegramError: ${e.response.data.description}` : e)
      }
    } catch (e: any) {
      throw e
    }
  }

  public async sendVideo(userId?: number, media?: Media, keyboard?: Keyboard | null, options?: Options | null): Promise<IMessage | void> {
    try {
      if (!userId || !media) return
      const moreExtra: IMessageExtra = this.getResultExtra(keyboard, options)
      const formData: FormData = await media.getFormData(userId, moreExtra)

      try {
        const { data } = await axios.post(
          connectionUri + '/sendVideo',
          formData,
          { headers: formData.getHeaders(), maxBodyLength: Infinity }
        )

        media.saveCache(data.result.video.file_id)
        return data.result
      } catch (e: any) {
        throw new Error(e.response ? `TelegramError: ${e.response.data.description}` : e)
      }
    } catch (e: any) {
      throw e
    }
  }

  public async sendDocument(userId?: number, media?: Media, keyboard?: Keyboard | null, options?: Options | null): Promise<IMessage | void> {
    try {
      if (!userId || !media) return
      const moreExtra: IMessageExtra = this.getResultExtra(keyboard, options)
      const formData: FormData = await media.getFormData(userId, moreExtra)

      try {
        const { data } = await axios.post(
          connectionUri + '/sendDocument',
          formData,
          { headers: formData.getHeaders(), maxBodyLength: Infinity }
        )

        media.saveCache(data.result.document.file_id)
        return data.result
      } catch (e: any) {
        throw new Error(e.response ? `TelegramError: ${e.response.data.description}` : e)
      }
    } catch (e: any) {
      throw e
    }
  }

  public async sendDice(userId?: number, emoji?: diceEmojis, keyboard?: Keyboard | null, options?: Options | null): Promise<IMessage | void> {
    try {
      if (!userId) return

      const initExtra: ISendDiceExtra = {
        chat_id: userId,
        parse_mode: 'HTML',
        emoji,
        ...this.getResultExtra(keyboard, options)
      }

      return await TelegramMethods.fetch<IMessage>('/sendDice', initExtra)
    } catch (e: any) {
      throw e
    }
  }

  public async sendChatAction(chatId?: number, action?: chatActions): Promise<boolean | void> {
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

  public async toast(callbackQueryId?: string, text?: string, showAlert?: boolean): Promise<IMessage | void> {
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

  public async alert(callbackQueryId?: string, text?: string): Promise<IMessage | void> {
    try {
      return await this.toast(callbackQueryId, text, true)
    } catch (e: any) {
      throw e
    }
  }

  public async answerPayment(preCheckoutQueryId: string, ok: boolean, errorMessage?: string): Promise<IMessage | void> {
    try {
      if (!preCheckoutQueryId) return

      const extra: IPreCheckoutQueryExtra = {
        pre_checkout_query_id: preCheckoutQueryId,
        error_message: errorMessage,
        ok,
      }

      return await TelegramMethods.fetch<IMessage>('/answerPreCheckoutQuery', extra)
    } catch (e: any) {
      throw e
    }
  }

  public async edit(userId?: number, msgId?: number, data?: sendTypes | Keyboard, keyboard?: Keyboard | Options | null, options?: Options | null): Promise<IMessage | void> {
    try {
      if (!userId || !msgId || !data) return
      if (data instanceof Payment) throw new Error(`TelegramError: You can't edit message to payment`)

      if (data instanceof Keyboard) {
        if (keyboard instanceof Options) options = keyboard
        keyboard = data
        return this.editKeyboard(userId, msgId, keyboard, options)
      }

      if (keyboard instanceof Options) throw new Error(`TelegramError: You can't use options how keyboard`)

      if (data instanceof Media) {
        return this.editMedia(userId, msgId, data, keyboard, options)
      }

      const extra: IEditMessageTextExtra = {
        chat_id: userId,
        message_id: msgId,
        parse_mode: 'HTML',
        text: data,
        ...this.getResultExtra(keyboard, options)
      }

      return await TelegramMethods.fetch<IMessage>('/editMessageText', extra)
    } catch (e: any) {
      throw e
    }
  }

  public async editKeyboard(userId?: number, msgId?: number, keyboard?: Keyboard | null, options?: Options | null): Promise<IMessage | void> {
    try {
      if (!userId || !msgId) return

      const data: IEditMarkupExtra = {
        chat_id: userId,
        message_id: msgId,
        ...this.getResultExtra(keyboard, options)
      }

      return await TelegramMethods.fetch<IMessage>('/editMessageReplyMarkup', data)
    } catch (e: any) {
      throw e
    }
  }

  public async editMedia(userId?: number, msgId?: number, media?: Media, keyboard?: Keyboard | null, options?: Options | null): Promise<IMessage | void> {
    try {
      if (!userId || !msgId || !media) return
      const resultExtra: IMessageExtra = this.getResultExtra(keyboard, options)
      const formData: FormData = await media.getEditFormData(userId, msgId, resultExtra)

      try {
        const { data } = await axios.post(
          connectionUri + '/editMessageMedia',
          formData,
          { headers: formData.getHeaders() }
        )

        return data.result
      } catch (e: any) {
        throw new Error(e.response ? `TelegramError: ${e.response.data.description}` : e)
      }
    } catch (e: any) {
      throw e
    }
  }

  public async delete(userId?: number, msgId?: number): Promise<boolean> {
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

  public async pinMessage(chatId?: number | string, msgId?: number, disableNotification?: boolean): Promise<boolean> {
    try {
      if (!chatId || !msgId) return false

      const data: IPinMessageExtra = {
        chat_id: chatId,
        message_id: msgId,
        disable_notification: disableNotification,
      }

      return await TelegramMethods.fetch<boolean>('/pinChatMessage', data)
    } catch (e: any) {
      throw e
    }
  }

  public async unpinMessage(chatId?: number | string, msgId?: number): Promise<boolean> {
    try {
      if (!chatId || !msgId) return false

      const data: IPinMessageExtra = {
        chat_id: chatId,
        message_id: msgId,
      }

      return await TelegramMethods.fetch<boolean>('/unpinChatMessage', data)
    } catch (e: any) {
      throw e
    }
  }

  public async getChatMember(chatId: number | string, userId: number): Promise<IGetChatMemberResponse | void> {
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

  public async kickChatMember(chatId?: number | string, userId?: number, moreExtra?: IKickChatMemberExtra): Promise<boolean> {
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

  public async getFile(fileId: string): Promise<IFile | void> {
    try {
      return await TelegramMethods.fetch<IFile | undefined>('/getFile', { file_id: fileId })
    } catch (e: any) {
      throw e
    }
  }
}