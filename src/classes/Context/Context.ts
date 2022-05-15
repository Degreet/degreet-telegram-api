import {
  ICallbackQuery,
  IPrivateChat,
  IChatJoinRequest, IContact,
  IContext, IDiceContext,
  ILocation,
  IMessage,
  INewChatMember, IPhotoSize, ISceneContext,
  IUpdate, IChatMemberUpdate, IPaymentData, IPaymentAnswer, ISuccessfulPayment
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

  callbackQuery?: ICallbackQuery
  joinRequest?: IChatJoinRequest
  newChatMember?: INewChatMember
  chatMemberUpdate?: IChatMemberUpdate
  dice?: IDiceContext
  location?: ILocation
  contact?: IContact
  photoParts?: IPhotoSize[]
  photo?: IPhotoSize
  payment?: IPaymentData
  paymentAnswer?: IPaymentAnswer
  successfulPayment?: ISuccessfulPayment

  constructor(update: IUpdate, sceneController: SceneController, layouts: Layout[]) {
    if (update.message) {
      this.message = update.message
      this.sender = update.message?.from
      this.chat = update.message?.chat

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
      } else if (update.message.contact) {
        this.contact = update.message.contact
      } else if (update.message.invoice) {
        this.payment = update.message.invoice
      } else if (update.message.photo) {
        this.photoParts = update.message.photo
        this.photo = this.photoParts[this.photoParts.length - 1]
      } else if (update.message.successful_payment) {
        this.successfulPayment = update.message.successful_payment
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
    }

    this.update = update
    this.api = new TelegramMethods(this)
    this.msg = new Msg(this.message, this.update)
    this.answer = new Answer(this, this.sender, this.message, this.update)
    this.scene = this.getSceneParams(sceneController)
    this.layouts = layouts
  }

  public callLayout(name: string): boolean {
    const layout = this.layouts.find((layout: Layout): boolean => layout.name === name)
    if (layout) layout.handler(this, () => {})
    return !!layout
  }

  private getSceneParams(sceneController: SceneController): ISceneContext {
    const enter = (name: string): void => sceneController.enter(this.sender?.id, this, name)
    const leave = (): void => sceneController.leave(this.sender?.id)
    const next = (): void => sceneController.next(this.sender?.id)

    return { enter, leave, next }
  }
}