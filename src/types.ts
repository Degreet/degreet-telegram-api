import { Msg } from './classes/Context'
import { TelegramMethods } from './classes/TelegramMethods'
import { BlockScene } from './classes/BlockScene'
import { StepScene } from './classes/StepScene'

export type middleware = (ctx: IContext, next: nextMiddleware) => any | Promise<any>
export type nextMiddleware = () => any
export type sessionItem<T> = [number, T]
export type sceneInfoItem = [number, IScene]
export type keyboard = IInlineKeyboard | IReplyKeyboard | IRemoveKeyboard
export type allowedTypes = 'base' | 'callback' | 'cb' | 'requestContact' | 'requestLocation' | 'webApp' | 'url' | 'switchInlineQuery'
export type keyboardType = 'inline' | 'reply' | 'remove'
export type parseModeTypes = 'HTML' | 'Markdown' | 'MarkdownV2'
export type scene = BlockScene | StepScene
export type eventHint = 'join_request' | 'new_chat_member' | 'message' | 'text' | 'dice' | 'location' | 'contact' | 'photo' | string
export type diceEmojis = '🎲' | '🎯' | '🏀' | '⚽' | '🎳' | '🎰'
export type eventType = eventHint | RegExp
export type chatActions = 'typing' | 'upload_photo' | 'record_video' | 'upload_video' | 'record_voice' | 'upload_voice' | 'upload_document' | 'choose_sticker' | 'find_location' | 'record_video_note' | 'upload_video_note' | string

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

export interface IContext {
  from?: IChat
  message?: IMessage
  update?: IUpdate
  msg: Msg
  props: any
  session: any
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
}

export interface IFile {
  file_id: string
  file_unique_id: string
  file_size?: IPhotoSize
  file_path?: string
}

export interface IPhotoInfo {
  url?: string
  photoPath?: string
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

export interface IUpdate {
  update_id: number,
  from?: IChat,
  message?: IMessage
  callback_query?: ICallbackQuery
  chat_join_request?: IChatJoinRequest
}

export interface IEntity {
  offset: number
  length: number
  type: 'bot_command' | 'bold' | 'hashtag' | 'phone_number' | 'url' | string
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
  status: 'kicked' | 'left' | 'restricted' | 'member' | 'administrator' | 'creator'
  user: IChat
}