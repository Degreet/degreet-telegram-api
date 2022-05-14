import { Msg } from './classes/Context/Msg'
import { TelegramMethods } from './classes/TelegramMethods'
import { BlockScene } from './classes/Scenes/BlockScene'
import { StepScene } from './classes/Scenes/StepScene'
import { Payment } from './classes/SendTypes/Payment'
import { Answer } from './classes/Context/Answer'
import { Media } from './classes/SendTypes/Media'

export type middleware = (ctx: IContext, next: nextMiddleware) => any | Promise<any>
export type nextMiddleware = () => any
export type sessionItem<T> = [number, T]
export type sceneInfoItem = [number, IScene]
export type keyboard = IInlineKeyboard | IReplyKeyboard | IRemoveKeyboard
export type allowedTypes = 'base' | 'callback' | 'cb' | 'requestContact' | 'requestLocation' | 'webApp' | 'url' | 'switchInlineQuery' | 'pay'
export type keyboardType = 'under_the_message' | 'under_the_chat' | 'remove_under_the_chat'
export type parseModeTypes = 'HTML' | 'Markdown' | 'MarkdownV2'
export type scene = BlockScene | StepScene
export type eventHint = 'join_request' | 'new_chat_member' | 'message' | 'text' | 'dice' | 'location' | 'contact' | 'photo' | 'edit' | 'chat_member_update' | 'payment_answer' | 'payment' | 'successful_payment' | string
export type diceEmojis = '🎲' | '🎯' | '🏀' | '⚽' | '🎳' | '🎰'
export type eventType = eventHint | RegExp
export type chatActions = 'typing' | 'upload_photo' | 'record_video' | 'upload_video' | 'record_voice' | 'upload_voice' | 'upload_document' | 'choose_sticker' | 'find_location' | 'record_video_note' | 'upload_video_note' | string
export type statusTypes = 'kicked' | 'left' | 'restricted' | 'member' | 'administrator' | 'creator'
export type mediaFileTypes = 'url' | 'path'
export type mediaTypes = 'photo' | 'video' | 'document'
export type sendTypes = Payment | Media | string
export type needUserDataPayment = 'name' | 'phone_number' | 'email' | 'shipping_address'

// export interface I

export interface IPaymentExtra {
  chat_id?: number
  title?: string
  description?: string
  payload?: string
  provider_token?: string
  currency?: string
  prices?: IPaymentPrice[]
  max_tip_amount?: number
  suggested_tip_amounts?: number[]
  start_parameter?: string
  provider_data?: string
  photo_url?: string
  photo_size?: number
  photo_width?: number
  photo_height?: number
  need_name?: boolean
  need_phone_number?: boolean
  need_email?: boolean
  need_shipping_address?: boolean
  send_phone_number_to_provider?: boolean
  send_email_to_provider?: boolean
  is_flexible?: boolean
  disable_notification?: boolean
  protect_content?: boolean
  reply_to_message_id?: number
  allow_sending_without_reply?: boolean
  reply_markup?: keyboard
}

export interface IPaymentPrice {
  label: string
  amount: number
}

export interface ISendActionExtra {
  chat_id: number
  action: chatActions
}

export interface IKickChatMemberExtra {
  chat_id: number | string
  user_id: number
  until_date?: number
  revoke_messages?: boolean
}

export interface IMarkupLayout {
  name: string,
  layout: IButton[][]
}

export interface IDiceContext {
  emoji: diceEmojis
  value: number
}

export interface ISendDiceExtra {
  chat_id: number
  emoji?: diceEmojis
  disable_notification?: boolean
  protect_content?: boolean
  reply_to_message_id?: number
  allow_sending_without_reply?: boolean
  reply_markup?: keyboard
}

export interface I18n {
  setLocale: (localeName: string) => void
  get: (key: string, data?: any) => string | undefined
}

export interface IContext<T = any> {
  sender?: IChat
  message?: IMessage
  update?: IUpdate
  msg: Msg
  props: any
  session: T
  answer: Answer
  api: TelegramMethods
  params: string[]
  scene: ISceneContext
  callLayout: (name: string) => boolean
  matchParams: RegExpMatchArray
  callbackQuery?: ICallbackQuery
  joinRequest?: IChatJoinRequest
  newChatMember?: INewChatMember
  dice?: IDiceContext
  location?: ILocation
  contact?: IContact
  photoParts?: IPhotoSize[]
  photo?: IPhotoSize
  i18n?: I18n
  chat?: IChat
  successfulPayment?: ISuccessfulPayment
}

export interface I18nSession {
  i18n?: {
    locale: string
  }
}

export interface IFile {
  file_id: string
  file_unique_id: string
  file_size?: IPhotoSize
  file_path?: string
}

export interface IMediaInfo {
  url?: string
  path?: string
}

export interface ISceneContext {
  enter: (name: string) => void
  leave: () => void
  next: () => void
}

export interface IScene {
  activeScene: string | null
  middlewareIndex: number
}

export interface IInlineKeyboard {
  inline_keyboard: IButton[][]
}

export interface IReplyKeyboard {
  keyboard: IButton[][]
  resize_keyboard?: boolean
  input_field_placeholder?: string
}

export interface IRemoveKeyboard {
  remove_keyboard: boolean
}

export interface ISendPhotoExtra {
  chat_id?: number
  photo?: string
  caption?: string
  parse_mode?: parseModeTypes
  caption_entities?: IEntity[]
  disable_notification?: boolean
  protect_content?: boolean
  reply_to_message_id?: number
  allow_sending_without_reply?: boolean
  reply_markup?: keyboard
}

export interface IMediaCache {
  fileId: string
  filePath: string
}

export interface IMessageExtra {
  chat_id?: number
  text?: string
  parse_mode?: parseModeTypes
  disable_web_page_preview?: boolean
  disable_notification?: boolean
  protect_content?: boolean
  reply_to_message_id?: number
  allow_sending_without_reply?: boolean
  reply_markup?: keyboard
  caption?: string
}

export interface IHandler {
  type: string
  event?: string | RegExp
  text?: string
  listenEntities?: string[]
  middlewares: middleware[]
}

export interface IChat {
  id: number
  is_bot: boolean
  first_name: string
  username: string
  can_join_groups: boolean
  can_read_all_group_messages: boolean
  supports_inline_queries: boolean
}

export interface INewChatMember {
  id: number
  is_bot: boolean
  first_name: string
  username: string
}

export interface IContact {
  phone_number: number
  first_name: string
  last_name: string
  user_id?: number
  vcard?: string
}

export interface IPhotoSize {
  file_id: string
  file_unique_id: string
  width: number
  height: number
  file_size?: number
}

export interface IPaymentData {
  title: string
  description: string
  start_parameter: string
  currency: string
  total_amount: number
}

export interface IPaymentOrderInfo {
  name?: string
  phone_number?: string
  email?: string
  shipping_address?: IShippingAddress
}

export interface IPaymentAnswer {
  id: string
  from: IChat
  currency: string
  total_amount: number
  invoice_payload: string
  shipping_option_id: string
  order_info: IPaymentOrderInfo
}

export interface IShippingAddress {
  country_code: string
  state: string
  city: string
  street_line1: string
  street_line2: string
  post_code: string
}

export interface ISuccessfulPayment {
  currency: string
  total_amount: number
  invoice_payload: string
  shipping_option_id?: string
  order_info?: IPaymentOrderInfo
  telegram_payment_charge_id: string
  provider_payment_charge_id: string
}

export interface IMessage {
  message_id: number,
  from?: IChat,
  chat: IChat,
  date: number,
  text: string,
  entities?: IEntity[]
  new_chat_member?: INewChatMember
  dice?: IDiceContext
  location?: ILocation
  contact?: IContact
  photo?: IPhotoSize[]
  invoice?: IPaymentData
  successful_payment?: ISuccessfulPayment
}

export interface ILocation {
  longitude: number
  latitude: number
  horizontal_accuracy?: number
  live_period?: number
  heading?: number
  proximity_alert_radius?: number
}

export interface ICallbackQuery {
  id: string,
  from: IChat
  message: IMessage
  chat_instance: string
  data: string
}

export interface IInviteLink {
  invite_link: string
  name: string
  creator: IChat
  pending_join_request_count: number
  creates_join_request: boolean
  is_primary: boolean
  is_revoked: boolean
}

export interface IChatJoinRequest {
  chat: IChat
  from: IChat
  date: number
  invite_link: IInviteLink
}

export interface IChatMemberUpdateStatus {
  user: IChat
  status: statusTypes
}

export interface IChatMemberUpdate {
  chat: IChat
  from: IChat
  date: number
  old_chat_member: IChatMemberUpdateStatus
  new_chat_member: IChatMemberUpdateStatus
}

export interface IUpdate {
  update_id: number,
  from?: IChat,
  message?: IMessage
  callback_query?: ICallbackQuery
  chat_join_request?: IChatJoinRequest
  edited_message?: IMessage
  chat_member?: IChatMemberUpdate
  pre_checkout_query?: IPaymentAnswer
}

export interface IPinMessageExtra {
  chat_id: string | number
  message_id: number
  disable_notification?: boolean
}

export interface IEntity {
  offset: number
  length: number
  type: 'bot_command' | 'bold' | 'hashtag' | 'phone_number' | 'url' | 'email' | 'italic' | 'underline' | 'strikethrough' | 'spoiler' | 'code' | 'pre' | 'text_link' | 'text_mention' | string
}

export interface IWebAppButton {
  url?: string
}

export interface IButton {
  text: string
  url?: string
  callback_data?: string
  request_contact?: boolean
  request_location?: boolean
  switch_inline_query?: string
  web_app?: IWebAppButton
  pay?: boolean
}

export interface IPreCheckoutQueryExtra {
  pre_checkout_query_id: string
  ok: boolean
  error_message?: string
}

export interface IAnswerCallbackQueryExtra {
  callback_query_id: string,
  text?: string,
  show_alert?: boolean
  url?: string
}

export interface IDeleteMessageTextExtra {
  chat_id: number,
  message_id: number,
}

export interface IEditMarkupExtra extends IDeleteMessageTextExtra {
  reply_markup?: keyboard
}

export interface IEditMessageTextExtra extends IDeleteMessageTextExtra {
  text: string
  parse_mode?: parseModeTypes
  entities?: IEntity[]
  disable_web_page_preview?: boolean
  reply_markup?: keyboard
}

export interface IGetChatMemberExtra {
  chat_id: string | number
  user_id: number
}

export interface IGetChatMemberResponse {
  status: statusTypes
  user: IChat
}