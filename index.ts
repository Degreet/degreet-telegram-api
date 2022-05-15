import { eventHint, IPrivateChat, IContext, IHandler, middleware, scene } from './src/types'
import { TELEGRAM_BOT_API } from './src/constants'

import { updateConnectionUri, updateToken } from './src/classes/TelegramMethods'
import { Keyboard } from './src/classes/Extra/Keyboard'
import { Context } from './src/classes/Context/Context'
import { Options } from './src/classes/Extra/Options'
import { Session } from './src/classes/Session'
import { Layout } from './src/classes/Block/Layout'
import { I18n } from './src/classes/I18n'

import { BlockBuilder } from './src/classes/Block/BlockBuilder'
import { Block } from './src/classes/Block/Block'

import { StepScene } from './src/classes/Scenes/StepScene'
import { BlockScene } from './src/classes/Scenes/BlockScene'
import { SceneController } from './src/classes/Scenes/SceneController'

import axios from 'axios'
import { Polling } from './src/classes/Update/Polling'
import { Handler } from './src/classes/Update/Handler'

class DegreetTelegram<T extends IContext = IContext> extends BlockBuilder {
  token: string
  connectionUri: string
  info: IPrivateChat
  scenes: scene[] = []
  layouts: Layout[] = []
  allowedUpdates: (eventHint | string)[]

  sceneController: SceneController = new SceneController(this.scenes)
  polling: Polling

  constructor(token: string, allowedUpdates: eventHint[] = []) {
    super()
    this.token = token
    this.connectionUri = TELEGRAM_BOT_API + this.token
    this.allowedUpdates = allowedUpdates

    updateConnectionUri(this.connectionUri)
    updateToken(this.token)
  }

  public get supportedUpdates() {
    return [
      'chat_join_request', 'my_chat_member',
      'new_chat_member', 'left_chat_member',
      'dice', 'location', 'contact', 'photo',
      'callback_query', 'pre_checkout_query',
      'channel_post', 'edited_channel_post',
      'inline_query', 'chosen_inline_result',
      'shipping_query', 'invoice',
      'message', 'text', 'edit',
      'poll',
    ]
  }

  private async fetch<T>(url: string, params?: any): Promise<T> {
    const { data } = await axios.post(this.connectionUri + url, params)
    if (!data.ok) throw 'TelegramError'
    return data.result
  }

  public use(...middlewares: (middleware | Block | scene | Layout)[]): void {
    middlewares.forEach((middleware: middleware | Block | scene | Layout): void => {
      if (middleware instanceof Block) {
        const handlers: IHandler[] = middleware.handlers

        handlers.forEach((handler: IHandler): void => {
          handler.middlewares.unshift(...middleware.middlewares)
        })

        this.handlers.push(...handlers)
      } else if (middleware instanceof BlockScene || middleware instanceof StepScene) {
        this.scenes.push(middleware)
      } else if (middleware instanceof Layout) {
        this.layouts.push(middleware)
      } else {
        this.middlewares.push(middleware)
      }
    })
  }

  public async start(): Promise<string> {
    const handler: Handler<T> = new Handler<T>(this.sceneController, this.scenes, this.layouts, this.handlers, this.middlewares)
    this.polling = new Polling(this.connectionUri, this.allowedUpdates, handler)

    this.info = await this.fetch<IPrivateChat>('/getMe')
    this.polling.start()

    return this.info.username
  }
}

export {
  DegreetTelegram,
  Context,
  Session,
  Block,
  BlockScene,
  StepScene,
  Layout,
  Keyboard,
  I18n,
  Options,
}