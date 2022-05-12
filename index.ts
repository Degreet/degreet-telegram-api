import { eventHint, IChat, IContext, IEntity, IHandler, IUpdate, middleware, nextMiddleware, scene } from './src/types'
import { TELEGRAM_BOT_API } from './src/constants'

import { updateConnectionUri, updateToken } from './src/classes/TelegramMethods'
import { Keyboard } from './src/classes/Keyboard'
import { Context } from './src/classes/Context'
import { Session } from './src/classes/Session'
import { Layout } from './src/classes/Layout'
import { I18n } from './src/classes/I18n'

import { BlockBuilder } from './src/classes/BlockBuilder'
import { Block } from './src/classes/Block'

import { StepScene } from './src/classes/StepScene'
import { BlockScene } from './src/classes/BlockScene'
import { SceneController } from './src/classes/SceneController'

import axios from 'axios'

class DegreetTelegram<T extends IContext = IContext> extends BlockBuilder {
  token: string
  connectionUri: string
  info: IChat
  scenes: scene[] = []
  sceneController: SceneController = new SceneController(this.scenes)
  layouts: Layout[] = []
  allowedUpdates: (eventHint | string)[] = ['chat_join_request', 'new_chat_member', 'message', 'text', 'dice', 'location', 'contact', 'photo', 'edit', 'chat_member', 'callback_query']

  constructor(token: string, allowedUpdates: eventHint[] = []) {
    super()
    this.token = token
    this.connectionUri = TELEGRAM_BOT_API + this.token
    this.allowedUpdates.push(...allowedUpdates)

    updateConnectionUri(this.connectionUri)
    updateToken(this.token)
  }

  private async fetch<T>(url: string, params?: any): Promise<T> {
    const { data } = await axios.post(this.connectionUri + url, params)
    if (!data.ok) throw 'TelegramError'
    return data.result
  }

  private async *updateGetter(): AsyncIterableIterator<Promise<IUpdate[] | any>> {
    while (true) {
      const updates = await this.fetch<any>(
        '/getUpdates',
        { allowed_updates: this.allowedUpdates }
      )

      yield updates
    }
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

  private getAvailableHandlers(userId?: number): IHandler[] {
    if (this.sceneController.getActiveScene(userId)) {
      const scene = this.scenes.find((scene: scene) => (
        scene.name === this.sceneController.getActiveScene(userId)
      ))

      if (!scene) {
        return this.handlers
      } else {
        return scene.handlers
      }
    } else {
      return this.handlers
    }
  }

  private async handleUpdate(update: IUpdate): Promise<void> {
    const events: (eventHint | void)[] = []

    if (update.message) {
      events.push('message')

      if (update.message.text) {
        events.push('text')
      }

      if (update.message.new_chat_member) {
        events.push('new_chat_member')
      } else if (update.message.dice) {
        events.push('dice')
      } else if (update.message.location) {
        events.push('location')
      } else if (update.message.contact) {
        events.push('contact')
      } else if (update.message.photo) {
        events.push('photo')
      }
    } else if (update.chat_join_request) {
      events.push('join_request')
    } else if (update.edited_message) {
      events.push('edit')
    } else if (update.chat_member) {
      events.push('chat_member_update')
    }

    let handlers: IHandler[] = []
    const entities: IEntity[] | void = update.message?.entities

    const ctx: IContext = new Context<T>(update, this.sceneController, this.layouts)
    const userId: number | undefined = ctx.from?.id
    const availableHandlers: IHandler[] = this.getAvailableHandlers(userId)

    const commandEntities: IEntity[] | void = entities?.filter(
      (entity: IEntity): boolean => entity.type === 'bot_command')

    if (commandEntities && commandEntities.length) {
      commandEntities.forEach((entity: IEntity): void => {
        handlers = [
          ...handlers,
          ...availableHandlers.filter((handler: IHandler): boolean => {
            if (handler.type !== 'command') return false
            if (!update.message?.text) return false
            return update.message.text.slice(entity.offset + 1, entity.length) === handler.text
          })
        ]
      })
    } else if (update.callback_query) {
      handlers = availableHandlers.filter((handler: IHandler): boolean => {
        if (handler.type === 'button_click' && handler.event instanceof RegExp) {
          const match: RegExpMatchArray | null | undefined =
            update.callback_query?.data.match(handler.event)
          if (!match) return false

          ctx.matchParams = match
          return true
        } else {
          return handler.type === 'button_click' && update.callback_query?.data === handler.event
        }
      })
    } else if (events.includes('message') && this.sceneController.getActiveScene(userId)) {
      const activeScene: string | null = this.sceneController.getActiveScene(userId)

      if (activeScene) {
        const scene: scene | undefined = this.scenes.find((scene: scene) => (
          scene.name === this.sceneController.getActiveScene(userId)
        ))

        if (scene && scene.handlers.length) {
          const activeIndex: number | null = this.sceneController.getActiveIndex(userId)
          if (!activeIndex) return

          const middleware = scene.handlers[0].middlewares[activeIndex]
          if (!middleware) return

          middleware(ctx, () => {})
        }
      }
    } else {
      if (entities && entities.length) {
        handlers = availableHandlers.filter((handler: IHandler): boolean => (
          handler.type === 'event' && handler.event === 'message' &&
          !!handler.listenEntities?.find((entityType: string): boolean => (
            !!entities.find((entity: IEntity): boolean => entity.type === entityType)
          ))
        ))
      } else {
        handlers = availableHandlers.filter((handler: IHandler): boolean => (
          handler.type === 'event' && handler.event === 'text' && handler.text === update.message?.text
        ))

        if (!handlers || !handlers.length) {
          handlers = availableHandlers.filter((handler: IHandler): boolean => (
            handler.type === 'event' && typeof handler.event === 'string' &&
            events.includes(handler.event) && !handler.text && !handler.listenEntities?.length
          ))
        }
      }
    }

    function passMiddlewares() {
      handlers.forEach((handler: IHandler): void => {
        handler.middlewares[0](ctx, getNextHandler(handler.middlewares, 1))
      })
    }

    const getNextHandler = (middlewares: middleware[], i: number): nextMiddleware => {
      return (): void => {
        if (!middlewares[i]) return passMiddlewares()
        middlewares[i](ctx, getNextHandler(middlewares, i + 1))
      }
    }

    if (this.middlewares.length) this.middlewares[0](ctx, getNextHandler(this.middlewares, 1))
    else passMiddlewares()
  }

  private async startPolling(): Promise<void> {
    for await (const updates of this.updateGetter()) {
      for (const update of await updates) {
        await this.handleUpdate(update)
        await this.fetch<any>(`/getUpdates?offset=${update.update_id + 1}`)
      }
    }
  }

  public async start(): Promise<any> {
    this.info = await this.fetch<IChat>('/getMe')
    this.startPolling()
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
}