import { IChat, IContext, IEntity, IHandler, IUpdate, middleware, nextMiddleware, scene } from './src/types'
import { TELEGRAM_BOT_API } from './src/constants'

import { updateConnectionUri } from './src/classes/TelegramMethods'
import { Context } from './src/classes/Context'
import { Session } from './src/classes/Session'

import { BlockBuilder } from './src/classes/BlockBuilder'
import { Block } from './src/classes/Block'

import { StepScene } from './src/classes/StepScene'
import { BlockScene } from './src/classes/BlockScene'
import { SceneController } from './src/classes/SceneController'

import axios from 'axios'
import { Layout } from './src/classes/Layout'

// TODO: RegExp actions, scenes state
// TODO: Markup layouts
// TODO: I18n
// TODO: Delete handler
// TODO: Payments

class DegreetTelegram<T extends IContext> extends BlockBuilder {
  token: string
  connectionUri: string
  botInfo: IChat
  scenes: scene[] = []
  sceneController: SceneController = new SceneController(this.scenes)
  layouts: Layout[] = []

  constructor(token: string) {
    super()
    this.token = token
    this.connectionUri = TELEGRAM_BOT_API + this.token
    updateConnectionUri(this.connectionUri)
  }

  private async fetch<T>(url: string): Promise<T> {
    const { data } = await axios.get(this.connectionUri + url)
    if (!data.ok) throw 'TelegramError'
    return data.result
  }

  private async *updateGetter(): AsyncIterableIterator<Promise<IUpdate[] | any>> {
    while (true) {
      const updates = await this.fetch<any>('/getUpdates')
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
    const events: (string | void)[] = []

    if (update.message) {
      events.push('message')

      if (update.message.text) {
        events.push('text')
      }
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
      handlers = availableHandlers.filter((handler: IHandler): boolean => (
        handler.type === 'event' && update.callback_query?.data === handler.event
      ))
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
            handler.type === 'event' && events.includes(handler.event) && !handler.text &&
            !handler.listenEntities?.length
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
      for (const update of updates) {
        await this.handleUpdate(update)
        await this.fetch<any>(`/getUpdates?offset=${update.update_id + 1}`)
      }
    }
  }

  public async launch(): Promise<any> {
    this.botInfo = await this.fetch<IChat>('/getMe')
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
}