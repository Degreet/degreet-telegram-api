import {
  diceEmojis,
  ICallbackQuery,
  IChat,
  IChatJoinRequest,
  IContext, IDiceContext,
  IGetChatMemberResponse, ILocation,
  IMessage,
  IMessageExtra, INewChatMember, IPhotoInfo, ISceneContext, ISendPhotoExtra,
  IUpdate
} from '../types'

import { Markup } from './Markup'
import { TelegramMethods } from './TelegramMethods'
import { SceneController } from './SceneController'
import { Layout } from './Layout'

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

  async sendPhoto(photo: IPhotoInfo, extra: ISendPhotoExtra | Markup = {}): Promise<IMessage | void> {
    try {
      if (!this.from) throw new Error(`DegreetTelegram Error: can't found userId`)
      return new TelegramMethods().sendPhoto(this.from.id, photo, extra)
    } catch (e: any) {
      throw new Error(`TelegramError ${e.response.data.description}`)
    }
  }

  async sendDice(emoji?: diceEmojis, extra?: IMessageExtra | Markup): Promise<IMessage | void> {
    try {
      if (!this.from) throw new Error(`DegreetTelegram Error: can't found userId`)
      return new TelegramMethods().sendDice(this.from.id, emoji, extra)
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
  msg: Msg
  props: Partial<T> = {}
  session: any = {}
  api: TelegramMethods
  params: string[] = []
  scene: ISceneContext
  layouts: Layout[] = []
  matchParams: RegExpMatchArray

  update: IUpdate
  message?: IMessage

  callbackQuery?: ICallbackQuery
  joinRequest?: IChatJoinRequest
  newChatMember?: INewChatMember
  dice?: IDiceContext
  location?: ILocation

  constructor(update: IUpdate, sceneController: SceneController, layouts: Layout[]) {
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

      if (update.message.new_chat_member) {
        this.newChatMember = update.message.new_chat_member
      } else if (update.message.dice) {
        this.dice = update.message.dice
      } else if (update.message.location) {
        this.location = update.message.location
      }
    } else if (update.callback_query) {
      this.message = update.callback_query?.message
      this.from = update.callback_query?.from
      this.callbackQuery = update.callback_query
    } else if (update.chat_join_request) {
      this.joinRequest = update.chat_join_request
      this.from = update.chat_join_request.from
    }

    this.update = update
    this.api = new TelegramMethods()
    this.msg = new Msg(this.from, this.message, update)
    this.scene = this.getSceneParams(sceneController)
    this.layouts = layouts
  }

  public callLayout(name: string): boolean {
    const layout = this.layouts.find((layout: Layout): boolean => layout.name === name)
    if (layout) layout.handler(this, () => {})
    return !!layout
  }

  private getSceneParams(sceneController: SceneController): ISceneContext {
    const enter = (name: string): void => sceneController.enter(this.from?.id, this, name)
    const leave = (): void => sceneController.leave(this.from?.id)
    const next = (): void => sceneController.next(this.from?.id)

    return { enter, leave, next }
  }
}