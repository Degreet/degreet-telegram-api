import {
  ICallbackQuery,
  IPrivateChat,
  IChatJoinRequest,
  IContact,
  IContext,
  IDiceContext,
  ILocation,
  IMessage,
  IPhotoSize,
  ISceneContext,
  IUpdate,
  IChatMemberUpdate,
  IPaymentData,
  IPaymentAnswer,
  ISuccessfulPayment,
  IInlineQuery,
  IChosenInlineQuery,
  IShippingQuery, IVideo, IVideoNote, IDocument, IParsed, IEntity
} from '../../types'

import { TelegramMethods } from '../TelegramMethods'
import { SceneController } from '../Scenes/SceneController'
import { Layout } from '../Block/Layout'
import { Msg } from './Msg'
import { Answer } from './Answer'

export class Context<T> implements IContext {
  sender?: IPrivateChat
  chat?: IPrivateChat

  props: Partial<T> = {}
  session: any = {}

  msg: Msg
  answer: Answer
  update: IUpdate
  message?: IMessage
  scene: ISceneContext
  api: TelegramMethods
  layouts: Layout[] = []

  params: string[] = []
  matchParams: RegExpMatchArray
  parsed: IParsed = { links: [], emails: [], phones: [] }

  callbackQuery?: ICallbackQuery
  joinRequest?: IChatJoinRequest
  newChatMember?: IPrivateChat
  leftChatMember?: IPrivateChat
  chatMemberUpdate?: IChatMemberUpdate
  dice?: IDiceContext
  location?: ILocation
  contact?: IContact
  photoParts?: IPhotoSize[]
  photo?: IPhotoSize
  payment?: IPaymentData
  paymentAnswer?: IPaymentAnswer
  successfulPayment?: ISuccessfulPayment
  inlineQuery?: IInlineQuery
  chosenInlineQuery?: IChosenInlineQuery
  shippingQuery?: IShippingQuery
  userStatusUpdate?: IChatMemberUpdate
  video?: IVideo
  videoNote?: IVideoNote
  document?: IDocument
  post?: IMessage

  constructor(update: IUpdate, sceneController: SceneController, layouts: Layout[]) {
    if (update.message) {
      this.message = update.message
      this.sender = update.message?.from
      this.chat = update.message?.chat

      if (update.message.entities && update.message.text) {
        update.message.entities.forEach((entity: IEntity): void | null => {
          if (!['url', 'phone_number', 'email'].includes(entity.type) || !update.message) return null
          const text: string = update.message.text.slice(entity.offset, entity.length)

          switch (entity.type) {
            case 'url':
              if (!this.parsed.link) this.parsed.link = text
              this.parsed.links.push(text)
              break
            case 'phone_number':
              if (!this.parsed.phone) this.parsed.phone = text
              this.parsed.phones.push(text)
              break
            case 'email':
              if (!this.parsed.email) this.parsed.email = text
              this.parsed.emails.push(text)
              break
          }
        })

        if (
          update.message.entities[0].type === 'bot_command' &&
          update.message.text.length !== update.message.entities[0].length
        ) {
          this.params = update.message.text
            .slice(update.message.entities[0].length + 1)
            .split(' ')
        }
      }

      if (update.message.new_chat_member) {
        this.newChatMember = update.message.new_chat_member
      } else if (update.message.left_chat_member) {
        this.leftChatMember = update.message.left_chat_member
      } else if (update.message.dice) {
        this.dice = update.message.dice
      } else if (update.message.location) {
        this.location = update.message.location
      } else if (update.message.contact) {
        this.contact = update.message.contact
      } else if (update.message.invoice) {
        this.payment = update.message.invoice
      } else if (update.message.photo) {
        this.photoParts = update.message.photo
        this.photo = this.photoParts[this.photoParts.length - 1]
      } else if (update.message.successful_payment) {
        this.successfulPayment = update.message.successful_payment
      } else if (update.message.video) {
        this.video = update.message.video
      } else if (update.message.video_note) {
        this.videoNote = update.message.video_note
      } else if (update.message.document) {
        this.document = update.message.document
      }
    } else if (update.callback_query) {
      this.message = update.callback_query?.message
      this.sender = update.callback_query?.from
      this.callbackQuery = update.callback_query
    } else if (update.chat_join_request) {
      this.joinRequest = update.chat_join_request
      this.sender = update.chat_join_request.from
    } else if (update.edited_message) {
      this.message = update.edited_message
      this.sender = update.edited_message?.from
    } else if (update.chat_member) {
      this.chatMemberUpdate = update.chat_member
      this.sender = update.chat_member?.from
    } else if (update.pre_checkout_query) {
      this.paymentAnswer = update.pre_checkout_query
      this.sender = update.pre_checkout_query?.from
    } else if (update.channel_post) {
      this.message = this.post = update.channel_post
      this.sender = update.channel_post?.from
    } else if (update.edited_channel_post) {
      this.message = update.edited_channel_post
      this.sender = update.edited_channel_post?.from
    } else if (update.inline_query) {
      this.inlineQuery = update.inline_query
      this.sender = update.inline_query?.from
    } else if (update.chosen_inline_query) {
      this.chosenInlineQuery = update.chosen_inline_query
      this.sender = update.chosen_inline_query?.from
    } else if (update.shipping_query) {
      this.shippingQuery = update.shipping_query
      this.sender = update.shipping_query?.from
    } else if (update.my_chat_member) {
      this.userStatusUpdate = update.my_chat_member
      this.sender = update.my_chat_member?.new_chat_member.user
    }

    this.update = update
    this.api = new TelegramMethods(this)
    this.msg = new Msg(this.message, this.update)
    this.answer = new Answer(this, this.sender, this.message, this.update)
    this.scene = this.getSceneParams(sceneController)
    this.layouts = layouts
  }

  public callLayout(name: string, ...args: any[]): true {
    const layout = this.layouts.find((layout: Layout): boolean => layout.name === name)
    if (!layout) throw new Error(`DegreetTelegram: Layout ${name} not found`)
    layout.handler(this, ...args)
    return true
  }

  private getSceneParams(sceneController: SceneController): ISceneContext {
    const enter = (name: string, params?: any): void => sceneController.enter(this.sender?.id, this, name, params)
    const leave = (): void => sceneController.leave(this.sender?.id, this)
    const next = (): void => sceneController.next(this.sender?.id)

    const getData = (): string[] | void => sceneController.getData(this.sender?.id)
    const getParams = (): string[] | void => sceneController.getParams(this.sender?.id)

    return {
      enter, leave, next,
      get data(): string[] | void {
        return getData()
      },
      get params(): any | void {
        return getParams()
      },
    }
  }
}