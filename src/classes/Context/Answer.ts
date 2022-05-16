import {
  chatActions,
  diceEmojis,
  IPrivateChat, IContext,
  IFile, IGetChatMemberResponse,
  IMessage,
  IPhotoSize,
  IUpdate, sendTypes
} from '../../types'

import { Keyboard } from '../Extra/Keyboard'
import { TelegramMethods } from '../TelegramMethods'
import { Options } from '../Extra/Options'

import { TELEGRAM_FILE } from '../../constants'
import axios, { AxiosResponse } from 'axios'
import fs from 'fs'

export class Answer {
  chat?: IPrivateChat
  from?: IPrivateChat
  update?: IUpdate
  message?: IMessage
  message_id?: number
  ctx?: IContext

  constructor(ctx: IContext, from?: IPrivateChat, message?: IMessage, update?: IUpdate) {
    this.from = from
    this.message = message
    this.chat = message && message.chat || from
    this.message_id = message && message.message_id
    this.update = update
    this.ctx = ctx
  }

  async send(data?: sendTypes, keyboard?: Keyboard | null, options?: any): Promise<IMessage | void> {
    try {
      if (!this.chat) throw new Error(`DegreetTelegram Error: can't find userId`)
      return new TelegramMethods(this.ctx).send(this.chat.id, data, keyboard, options)
    } catch (e: any) {
      throw new Error(`TelegramError ${e.response.data.description}`)
    }
  }

  async pin(msgId?: number, disableNotification?: boolean): Promise<boolean> {
    try {
      if (!this.chat) throw new Error(`DegreetTelegram Error: can't find userId`)
      if (!msgId) msgId = this.message_id
      return new TelegramMethods(this.ctx).pinMessage(this.chat.id, msgId, disableNotification)
    } catch (e: any) {
      throw new Error(`TelegramError ${e.response.data.description}`)
    }
  }

  async unpin(msgId?: number): Promise<boolean> {
    try {
      if (!this.chat) throw new Error(`DegreetTelegram Error: can't find userId`)
      if (!msgId) msgId = this.message_id
      return new TelegramMethods(this.ctx).unpinMessage(this.chat.id, msgId)
    } catch (e: any) {
      throw new Error(`TelegramError ${e.response.data.description}`)
    }
  }

  async sendChatAction(action: chatActions): Promise<boolean | void> {
    try {
      if (!this.chat) throw new Error(`DegreetTelegram Error: can't find userId`)
      return new TelegramMethods(this.ctx).sendChatAction(this.chat.id, action)
    } catch (e: any) {
      throw new Error(`TelegramError ${e.response.data.description}`)
    }
  }

  async sendDice(emoji?: diceEmojis, keyboard?: Keyboard | null, options?: any): Promise<IMessage | void> {
    try {
      if (!this.chat) throw new Error(`DegreetTelegram Error: can't find userId`)
      return new TelegramMethods(this.ctx).sendDice(this.chat.id, emoji, keyboard, options)
    } catch (e: any) {
      throw new Error(`TelegramError ${e.response.data.description}`)
    }
  }

  async toast(text?: string): Promise<IMessage | void> {
    try {
      if (!this.update || !this.update.callback_query)
        throw new Error(`DegreetTelegram Error: can't find callback_query_id`)
      return new TelegramMethods(this.ctx).toast(this.update.callback_query.id, text)
    } catch (e: any) {
      throw new Error(`TelegramError ${e.response.data.description}`)
    }
  }

  async alert(text?: string): Promise<IMessage | void> {
    try {
      if (!this.update || !this.update.callback_query)
        throw new Error(`DegreetTelegram Error: can't find callback_query_id`)
      return new TelegramMethods(this.ctx).alert(this.update?.callback_query?.id, text)
    } catch (e: any) {
      throw new Error(`TelegramError ${e.response.data.description}`)
    }
  }

  async payment(ok: boolean, errorMessage?: string): Promise<IMessage | void> {
    try {
      if (!this.update || !this.update.pre_checkout_query)
        throw new Error(`DegreetTelegram Error: can't find callback_query_id`)
      return new TelegramMethods(this.ctx).answerPayment(this.update.pre_checkout_query.id, ok, errorMessage)
    } catch (e: any) {
      throw new Error(`TelegramError ${e.response.data.description}`)
    }
  }

  async edit(data?: sendTypes | Keyboard, keyboard?: Keyboard | Options | null, options?: any): Promise<IMessage | void> {
    try {
      if (!this.chat || !this.message_id)
        throw new Error(`DegreetTelegram Error: can't find userId & msgId`)

      return new TelegramMethods(this.ctx).edit(this.chat.id, this.message_id, data, keyboard, options)
    } catch (e: any) {
      throw new Error(`TelegramError ${e.response.data.description}`)
    }
  }

  async forward(toChatId?: number, options?: Options): Promise<IMessage | void> {
    try {
      if (!this.chat || !this.message_id)
        throw new Error(`DegreetTelegram Error: can't find userId & msgId`)

      return new TelegramMethods(this.ctx).forward(
        this.chat.id,
        toChatId, 
        this.message_id,
        options,
      )
    } catch (e: any) {
      throw new Error(`TelegramError ${e.response.data.description}`)
    }
  }

  async copy(toChatId?: number, options?: Options): Promise<IMessage | void> {
    try {
      if (!this.chat || !this.message_id)
        throw new Error(`DegreetTelegram Error: can't find userId & msgId`)

      return new TelegramMethods(this.ctx).copy(
        this.chat.id,
        toChatId,
        this.message_id,
        options,
      )
    } catch (e: any) {
      throw new Error(`TelegramError ${e.response.data.description}`)
    }
  }

  /**
   * @deprecated Use .edit instead
   */
  async editKeyboard(keyboard?: Keyboard | null, options?: any): Promise<IMessage | void> {
    try {
      if (!this.chat || !this.message_id)
        throw new Error(`DegreetTelegram Error: can't find userId & msgId`)

      return new TelegramMethods(this.ctx).editKeyboard(this.chat.id, this.message_id, keyboard, options)
    } catch (e: any) {
      throw new Error(`TelegramError ${e.response.data.description}`)
    }
  }

  async delete(): Promise<boolean> {
    try {
      if (!this.chat || !this.message_id)
        throw new Error(`DegreetTelegram Error: can't find userId & msgId`)

      return new TelegramMethods(this.ctx).delete(this.chat.id, this.message_id)
    } catch (e: any) {
      throw new Error(`TelegramError ${e.response.data.description}`)
    }
  }

  async getChatMember(chatId: number | string): Promise<IGetChatMemberResponse | void> {
    try {
      if (!this.chat) throw new Error(`DegreetTelegram Error: can't find userId`)
      return new TelegramMethods(this.ctx).getChatMember(chatId, this.chat.id)
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

  async kickChatMember(): Promise<boolean> {
    try {
      if (!this.chat || !this.from) throw new Error(`DegreetTelegram Error: can't find userId`)
      return new TelegramMethods(this.ctx).kickChatMember(this.chat.id, this.from.id)
    } catch (e: any) {
      throw new Error(`TelegramError ${e.response.data.description}`)
    }
  }

  async downloadMedia(path: string): Promise<boolean> {
    try {
      let fileId: string

      if (this.update?.message?.photo) {
        const photoParts: IPhotoSize[] | undefined = this.update?.message?.photo
        if (!photoParts) return false

        const photo: IPhotoSize | undefined = photoParts[photoParts.length - 1]
        if (!photo) return false

        fileId = photo.file_id
      } else if (this.update?.message?.document) {
        fileId = this.update?.message?.document.file_id
      } else if (this.update?.message?.video) {
        fileId = this.update?.message?.video.file_id
      } else if (this.update?.message?.video_note) {
        fileId = this.update?.message?.video_note.file_id
      } else return false

      const fileInfo: IFile | void = await new TelegramMethods(this.ctx).getFile(fileId)
      if (!fileInfo) return false

      const connectionUri: string = TelegramMethods.token
      const fullPath: string = `${TELEGRAM_FILE}${connectionUri}/${fileInfo.file_path}`

      try {
        axios({
          method: 'GET',
          url: fullPath,
          responseType: 'stream'
        }).then((response: AxiosResponse): void => {
          response.data.pipe(fs.createWriteStream(path))
        })

        return true
      } catch {
        return false
      }
    } catch (e: any) {
      throw new Error(`TelegramError ${e.response.data.description}`)
    }
  }
}