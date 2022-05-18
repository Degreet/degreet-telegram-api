import { Msg } from './classes/Context/Msg'
import { TelegramMethods } from './classes/TelegramMethods'
import { BlockScene } from './classes/Scenes/BlockScene'
import { StepScene } from './classes/Scenes/StepScene'
import { Payment } from './classes/SendTypes/Payment'
import { Answer } from './classes/Context/Answer'
import { Media } from './classes/SendTypes/Media'

export type middleware = (ctx: IContext, next: nextMiddleware) => any | Promise<any>
export type middlewareArgs = (ctx: IContext, ...args: any[]) => any | Promise<any>
export type nextMiddleware = () => any
export type sessionItem<T> = [number, T]
export type sceneInfoItem = [number, IScene]
export type keyboard = IInlineKeyboard | IReplyKeyboard | IRemoveKeyboard
export type allowedTypes = 'base' | 'callback' | 'cb' | 'requestContact' | 'requestLocation' | 'webApp' | 'url' | 'switchInlineQuery' | 'pay'
export type keyboardType = 'under_the_message' | 'under_the_chat' | 'remove_under_the_chat' | 'remove_under_the_message'
export type parseModeTypes = 'HTML' | 'Markdown' | 'MarkdownV2'
export type scene = BlockScene | StepScene
export type eventHint = 'join_request' | 'new_chat_member' | 'message' | 'text' | 'dice' | 'location' | 'contact' | 'edit' | 'chat_member_update' | 'payment_answer' | 'payment' | 'successful_payment' | 'post' | 'post_edit' | 'inline_query' | 'inline_query_choose' | 'shipping_query' | 'poll' | 'user_status_update' | 'forward' | 'left_chat_member' | mediaTypes | 'video_note' | string
export type diceEmojis = '🎲' | '🎯' | '🏀' | '⚽' | '🎳' | '🎰'
export type eventType = eventHint | RegExp
export type onClickActions = string | RegExp
export type chatActions = 'typing' | 'upload_photo' | 'record_video' | 'upload_video' | 'record_voice' | 'upload_voice' | 'upload_document' | 'choose_sticker' | 'find_location' | 'record_video_note' | 'upload_video_note' | string
export type statusTypes = 'kicked' | 'left' | 'restricted' | 'member' | 'administrator' | 'creator'
export type mediaFileTypes = 'url' | 'path'
export type mediaTypes = 'photo' | 'video' | 'document'
export type sendTypes = Payment | Media | 'keyboard' | string
export type needUserDataPayment = 'name' | 'phone_number' | 'email' | 'shipping_address'
export type inlineQueryChatTypes = 'sender' | 'private' | 'group' | 'supergroup' | 'channel'
export type pollTypes = 'regular' | 'quiz'
export type chatTypes = 'private' | 'group' | 'supergroup' | 'channel'

export interface IOptions {
  allowedUpdates?: eventHint[]
  limit?: number
  timeout?: number
  webhook?: string
}

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
  name: string
  layout: IButton[][]
  isI18n: boolean
}

export interface IMarkupLayoutEntity {
  layout: IMarkupLayout
  isI18n: boolean
  index: number
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

export interface IEditMessageMediaExtra {
  type: mediaTypes
  media: string
  caption?: string
  parse_mode?: parseModeTypes
  caption_entities?: IEntity[]
  thumb?: string
  width?: number
  height?: number
  duration?: number
  supports_streaming?: boolean
}

export interface IContext<T = any> {
  sender?: IPrivateChat
  message?: IMessage
  update?: IUpdate
  msg: Msg
  props: any
  session: T
  answer: Answer
  api: TelegramMethods
  params: string[]
  scene: ISceneContext
  callLayout: (name: string, ...args: any[]) => boolean
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
  chat?: IPrivateChat
  successfulPayment?: ISuccessfulPayment
  inlineQuery?: IInlineQuery
  chosenInlineQuery?: IChosenInlineQuery
  shippingQuery?: IShippingQuery
  userStatusUpdate?: IChatMemberUpdate
  video?: IVideo
  videoNote?: IVideoNote
  document?: IDocument
  post?: IMessage
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
  enter: (name: string, params?: any) => void
  leave: () => void
  next: () => void
  data: string[] | void
  params: any
}

export interface IScene {
  activeScene: string | null
  middlewareIndex: number
  data: string[]
  params?: any
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
  from: IPrivateChat
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

export interface IShippingQuery {
  id: string
  from: IPrivateChat
  invoice_payload: string
  shipping_address: IShippingAddress
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

export interface IPrivateChat {
  id: number
  is_bot: boolean
  first_name: string
  last_name?: string
  username: string
  can_join_groups: boolean
  can_read_all_group_messages: boolean
  supports_inline_queries: boolean
}

export interface IForwardMessageExtra {
  chat_id: number
  message_id: number
  from_chat_id: number
  disable_notification?: boolean
  protect_content?: boolean
}

export interface IChatPhoto {
  small_file_id: string
  small_file_unique_id: string
  big_file_id: string
  big_file_unique_id: string
}

export interface IChatPermission {
  can_send_messages?: boolean
  can_send_media_messages?: boolean
  can_send_polls?: boolean
  can_send_other_messages?: boolean
  can_add_web_page_previews?: boolean
  can_change_info?: boolean
  can_invite_users?: boolean
  can_pin_messages?: boolean
}

export interface IChatLocation {
  location: ILocation
  address: string
}

export interface IChat extends IPrivateChat {
  type: chatTypes
  title?: string
  photo?: IChatPhoto
  bio?: string
  has_private_forwards?: true
  description?: string
  invite_link?: string
  pinned_message?: IMessage
  permissions?: IChatPermission[]
  slow_mode_delay?: number
  message_auto_delete_time: number
  has_protected_content?: true
  sticker_set_name?: string
  can_set_sticker_set?: true
  linked_chat_id?: number
  location?: IChatLocation
}

export interface IDocument {
  file_id: string
  file_unique_id: string
  thumb?: IPhotoSize[]
  file_name?: string
  mime_type?: string
  file_size?: number
}

export interface IVideo {
  file_id: string
  file_unique_id: string
  width: number
  height: number
  duration: number
  thumb?: IPhotoSize[]
  file_name?: string
  mime_type?: string
  file_size?: number
}

export interface IVideoNote {
  file_id: string
  file_unique_id: string
  length: number
  duration: number
  thumb?: IPhotoSize[]
  file_size?: number
}

export interface IWebAppData {
  data: string
  button_text: string
}

export interface IMessage {
  message_id: number,
  from?: IPrivateChat,
  sender_chat?: IPrivateChat,
  date: number,
  chat: IChat,
  forward_from?: IPrivateChat
  forward_from_chat?: IChat
  forward_from_message_id?: number
  forward_signature?: string
  forward_sender_name?: string
  forward_date?: number
  is_automatic_forward?: true
  reply_to_message?: IMessage
  via_bot?: IPrivateChat
  edit_date?: number
  has_protected_content?: true
  media_group_id?: string
  author_signature?: string
  text: string,
  entities?: IEntity[]
  document?: IDocument
  photo?: IPhotoSize[]
  video?: IVideo
  video_note?: IVideoNote
  caption?: string
  caption_entities?: IEntity[]
  contact?: IContact
  dice?: IDiceContext
  poll?: IPoll
  location?: ILocation
  new_chat_member?: IPrivateChat
  left_chat_member?: IPrivateChat
  new_chat_title?: string
  new_chat_photo?: IPhotoSize[]
  delete_chat_photo?: true
  group_chat_created?: true
  supergroup_chat_created?: true
  channel_chat_created?: true
  migrate_to_chat_id?: number
  migrate_from_chat_id?: number
  pinned_message?: IMessage
  invoice?: IPaymentData
  successful_payment?: ISuccessfulPayment
  web_app_data?: IWebAppData
  reply_markup?: keyboard
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
  from: IPrivateChat
  message: IMessage
  chat_instance: string
  data: string
}

export interface IInviteLink {
  invite_link: string
  name: string
  creator: IPrivateChat
  pending_join_request_count: number
  creates_join_request: boolean
  is_primary: boolean
  is_revoked: boolean
}

export interface IChatJoinRequest {
  chat: IChat
  from: IPrivateChat
  date: number
  invite_link: IInviteLink
}

export interface IChatMemberUpdateStatus {
  user: IPrivateChat
  status: statusTypes
}

export interface IChatMemberUpdate {
  chat: IChat
  from: IPrivateChat
  date: number
  old_chat_member: IChatMemberUpdateStatus
  new_chat_member: IChatMemberUpdateStatus
}

export interface IInlineQuery {
  id: string
  from: IPrivateChat
  query: string
  offset: string
  chat_type?: inlineQueryChatTypes
  location?: ILocation
}

export interface IChosenInlineQuery {
  result_id: string
  from: IPrivateChat
  location?: ILocation
  inline_message_id?: string
  query?: string
}

export interface IPollOption {
  text: string
  voter_count: number
}

export interface IPoll {
  id: string
  question: string
  options: IPollOption[]
  total_voter_count: number
  is_closed: boolean
  is_anonymous: boolean
  type: pollTypes
  allows_multiple_answers: boolean
  correct_option_id?: number
  explanation?: string
  explanation_entities?: IEntity[]
  open_period: number
  close_date: number
}

export interface IUpdate {
  update_id: number,
  message?: IMessage
  edited_message?: IMessage
  channel_post?: IMessage
  edited_channel_post?: IMessage
  inline_query?: IInlineQuery
  chosen_inline_query?: IChosenInlineQuery
  callback_query?: ICallbackQuery
  shipping_query?: IShippingQuery
  pre_checkout_query?: IPaymentAnswer
  poll?: IPoll
  my_chat_member?: IChatMemberUpdate
  chat_member?: IChatMemberUpdate
  chat_join_request?: IChatJoinRequest
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
  user: IPrivateChat
}